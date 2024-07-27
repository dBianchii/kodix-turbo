/* eslint-disable */
import { notFound } from "next/navigation";

import { getRequestConfig } from "@kdx/locales";

const locales = ["pt-BR", "en"];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (
      await import(`../../../packages/locales/src/messages/${locale}.json`)
    ).default,
  };
});
