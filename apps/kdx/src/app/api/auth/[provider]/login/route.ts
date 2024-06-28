import { cookies } from "next/headers";
import { generateCodeVerifier, generateState } from "arctic";

import type { Providers } from "@kdx/auth";
import { providers } from "@kdx/auth";

import { env } from "~/env";

export async function GET(
  request: Request,
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

  const state = generateState();
  const currentProvider = providers[params.provider as Providers];
  const url = await currentProvider.getAuthorizationUrl(state);
  if (currentProvider.name === "Google") {
    const codeVerifier = generateCodeVerifier();
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

  return Response.redirect(url);
}
