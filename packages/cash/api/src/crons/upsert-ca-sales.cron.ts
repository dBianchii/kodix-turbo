import type { clients, sales } from "@cash/db/schema";
import { caRepository } from "@cash/db/repositories";
import dayjs from "@kodix/dayjs";
import { uniqBy } from "es-toolkit";

import {
  listContaAzulPersons,
  listContaAzulSales,
} from "../services/conta-azul.service";
import { verifiedQstashCron } from "./_utils";

const LOOKBACK_DAYS = 2;

function normalizePhoneNumber(
  phone: Awaited<
    ReturnType<typeof listContaAzulPersons>
  >["items"][number]["telefone"]
) {
  if (!phone) return;
  if (phone.startsWith("+")) {
    return phone;
  }
  return `+55${phone}`;
}

export const upsertCASalesCron = verifiedQstashCron(async () => {
  const now = dayjs().tz("America/Sao_Paulo");

  const yesterday = now.subtract(LOOKBACK_DAYS, "day").format("YYYY-MM-DD");
  const today = now.format("YYYY-MM-DD");

  let allSales: Awaited<ReturnType<typeof listContaAzulSales>>["itens"] = [];
  let currentPage = 1;
  let totalItens = 0;
  const pageSize = 100;

  do {
    const { itens, total_itens } = await listContaAzulSales({
      data_fim: today,
      data_inicio: yesterday,
      pagina: currentPage,
      tamanho_pagina: pageSize,
    });

    if (itens?.length) {
      allSales = [...allSales, ...itens];
    }

    totalItens = total_itens;
    currentPage++;
  } while (allSales.length < totalItens);

  if (!allSales.length) {
    return new Response("No recent sales found. Skipping", {
      status: 202,
    });
  }

  const uniqueClientIds = uniqBy(allSales, (item) => item.cliente.id).map(
    (item) => item.cliente.id
  );

  let allClients: Awaited<ReturnType<typeof listContaAzulPersons>>["items"] =
    [];
  let currentClientPage = 1;
  let totalClients = 0;

  do {
    const { items, totalItems } = await listContaAzulPersons({
      com_endereco: true,
      ids: uniqueClientIds,
      pagina: currentClientPage,
      tamanho_pagina: pageSize,
    });

    if (items?.length) {
      allClients = [...allClients, ...items];
    }

    totalClients = totalItems;
    currentClientPage++;
  } while (allClients.length < totalClients);

  const upsertedClients = await caRepository.upsertClientsByCaId(
    allClients.map(
      (caClient) =>
        ({
          bairro: caClient.endereco?.bairro,
          caId: caClient.id,
          cep: caClient.endereco?.cep,
          cidade: caClient.endereco?.cidade,
          complemento: caClient.endereco?.complemento,
          document: caClient.documento,
          email: caClient.email,
          estado: caClient.endereco?.estado,
          logradouro: caClient.endereco?.logradouro,
          name: caClient.nome,
          numero: caClient.endereco?.numero,
          pais: caClient.endereco?.pais,
          phone: normalizePhoneNumber(caClient.telefone),
          type: caClient.tipo_pessoa,
        }) satisfies typeof clients.$inferInsert
    )
  );

  const clientMap = new Map(upsertedClients.map((c) => [c.caId, c]));

  const upsertedSales = await caRepository.upsertSalesByCaId(
    allSales.map((sale) => {
      const client = clientMap.get(sale.cliente.id);
      if (!client) throw new Error(`Client not found for sale ${sale.id}`);

      const createdAtUtc = dayjs
        .tz(sale.criado_em, "America/Sao_Paulo")
        .utc()
        .toISOString();

      return {
        caCreatedAt: createdAtUtc,
        caId: sale.id,
        caNumero: String(sale.numero),
        clientId: client.id,
        total: sale.total,
      } satisfies typeof sales.$inferInsert;
    })
  );

  const clientCreatedCount = upsertedClients.filter((c) => c.inserted).length;
  const clientUpdatedCount = upsertedClients.length - clientCreatedCount;

  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created: ${clientCreatedCount}, Updated: ${clientUpdatedCount}`
  );

  const createdCount = upsertedSales.filter((s) => s.inserted).length;
  const updatedCount = upsertedSales.length - createdCount;

  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created: ${createdCount}, Updated: ${updatedCount}`
  );

  return new Response(`Upserted ${upsertedSales.length} sales`);
});
