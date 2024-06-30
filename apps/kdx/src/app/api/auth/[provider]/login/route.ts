import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";

import type { Providers } from "@kdx/auth";
import { providers } from "@kdx/auth";

import { env } from "~/env";

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
    return new NextResponse(null, {
      status: 400,
    });
  }

  const state = generateState();
  const currentProvider = providers[params.provider as Providers];

  const codeVerifier = generateCodeVerifier(); //? Not needed for all providers.
  const url = await currentProvider.getAuthorizationUrl(state, codeVerifier);
  if (currentProvider.name === "Google") {
    cookies().set("code_verifier", codeVerifier, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
  }
  cookies().set(`oauth_state`, state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  const { searchParams } = new URL(request.url);
  const invite = searchParams.get("invite");

  return new NextResponse(null, {
    ...(invite
      ? {
          headers: {
            invite,
          },
        }
      : {}),
    url: url.href,
  });
}
