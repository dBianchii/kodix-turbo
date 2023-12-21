import type { Adapter } from "@auth/core/adapters";
import type { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import cuid from "cuid";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
// import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";

import type { PrismaClient } from "@kdx/db";
import { prisma } from "@kdx/db";

import { env } from "../env.js";
import { sendVerificationRequest } from "./email/send-verification-request";

export type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeTeamId: string; // Might need fix
      activeTeamName: string;
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

function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    ...PrismaAdapter(p),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createUser(data): Promise<any> {
      const userId = cuid();
      const teamId = cuid();

      //! When changing team creation flow here, change it on api.team.create router as well!
      const user = await p.user.create({
        data: {
          id: userId,
          ...data,
          ActiveTeam: {
            connectOrCreate: {
              create: {
                id: teamId,
                name: `Personal Team`,
                ownerId: userId,
              },
              where: {
                id: teamId,
              },
            },
          },
          Teams: {
            connect: {
              id: teamId,
            },
          },
        },
      });

      return user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getUser(id): Promise<any> {
      const user = await p.user.findUnique({
        where: {
          id,
        },
        ...customUserInclude,
      });
      if (!user) return null;
      return { ...user, activeTeamName: user.ActiveTeam.name };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getUserByEmail(email): Promise<any> {
      const user = await p.user.findUnique({
        where: { email },
        ...customUserInclude,
      });
      if (!user) return null;
      return { ...user, activeTeamName: user.ActiveTeam.name };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getSessionAndUser(sessionToken): Promise<any> {
      const userAndSession = await p.session.findUnique({
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
  adapter: {
    ...CustomPrismaAdapter(prisma),
  },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      name: "email",
      server: "",
      from: "invitation@kodix.com.br",
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      session.user.id = user.id;

      session.user.activeTeamName = (
        user as typeof user & { activeTeamName: string }
      ).activeTeamName;
      session.user.activeTeamId = (
        user as typeof user & { activeTeamId: string }
      ).activeTeamId;
      return session;
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
