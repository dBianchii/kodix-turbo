"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";

import { formats } from "@kdx/locales";
import { useI18nZodErrors } from "@kdx/validators/use-i18n-zod-errors";
import { formNs } from "@kdx/validators/zod-namespaces";

export function CCNextIntlClientProvider({
  children,
  messages,
  locale,
}: {
  locale: string;
  children: React.ReactNode;
  messages?: AbstractIntlMessages | undefined;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      getMessageFallback={({ namespace, key }) => {
        //TODO: unify it in a single place and not repeat it
        const defaultFallback = `${namespace}.${key}`;
        if (defaultFallback.startsWith(formNs)) return "missingTranslation";

        return defaultFallback;
      }}
      onError={(err) => {
        //TODO: unify it in a single place and not repeat it
        //TODO: Before, it was showing an error if it didnt find a translation. Now it is checking if the error is from the formNs and if it is, it will not show the error.
        //TODO: This is a temporary solution, we need to find a better solution to handle this error.
        if (err.originalMessage) {
          const match = /`([^`]+)`/.exec(err.originalMessage);
          const extracted = match ? match[1] : null;
          if (extracted?.startsWith(formNs)) return;
        }
        console.error(err);
      }}
      messages={messages}
      formats={formats}
      timeZone="America/Sao_Paulo" //?Fix me!
    >
      <I18nZodMessages />
      {children}
    </NextIntlClientProvider>
  );
}

function I18nZodMessages() {
  useI18nZodErrors();
  return null;
}
