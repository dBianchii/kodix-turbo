import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTotalAvailableCashback } from "./cashback-utils";

const NOW = new Date("2024-06-15T12:00:00Z");
const futureDate = "2024-07-15T12:00:00Z"; // 30 days after NOW
const pastDate = "2024-06-14T12:00:00Z"; // 1 day before NOW

describe("getTotalAvailableCashback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("returns 0 for empty items array", () => {
    expect(getTotalAvailableCashback([])).toBe(0);
  });

  it("returns 0 when item has no cashbacks", () => {
    expect(getTotalAvailableCashback([{ Cashbacks: [] }])).toBe(0);
  });

  it("returns full amount for cashback with no vouchers used", () => {
    const items = [
      {
        Cashbacks: [
          { amount: 100, expiresAt: futureDate, VoucherCashbacks: [] },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(100);
  });

  it("returns 0 for expired cashbacks", () => {
    const items = [
      {
        Cashbacks: [{ amount: 100, expiresAt: pastDate, VoucherCashbacks: [] }],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(0);
  });

  it("subtracts voucher amounts from cashback", () => {
    const items = [
      {
        Cashbacks: [
          {
            amount: 100,
            expiresAt: futureDate,
            VoucherCashbacks: [{ amount: 30 }, { amount: 20 }],
          },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(50);
  });

  it("returns 0 when vouchers exceed cashback amount (no negative)", () => {
    const items = [
      {
        Cashbacks: [
          {
            amount: 50,
            expiresAt: futureDate,
            VoucherCashbacks: [{ amount: 60 }],
          },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(0);
  });

  it("sums cashbacks across multiple items", () => {
    const items = [
      {
        Cashbacks: [
          { amount: 100, expiresAt: futureDate, VoucherCashbacks: [] },
        ],
      },
      {
        Cashbacks: [
          { amount: 50, expiresAt: futureDate, VoucherCashbacks: [] },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(150);
  });

  it("sums multiple cashbacks within single item", () => {
    const items = [
      {
        Cashbacks: [
          { amount: 100, expiresAt: futureDate, VoucherCashbacks: [] },
          { amount: 75, expiresAt: futureDate, VoucherCashbacks: [] },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(175);
  });

  it("filters out expired and includes valid cashbacks", () => {
    const items = [
      {
        Cashbacks: [
          { amount: 100, expiresAt: futureDate, VoucherCashbacks: [] },
          { amount: 50, expiresAt: pastDate, VoucherCashbacks: [] },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(100);
  });

  it("handles complex scenario with mixed data", () => {
    const items = [
      {
        Cashbacks: [
          // Valid: 100 - 25 = 75
          {
            amount: 100,
            expiresAt: futureDate,
            VoucherCashbacks: [{ amount: 25 }],
          },
          // Expired: ignored
          { amount: 200, expiresAt: pastDate, VoucherCashbacks: [] },
        ],
      },
      {
        Cashbacks: [
          // Valid: 50 - 0 = 50
          { amount: 50, expiresAt: futureDate, VoucherCashbacks: [] },
          // Valid but fully used: max(0, 30 - 30) = 0
          {
            amount: 30,
            expiresAt: futureDate,
            VoucherCashbacks: [{ amount: 30 }],
          },
        ],
      },
    ];
    expect(getTotalAvailableCashback(items)).toBe(125); // 75 + 50 + 0
  });

  it("handles cashback expiring exactly now as expired", () => {
    const items = [
      {
        Cashbacks: [
          {
            amount: 100,
            expiresAt: NOW.toISOString(),
            VoucherCashbacks: [],
          },
        ],
      },
    ];
    // expiresAt === now means not > now, so should be 0
    expect(getTotalAvailableCashback(items)).toBe(0);
  });
});
