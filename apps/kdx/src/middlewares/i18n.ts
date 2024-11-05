import type { NextFetchEvent, NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "@kdx/locales";

import type { CustomMiddleware } from "~/middlewares/chain-middleware";

const I18nMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "as-needed",
});

export function withI18n(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = I18nMiddleware(request);

    return middleware(request, event, response);
  };
}
