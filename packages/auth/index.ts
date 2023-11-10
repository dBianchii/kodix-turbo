import crypto from "crypto";
import type { Adapter } from "@auth/core/adapters";
import EmailProvider from "@auth/core/providers/email";
// import EmailProvider from "next-auth/providers/email";
import Google from "@auth/core/providers/google";
import type { DefaultSession } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import type { PrismaClient, User } from "@kdx/db";
import { prisma } from "@kdx/db";

import { env } from "./env.mjs";

export type { Session } from "next-auth";

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

function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    ...PrismaAdapter(p),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createUser(data): Promise<any> {
      //TODO: is it possible to do this with less DB calls?
      let url = `${data.name?.toLowerCase()!.split(" ").join("-")}`;

      const workspaces = await p.workspace.findMany({
        where: {
          url,
        },
      });

      if (workspaces.length > 0) {
        url = `${url}-${crypto.randomBytes(4).toString("hex")}`;
      }

      const workspace = await p.workspace.create({
        data: {
          name: `${data.name!}'s Workspace`,
          url,
        },
      });

      const user = await p.user.create({
        data: {
          ...data,
          activeWorkspace: {
            connect: {
              id: workspace.id,
            },
          },
          workspaces: {
            connect: {
              id: workspace.id,
            },
          },
        },
      });

      return user;
    },
  };
}

export const {
  handlers: { GET, POST },
  auth,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  signIn,
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
      server: {
        host: env.AUTH_EMAIL_SERVER_HOST,
        port: env.AUTH_EMAIL_SERVER_PORT,
        auth: {
          user: env.AUTH_EMAIL_SERVER_USER,
          pass: env.AUTH_EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.AUTH_EMAIL_FROM,
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
      const activeWs = await prisma.workspace.findFirstOrThrow({
        where: {
          activeUsers: {
            some: {
              id: user.id,
            },
          },
        },
        select: {
          name: true,
        },
      });
      session.user.activeWorkspaceName = activeWs.name;
      session.user.activeWorkspaceId = (user as User).activeWorkspaceId;
      session.user.id = user.id;

      return session;
    },
    // redirect: async ({ url }) => {
    //   return Promise.resolve(url);
    // },
  },

  events: {
    // createUser: async (message) => {
    //   //In here, user has already been created in dataBase. Meaning that we can't make activeWorkspaceId non-null by default.
    //   //Could not find a way to override user creation in nextauth.
    //   const firstName = message.user.name
    //     ? message.user.name.split(" ")[0]
    //     : "";
    //   //Create a personal workspace for the user on signup, set it as their active workspace
    //   const workspace = await prisma.workspace.create({
    //     data: {
    //       name: `${firstName ?? ""}'s Workspace`,
    //       users: {
    //         connect: [{ id: message.user.id }],
    //       },
    //     },
    //   });
    //   await prisma.user.update({
    //     where: {
    //       id: message.user.id,
    //     },
    //     data: {
    //       activeWorkspaceId: workspace.id,
    //     },
    //   });
    // },
  },
  pages: {
    signIn: "/signIn",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
});
