import type z from "zod";
import { db } from "@cash/db/client";
import { clients, sales } from "@cash/db/schema";
import { desc, eq } from "drizzle-orm";

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
        with: {
          VoucherCashbacks: {
            columns: {
              amount: true,
            },
          },
        },
      },
    },
  });

  const salesDataWithUsedAmount = salesData.map((sale) => ({
    ...sale,
    Cashbacks: sale.Cashbacks.map((cashback) => {
      const { VoucherCashbacks, ...cashbackWithoutVoucherCashbacks } = cashback;
      return {
        ...cashbackWithoutVoucherCashbacks,
        usedAmount:
          VoucherCashbacks.reduce((sum, vc) => sum + Number(vc.amount), 0) ?? 0,
      };
    }),
  }));

  return {
    client,
    sales: salesDataWithUsedAmount,
  };
};
