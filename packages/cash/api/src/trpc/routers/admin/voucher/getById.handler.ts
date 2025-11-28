import type z from "zod";
import { db } from "@cash/db/client";
import { vouchers } from "@cash/db/schema";
import { eq } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZGetVoucherByIdInputSchema } from "../../../schemas/voucher";

interface GetVoucherByIdOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZGetVoucherByIdInputSchema>;
}

export const getVoucherByIdHandler = async ({
  input,
}: GetVoucherByIdOptions) => {
  const { voucherId } = input;

  const voucher = await db.query.vouchers.findFirst({
    where: eq(vouchers.id, voucherId),
    with: {
      VoucherCashbacks: {
        with: {
          Cashback: {
            with: {
              Sale: {
                columns: {
                  caCreatedAt: true,
                  caNumero: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!voucher) {
    return null;
  }

  const totalAmount = voucher.VoucherCashbacks.reduce(
    (sum, vc) => sum + vc.amount,
    0,
  );

  return {
    amount: totalAmount,
    cashbacksUsed: voucher.VoucherCashbacks.map((vc) => ({
      amount: vc.amount,
      caCreatedAt: vc.Cashback.Sale.caCreatedAt,
      caNumero: vc.Cashback.Sale.caNumero,
    })),
    code: voucher.code,
    createdAt: voucher.createdAt,
    createdBy: voucher.createdBy,
    id: voucher.id,
    purchaseTotal: voucher.purchaseTotal,
  };
};
