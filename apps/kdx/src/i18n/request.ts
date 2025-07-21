/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { getRequestConfig } from "next-intl/server";

import { formats } from "@kdx/locales";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  // Ensure that a valid locale is used
  // biome-ignore lint/suspicious/noExplicitAny: <fix me>
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    //! We should only load messages that are hosted by kdx. No need to load more messages than necessary.
    messages: {
      ...(
        await import(
          `../../../../packages/locales/src/messages/kdx/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../../packages/locales/src/messages/api/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../../packages/locales/src/messages/validators/${locale}.json`
        )
      ).default,
    },
    formats: formats,
  };
});
