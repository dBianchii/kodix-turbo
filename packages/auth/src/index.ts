import type { AdapterAccount, AdapterUser } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import cuid from "cuid";
import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";
// import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";

import type { PrismaClient, User } from "@kdx/db";
import { prisma } from "@kdx/db";
import { kodixNotificationFromEmail } from "@kdx/react-email/constants";
import EmailProvider from "next-auth/providers/email";
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
    } & DefaultSession["user"];
  }
}

const customUserInclude = {
  include: {
    ActiveTeam: {
      select: {
        name: true,
      },
    },
  },
};

/** @return { import("next-auth/adapters").Adapter } */
function KodixAdapter(prisma: PrismaClient) {
  return {
    ...PrismaAdapter(prisma),
    createUser: async (data: AdapterUser) => {
      const teamId = cuid();
      data.id = cuid();
      //! When changing team creation flow here, change it on api.team.create router as well!
      const teamConnectOrCreate = {
        create: {
          id: teamId,
          name: `Personal Team`,
          ownerId: data.id,
        },
        where: {
          id: teamId,
        },
      };
      const user = await prisma.user.create({
        data: {
          ...data,
          Teams: {
            connectOrCreate: teamConnectOrCreate,
          },
          ActiveTeam: {
            connectOrCreate: teamConnectOrCreate,
          },
          OwnedTeams: {
            connectOrCreate: {
              create: {
                id: teamId,
                name: `Personal Team`,
              },
              where: {
                id: teamId,
              },
            },
          },
        },
      });

      return user;
    },
    getUser: async (id: string) => {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        ...customUserInclude,
      });
      if (!user) return null;
      return { ...user, activeTeamName: user.ActiveTeam.name };
    },
    getUserByEmail: async (email: User["email"]) => {
      const user = await prisma.user.findUnique({
        where: { email },
        ...customUserInclude,
      });
      if (!user) return null;
      return { ...user, activeTeamName: user.ActiveTeam.name };
    },
    getUserByAccount: async (
      provider_providerAccountId: Pick<
        AdapterAccount,
        "provider" | "providerAccountId"
      >,
    ) => {
      //? Had to add his manually because we changed the schema to uppercase User
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        select: { User: true },
      });
      return account?.User ?? null;
    },
    getSessionAndUser: async (sessionToken: string) => {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
          User: {
            ...customUserInclude,
          },
        },
      });
      if (!userAndSession) return null;
      const { User, ...session } = userAndSession;
      return {
        user: { ...User, activeTeamName: User.ActiveTeam.name },
        session,
      };
    },
  };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: KodixAdapter(prisma),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      name: "email",
      server: "",
      from: kodixNotificationFromEmail,
      sendVerificationRequest,
    }),
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
