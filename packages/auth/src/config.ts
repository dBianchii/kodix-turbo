import type { AdapterUser } from "@auth/core/adapters";
import type { Awaitable } from "@auth/core/types";
import type { DefaultSession, NextAuthConfig, Session } from "next-auth";
import type { Adapter, AdapterSession } from "next-auth/adapters";
import { cookies } from "next/headers";
import { skipCSRFCheck } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import resend from "next-auth/providers/resend";

import { and, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
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
export const EXPO_REGISTER_COOKIE_NAME = "isExpoRegister"; //TODO: move to common file

/** @return { import("next-auth/adapters").Adapter } */
function KodixAdapter(): Adapter {
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

      const isExpoRegister = cookies().get(EXPO_REGISTER_COOKIE_NAME);

      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          ...data,
          id,
          activeTeamId: teamId,
        });
        if (!isExpoRegister) {
          //In expo, we just accept the invite from the team and we don't need to create a default team
          await tx.insert(teams).values({
            id: teamId,
            ownerId: id,
            name: `Personal Team`,
          });
          await tx.insert(usersToTeams).values({
            userId: id,
            teamId: teamId,
          });
        } else {
          //Accept invitation
          const invitationId = isExpoRegister.value;

          //!!This logic also exists inside the invitation accept handler.
          //TODO: Refactor to avoid duplication
          const invitation = await db.query.invitations.findFirst({
            where: (invitation, { and, eq }) =>
              and(
                eq(invitation.id, invitationId),
                // eq(invitation.email, ctx.session.user.email), //TODO: add email verification
              ),
            with: {
              Team: {
                columns: {
                  id: true,
                },
              },
            },
          });

          if (!invitation) throw new Error("No Invitation Found");

          await tx
            .update(schema.users)
            .set({
              activeTeamId: invitation.Team.id,
            })
            .where(eq(schema.users.id, id));
          await tx.insert(schema.usersToTeams).values({
            userId: id,
            teamId: invitation.Team.id,
          });
          await tx
            .delete(schema.invitations)
            .where(eq(schema.invitations.id, invitationId));
          cookies().delete(EXPO_REGISTER_COOKIE_NAME);
        }
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
const adapter = KodixAdapter();

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  // In development, we need to skip checks to allow Expo to work
  ...(!isSecureContext
    ? {
        skipCSRFCheck: skipCSRFCheck,
        trustHost: true,
      }
    : {}),
  secret: env.AUTH_SECRET,
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    resend({
      apiKey: env.RESEND_API_KEY,
      from: kodixNotificationFromEmail,
      sendVerificationRequest,
    }),
    Discord({
      allowDangerousEmailAccountLinking: true,
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

export const validateToken = async (token: string): Promise<Session | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = (await adapter.getSessionAndUser?.(sessionToken)) as
    | {
        session: AdapterSession;
        user: AdapterUser & {
          activeTeamId: string;
          activeTeamName: string;
          kodixAdmin: boolean;
        };
      }
    | null
    | undefined;

  return session
    ? {
        user: {
          ...session.user,
        },
        expires: session.session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  await adapter.deleteSession?.(token);
};
