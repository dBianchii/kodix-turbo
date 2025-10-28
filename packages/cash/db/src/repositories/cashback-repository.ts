import { sql } from "drizzle-orm";
import { buildConflictUpdateAllColumns } from "..";

import { db as _db, type Drizzle, type DrizzleTransaction } from "../client";
import { cashbacks } from "../schema/cashback";

export function upsertCashbacksByCaId(
  input: (typeof cashbacks.$inferInsert)[],
  db: Drizzle | DrizzleTransaction = _db,
) {
  return db
    .insert(cashbacks)
    .values(input)
    .onConflictDoUpdate({
      set: buildConflictUpdateAllColumns(cashbacks, ["id"]),
      target: [cashbacks.saleId, cashbacks.caProductId],
    })
    .returning({
      id: cashbacks.id,
      inserted: sql<boolean>`xmax = 0`, // true if inserted, false if updated
    });
}
