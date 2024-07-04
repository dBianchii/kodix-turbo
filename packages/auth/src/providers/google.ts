import { Google } from "arctic";

import { getBaseKdxUrl } from "@kdx/shared";

import { env } from "../../env";
import createOrGetExistingUserForUnlinkedProviderAccount from "./utils/createOrGetExistingUserForUnlinkedProviderAccount";
import getAccountByProviderUserId from "./utils/getAccountByProviderUserId";

interface GoogleUser {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

const google = new Google(
  env.AUTH_GOOGLE_CLIENT_ID,
  env.AUTH_GOOGLE_CLIENT_SECRET,
  `${getBaseKdxUrl()}/api/auth/google/callback`,
);

export const name = "Google";

export const getAuthorizationUrl = async (
  state: string,
  codeVerifier: string,
) => {
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

  const existingAccount = await getAccountByProviderUserId({
    providerId: "google",
    providerUserId: googleUser.id,
  });

  if (existingAccount) return existingAccount.userId;

  const userId = await createOrGetExistingUserForUnlinkedProviderAccount({
    name: googleUser.name,
    email: googleUser.email,
    image: googleUser.picture,
    providerUserId: googleUser.id,
    providerId: "google",
  });

  return userId;
};
