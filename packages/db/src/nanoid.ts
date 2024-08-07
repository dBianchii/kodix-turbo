import { customAlphabet } from "nanoid";

export const NANOID_SIZE = 12; //If this is changed, the regex in zNanoIdRegex in @kdx/validators must be updated
export const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyz",
  NANOID_SIZE,
);
