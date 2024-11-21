"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";

import { formats } from "@kdx/locales";
import { useI18nZodErrors } from "@kdx/validators/useI18nZodErrors";
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
        const defaultFallback = `${namespace}.${key}`;
        if (defaultFallback.startsWith(formNs)) return "missingTranslation";

        return defaultFallback;
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
