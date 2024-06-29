import type { APIUser as DiscordUser } from "discord-api-types/v10";
import { Discord } from "arctic";
import { OAuth2Scopes } from "discord-api-types/v10";

import { db } from "@kdx/db/client";
import { getBaseKdxUrl } from "@kdx/shared";

import { env } from "../../env";
import createOrGetExistingUserForUnlinkedProviderAccount from "./utils/createOrGetExistingUserForUnlinkedProviderAccount";

const discord = new Discord(
  env.AUTH_DISCORD_ID,
  env.AUTH_DISCORD_SECRET,
  `${getBaseKdxUrl()}/api/auth/discord/callback`,
);

export const name = "Discord";

export const getAuthorizationUrl = async (state: string) => {
  return await discord.createAuthorizationURL(state, {
    scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Email],
  });
};

export const handleCallback = async (code: string) => {
  const tokens = await discord.validateAuthorizationCode(code);

  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const discordUser = (await response.json()) as DiscordUser;

  const existingAccount = await db.query.accounts.findFirst({
    columns: {
      userId: true,
    },

    where: (accounts, { and, eq }) => {
      return and(
        eq(accounts.providerId, "discord"),

        eq(accounts.providerUserId, discordUser.id),
      );
    },
  });

  if (existingAccount) {
    return existingAccount.userId;
  }

  const userId = await createOrGetExistingUserForUnlinkedProviderAccount({
    name: discordUser.username,
    email: discordUser.email ?? "",
    image: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
    providerUserId: discordUser.id,
    providerId: "discord",
  });

  return userId;
};
