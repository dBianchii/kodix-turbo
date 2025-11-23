import { eq } from "drizzle-orm";

import { db as _db, type Drizzle, type DrizzleTransaction } from "../client";
import { magicLinkTokens } from "../schema";

export function createMagicLinkToken(
  token: typeof magicLinkTokens.$inferInsert,
  db: Drizzle | DrizzleTransaction = _db,
) {
  return db.insert(magicLinkTokens).values(token);
}

export function findMagicLinkByToken(token: string, db: Drizzle = _db) {
  return db.query.magicLinkTokens.findFirst({
    where: eq(magicLinkTokens.token, token),
  });
}

export async function deleteToken(
  token: string,
  db: Drizzle | DrizzleTransaction = _db,
) {
  await db.delete(magicLinkTokens).where(eq(magicLinkTokens.token, token));
}
