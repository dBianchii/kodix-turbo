import path from "path";
import { notFound } from "next/navigation";

import { locales } from "@kdx/locales";
import { getRequestConfig } from "@kdx/locales/next-intl/server";

const messagesFolderPath = path.resolve(
  __dirname,
  "../../../packages/locales/src/messages",
);

const loadMessages = async (folder: string, locale: string) => {
  const messages = (
    await import(path.resolve(messagesFolderPath, `${folder}/${locale}.json`))
  ).default;
  return messages;
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    //! We should only load messages that are hosted by kdx. No need to load more messages than necessary.
    messages: {
      ...(await loadMessages("kdx", locale)),
      ...(await loadMessages("api", locale)),
      ...(await loadMessages("validators", locale)),
      ...(await loadMessages("zod", locale)),
    },
  };
});
