import { cache } from "react";

import { auth as _auth } from "./config";

export type { AuthResponse, Providers, Session, User } from "./config";

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to the default `auth()` function and only call it once per request across all components
 */
export const auth = cache(_auth);

export {
  argon2Config,
  deleteSessionTokenCookie,
  invalidateSession,
  providers,
  validateUserEmailAndPassword,
} from "./config";
