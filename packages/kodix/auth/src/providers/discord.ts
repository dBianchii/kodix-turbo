import type { APIUser as DiscordUser } from "discord-api-types/v10";
import type { AuthProvider, ProviderConfig } from ".";
import { getBaseUrl } from "@kodix/shared/utils";
import { Discord } from "arctic";
import { OAuth2Scopes } from "discord-api-types/v10";

export const createDiscordProvider = (config: ProviderConfig): AuthProvider => {
  const discord = new Discord(
    process.env.AUTH_DISCORD_ID ?? "",
    process.env.AUTH_DISCORD_SECRET ?? "",
    `${getBaseUrl()}/api/auth/discord/callback`,
  );

  const name = "Discord";

  const getAuthorizationUrl = async (state: string) =>
    await discord.createAuthorizationURL(state, {
      scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Email],
    });

  const handleCallback = async (code: string, _codeVerifier: string) => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Login with ${name} is not enabled in production`);
    }

    const tokens = await discord.validateAuthorizationCode(code);

    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const discordUser = (await response.json()) as DiscordUser;

    const existingAccount =
      await config.repositories.findAccountByProviderUserId({
        providerId: "discord",
        providerUserId: discordUser.id,
      });

    if (existingAccount) return existingAccount.userId;

    const userId = await config.repositories.createUserWithProvider({
      email: discordUser.email ?? "",
      image: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
      name: discordUser.username,
      providerId: "discord",
      providerUserId: discordUser.id,
    });

    return userId;
  };

  return {
    getAuthorizationUrl,
    handleCallback,
    name,
  };
};
