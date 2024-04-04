import type { NextRequest } from "next/server";

import { createI18nMiddleware } from "@kdx/locales";

const I18nMiddleware = createI18nMiddleware({
  locales: ["pt-BR", "en"],
  defaultLocale: "pt-BR",
  urlMappingStrategy: "rewriteDefault",
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
