import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, clients, voucherCashbacks } from "@cash/db/schema";
import { getVectorSearchFilter } from "@kodix/drizzle-utils";
import { asc, count, desc, ilike, or, sql } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../procedures";
import type { ZListClientsInputSchema } from "../../schemas/client";
import { getTotalAvailableCashback } from "../../../utils/cashback-utils";

interface ListClientsOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZListClientsInputSchema>;
}

export const listClientsHandler = async ({ input }: ListClientsOptions) => {
  const offset = (input.page - 1) * input.perPage;

  const [column, order] = input.sort.split(".").filter(Boolean) as [
    (
      | keyof typeof clients.$inferSelect
      | "cashback"
      | "totalAvailableCashback"
      | undefined
    ),
    "asc" | "desc" | undefined,
  ];

  const globalSearchFilter = input.globalSearch
    ? or(
        getVectorSearchFilter(clients.name, input.globalSearch),
        getVectorSearchFilter(clients.email, input.globalSearch),
        ilike(clients.document, `%${input.globalSearch}%`),
      )
    : undefined;

  const cashbackSum = sql<number>`COALESCE((SELECT SUM(${cashbacks.amount}) FROM ${cashbacks} WHERE ${cashbacks.clientId} = ${clients.id}), 0)`;

  const totalAvailableCashback = sql<number>`COALESCE(
    (
      SELECT SUM(GREATEST(0, ${cashbacks.amount} - COALESCE(voucherCashbackTotals.totalRedeemed, 0)))
      FROM ${cashbacks}
      LEFT JOIN (
        SELECT ${voucherCashbacks.cashbackId} AS cashback_id, SUM(${voucherCashbacks.amount}) AS "totalRedeemed"
        FROM ${voucherCashbacks}
        GROUP BY ${voucherCashbacks.cashbackId}
      ) AS voucherCashbackTotals ON voucherCashbackTotals.cashback_id = ${cashbacks.id}
      WHERE ${cashbacks.clientId} = ${clients.id} AND ${cashbacks.expiresAt} > NOW()
    ),
    0
  )`;

  const getOrderBy = () => {
    const getOrderFn = (value: Parameters<typeof asc>[0]) =>
      order === "asc" ? asc(value) : desc(value);

    if (column === "totalAvailableCashback") {
      return getOrderFn(totalAvailableCashback);
    }
    if (column === "cashback") {
      return getOrderFn(cashbackSum);
    }
    if (column && column in clients) {
      return getOrderFn(clients[column]);
    }
    return desc(totalAvailableCashback);
  };

  const result = await db.transaction(async (tx) => {
    const [data, total] = await Promise.all([
      tx.query.clients.findMany({
        limit: input.perPage,
        offset,
        orderBy: getOrderBy(),
        where: globalSearchFilter,
        with: {
          Cashbacks: {
            columns: {
              amount: true,
              expiresAt: true,
            },
            with: {
              VoucherCashbacks: {
                columns: {
                  amount: true,
                },
              },
            },
          },
        },
      }),
      tx
        .select({ count: count() })
        .from(clients)
        .where(globalSearchFilter)
        .then((res) => res[0]?.count ?? 0),
    ]);

    const pageCount = Math.ceil(total / input.perPage);

    return {
      data: data.map((client) => ({
        ...client,
        totalAvailableCashback: getTotalAvailableCashback([client]),
      })),
      pageCount,
    };
  });

  return result;
};
