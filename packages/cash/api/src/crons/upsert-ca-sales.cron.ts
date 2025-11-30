import type { clients, sales } from "@cash/db/schema";
import { db } from "@cash/db/client";
import { caRepository, cashbackRepository } from "@cash/db/repositories";
import dayjs from "@kodix/dayjs";
import { captureException } from "@kodix/posthog";
import { uniqBy } from "es-toolkit";

import { MONTHS_TO_EXPIRE_CASHBACK } from "../constants";
import {
  getProductById,
  listContaAzulPersons,
  listContaAzulSales,
  listSaleItemsBySaleId,
} from "../services/conta-azul.service";
import { verifiedQstashCron } from "./_utils";

const LOOKBACK_DAYS = 1;

// type CAPersonPhone = NonNullable<
//   Awaited<ReturnType<typeof listContaAzulPersons>>["items"]
// >[number]["telefone"];

// function normalizePhoneNumber(phone: CAPersonPhone) {
//   if (!phone) return;
//   if (phone.startsWith("+")) {
//     return phone;
//   }
//   return `+55${phone}`;
// }

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function toReais(amount: number) {
  return amount / 100;
}

const FULL_CASHBACK_PERCENT = 5; // 5%
const DISCOUNTED_CASHBACK_PERCENT = 1; // 1%

