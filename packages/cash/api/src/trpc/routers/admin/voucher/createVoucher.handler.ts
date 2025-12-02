import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, voucherCashbacks, vouchers } from "@cash/db/schema";
import { TRPCError } from "@trpc/server";
import { inArray, sql } from "drizzle-orm";

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

  // Create voucher and voucherCashbacks in transaction with row locking
  const result = await db.transaction(async (tx) => {
    // Lock and get available cashbacks atomically to prevent race conditions
    // First, lock all non-expired cashbacks for this client
    const lockedCashbacks = await tx.execute<{ id: string; amount: number }>(
      sql`SELECT ${cashbacks.id}, ${cashbacks.amount} FROM ${cashbacks}
          WHERE ${cashbacks.clientId} = ${clientId}
          AND ${cashbacks.expiresAt} > ${new Date().toISOString()}
          ORDER BY ${cashbacks.expiresAt} ASC
          FOR UPDATE`,
    );

    if (!lockedCashbacks.rows.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nenhum cashback disponível para resgate",
      });
    }

    const cashbackIds = lockedCashbacks.rows.map((row) => row.id as string);

    // Now get the used amounts from voucherCashbacks (safe since we hold the lock)
    const usedAmounts = await tx.query.voucherCashbacks.findMany({
      columns: { amount: true, cashbackId: true },
      where: inArray(voucherCashbacks.cashbackId, cashbackIds),
    });

    const cbIdToTotalUsedAmount = usedAmounts.reduce((acc, vc) => {
      acc.set(vc.cashbackId, (acc.get(vc.cashbackId) ?? 0) + vc.amount);
      return acc;
    }, new Map<string, number>());

    const availableCashbacks = lockedCashbacks.rows
      .map((row) => ({
        available: row.amount - (cbIdToTotalUsedAmount.get(row.id) ?? 0),
        id: row.id,
      }))
      .filter((row) => row.available > 0);

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

    const [inserted] = await tx
      .insert(vouchers)
      .values({
        clientId,
        createdBy: ctx.auth.user.id,
        purchaseTotal,
      })
      .returning({
        codeNumber: vouchers.codeNumber,
        createdAt: vouchers.createdAt,
        id: vouchers.id,
      });

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
      createdAt: inserted.createdAt,
      id: inserted.id,
      purchaseTotal,
    };
  });

  return result;
};
