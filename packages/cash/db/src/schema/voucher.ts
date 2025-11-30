import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";

import { clients } from "./ca";
import { cashbacks } from "./cashback";
import { users } from "./users";
import { nanoidPrimaryKey } from "./utils";

export const vouchers = pgTable(
  "voucher",
  (t) => ({
    clientId: t
      .text()
      .notNull()
      .references(() => clients.id, {
        onUpdate: "cascade",
      }),
    codeNumber: t.integer().generatedAlwaysAsIdentity().unique(),
    createdAt: t
      .timestamp({
        mode: "string",
        precision: 3,
        withTimezone: true,
      })
      .notNull()
      .defaultNow(),
    createdBy: t
      .text()
      .notNull()
      .references(() => users.id, {
        onUpdate: "cascade",
      }),
    id: nanoidPrimaryKey(t),
    purchaseTotal: t
      .numeric({ mode: "number", precision: 10, scale: 2 })
      .notNull(),
  }),
  (table) => [index().on(table.clientId, table.createdAt)],
);
export const vouchersRelations = relations(vouchers, ({ one, many }) => ({
  Client: one(clients, {
    fields: [vouchers.clientId],
    references: [clients.id],
  }),
  CreatedByUser: one(users, {
    fields: [vouchers.createdBy],
    references: [users.id],
  }),
  VoucherCashbacks: many(voucherCashbacks),
}));

export const voucherCashbacks = pgTable(
  "voucherCashback",
  (t) => ({
    amount: t.numeric({ mode: "number", precision: 10, scale: 2 }).notNull(),
    cashbackId: t
      .text()
      .notNull()
      .references(() => cashbacks.id, {
        onUpdate: "cascade",
      }),
    id: nanoidPrimaryKey(t),
    voucherId: t
      .text()
      .notNull()
      .references(() => vouchers.id, {
        onUpdate: "cascade",
      }),
  }),
  (table) => [index().on(table.voucherId), index().on(table.cashbackId)],
);
export const voucherCashbacksRelations = relations(
  voucherCashbacks,
  ({ one }) => ({
    Cashback: one(cashbacks, {
      fields: [voucherCashbacks.cashbackId],
      references: [cashbacks.id],
    }),
    Voucher: one(vouchers, {
      fields: [voucherCashbacks.voucherId],
      references: [vouchers.id],
    }),
  }),
);
