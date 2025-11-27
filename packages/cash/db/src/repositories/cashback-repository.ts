import { eq, sql, sum } from "drizzle-orm";
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

export async function getTotalCashbackByClientId(
  clientId: string,
  db: Drizzle = _db,
) {
  const result = await db
    .select({
      total: sum(cashbacks.amount).mapWith(Number),
    })
    .from(cashbacks)
    .where(eq(cashbacks.clientId, clientId));

  return result[0]?.total ?? 0;
}
