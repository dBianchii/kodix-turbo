import type { AdapterAccount, AdapterUser } from "@auth/core/adapters";
import type { Awaitable } from "@auth/core/types";
import type { DefaultSession } from "next-auth";
import type { Adapter, AdapterSession } from "next-auth/adapters";
import { cache } from "react";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import cuid from "cuid";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
// import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";

import type { Prisma, PrismaClient, User } from "@kdx/db";
import { and, db, eq, prisma, tableCreator } from "@kdx/db";
import { kodixNotificationFromEmail } from "@kdx/react-email/constants";

import {
  accounts,
  sessions,
  teams,
  users,
  usersToTeams,
  verificationTokens,
} from "../../db/src/schema/schema";
import { env } from "../env";
import { sendVerificationRequest } from "./email/send-verification-request";

export type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeTeamId: string; // Might need fix
      activeTeamName: string;
      email: string;
      kodixAdmin: boolean;
    } & DefaultSession["user"];
  }
}

const customUserInclude: Prisma.UserInclude = {
  ActiveTeam: {
    select: {
      name: true,
    },
  },
};

/** @return { import("next-auth/adapters").Adapter } */
function KodixAdapter(): Adapter {
  return {
    ...DrizzleAdapter(db, tableCreator),
    async createUser(data) {
      console.log("createUser");
      console.log("createUser");
      console.log("createUser");
      const id = crypto.randomUUID();
      const teamId = crypto.randomUUID();

      await db.insert(teams).values({
        id: teamId,
        ownerId: id,
        name: `Personal Team`,
      });
      await db.insert(users).values({
        ...data,
        id,
        activeTeamId: teamId,
      });
      await db.insert(usersToTeams).values({
        a: id,
        b: teamId,
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
      const user =
        (await db
          .select()
          .from(users)
          .where(eq(users.email, data))
          .then((res) => res[0])) ?? null;

      return user as Awaitable<AdapterUser | null>;
    },
    async getUserByAccount(account) {
      console.log("getUserByAccount");
      console.log("getUserByAccount");
      console.log("getUserByAccount");
      const dbAccount =
        (await db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.providerAccountId, account.providerAccountId),
              eq(accounts.provider, account.provider),
            ),
          )
          .leftJoin(users, eq(accounts.userId, users.id))
          .then((res) => res[0])) ?? null;

      if (!dbAccount) {
        return null;
      }

      return dbAccount.User as Awaitable<AdapterUser | null>;
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
          .then((res) => res[0])) ?? null;

      return thing as Awaitable<AdapterUser | null>;
    },
    async createSession(data) {
      console.log("createSession");
      console.log("createSession");
      console.log("createSession");

      await db.insert(sessions).values(data);

      return (await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then((res) => res[0])) as Awaitable<AdapterSession>;
    },
    async updateUser(data) {
      console.log("updateUser");
      console.log("updateUser");
      console.log("updateUser");

      if (!data.id) {
        throw new Error("No user id.");
      }

      await db.update(users).set(data).where(eq(users.id, data.id));

      return (await db
        .select()
        .from(users)
        .where(eq(users.id, data.id))
        .then((res) => res[0])) as Awaitable<AdapterUser>;
    },
    async updateSession(data) {
      console.log("updateSession");
      console.log("updateSession");
      console.log("updateSession");

      await db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken));

      return (await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then((res) => res[0])) as Awaitable<AdapterSession>;
    },
    async linkAccount(rawAccount) {
      console.log("linkAccount");
      await db.insert(accounts).values({
        ...rawAccount,
        type: rawAccount.type as "oauth" | "oidc" | "email",
      });
    },
    async deleteSession(sessionToken) {
      console.log("deleteSession");
      console.log("deleteSession");
      console.log("deleteSession");

      const session =
        (await db
          .select()
          .from(sessions)
          .where(eq(sessions.sessionToken, sessionToken))
          .then((res) => res[0])) ?? null;

      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));

      return session;
    },
    async createVerificationToken(token) {
      console.log("createVerificationToken");
      console.log("createVerificationToken");
      console.log("createVerificationToken");

      await db.insert(verificationTokens).values(token);

      return await db
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.identifier, token.identifier))
        .then((res) => res[0]);
    },
    async useVerificationToken(token) {
      console.log("useVerificationToken");
      console.log("useVerificationToken");
      console.log("useVerificationToken");
      try {
        const deletedToken =
          (await db
            .select()
            .from(verificationTokens)
            .where(
              and(
                eq(verificationTokens.identifier, token.identifier),
                eq(verificationTokens.token, token.token),
              ),
            )
            .then((res) => res[0])) ?? null;

        await db
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token),
            ),
          );

        return deletedToken;
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    async deleteUser(id) {
      console.log("deleteUser");
      console.log("deleteUser");
      console.log("deleteUser");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .then((res) => res[0] ?? null);

      await db.delete(users).where(eq(users.id, id));

      return user;
    },
    async unlinkAccount(account) {
      console.log("unlinkAccount");
      console.log("unlinkAccount");
      console.log("unlinkAccount");
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        );

      return undefined;
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

export const {
  handlers: { GET, POST },
  auth: defaultAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter: KodixAdapter(),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    // EmailProvider({
    //   name: "email",
    //   server: "",
    //   from: kodixNotificationFromEmail,
    //   sendVerificationRequest,
    // }),
  ],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable with session strategy";
      opts.session.user.id = opts.user.id;

      opts.session.user.activeTeamName = (
        opts.user as typeof opts.user & { activeTeamName: string }
      ).activeTeamName;
      opts.session.user.activeTeamId = (
        opts.user as typeof opts.user & { activeTeamId: string }
      ).activeTeamId;
      opts.session.user.kodixAdmin = (
        opts.user as typeof opts.user & { kodixAdmin: boolean }
      ).kodixAdmin;
      return opts.session;
    },
  },
  pages: {
    signIn: "/signin",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
});

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to next-auth's default `auth()` function and only call it once per request across all components
 */
export const auth = cache(defaultAuth);
