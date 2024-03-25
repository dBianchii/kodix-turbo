import type { AdapterUser } from "@auth/core/adapters";
import type { Awaitable } from "@auth/core/types";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { Adapter, AdapterSession } from "next-auth/adapters";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
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
      console.log("createUser");
      console.log("createUser");
      console.log("createUser");
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
      console.log("getSessionAndUser");
      console.log("getSessionAndUser");
      console.log("getSessionAndUser");

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
          ...sessionAndUser?.user,
          activeTeamName: sessionAndUser?.team?.name,
        },
      } as Awaitable<{
        session: AdapterSession;
        user: AdapterUser;
      } | null>;
    },
    async getUserByEmail(data) {
      console.log("getUserByEmail");
      console.log("getUserByEmail");
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
      console.log("getUserByAccount");
      console.log("getUserByAccount");
      console.log("getUserByAccount");
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
      console.log("getUser");
      console.log("getUser");
      console.log("getUser");

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

    // createUser: async (data: AdapterUser) => {
    //   const teamId = cuid();
    //   data.id = cuid();
    //   //! When changing team creation flow here, change it on api.team.create router as well!
    //   const teamConnectOrCreate = {
    //     create: {
    //       id: teamId,
    //       name: `Personal Team`,
    //       ownerId: data.id,
    //     },
    //     where: {
    //       id: teamId,
    //     },
    //   };
    //   const user = await prisma.user.create({
    //     data: {
    //       ...data,
    //       Teams: {
    //         connectOrCreate: teamConnectOrCreate,
    //       },
    //       ActiveTeam: {
    //         connectOrCreate: teamConnectOrCreate,
    //       },
    //       OwnedTeams: {
    //         connectOrCreate: {
    //           create: {
    //             id: teamId,
    //             name: `Personal Team`,
    //           },
    //           where: {
    //             id: teamId,
    //           },
    //         },
    //       },
    //     },
    //   });

    //   return user;
    // },
    // getUser: async (id: string) => {
    //   const user = await prisma.user.findUnique({
    //     where: {
    //       id,
    //     },
    //     include: customUserInclude,
    //   });
    //   if (!user) return null;
    //   return { ...user, activeTeamName: user.ActiveTeam.name };
    // },
    // getUserByEmail: async (email: User["email"]) => {
    //   const user = await prisma.user.findUnique({
    //     where: { email },
    //     include: customUserInclude,
    //   });
    //   if (!user) return null;
    //   return { ...user, activeTeamName: user.ActiveTeam.name };
    // },
    // getUserByAccount: async (
    //   provider_providerAccountId: Pick<
    //     AdapterAccount,
    //     "provider" | "providerAccountId"
    //   >,
    // ) => {
    //   //? Had to add his manually because we changed the schema to uppercase User
    //   const account = await prisma.account.findUnique({
    //     where: { provider_providerAccountId },
    //     select: { User: true },
    //   });
    //   return account?.User ?? null;
    // },

    // getSessionAndUser: async (sessionToken: string) => {
    //   const userAndSession = await prisma.session.findUnique({
    //     where: { sessionToken },
    //     include: {
    //       User: {
    //         include: customUserInclude,
    //       },
    //     },
    //   });
    //   if (!userAndSession) return null;
    //   const { User, ...session } = userAndSession;
    //   return {
    //     user: { ...User, activeTeamName: User.ActiveTeam.name },
    //     session,
    //   };
    // },
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
