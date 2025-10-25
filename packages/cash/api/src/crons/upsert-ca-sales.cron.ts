import type { clients, sales } from "@cash/db/schema";
import { db } from "@cash/db/client";
import { caRepository, cashbackRepository } from "@cash/db/repositories";
import dayjs from "@kodix/dayjs";
import { uniqBy } from "es-toolkit";

import {
  getProductById,
  listContaAzulPersons,
  listContaAzulSales,
  listSaleItemsBySaleId,
} from "../services/conta-azul.service";
import { verifiedQstashCron } from "./_utils";

const LOOKBACK_DAYS = 1;

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

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function toReais(amount: number) {
  return amount / 100;
}

const FULL_CASHBACK_PERCENT = 5; // 5%
const DISCOUNTED_CASHBACK_PERCENT = 1; // 1%

function getCashbackAmountInCents(
  soldPriceCents: number,
  originalPriceCents: number
): number {
  const isAlreadyDiscounted = soldPriceCents < originalPriceCents;
  const cashbackPercent = isAlreadyDiscounted
    ? DISCOUNTED_CASHBACK_PERCENT
    : FULL_CASHBACK_PERCENT;

  // Calcula em centavos e arredonda
  return Math.round((soldPriceCents * cashbackPercent) / 100);
}

export const upsertCASalesCron = verifiedQstashCron(async () => {
  const now = dayjs().tz("America/Sao_Paulo");

  const yesterday = now.subtract(LOOKBACK_DAYS, "day").format("YYYY-MM-DD");
  const today = now.format("YYYY-MM-DD");

  let allCASales: Awaited<ReturnType<typeof listContaAzulSales>>["itens"] = [];
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
      allCASales = [...allCASales, ...itens];
    }

    totalItens = total_itens;
    currentPage++;
  } while (allCASales.length < totalItens);

  if (!allCASales.length) {
    return new Response("No recent sales found. Skipping", {
      status: 202,
    });
  }

  const allCASaleItems = (
    await Promise.all(
      allCASales.map(async (caSale) => {
        const { itens } = await listSaleItemsBySaleId({
          id_venda: caSale.id,
          pagina: 1,
          tamanho_pagina: 100,
        });
        return itens.map((item) => ({
          ...item,
          caSaleId: caSale.id,
        }));
      })
    )
  ).flat();

  const uniqueProductIds = uniqBy(allCASaleItems, (item) => item.id_item);
  const products = await Promise.all(
    uniqueProductIds.map((item) => getProductById(item.id_item))
  ).then((p) =>
    p.map(({ estoque, id }) => ({
      caProductId: id,
      valor_venda: estoque.valor_venda,
    }))
  );

  //Get cashback amount for each sold product
  const cashbackAmounts = allCASaleItems
    .map((caSaleItem) => {
      const product = products.find(
        (p) => p.caProductId === caSaleItem.id_item
      );
      if (!product) throw new Error("Product not found!");

      // Converte para centavos antes de multiplicar
      const soldPriceCents = toCents(caSaleItem.valor);
      const originalPriceCents = toCents(product.valor_venda);

      const totalSoldPriceForItemCents = soldPriceCents * caSaleItem.quantidade;
      const totalOriginalPriceForItemCents =
        originalPriceCents * caSaleItem.quantidade;

      return {
        caProductId: product.caProductId,
        caSaleId: caSaleItem.caSaleId,
        cashbackAmountCents: getCashbackAmountInCents(
          totalSoldPriceForItemCents,
          totalOriginalPriceForItemCents
        ),
      };
    })
    .filter((item) => item.cashbackAmountCents > 0); // Remove items with no cashback

  const uniqueClientIds = uniqBy(allCASales, (item) => item.cliente.id).map(
    (item) => item.cliente.id
  );

  let allCAClients: Awaited<ReturnType<typeof listContaAzulPersons>>["items"] =
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
      allCAClients = [...allCAClients, ...items];
    }

    totalClients = totalItems;
    currentClientPage++;
  } while (allCAClients.length < totalClients);

  const { upsertedClients, upsertedSales, upsertedCashbacks } =
    await db.transaction(async (tx) => {
      const txUpsertedClients = await caRepository.upsertClientsByCaId(
        allCAClients.map(
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
        ),
        tx
      );

      const caClientIdToClientMap = new Map(
        txUpsertedClients.map((c) => [c.caId, c])
      );

      const txUpsertedSales = await caRepository.upsertSalesByCaId(
        allCASales.map((caSale) => {
          const client = caClientIdToClientMap.get(caSale.cliente.id);
          if (!client)
            throw new Error(`Client not found for sale ${caSale.id}`);

          const createdAtUtc = dayjs
            .tz(caSale.criado_em, "America/Sao_Paulo")
            .utc()
            .toISOString();

          return {
            caCreatedAt: createdAtUtc,
            caId: caSale.id,
            caNumero: String(caSale.numero),
            clientId: client.id,
            total: caSale.total,
          } satisfies typeof sales.$inferInsert;
        }),
        tx
      );

      const txUpsertedCashbacks =
        await cashbackRepository.upsertCashbacksByCaId(
          cashbackAmounts.map((item) => {
            const sale = txUpsertedSales.find((s) => s.caId === item.caSaleId);
            if (!sale)
              throw new Error(`Sale not found for cashback ${item.caSaleId}`);

            return {
              amount: toReais(item.cashbackAmountCents),
              caProductId: item.caProductId,
              clientId: sale.clientId,
              saleId: sale.id,
            };
          }),
          tx
        );

      return {
        upsertedCashbacks: txUpsertedCashbacks,
        upsertedClients: txUpsertedClients,
        upsertedSales: txUpsertedSales,
      };
    });

  const clientCreatedCount = upsertedClients.filter((c) => c.inserted).length;
  const clientUpdatedCount = upsertedClients.length - clientCreatedCount;
  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created Clients: ${clientCreatedCount}, Updated Clients: ${clientUpdatedCount}`
  );

  const createdCount = upsertedSales.filter((s) => s.inserted).length;
  const updatedCount = upsertedSales.length - createdCount;
  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created Sales: ${createdCount}, Updated Sales: ${updatedCount}`
  );

  const cashbackCreatedCount = upsertedCashbacks.filter(
    (c) => c.inserted
  ).length;
  const cashbackUpdatedCount = upsertedCashbacks.length - cashbackCreatedCount;
  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created Cashbacks: ${cashbackCreatedCount}, Updated Cashbacks: ${cashbackUpdatedCount}`
  );

  return new Response(`Upserted ${upsertedSales.length} sales`);
});
