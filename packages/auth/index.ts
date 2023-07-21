import type { DefaultSession } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@kdx/db";

import { env } from "./env.mjs";

export type { Session } from "next-auth";

// Update this whenever adding new providers so that the client can
export const providers = ["google", "email"] as const;
export type OAuthProviders = (typeof providers)[number];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
      activeWorkspaceId: string; // Might need fix
      activeWorkspaceName: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
      type: "email",
      sendVerificationRequest: () => {
        throw new Error("Not implemented");
      },
      id: "",
      name: "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const workspace = await prisma.workspace.findUnique({
          where: {
            id: session.user.activeWorkspaceId,
          },
        });
        session.user.id = user.id;
        //session.user.activeWorkspaceId = user.activeWorkspaceId; // Might need fix

        session.user.activeWorkspaceName = workspace?.name ?? "";
      }
      return session;
    },

    // @TODO - if you wanna have auth on the edge
    // jwt: ({ token, profile }) => {
    //   if (profile?.id) {
    //     token.id = profile.id;
    //     token.image = profile.picture;
    //   }
    //   return token;
    // },

    // @TODO
    // authorized({ request, auth }) {
    //   return !!auth?.user
    // }
  },
  events: {
    createUser: async (message) => {
      const firstName = message.user.name
        ? message.user.name.split(" ")[0]
        : "";
      //Create a personal workspace for the user on signup, set it as their active workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: `${firstName ?? ""}'s Workspace`,
          users: {
            connect: [{ id: message.user.id }],
          },
        },
      });

      await prisma.user.update({
        where: {
          id: message.user.id,
        },
        data: {
          activeWorkspaceId: workspace.id,
        },
      });
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signIn",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
});
