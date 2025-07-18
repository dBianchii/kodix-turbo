import { customAlphabet } from "nanoid";

export const NANOID_SIZE = 12; //If this is changed, the regex in zNanoIdRegex in @kdx/validators must be updated

// New constant for model IDs that need to support longer universal model identifiers
export const MODEL_ID_SIZE = 30;
export const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyz",
  NANOID_SIZE,
);
