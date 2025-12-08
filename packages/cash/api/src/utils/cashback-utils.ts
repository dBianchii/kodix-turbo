import type { cashbacks, voucherCashbacks } from "@cash/db/schema";

export const getTotalAvailableCashback = (
  items: {
    Cashbacks: (Pick<typeof cashbacks.$inferSelect, "amount" | "expiresAt"> & {
      VoucherCashbacks: Pick<typeof voucherCashbacks.$inferSelect, "amount">[];
    })[];
  }[],
) =>
  items
    .flatMap((item) => item.Cashbacks)
    .filter((cb) => new Date(cb.expiresAt) > new Date())
    .reduce(
      (sum, cb) =>
        sum +
        Math.max(
          0,
          cb.amount -
            cb.VoucherCashbacks.reduce((sum2, vc) => sum2 + vc.amount, 0),
        ),
      0,
    );
