import { pgTable, unique } from "drizzle-orm/pg-core";

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
    id: nanoidPrimaryKey(t),
    saleId: t
      .text()
      .notNull()
      .references(() => sales.id),
  }),
  (table) => [unique().on(table.caProductId)]
);
