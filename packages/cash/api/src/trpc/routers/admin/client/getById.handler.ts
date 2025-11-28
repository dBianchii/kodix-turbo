import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, clients, sales } from "@cash/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZGetClientByIdInputSchema } from "../../../schemas/client";

interface GetClientByIdOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZGetClientByIdInputSchema>;
}

export const getByIdHandler = async ({ input }: GetClientByIdOptions) => {
  const clientData = await db.query.clients.findFirst({
    columns: {
      email: true,
      id: true,
      name: true,
    },
    where: eq(clients.id, input.clientId),
  });

  if (!clientData) {
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
          //TODO: Make this use the tables/columns directly
          usedAmount: sql<number>`COALESCE((
            SELECT SUM("voucherCashback"."amount")
            FROM "voucherCashback"
            WHERE "voucherCashback"."cashbackId" = ${cashbacks.id}
          ), 0)`.as("usedAmount"),
        },
      },
    },
  });

  const now = new Date();

  let cashbackAvailable = 0;
  for (const sale of salesData) {
    for (const cb of sale.Cashbacks) {
      if (new Date(cb.expiresAt) > now) {
        cashbackAvailable += cb.amount - cb.usedAmount;
      }
    }
  }

  const clientSales = salesData.map((sale) => {
    const cashbackOriginal = sale.Cashbacks.reduce(
      (sum, cb) => sum + cb.amount,
      0,
    );
    const cashbackUsed = sale.Cashbacks.reduce(
      (sum, cb) => sum + cb.usedAmount,
      0,
    );
    const cashbackAvail = cashbackOriginal - cashbackUsed;

    const expiresAt =
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
        : null;

    return {
      caCreatedAt: sale.caCreatedAt,
      caNumero: sale.caNumero,
      cashbackAvailable: sale.Cashbacks.length > 0 ? cashbackAvail : null,
      cashbackOriginal: sale.Cashbacks.length > 0 ? cashbackOriginal : null,
      cashbackUsed: sale.Cashbacks.length > 0 ? cashbackUsed : null,
      expiresAt,
      id: sale.id,
      total: sale.total,
    };
  });

  return {
    cashbackAvailable,
    client: clientData,
    sales: clientSales,
  };
};
