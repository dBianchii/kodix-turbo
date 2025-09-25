import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";

import { type KdxAuthProviders, kdxAuthProviders } from "@kdx/auth";
import { env } from "@kdx/env";

const providersWithCodeVerifier = ["Google"];

export async function GET(
  request: NextRequest,
  props: {
    params: Promise<{ provider: string }>;
  },
) {
  const params = await props.params;
  if (!Object.keys(kdxAuthProviders).includes(params.provider)) {
    console.error("Invalid oauth provider", params.provider);
    return new NextResponse(null, {
      status: 400,
    });
  }

  const state = generateState();
  const currentProvider = kdxAuthProviders[params.provider as KdxAuthProviders];

  const codeVerifier = generateCodeVerifier(); //? Not needed for all providers.
  const url = await currentProvider.getAuthorizationUrl(state, codeVerifier);

  (await cookies()).set(`oauth_state`, state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  if (providersWithCodeVerifier.includes(currentProvider.name))
    (await cookies()).set("code_verifier", codeVerifier, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

  const invite = request.nextUrl.searchParams.get("invite");
  if (invite)
    (await cookies()).set("invite", invite, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  if (callbackUrl)
    (await cookies()).set("callbackUrl", callbackUrl, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

  return NextResponse.redirect(url);
}
