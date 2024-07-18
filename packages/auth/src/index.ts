import { generateIdFromEntropySize } from "lucia";

export { auth, isSecureContext, lucia, providers } from "./config";

//Results in a string of 12 characters. If this is changed please update ZUserId in @kdx/validators
export const generateUserId = () => generateIdFromEntropySize(7);

export type { Session, User } from "lucia";
export type { AuthResponse, Providers } from "./config";
