import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CAME_FROM_INVITE_COOKIE_NAME } from "node_modules/@kdx/auth/src/config";

import { handlers, rewriteRequestUrlInDevelopment } from "@kdx/auth";

export const EXPO_COOKIE_NAME = "__kdx-expo-redirect-state";
const AUTH_COOKIE_PATTERN = /authjs\.session-token=([^;]+)/;

export const POST = async (_req: NextRequest) => {
  // First step must be to correct the request URL.
  const req = rewriteRequestUrlInDevelopment(_req);
  return handlers.POST(req);
};

export const GET = async (
  _req: NextRequest,
  props: { params: { nextauth: string[] } },
) => {
  // First step must be to correct the request URL.
  const req = rewriteRequestUrlInDevelopment(_req);

  const nextauthAction = props.params.nextauth[0];
  const isExpoSignIn = req.nextUrl.searchParams.get("expo-redirect");
  const isExpoCallback = cookies().get(EXPO_COOKIE_NAME);

  if (nextauthAction === "signin") {
    if (isExpoSignIn) {
      // set a cookie we can read in the callback
      // to know to send the user back to expo
      cookies().set({
        name: EXPO_COOKIE_NAME,
        value: isExpoSignIn,
        maxAge: 60 * 10, // 10 min
        path: "/",
      });
    }

    const cameFromInvite = req.nextUrl.searchParams.get("invite");
    if (cameFromInvite) {
      //Request came from invite. Set a cookie so we can use it in the createUser function
      const invitationId = cameFromInvite;
      if (!invitationId)
        throw new Error(`Invalid expo register query param: ${cameFromInvite}`);

      cookies().set({
        name: CAME_FROM_INVITE_COOKIE_NAME,
        value: invitationId,
        maxAge: 60 * 4,
        path: "/",
      });
      req.nextUrl.searchParams.delete("invite");
    }
  }

  if (nextauthAction === "callback" && !!isExpoCallback) {
    cookies().delete(EXPO_COOKIE_NAME);

    // Run original handler, then extract the session token from the response
    // Send it back via a query param in the Expo deep link. The Expo app
    // will then get that and set it in the session storage.
    const authResponse = await handlers.GET(req);
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
  return handlers.GET(req);
};
