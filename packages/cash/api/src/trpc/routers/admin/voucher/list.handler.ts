import type z from "zod";
import { db } from "@cash/db/client";
import { voucherCashbacks, vouchers } from "@cash/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZListVouchersInputSchema } from "../../../schemas/voucher";

interface ListVouchersOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZListVouchersInputSchema>;
}

export const listVouchersHandler = async ({ input }: ListVouchersOptions) => {
  const { clientId } = input;

  const vouchersList = await db
    .select({
      amount: sql<number>`COALESCE((
        SELECT SUM(${voucherCashbacks.amount})
        FROM ${voucherCashbacks}
        WHERE ${voucherCashbacks.voucherId} = ${vouchers.id}
      ), 0)`,
      code: vouchers.code,
      createdAt: vouchers.createdAt,
      createdBy: vouchers.createdBy,
      id: vouchers.id,
      purchaseTotal: vouchers.purchaseTotal,
    })
    .from(vouchers)
    .where(eq(vouchers.clientId, clientId))
    .orderBy(desc(vouchers.createdAt));

  return vouchersList;
};
