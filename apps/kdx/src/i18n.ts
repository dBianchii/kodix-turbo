/* eslint-disable */
import { notFound } from "next/navigation";

import { locales } from "@kdx/locales/locales";
import { getRequestConfig } from "@kdx/locales/server";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (
      await import(`../../../packages/locales/src/messages/${locale}.json`)
    ).default,
  };
});
