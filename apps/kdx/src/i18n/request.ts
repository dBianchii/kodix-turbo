/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { getRequestConfig } from "next-intl/server";

import { formats } from "@kdx/locales";
import { formNs } from "@kdx/validators/zod-namespaces";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  // Ensure that a valid locale is used
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
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
          `../../../../packages/locales/src/messages/zod/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../../packages/locales/src/messages/validators/${locale}.json`
        )
      ).default,
    },
    formats: formats,
    getMessageFallback({ namespace, key }) {
      //TODO: unify it in a single place and not repeat it
      const defaultFallback = `${namespace}.${key}`;
      if (defaultFallback.startsWith(formNs)) return "missingTranslation";

      return defaultFallback;
    },
    onError(err) {
      //TODO: unify it in a single place and not repeat it
      //TODO: Before, it was showing an error if it didnt find a translation. Now it is checking if the error is from the formNs and if it is, it will not show the error.
      //TODO: This is a temporary solution, we need to find a better solution to handle this error.
      if (err.originalMessage) {
        const match = /`([^`]+)`/.exec(err.originalMessage);
        const extracted = match ? match[1] : null;
        if (extracted?.startsWith(formNs)) return;
      }
      console.error(err);
    },
  };
});
