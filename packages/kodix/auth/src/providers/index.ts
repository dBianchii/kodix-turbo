import { createDiscordProvider } from "./discord";
import { createGoogleProvider } from "./google";

export type AuthProvider = {
  name: string;
  getAuthorizationUrl: (state: string, codeVerifier: string) => Promise<URL>;
  handleCallback: (code: string, codeVerifier: string) => Promise<string>;
};

export type ProviderConfig = {
  repositories: {
    findAccountByProviderUserId: (params: {
      providerId: "google" | "discord";
      providerUserId: string;
    }) => Promise<{ userId: string } | undefined>;
    findUserByEmail: (email: string) => Promise<{ id: string } | undefined>;
    createUserWithProvider: (params: {
      name: string;
      email: string;
      image?: string;
      providerUserId: string;
      providerId: "google" | "discord";
    }) => Promise<string>;
  };
};

export const authProviders = {
  discord: createDiscordProvider,
  google: createGoogleProvider,
};
