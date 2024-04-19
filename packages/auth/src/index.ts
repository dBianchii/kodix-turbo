import type { Session } from "next-auth";
import type { AdapterSession, AdapterUser } from "next-auth/adapters";
import NextAuth from "next-auth";

import { authConfig, KodixAdapter } from "./config";

export type { Session } from "next-auth";

const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { GET, POST, auth, signIn, signOut };

const adapter = KodixAdapter();

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
