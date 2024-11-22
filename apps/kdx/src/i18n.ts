/* eslint-disable */
import { notFound } from "next/navigation";
// const messagesFolderPath = path.resolve(
//   __dirname,
//   "../../../packages/locales/src/messages",
// );

// const loadMessages = async (folder: string, locale: string) => {
//   const messages = (
//     await import(path.resolve(messagesFolderPath, `${folder}/${locale}.json`))
//   ).default;
//   return messages;
// };
import { getRequestConfig } from "next-intl/server";

import { formats, locales } from "@kdx/locales";
import { formNs } from "@kdx/validators/zod-namespaces";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    //! We should only load messages that are hosted by kdx. No need to load more messages than necessary.
    messages: {
      ...(
        await import(
          `../../../packages/locales/src/messages/kdx/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../packages/locales/src/messages/api/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../packages/locales/src/messages/zod/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../../../packages/locales/src/messages/validators/${locale}.json`
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
  };
});
