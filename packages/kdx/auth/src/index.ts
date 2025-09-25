/** biome-ignore-all lint/performance/noBarrelFile: <its ok> */
import { cache } from "react";

import { auth as _auth } from "./config";

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to the default `auth()` function and only call it once per request across all components
 */
export const auth = cache(_auth);

export {
  deleteSessionTokenCookie,
  generatePasswordHash,
} from "@kodix/auth/core";

export type {
  AuthProvider,
  KdxAuthProvider as KdxAuthProviders,
} from "./providers";
export type { KdxAuthResponse, Session, User } from "./types";
export {
  createDbSessionAndCookie,
  invalidateSession,
  validateUserEmailAndPassword,
} from "./config";
export { kdxAuthProviders } from "./providers";
