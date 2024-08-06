import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "@kdx/locales";
import { createMiddleware } from "@kdx/locales/next-intl";

const I18nMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "as-needed",
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  // matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",

    // Match all pathnames within `/users`, optionally with a locale prefix
    // "/(.+)?/users/(.+)",
  ],
};
