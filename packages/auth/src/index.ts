import NextAuth from "next-auth";

import { authConfig } from "./config";

export type { Session } from "next-auth";

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };

export {
  EXPO_REGISTER_COOKIE_NAME,
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

export { rewriteRequestUrlInDevelopment } from "./utils";
