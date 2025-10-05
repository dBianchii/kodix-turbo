import { and, eq } from "drizzle-orm";

import type { Drizzle, DrizzleTransaction } from "../client";
import { db as _db } from "../client";
import { accounts, sessions } from "../schema";

export async function createSession(
  session: typeof sessions.$inferInsert,
  db: Drizzle | DrizzleTransaction = _db
) {
  await db.insert(sessions).values(session);
}

export async function deleteSession(
  sessionId: string,
  db: Drizzle | DrizzleTransaction = _db
) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function updateSessionById(
  {
    id,
    input,
  }: { id: string; input: Pick<typeof sessions.$inferSelect, "expiresAt"> },
  db: Drizzle | DrizzleTransaction = _db
) {
  await db.update(sessions).set(input).where(eq(sessions.id, id));
}

export function findAccountByProviderUserId({
  providerId,
  providerUserId,
  db = _db,
}: {
  providerId: "google" | "discord";
  providerUserId: string;
  db?: Drizzle | DrizzleTransaction;
}) {
  return db.query.accounts.findFirst({
    columns: { userId: true },
    where: and(
      eq(accounts.providerId, providerId),
      eq(accounts.providerUserId, providerUserId)
    ),
  });
}

export async function createAccount(
  account: typeof accounts.$inferInsert,
  db: Drizzle | DrizzleTransaction = _db
) {
  await db.insert(accounts).values(account);
}
