import type z from "zod";
import { db } from "@cash/db/client";
import { clients, sales } from "@cash/db/schema";
import { and, asc, count, desc, eq, gte, ilike, lte } from "drizzle-orm";

import type { TProtectedProcedureContext } from "../../procedures";
import type { ZListSalesInputSchema } from "../../schemas/sales";

interface ListSalesOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof ZListSalesInputSchema>;
}

export const listSalesHandler = async ({ input }: ListSalesOptions) => {
  const offset = (input.page - 1) * input.perPage;

  const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
    "caCreatedAt",
    "desc",
  ]) as [
    keyof typeof sales.$inferSelect | undefined,
    "asc" | "desc" | undefined,
  ];

  // Build filter conditions
  const filterExpressions = [
    // Filter by client name if provided
    input.clientName ? ilike(clients.name, `%${input.clientName}%`) : undefined,
    // Filter by date range if provided
    input.dateFrom
      ? gte(sales.caCreatedAt, new Date(input.dateFrom))
      : undefined,
    input.dateTo ? lte(sales.caCreatedAt, new Date(input.dateTo)) : undefined,
  ].filter(Boolean);

  const where =
    filterExpressions.length > 0 ? and(...filterExpressions) : undefined;

  const result = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        caCreatedAt: sales.caCreatedAt,
        caId: sales.caId,
        caNumero: sales.caNumero,
        clientEmail: clients.email,
        clientId: sales.clientId,
        clientName: clients.name,
        clientType: clients.type,
        id: sales.id,
        total: sales.total,
      })
      .from(sales)
      .innerJoin(clients, eq(sales.clientId, clients.id))
      .where(where)
      .limit(input.perPage)
      .offset(offset)
      .orderBy(
        column && column in sales
          ? order === "asc"
            ? asc(sales[column])
            : desc(sales[column])
          : desc(sales.caCreatedAt),
      );

    const total = await tx
      .select({
        count: count(),
      })
      .from(sales)
      .innerJoin(clients, eq(sales.clientId, clients.id))
      .where(where)
      .execute()
      .then((res) => res[0]?.count ?? 0);

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
  });

  return result;
};
