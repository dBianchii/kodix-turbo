import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";

import type { Providers } from "@kdx/auth";
import { providers } from "@kdx/auth";

import { env } from "~/env";

const providersWithCodeVerifier = ["Google"];

export async function GET(
  _req: NextRequest,
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

  cookies().set(`oauth_state`, state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  if (providersWithCodeVerifier.includes(currentProvider.name))
    cookies().set("code_verifier", codeVerifier, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

  const invite = request.nextUrl.searchParams.get("invite");
  if (invite)
    cookies().set("invite", invite, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  if (callbackUrl)
    cookies().set("callbackUrl", callbackUrl, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

  return NextResponse.redirect(url);
}
