import type { Session } from "next-auth";
import type { AdapterSession, AdapterUser } from "next-auth/adapters";
import NextAuth from "next-auth";

import { authConfig } from "./config";

export type { Session } from "next-auth";

const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { GET, POST, auth, signIn, signOut };

export { invalidateSessionToken, validateToken } from "./config";
