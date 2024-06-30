import type { NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import { OAuth2RequestError } from "arctic";

import type { Providers } from "@kdx/auth";
import { lucia, providers } from "@kdx/auth";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { provider: string };
  },
) {
  if (!Object.keys(providers).includes(params.provider)) {
    console.error("Invalid oauth provider", params.provider);
    return new Response(null, {
      status: 400,
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get(`oauth_state`)?.value ?? null;
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
    const currentProvider = providers[params.provider as Providers];
    const codeVerifier = cookies().get("code_verifier")?.value;
    if (currentProvider.name === "Google" && !codeVerifier) {
      console.error("Missing code verifier");
      return new Response(null, {
        status: 400,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = await currentProvider.handleCallback(code, codeVerifier!);

    const session = await lucia.createSession(userId, {
      ipAddress: getIp(),
      userAgent: request.headers.get("user-agent"),
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    const callbackUrl = cookies().get("callbackUrl")?.value;
    if (callbackUrl) cookies().delete("callbackUrl");

    return new Response(null, {
      status: 302,
      headers: {
        Location: callbackUrl ?? "/",
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

export function getIp() {
  const forwardedFor = headers().get("x-forwarded-for");
  const realIp = headers().get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}
