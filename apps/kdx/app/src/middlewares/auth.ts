import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "@kdx/env";

import type { CustomMiddleware } from "./chain-middleware";

export function withAuth(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    if (request.method === "GET") {
      const response = NextResponse.next();
      const token = request.cookies.get("session")?.value ?? null;
      if (token !== null) {
        // Only extend cookie expiration on GET requests since we can be sure
        // a new session wasn't set when handling the request.
        response.cookies.set("session", token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
          httpOnly: true,
          secure: env.NODE_ENV === "production",
        });
      }
      return middleware(request, event, response);
    }

    const response = NextResponse.next();
    return middleware(request, event, response);
  };
}
