import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { Drizzle, DrizzleTransaction } from "../client";
import { db } from "../client";
import {
  accounts,
  invitations,
  sessions,
  teams,
  users,
  usersToTeams,
} from "../schema";
import { zAccountCreate } from "./zodSchemas/accountSchemas";
import { zSessionCreate, zSessionUpdate } from "./zodSchemas/sessionSchemas";
import { zUserCreate, zUserUpdate } from "./zodSchemas/userSchemas";

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

export async function updateSession(session: z.infer<typeof zSessionUpdate>) {
  await db
    .update(sessions)
    .set(zSessionUpdate.parse(session))
    .where(eq(sessions.id, session.id));
}

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    columns: {
      passwordHash: true, //! Bad: Exposing passwordHash sometimes when not needed
      activeTeamId: true,
      id: true,
      image: true,
    },
    where: (users, { and, eq }) => and(eq(users.email, email)),
  });
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

export async function createUser(
  db: Drizzle,
  user: z.infer<typeof zUserCreate>,
) {
  await db.insert(users).values(zUserCreate.parse(user));
}

export async function updateUser(
  db: Drizzle,
  user: z.infer<typeof zUserUpdate>,
) {
  await db
    .update(users)
    .set(zUserUpdate.parse(user))
    .where(eq(users.id, user.id));
}

export async function moveUserToTeamAndAssociateToTeam(
  db: Drizzle,
  {
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  },
) {
  await db
    .update(users)
    .set({ activeTeamId: teamId })
    .where(eq(users.id, userId));
  await db.insert(usersToTeams).values({
    userId: userId,
    teamId: teamId,
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
