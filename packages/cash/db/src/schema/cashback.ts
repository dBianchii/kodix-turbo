import { relations } from "drizzle-orm";
import { index, pgTable, unique } from "drizzle-orm/pg-core";

import { clients, sales } from "./ca";
import { nanoidPrimaryKey } from "./utils";

export const cashbacks = pgTable(
  "cashback",
  (t) => ({
    amount: t.numeric({ mode: "number", precision: 10, scale: 2 }).notNull(),
    caProductId: t.text().notNull(),
    clientId: t
      .text()
      .notNull()
      .references(() => clients.id),
    createdAt: t
      .timestamp({
        mode: "string",
        precision: 3,
        withTimezone: true,
      })
      .notNull()
      .defaultNow(),
    expiresAt: t
      .timestamp({
        mode: "string",
        precision: 3,
        withTimezone: true,
      })
      .notNull(),
    id: nanoidPrimaryKey(t),
    saleId: t
      .text()
      .notNull()
      .references(() => sales.id),
  }),
  (table) => [
    unique().on(table.saleId, table.caProductId),
    index().on(table.clientId, table.createdAt),
  ],
);

export const cashbacksRelations = relations(cashbacks, ({ one }) => ({
  Client: one(clients, {
    fields: [cashbacks.clientId],
    references: [clients.id],
  }),
  Sale: one(sales, { fields: [cashbacks.saleId], references: [sales.id] }),
}));
