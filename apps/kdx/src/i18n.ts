import { notFound } from "next/navigation";

import { getRequestConfig } from "@kdx/locales";

const locales = ["pt-BR", "en"];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  //eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (
      await import(`../../../packages/locales/src/messages/${locale}.json`)
    ).default,
  };
});
