import * as discordProvider from "./discord";
import * as googleProvider from "./google";

export const providers = {
  discord: discordProvider,
  google: googleProvider,
} as const;

export type Providers = keyof typeof providers;
