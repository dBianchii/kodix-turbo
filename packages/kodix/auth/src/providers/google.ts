import type { AuthProvider, ProviderConfig } from ".";
import { getBaseUrl } from "@kodix/shared/utils";
import { Google } from "arctic";

type GoogleUser = {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  picture: string;
  verified_email: boolean;
};

export const createGoogleProvider = (config: ProviderConfig): AuthProvider => {
  const google = new Google(
    process.env.AUTH_GOOGLE_CLIENT_ID ?? "",
    process.env.AUTH_GOOGLE_CLIENT_SECRET ?? "",
    `${getBaseUrl()}/api/auth/google/callback`
  );

  const name = "Google";

  const getAuthorizationUrl = async (state: string, codeVerifier: string) => {
    return await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ["profile", "email"],
    });
  };

  const handleCallback = async (code: string, codeVerifier: string) => {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const googleUser = (await response.json()) as GoogleUser;

    const existingAccount =
      await config.repositories.findAccountByProviderUserId({
        providerId: "google",
        providerUserId: googleUser.id,
      });

    if (existingAccount) return existingAccount.userId;

    const userId = await config.repositories.createUserWithProvider({
      name: googleUser.name,
      email: googleUser.email,
      image: googleUser.picture,
      providerUserId: googleUser.id,
      providerId: "google",
    });

    return userId;
  };

  return {
    name,
    handleCallback,
    getAuthorizationUrl,
  };
};
