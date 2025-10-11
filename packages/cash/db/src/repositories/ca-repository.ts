import { desc, eq } from "drizzle-orm";

import { db as _db, type Drizzle } from "../client";
import { caTokens } from "../schema";

export async function getCAToken(db = _db) {
  const token = await db.query.caTokens.findFirst({
    orderBy: [desc(caTokens.createdAt)],
  });
  if (!token) {
    throw new Error("No token found in db");
  }
  return token;
}

export async function createCAToken(
  token: typeof caTokens.$inferInsert,
  db: Drizzle = _db
) {
  const [newToken] = await db.insert(caTokens).values(token).returning();
  return newToken;
}

export async function updateCAToken(
  id: string,
  data: Partial<typeof caTokens.$inferInsert>,
  db: Drizzle = _db
) {
  const [updatedToken] = await db
    .update(caTokens)
    .set(data)
    .where(eq(caTokens.id, id))
    .returning();
  return updatedToken;
}
