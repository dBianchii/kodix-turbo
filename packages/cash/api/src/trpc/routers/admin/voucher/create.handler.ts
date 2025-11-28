import type z from "zod";
import { db } from "@cash/db/client";
import { cashbacks, voucherCashbacks, vouchers } from "@cash/db/schema";
import { nanoid } from "@kodix/shared/utils";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, sql } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZCreateVoucherInputSchema } from "../../../schemas/voucher";
import { CASHBACK_REDEMPTION_PERCENTAGE } from "../../../../constants";

const VOUCHER_CODE_REGEX = /VC-(\d+)/;

interface CreateVoucherOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZCreateVoucherInputSchema>;
}

export const createVoucherHandler = async ({
  ctx,
  input,
}: CreateVoucherOptions) => {
  const { clientId, purchaseTotal, redemptionAmount } = input;

  // Calculate max redeemable amount (40% of purchase)
  const maxRedeemable = purchaseTotal * CASHBACK_REDEMPTION_PERCENTAGE;

  if (redemptionAmount > maxRedeemable) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Valor máximo de resgate é R$ ${maxRedeemable.toFixed(2)} (${CASHBACK_REDEMPTION_PERCENTAGE * 100}% do valor da compra)`,
    });
  }

  // Get available cashbacks (FIFO by expiration, not expired, with available amount)
  const availableCashbacks = await db
    .select({
      amount: cashbacks.amount,
      expiresAt: cashbacks.expiresAt,
      id: cashbacks.id,
      usedAmount: sql<number>`COALESCE((
        SELECT SUM("voucherCashback"."amount")
        FROM "voucherCashback"
        WHERE "voucherCashback"."cashbackId" = "cashback"."id"
      ), 0)`,
    })
    .from(cashbacks)
    .where(
      and(
        eq(cashbacks.clientId, clientId),
        gt(cashbacks.expiresAt, new Date().toISOString()),
      ),
    )
    .orderBy(asc(cashbacks.expiresAt))
    .then((rows) =>
      rows
        .map((row) => ({
          ...row,
          available: row.amount - row.usedAmount,
        }))
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

  // Get next sequential code
  const lastVoucher = await db
    .select({ code: vouchers.code })
    .from(vouchers)
    .orderBy(sql`${vouchers.code} DESC`)
    .limit(1)
    .then((rows) => rows[0]);

  let nextNumber = 1;
  if (lastVoucher) {
    const match = lastVoucher.code.match(VOUCHER_CODE_REGEX);
    if (match?.[1]) {
      nextNumber = Number.parseInt(match[1], 10) + 1;
    }
  }
  const voucherCode = `VC-${nextNumber.toString().padStart(4, "0")}`;

  // Create voucher and voucherCashbacks in transaction
  const result = await db.transaction(async (tx) => {
    const voucherId = nanoid();

    // Insert voucher
    await tx.insert(vouchers).values({
      clientId,
      code: voucherCode,
      createdBy: ctx.auth.user.id,
      id: voucherId,
      purchaseTotal,
    });

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

    // Insert voucherCashbacks
    for (const allocation of allocations) {
      await tx.insert(voucherCashbacks).values({
        amount: allocation.amount,
        cashbackId: allocation.cashbackId,
        id: nanoid(),
        voucherId,
      });
    }

    return {
      allocations,
      amount: redemptionAmount,
      code: voucherCode,
      id: voucherId,
      purchaseTotal,
    };
  });

  return result;
};
