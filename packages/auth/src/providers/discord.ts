import type { APIUser as DiscordUser } from "discord-api-types/v10";
import { Discord } from "arctic";
import { OAuth2Scopes } from "discord-api-types/v10";

import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { getBaseKdxUrl, nanoid } from "@kdx/shared";

import { env } from "../../env";

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

  let userId = nanoid();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const userEmail = discordUser.email!;

  await db.transaction(async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      columns: {
        id: true,
      },
      where: (users, { and, eq }) => {
        return and(eq(users.email, userEmail));
      },
    });

    if (!existingUser) {
      const teamId = nanoid();

      await tx.insert(schema.users).values({
        id: userId,
        name: discordUser.username,
        activeTeamId: teamId,
        email: userEmail,
      });
      await tx.insert(schema.teams).values({
        id: teamId,
        ownerId: userId,
        name: `Personal Team`,
      });
      await tx.insert(schema.usersToTeams).values({
        userId: teamId,
        teamId: teamId,
      });
    } else {
      userId = existingUser.id;
    }

    await tx.insert(schema.accounts).values({
      providerId: "discord",
      providerUserId: discordUser.id,
      userId,
    });
  });

  return userId;
};