export const upsertCASalesCron = verifiedQstashCron(async () => {
  const now = dayjs().tz("America/Sao_Paulo");

  const yesterday = now.subtract(LOOKBACK_DAYS, "day").format("YYYY-MM-DD");
  const today = now.format("YYYY-MM-DD");

  let allCASales: Awaited<ReturnType<typeof listContaAzulSales>>["itens"] = [];
  let currentPage = 1;
  let totalItens = 0;
  const pageSize = 100;

  try {
    do {
      const { itens, total_itens } = await listContaAzulSales({
        data_fim: today,
        data_inicio: yesterday,
        pagina: currentPage,
        tamanho_pagina: pageSize,
      });

      const filteredItens = itens.filter((item) => item.itens === "PRODUCT"); // Exclude services

      if (filteredItens?.length) {
        allCASales = [...allCASales, ...filteredItens];
      }

      totalItens = total_itens;
      currentPage++;
    } while (allCASales.length < totalItens);
  } catch (error) {
    captureException(error, undefined, {
      context: "listContaAzulSales",
      currentPage,
      today,
      totalItens,
      yesterday,
    });
    throw error;
  }

  if (!allCASales.length) {
    return new Response("No recent sales found. Skipping", {
      status: 202,
    });
  }

  const allCASaleItems = (
    await Promise.all(
      allCASales.map(async (caSale) => {
        try {
          // Fetch all pages of sale items
          const saleItems: Awaited<
            ReturnType<typeof listSaleItemsBySaleId>
          >["itens"] = [];
          let currentItemPage = 1;
          let totalSaleItems = 0;

          do {
            const { itens, itens_totais } = await listSaleItemsBySaleId({
              id_venda: caSale.id,
              pagina: currentItemPage,
              tamanho_pagina: 100,
            });

            if (itens?.length) {
              saleItems.push(...itens);
            }

            totalSaleItems = itens_totais;
            currentItemPage++;
          } while (saleItems.length < totalSaleItems);

          return saleItems.map((item) => ({
            ...item,
            caSaleId: caSale.id,
          }));
        } catch (error) {
          captureException(error, undefined, {
            caSaleId: caSale.id,
            context: "listSaleItemsBySaleId",
          });
          return [];
        }
      }),
    )
  ).flat();

  const uniqueProductIds = uniqBy(allCASaleItems, (item) => item.id_item);
  const products = (
    await Promise.all(
      uniqueProductIds.map(async (item) => {
        try {
          const product = await getProductById(item.id_item);

          // Validate product price
          if (
            product.estoque.valor_venda <= 0 ||
            !Number.isFinite(product.estoque.valor_venda)
          ) {
            // biome-ignore lint/suspicious/noConsole: Logging for observability
            console.warn(
              `Product ${item.id_item} has invalid price: ${product.estoque.valor_venda}, skipping`,
            );
            return null;
          }

          return {
            caProductId: product.id,
            valor_venda: product.estoque.valor_venda,
          };
        } catch (error) {
          captureException(error, undefined, {
            context: "getProductById",
            productId: item.id_item,
          });
          return null;
        }
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  //Get cashback amount for each sold product
  const cashbackAmounts = allCASaleItems
    .map((caSaleItem) => {
      const product = products.find(
        (p) => p.caProductId === caSaleItem.id_item,
      );
      if (!product) {
        // biome-ignore lint/suspicious/noConsole: Logging for observability
        console.warn(
          `Product ${caSaleItem.id_item} not found for sale item, skipping cashback calculation`,
        );
        return null;
      }

      // Validate sale item values
      if (
        caSaleItem.valor <= 0 ||
        !Number.isFinite(caSaleItem.valor) ||
        caSaleItem.quantidade <= 0 ||
        !Number.isFinite(caSaleItem.quantidade)
      ) {
        // biome-ignore lint/suspicious/noConsole: Logging for observability
        console.warn(
          `Sale item has invalid values (valor: ${caSaleItem.valor}, quantidade: ${caSaleItem.quantidade}), skipping cashback`,
        );
        return null;
      }

      const soldPriceCents = toCents(caSaleItem.valor);
      const originalPriceCents = toCents(product.valor_venda);

      const isUnitDiscounted = soldPriceCents < originalPriceCents;
      const cashbackPercent = isUnitDiscounted
        ? DISCOUNTED_CASHBACK_PERCENT
        : FULL_CASHBACK_PERCENT;

      const totalSoldPriceForItemCents = soldPriceCents * caSaleItem.quantidade;

      const cashbackAmountCents = Math.round(
        (totalSoldPriceForItemCents * cashbackPercent) / 100,
      );

      return {
        caProductId: product.caProductId,
        caSaleId: caSaleItem.caSaleId,
        cashbackAmountCents,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null && item.cashbackAmountCents > 0,
    ); // Remove items with no cashback or missing products

  const uniqueClientIds = uniqBy(allCASales, (item) => item.cliente.id).map(
    (item) => item.cliente.id,
  );

  let allCAClients: Awaited<ReturnType<typeof listContaAzulPersons>>["items"] =
    [];
  let currentClientPage = 1;
  let totalClients = 0;

  try {
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
  } catch (error) {
    captureException(error, undefined, {
      context: "listContaAzulPersons",
      currentClientPage,
      totalClients,
      uniqueClientIds,
    });
    throw error;
  }
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
              // phone: normalizePhoneNumber(caClient.telefone), //TODO: Add phone to DB if we can get it from the API
              type: caClient.tipo_pessoa,
            }) satisfies typeof clients.$inferInsert,
        ),
        tx,
      );

      const caClientIdToClientMap = new Map(
        txUpsertedClients.map((c) => [c.caId, c]),
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
        tx,
      );

      const caSaleIdToCaSaleMap = new Map(
        allCASales.map((caSale) => [caSale.id, caSale]),
      );

      const txUpsertedCashbacks =
        await cashbackRepository.upsertCashbacksByCaId(
          cashbackAmounts.map((item) => {
            const sale = txUpsertedSales.find((s) => s.caId === item.caSaleId);
            if (!sale)
              throw new Error(`Sale not found for cashback ${item.caSaleId}`);

            const caSale = caSaleIdToCaSaleMap.get(item.caSaleId);
            if (!caSale)
              throw new Error(
                `CA sale not found for cashback ${item.caSaleId}`,
              );

            const expiresAtUtc = dayjs
              .tz(caSale.criado_em, "America/Sao_Paulo")
              .add(MONTHS_TO_EXPIRE_CASHBACK, "months")
              .utc()
              .toISOString();

            return {
              amount: toReais(item.cashbackAmountCents),
              caProductId: item.caProductId,
              clientId: sale.clientId,
              expiresAt: expiresAtUtc,
              saleId: sale.id,
            };
          }),
          tx,
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
    `[CA Sales Sync] Created Clients: ${clientCreatedCount}, Updated Clients: ${clientUpdatedCount}`,
  );

  const createdCount = upsertedSales.filter((s) => s.inserted).length;
  const updatedCount = upsertedSales.length - createdCount;
  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created Sales: ${createdCount}, Updated Sales: ${updatedCount}`,
  );

  const cashbackCreatedCount = upsertedCashbacks.filter(
    (c) => c.inserted,
  ).length;
  const cashbackUpdatedCount = upsertedCashbacks.length - cashbackCreatedCount;
  // biome-ignore lint/suspicious/noConsole: Logging for observability
  console.log(
    `[CA Sales Sync] Created Cashbacks: ${cashbackCreatedCount}, Updated Cashbacks: ${cashbackUpdatedCount}`,
  );

  return new Response(`Upserted ${upsertedSales.length} sales`);
});
