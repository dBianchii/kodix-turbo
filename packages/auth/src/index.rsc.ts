import { cache } from "react";
import NextAuth from "next-auth";

import { authConfig } from "./config";

export type { Session } from "next-auth";

const { handlers, auth: defaultAuth, signIn, signOut } = NextAuth(authConfig);

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to next-auth's default `auth()` function and only call it once per request across all components
 */
const auth = cache(defaultAuth);

export { handlers, auth, signIn, signOut };

export {
  CAME_FROM_INVITE_COOKIE_NAME,
  EXPO_COOKIE_NAME,
  DONT_CREATE_USER_COOKIE_NAME,
  invalidateSessionToken,
  validateToken,
  isSecureContext,
} from "./config";

export { rewriteRequestUrlInDevelopment } from "./utils";
