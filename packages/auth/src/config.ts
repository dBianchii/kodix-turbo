import type { AdapterUser } from "@auth/core/adapters";
import type { DefaultSession, NextAuthConfig, Session } from "next-auth";
import type { AdapterSession } from "next-auth/adapters";
import { skipCSRFCheck } from "@auth/core";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import resend from "next-auth/providers/resend";

import { db } from "@kdx/db/client";
import { kodixNotificationFromEmail } from "@kdx/shared";

import { env } from "../env";
import { sendVerificationRequest } from "./email/send-verification-request";
import KodixAdapter from "./next-auth-custom-adapter";

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

const adapter = KodixAdapter(db);

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
