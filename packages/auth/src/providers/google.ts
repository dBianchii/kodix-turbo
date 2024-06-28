import { generateCodeVerifier, Google } from "arctic";

import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { getBaseKdxUrl, nanoid } from "@kdx/shared";

import { env } from "../../env";

interface GoogleUser {
  id: string;
  email: string;
  verified_email: string;
  name: string;
  given_name: string;
  picture: string;
  locale: string;
}

const google = new Google(
  env.AUTH_GOOGLE_CLIENT_ID,
  env.AUTH_GOOGLE_CLIENT_SECRET,
  `${getBaseKdxUrl()}/api/auth/google/callback`,
);

export const name = "Google";

export const getAuthorizationUrl = async (state: string) => {
  const codeVerifier = generateCodeVerifier();
  return await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });
};

export const handleCallback = async (code: string, codeVerifier: string) => {
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);

  const response = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  const googleUser = (await response.json()) as GoogleUser;

  const existingAccount = await db.query.accounts.findFirst({
    columns: {
      userId: true,
    },
    where: (accounts, { and, eq }) => {
      return and(
        eq(accounts.providerId, "google"),
        eq(accounts.providerUserId, googleUser.id),
      );
    },
  });

  if (existingAccount) {
    return existingAccount.userId;
  }

  let userId = nanoid();

  const userEmail = googleUser.email;

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
        name: googleUser.name,
        activeTeamId: teamId,
        email: userEmail,
        image: googleUser.picture,
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
      providerId: "google",
      providerUserId: googleUser.id,
      userId,
    });
  });

  return userId;
};
