import type { z } from "zod";
import { eq, lte, or } from "drizzle-orm";

import type { Drizzle, DrizzleTransaction } from "../client";
import type { Update } from "./_types";
import type { zAccountCreate } from "./_zodSchemas/accountSchemas";
import type { zResetPasswordTokenCreate } from "./_zodSchemas/resetPasswordTokenSchemas";
import type {
  zSessionCreate,
  zSessionUpdate,
} from "./_zodSchemas/sessionSchemas";
import { db } from "../client";
import {
  accounts,
  invitations,
  resetPasswordTokens,
  sessions,
  teams,
  users,
} from "../schema";

export async function createSession(session: z.infer<typeof zSessionCreate>) {
  await db.insert(sessions).values(session);
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function updateSessionById({
  id,
  input,
}: Update<typeof zSessionUpdate>) {
  await db.update(sessions).set(input).where(eq(sessions.id, id));
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
  await db.insert(accounts).values(account);
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

export async function findResetPasswordTokenByToken(token: string) {
  return await db.query.resetPasswordTokens.findFirst({
    where: (resetPasswordTokens, { eq }) =>
      eq(resetPasswordTokens.token, token),
    columns: {
      userId: true,
      tokenExpiresAt: true,
    },
  });
}

export async function createResetPasswordToken(
  data: z.infer<typeof zResetPasswordTokenCreate>,
) {
  await db.insert(resetPasswordTokens).values(data);
}

export async function deleteAllResetPasswordTokensByUserId(id: string) {
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
