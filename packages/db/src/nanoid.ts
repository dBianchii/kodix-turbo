import { customAlphabet } from "nanoid";

//If NANOID_SIZE is changed, the regex in zNanoIdRegex in @kdx/validators must be updated. Also, generateUserId must be updated in @kdx/auth
export const NANOID_SIZE = 12;
export const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyz",
  NANOID_SIZE,
);
