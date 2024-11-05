import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { DrizzleTransaction } from "../client";
import type { Update } from "./_types";
import { db } from "../client";
import { accounts, invitations, sessions, teams, users } from "../schema";
import { zAccountCreate } from "./_zodSchemas/accountSchemas";
import { zSessionCreate, zSessionUpdate } from "./_zodSchemas/sessionSchemas";

export async function createSession(session: z.infer<typeof zSessionCreate>) {
  await db.insert(sessions).values(zSessionCreate.parse(session));
}

export async function findUserTeamBySessionId({
  sessionId,
}: {
  sessionId: string;
}) {
  const [result] = await db
    .select({ user: users, session: sessions, team: teams })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(teams, eq(teams.id, users.activeTeamId))
    .where(eq(sessions.id, sessionId));

  return result;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function updateSession({
  id,
  input,
}: Update<typeof zSessionUpdate>) {
  await db
    .update(sessions)
    .set(zSessionUpdate.parse(input))
    .where(eq(sessions.id, id));
}

export async function findAccountByProviderUserId({
  providerId,
  providerUserId,
}: {
  providerId: "google" | "discord";
  providerUserId: string;
}) {
  return db.query.accounts.findFirst({
    columns: { userId: true },
    where: (accounts, { and, eq }) =>
      and(
        eq(accounts.providerId, providerId),
        eq(accounts.providerUserId, providerUserId),
      ),
  });
}

export async function createAccount(
  db: DrizzleTransaction,
  account: z.infer<typeof zAccountCreate>,
) {
  await db.insert(accounts).values(zAccountCreate.parse(account));
}

export async function deleteKodixAccountAndUserDataByUserId(userId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(accounts).where(eq(accounts.userId, userId));
    await tx.delete(invitations).where(eq(invitations.invitedById, userId));
    await tx.delete(teams).where(eq(teams.ownerId, userId));
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });
}
