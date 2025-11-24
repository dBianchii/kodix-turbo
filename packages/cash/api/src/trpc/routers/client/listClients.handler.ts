import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, clients } from "@cash/db/schema";
import { and, asc, count, desc, eq, ilike, sql } from "drizzle-orm";

import type { TProtectedProcedureContext } from "../../procedures";
import type { ZListClientsInputSchema } from "../../schemas/client";

interface ListClientsOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof ZListClientsInputSchema>;
}

export const listClientsHandler = async ({ input }: ListClientsOptions) => {
  const offset = (input.page - 1) * input.perPage;

  const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
    "cashback",
    "desc",
  ]) as [
    keyof typeof clients.$inferSelect | "cashback" | undefined,
    "asc" | "desc" | undefined,
  ];

  // Build filter conditions
  const filterExpressions = [
    // Filter by client name if provided
    input.clientName ? ilike(clients.name, `%${input.clientName}%`) : undefined,
  ].filter(Boolean);

  const where =
    filterExpressions.length > 0 ? and(...filterExpressions) : undefined;

  const cashbackSum = sql<number>`COALESCE(SUM(${cashbacks.amount}), 0)`;

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
    const data = await tx
      .select({
        cashback: cashbackSum,
        createdAt: clients.registeredFromFormAt,
        email: clients.email,
        id: clients.id,
        name: clients.name,
      })
      .from(clients)
      .leftJoin(cashbacks, eq(clients.id, cashbacks.clientId))
      .where(where)
      .groupBy(
        clients.id,
        clients.name,
        clients.email,
        clients.registeredFromFormAt,
      )
      .limit(input.perPage)
      .offset(offset)
      .orderBy(getOrderBy());

    const total = await tx
      .select({
        count: count(),
      })
      .from(clients)
      .where(where)
      .execute()
      .then((res) => res[0]?.count ?? 0);

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
  });

  return result;
};
