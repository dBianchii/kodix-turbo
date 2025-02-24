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

export function public_authRepositoryFactory() {
  async function createSession(session: z.infer<typeof zSessionCreate>) {
    await db.insert(sessions).values(session);
  }

  async function findUserTeamBySessionId({ sessionId }: { sessionId: string }) {
    const [result] = await db
      .select({ user: users, session: sessions, team: teams })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .innerJoin(teams, eq(teams.id, users.activeTeamId))
      .where(eq(sessions.id, sessionId));

    return result;
  }

  async function deleteSession(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async function updateSession({ id, input }: Update<typeof zSessionUpdate>) {
    await db.update(sessions).set(input).where(eq(sessions.id, id));
  }

  async function findAccountByProviderUserId({
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

  async function createAccount(
    db: DrizzleTransaction,
    account: z.infer<typeof zAccountCreate>,
  ) {
    await db.insert(accounts).values(account);
  }

  async function deleteKodixAccountAndUserDataByUserId(userId: string) {
    await db.transaction(async (tx) => {
      await tx.delete(accounts).where(eq(accounts.userId, userId));
      await tx.delete(invitations).where(eq(invitations.invitedById, userId));
      await tx.delete(teams).where(eq(teams.ownerId, userId));
      await tx.delete(sessions).where(eq(sessions.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
  }

  async function findResetPasswordTokenByToken(token: string) {
    return await db.query.resetPasswordTokens.findFirst({
      where: (resetPasswordTokens, { eq }) =>
        eq(resetPasswordTokens.token, token),
      columns: {
        userId: true,
        tokenExpiresAt: true,
      },
    });
  }

  async function createResetPasswordToken(
    data: z.infer<typeof zResetPasswordTokenCreate>,
  ) {
    await db.insert(resetPasswordTokens).values(data);
  }

  async function deleteAllResetPasswordTokensByUserId(id: string) {
    await db
      .delete(resetPasswordTokens)
      .where(eq(resetPasswordTokens.userId, id));
  }

  async function deleteTokenAndDeleteExpiredTokens(db: Drizzle, token: string) {
    await db
      .delete(resetPasswordTokens)
      .where(
        or(
          eq(resetPasswordTokens.token, token),
          lte(resetPasswordTokens.tokenExpiresAt, new Date()),
        ),
      );
  }
  return {
    createSession,
    findUserTeamBySessionId,
    deleteSession,
    updateSession,
    findAccountByProviderUserId,
    createAccount,
    deleteKodixAccountAndUserDataByUserId,
    findResetPasswordTokenByToken,
    createResetPasswordToken,
    deleteAllResetPasswordTokensByUserId,
    deleteTokenAndDeleteExpiredTokens,
  };
}
