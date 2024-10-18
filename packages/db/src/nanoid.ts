import { customAlphabet } from "nanoid";

import { NANOID_SIZE } from "@kdx/shared";

export const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyz",
  NANOID_SIZE,
);
