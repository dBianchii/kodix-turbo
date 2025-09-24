import { discordProvider } from "./discord";
import { googleProvider } from "./google";

export type Provider = {
  name: string;
  getAuthorizationUrl: (state: string, codeVerifier: string) => Promise<URL>;
  handleCallback: (code: string, codeVerifier: string) => Promise<string>;
};

export const authProviders = {
  google: googleProvider,
  discord: discordProvider,
} as const satisfies Record<string, Provider>;

export type AuthProviders = keyof typeof authProviders;
