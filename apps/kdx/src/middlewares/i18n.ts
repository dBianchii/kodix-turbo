import type { NextFetchEvent, NextRequest } from "next/server";

import { defaultLocale, locales } from "@kdx/locales";
import { createMiddleware } from "@kdx/locales/next-intl";

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
