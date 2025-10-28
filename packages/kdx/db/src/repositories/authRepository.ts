import type { z } from "zod";
import { and, eq, lte, or } from "drizzle-orm";

import type { Drizzle } from "../client";
import type { Update } from "./_types";
import type { zAccountCreate } from "./_zodSchemas/account-schemas";
import type { zResetPasswordTokenCreate } from "./_zodSchemas/reset-password-token-schemas";
import type {
  zSessionCreate,
  zSessionUpdate,
} from "./_zodSchemas/session-schemas";
import { db as _db } from "../client";
import {
  accounts,
  invitations,
  resetPasswordTokens,
  sessions,
  teams,
  users,
} from "../schema";

export async function createSession(
  session: z.infer<typeof zSessionCreate>,
  db = _db,
) {
  await db.insert(sessions).values(session);
}

export async function deleteSession(sessionId: string, db = _db) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function updateSessionById(
  { id, input }: Update<typeof zSessionUpdate>,
  db = _db,
) {
  await db.update(sessions).set(input).where(eq(sessions.id, id));
}

export function findAccountByProviderUserId(
  {
    providerId,
    providerUserId,
  }: {
    providerId: "google" | "discord";
    providerUserId: string;
  },
  db = _db,
) {
  return db.query.accounts.findFirst({
    columns: { userId: true },
    where: and(
      eq(accounts.providerId, providerId),
      eq(accounts.providerUserId, providerUserId),
    ),
  });
}

export async function createAccount(
  account: z.infer<typeof zAccountCreate>,
  db = _db,
) {
  await db.insert(accounts).values(account);
}

export async function deleteKodixAccountAndUserDataByUserId(
  userId: string,
  db = _db,
) {
  await db.transaction(async (tx) => {
    await tx.delete(accounts).where(eq(accounts.userId, userId));
    await tx.delete(invitations).where(eq(invitations.invitedById, userId));
    await tx.delete(teams).where(eq(teams.ownerId, userId));
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });
}

export function findResetPasswordTokenByToken(token: string, db = _db) {
  return db.query.resetPasswordTokens.findFirst({
    columns: {
      tokenExpiresAt: true,
      userId: true,
    },
    where: eq(resetPasswordTokens.token, token),
  });
}

export async function createResetPasswordToken(
  data: z.infer<typeof zResetPasswordTokenCreate>,
  db = _db,
) {
  await db.insert(resetPasswordTokens).values(data);
}

export async function deleteAllResetPasswordTokensByUserId(
  id: string,
  db = _db,
) {
  await db
    .delete(resetPasswordTokens)
    .where(eq(resetPasswordTokens.userId, id));
}

export async function deleteTokenAndDeleteExpiredTokens(
  db: Drizzle,
  token: string,
) {
  await db
    .delete(resetPasswordTokens)
    .where(
      or(
        eq(resetPasswordTokens.token, token),
        lte(resetPasswordTokens.tokenExpiresAt, new Date()),
      ),
    );
}
