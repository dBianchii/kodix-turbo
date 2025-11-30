import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, voucherCashbacks, vouchers } from "@cash/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZCreateVoucherInputSchema } from "../../../schemas/voucher";
import { CASHBACK_REDEMPTION_PERCENTAGE } from "../../../../constants";

interface CreateVoucherHandlerOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZCreateVoucherInputSchema>;
}

export const createVoucherHandler = async ({
  ctx,
  input,
}: CreateVoucherHandlerOptions) => {
  const { clientId, purchaseTotal, redemptionAmount } = input;

  const maxRedeemable = purchaseTotal * CASHBACK_REDEMPTION_PERCENTAGE;
  if (redemptionAmount > maxRedeemable) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Valor máximo de resgate é R$ ${maxRedeemable.toFixed(2)} (${CASHBACK_REDEMPTION_PERCENTAGE * 100}% do valor da compra)`,
    });
  }

  // Get available cashbacks (FIFO by expiration, not expired, with available amount)
  const availableCashbacks = await db.query.cashbacks
    .findMany({
      columns: {
        amount: true,
        id: true,
      },
      orderBy: asc(cashbacks.expiresAt),
      where: and(
        eq(cashbacks.clientId, clientId),
        gt(cashbacks.expiresAt, new Date().toISOString()),
      ),
      with: { VoucherCashbacks: true },
    })
    .then((rows) =>
      rows
        .map((row) => {
          const usedAmount = row.VoucherCashbacks.reduce(
            (sum, vc) => sum + vc.amount,
            0,
          );
          return {
            available: row.amount - usedAmount,
            id: row.id,
          };
        })
        .filter((row) => row.available > 0),
    );

  // Calculate total available
  const totalAvailable = availableCashbacks.reduce(
    (sum, cb) => sum + cb.available,
    0,
  );

  if (redemptionAmount > totalAvailable) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Saldo disponível insuficiente. Disponível: R$ ${totalAvailable.toFixed(2)}`,
    });
  }

  // Create voucher and voucherCashbacks in transaction
  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(vouchers)
      .values({
        clientId,
        createdBy: ctx.auth.user.id,
        purchaseTotal,
      })
      .returning({ codeNumber: vouchers.codeNumber, id: vouchers.id });

    if (!inserted) {
      throw new Error("Failed to create voucher");
    }

    // Allocate redemption amount across cashbacks (FIFO)
    let remainingToAllocate = redemptionAmount;
    const allocations: { cashbackId: string; amount: number }[] = [];

    for (const cb of availableCashbacks) {
      if (remainingToAllocate <= 0) break;

      const toAllocate = Math.min(cb.available, remainingToAllocate);
      allocations.push({
        amount: toAllocate,
        cashbackId: cb.id,
      });
      remainingToAllocate -= toAllocate;
    }

    if (allocations.length > 0) {
      await tx.insert(voucherCashbacks).values(
        allocations.map((allocation) => ({
          amount: allocation.amount,
          cashbackId: allocation.cashbackId,
          voucherId: inserted.id,
        })),
      );
    }

    return {
      allocations,
      amount: redemptionAmount,
      codeNumber: inserted.codeNumber,
      id: inserted.id,
      purchaseTotal,
    };
  });

  return result;
};
