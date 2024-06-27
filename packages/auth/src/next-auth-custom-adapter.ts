import type { Awaitable } from "@auth/core/types";
import type { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import type { Drizzle } from "@kdx/db/client";
import { and, eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

/** @return { import("next-auth/adapters").Adapter } */
export default function KodixAdapter(db: Drizzle): Adapter {
  const { users, teams, usersToTeams, accounts, sessions } = schema;
  return {
    ...DrizzleAdapter(db, {
      usersTable: schema.users,
      accountsTable: schema.accounts,
      sessionsTable: schema.sessions,
      verificationTokensTable: schema.verificationTokens,
    }),
    async createUser(data) {
      const id = nanoid();
      const teamId = nanoid();

      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          ...data,
          id,
          activeTeamId: teamId,
        });
        await tx.insert(teams).values({
          id: teamId,
          ownerId: id,
          name: `Personal Team`,
        });
        await tx.insert(usersToTeams).values({
          userId: id,
          teamId: teamId,
        });
      });

      const result = (await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .then((res) => res[0])) as Awaitable<AdapterUser>;

      return result;
    },
    async getSessionAndUser(sessionToken: string) {
      const sessionAndUser = await db
        .select({
          session: sessions,
          user: users,
          team: teams,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .innerJoin(users, eq(users.id, sessions.userId))
        .innerJoin(teams, eq(teams.id, users.activeTeamId))
        .then((res) => (res.length > 0 ? res[0] : null));

      if (!sessionAndUser) return null;

      return {
        ...sessionAndUser,
        user: {
          ...sessionAndUser.user,
          activeTeamName: sessionAndUser.team.name,
        },
      } as Awaitable<{
        session: AdapterSession;
        user: AdapterUser;
      } | null>;
    },
    async getUserByEmail(email) {
      const result = await db
        .select({ user: users, team: { name: teams.name } })
        .from(users)
        .where(eq(users.email, email))
        .innerJoin(teams, eq(users.activeTeamId, teams.id))
        .then((res) => (res.length > 0 ? res[0] : null));

      if (!result) return null;

      return {
        ...result.user,
        activeTeamName: result.team.name,
      } as Awaitable<AdapterUser | null>;
    },
    async getUserByAccount(account) {
      const dbAccount =
        (await db
          .select({ User: users, Team: teams })
          .from(accounts)
          .innerJoin(users, eq(accounts.userId, users.id))
          .where(
            and(
              eq(accounts.providerAccountId, account.providerAccountId),
              eq(accounts.provider, account.provider),
            ),
          )
          .innerJoin(teams, eq(users.activeTeamId, teams.id))
          .then((res) => res[0])) ?? null;

      if (!dbAccount) {
        return null;
      }

      return {
        ...dbAccount.User,
        activeTeamName: dbAccount.Team.name,
      } as Awaitable<AdapterUser | null>;
    },

    async getUser(data) {
      const thing =
        (await db
          .select()
          .from(users)
          .where(eq(users.id, data))
          .innerJoin(teams, eq(users.activeTeamId, teams.id))
          .then((res) => res[0])) ?? null;
      if (!thing) return null;

      return {
        ...thing.user,
        activeTeamName: thing.team.name,
      } as Awaitable<AdapterUser | null>;
    },
  } as Adapter;
}
