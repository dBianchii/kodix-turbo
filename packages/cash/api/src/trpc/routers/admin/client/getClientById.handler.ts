import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, clients, sales } from "@cash/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZGetClientByIdInputSchema } from "../../../schemas/client";

interface GetClientByIdHandlerOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZGetClientByIdInputSchema>;
}

export const getClientByIdHandler = async ({
  input,
}: GetClientByIdHandlerOptions) => {
  const client = await db.query.clients.findFirst({
    columns: {
      document: true,
      email: true,
      id: true,
      name: true,
      phone: true,
    },
    where: eq(clients.id, input.clientId),
  });

  if (!client) {
    return null;
  }

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
          id: true,
        },
        extras: {
          // Note: voucherCashback refs must be raw SQL since it's a subquery
          // Only ${cashbacks.id} can use Drizzle ref (correlates to parent row)
          usedAmount: sql<number>`COALESCE((
            SELECT SUM("voucherCashback"."amount")
            FROM "voucherCashback"
            WHERE "voucherCashback"."cashbackId" = ${cashbacks.id}
          ), 0)`.as("usedAmount"),
        },
      },
    },
  });

  return {
    client,
    sales: salesData,
  };
};
