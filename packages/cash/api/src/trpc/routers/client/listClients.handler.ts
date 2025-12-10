import type z from "zod";
import { db } from "@cash/db/client";
import { clients } from "@cash/db/schema";
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
    keyof typeof clients.$inferSelect | "cashback" | undefined,
    "asc" | "desc" | undefined,
  ];

  const globalSearchFilter = input.globalSearch
    ? or(
        getVectorSearchFilter(clients.name, input.globalSearch),
        getVectorSearchFilter(clients.email, input.globalSearch),
        ilike(clients.document, `%${input.globalSearch}%`),
      )
    : undefined;

  const cashbackSum = sql<number>`COALESCE((SELECT SUM("cashback"."amount") FROM "cashback" WHERE "cashback"."clientId" = "clients"."id"), 0)`;

  const getOrderBy = () => {
    if (column === "cashback") {
      return order === "asc" ? asc(cashbackSum) : desc(cashbackSum);
    }
    if (column && column in clients) {
      return order === "asc" ? asc(clients[column]) : desc(clients[column]);
    }
    return desc(cashbackSum);
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
