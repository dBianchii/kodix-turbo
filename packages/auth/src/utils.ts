import { NextRequest } from "next/server";

import { isSecureContext } from "./config";

/**
 * Noop in production.
 *
 * In development, rewrite the request URL to use localhost instead of host IP address
 * so that Expo Auth works without getting trapped by Next.js CSRF protection.
 * @param req The request to modify
 * @returns The modified request.
 */
export function rewriteRequestUrlInDevelopment(req: NextRequest) {
  if (isSecureContext) return req;

  const host = req.headers.get("host");
  const newURL = new URL(req.url);
  newURL.host = host ?? req.nextUrl.host;
  return new NextRequest(newURL, req);
}
