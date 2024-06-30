import "server-only";

import { env } from "~/env";

export const argon2Config = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const renderDiscord = env.NODE_ENV === "development";
