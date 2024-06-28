import { cache } from "react";

import { auth as _auth } from "./config";

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to next-auth's default `auth()` function and only call it once per request across all components
 */
export const auth = cache(_auth);

export { providers, isSecureContext } from "./config";

export type { Providers, AuthResponse } from "./config";
export { lucia } from "./config";
export type { Session } from "lucia";
export type { User } from "lucia";
