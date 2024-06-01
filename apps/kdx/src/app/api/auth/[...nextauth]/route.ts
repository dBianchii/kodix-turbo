import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { GET as DEFAULT_GET, POST as DEFAULT_POST } from "@kdx/auth";

import { env } from "~/env";

const EXPO_COOKIE_NAME = "__kdx-expo-redirect-state";
const AUTH_COOKIE_PATTERN = /authjs\.session-token=([^;]+)/;

/**
 * Correct request.url for local development so that Expo can work. Does nothing in production.
 * @param req The request to modify
 * @returns The modified request.
 */
function rewriteRequestUrl(req: NextRequest) {
  if (env.NODE_ENV === "production") {
    return req;
  }
  const host = req.headers.get("host");
  const newURL = new URL(req.url);
  newURL.host = host ?? req.nextUrl.host;
  return new NextRequest(newURL, req);
}

export const POST = async (req: NextRequest) => {
  // First step must be to correct the request URL.
  req = rewriteRequestUrl(req);
  return DEFAULT_POST(req);
};

export const GET = async (
  req: NextRequest,
  props: { params: { nextauth: string[] } },
) => {
  const nextauthAction = props.params.nextauth[0];
  const isExpoSignIn = req.nextUrl.searchParams.get("expo-redirect");
  const isExpoCallback = cookies().get(EXPO_COOKIE_NAME);

  if (nextauthAction === "signin" && !!isExpoSignIn) {
    // set a cookie we can read in the callback
    // to know to send the user back to expo
    cookies().set({
      name: EXPO_COOKIE_NAME,
      value: isExpoSignIn,
      maxAge: 60 * 10, // 10 min
      path: "/",
    });
  }

  if (nextauthAction === "callback" && !!isExpoCallback) {
    cookies().delete(EXPO_COOKIE_NAME);

    const authResponse = await DEFAULT_GET(req);
    const setCookie = authResponse.headers
      .getSetCookie()
      .find((cookie) => AUTH_COOKIE_PATTERN.test(cookie));
    const match = setCookie?.match(AUTH_COOKIE_PATTERN)?.[1];

    if (!match)
      throw new Error(
        "Unable to find session cookie: " +
          JSON.stringify(authResponse.headers.getSetCookie()),
      );

    const url = new URL(isExpoCallback.value);
    url.searchParams.set("session_token", match);
    return NextResponse.redirect(url);
  }

  // Every other request just calls the default handler
  return DEFAULT_GET(req);
};
