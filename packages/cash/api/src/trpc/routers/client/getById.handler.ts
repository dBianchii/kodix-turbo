import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, clients, sales } from "@cash/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import type { TProtectedProcedureContext } from "../../procedures";
import type { ZGetClientByIdInputSchema } from "../../schemas/client";

interface GetClientByIdOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof ZGetClientByIdInputSchema>;
}

export const getByIdHandler = async ({ input }: GetClientByIdOptions) => {
  const clientData = await db.query.clients.findFirst({
    columns: {
      email: true,
      id: true,
      name: true,
      phone: true,
      registeredFromFormAt: true,
    },
    where: eq(clients.id, input.clientId),
  });

  if (!clientData) {
    return null;
  }

  // Get total cashback
  const cashbackTotal = await db
    .select({
      total: sql<number>`COALESCE(SUM(${cashbacks.amount}), 0)`,
    })
    .from(cashbacks)
    .where(eq(cashbacks.clientId, input.clientId))
    .then((res) => res[0]?.total ?? 0);

  const salesData = await db.query.sales.findMany({
    columns: {
      caCreatedAt: true,
      caNumero: true,
      id: true,
      total: true,
    },
    orderBy: desc(sales.caCreatedAt),
    where: eq(sales.clientId, input.clientId),
    with: {
      Cashbacks: {
        columns: {
          amount: true,
          expiresAt: true,
        },
      },
    },
  });

  const clientSales = salesData.map((sale) => ({
    caCreatedAt: sale.caCreatedAt,
    caNumero: sale.caNumero,
    cashbackAmount:
      sale.Cashbacks.length > 0
        ? sale.Cashbacks.reduce((sum, cb) => sum + cb.amount, 0)
        : null,
    expiresAt:
      sale.Cashbacks.length > 0
        ? sale.Cashbacks.reduce(
            (earliest, cb) => {
              const cbExpiresAt = new Date(cb.expiresAt);
              return earliest === null || cbExpiresAt < earliest
                ? cbExpiresAt
                : earliest;
            },
            null as Date | null,
          )
        : null,
    id: sale.id,
    total: sale.total,
  }));

  return {
    cashbackTotal,
    client: clientData,
    sales: clientSales,
  };
};
