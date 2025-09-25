import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";

import {
  createDbSessionAndCookie,
  type KdxAuthProviders,
  kdxAuthProviders,
} from "@kdx/auth";

export async function GET(
  request: NextRequest,
  props: {
    params: Promise<{ provider: string }>;
  },
) {
  const params = await props.params;
  if (!Object.keys(kdxAuthProviders).includes(params.provider)) {
    console.error("Invalid oauth provider", params.provider);
    return new Response(null, {
      status: 400,
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = (await cookies()).get(`oauth_state`)?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    console.error(
      "token mismatch",
      "Could be an old cookie value or without a secured connection (https://...).",
    );

    // TODO: Maybe redirect back with a generic error?
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const currentProvider =
      kdxAuthProviders[params.provider as KdxAuthProviders];
    const codeVerifier = (await cookies()).get("code_verifier")?.value;
    if (currentProvider.name === "Google" && !codeVerifier) {
      console.error("Missing code verifier");
      return new Response(null, {
        status: 400,
      });
    }

    // biome-ignore lint/style/noNonNullAssertion: <biome migration>
    const userId = await currentProvider.handleCallback(code, codeVerifier!);

    await createDbSessionAndCookie({ userId });

    const callbackUrl = (await cookies()).get("callbackUrl")?.value;
    if (callbackUrl) (await cookies()).delete("callbackUrl");

    return new Response(null, {
      status: 302,
      headers: {
        Location: callbackUrl ?? "/team",
      },
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    console.error(e);
    return new Response(null, {
      status: 500,
    });
  }
}
