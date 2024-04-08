import type { AdapterUser } from "@auth/core/adapters";
import type { Awaitable } from "@auth/core/types";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { Adapter, AdapterSession } from "next-auth/adapters";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import resend from "next-auth/providers/resend";

import { and, db, eq, schema } from "@kdx/db";
import { kodixNotificationFromEmail, nanoid } from "@kdx/shared";

import { env } from "../env";
import { sendVerificationRequest } from "./email/send-verification-request";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeTeamId: string;
      activeTeamName: string; //"Virtual" field from the team table
      email: string;
      kodixAdmin: boolean;
    } & DefaultSession["user"];
  }
}

/** @return { import("next-auth/adapters").Adapter } */
function KodixAdapter(): Adapter {
  const { users, teams, usersToTeams, accounts, sessions } = schema;
  return {
    ...DrizzleAdapter(db),
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
        .where(eq(users.id, id))
        .then((res) => res[0])) as Awaitable<AdapterUser>;

      return result;
    },
    async getSessionAndUser(sessionToken: string) {
      const sessionAndUser =
        (await db
          .select({
            session: sessions,
            user: users,
            team: teams,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, sessionToken))
          .innerJoin(users, eq(users.id, sessions.userId))
          .innerJoin(teams, eq(teams.id, users.activeTeamId))
          .then((res) => res[0])) ?? null;

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
    async getUserByEmail(data) {
      const result =
        (await db
          .select()
          .from(users)
          .where(eq(users.email, data))
          .innerJoin(teams, eq(users.activeTeamId, teams.id))
          .then((res) => res[0])) ?? null;

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
          .where(
            and(
              eq(accounts.providerAccountId, account.providerAccountId),
              eq(accounts.provider, account.provider),
            ),
          )
          .leftJoin(users, eq(accounts.userId, users.id))
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
  };
}

export const authConfig = {
  adapter: KodixAdapter(),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    resend({
      apiKey: env.RESEND_API_KEY,
      from: kodixNotificationFromEmail,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable with session strategy";

      opts.session.user.activeTeamName = (
        opts.user as typeof opts.user & { activeTeamName: string }
      ).activeTeamName;
      opts.session.user.activeTeamId = (
        opts.user as typeof opts.user & { activeTeamId: string }
      ).activeTeamId;
      opts.session.user.kodixAdmin = (
        opts.user as typeof opts.user & { kodixAdmin: boolean }
      ).kodixAdmin;

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
  },
  pages: {
    signIn: "/signin",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
} satisfies NextAuthConfig;
