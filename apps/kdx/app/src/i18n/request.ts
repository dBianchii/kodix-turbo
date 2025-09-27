import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { formats } from "@kdx/locales";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  // Ensure that a valid locale is used
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    //! We should only load messages that are hosted by kdx. No need to load more messages than necessary.
    messages: {
      ...(
        await import(
          `../../../../../packages/kdx/locales/src/messages/kdx/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../../../packages/kdx/locales/src/messages/api/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../../../packages/kdx/locales/src/messages/validators/${locale}.json`
        )
      ).default,
    },
    formats: formats,
  };
});
