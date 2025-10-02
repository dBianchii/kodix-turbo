"use client";

import { DevDesignHelper } from "@kodix/ui/common/dev-design-helper";
import { Toaster } from "@kodix/ui/toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Locale, type Messages, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";

import { KdxTRPCReactProvider } from "@kdx/api/trpc/react/client";
import { formats } from "@kdx/locales";
import { useI18nZodErrors } from "@kdx/validators/use-i18n-zod-errors";

import PostHogPageView from "./_components/posthog-page-view";

interface ProvidersProps {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <>
      <SpeedInsights />
      <Analytics />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          formats={formats}
          timeZone="America/Sao_Paulo" //?Fix me!
        >
          <I18nZodMessages />
          <PostHogPageView />
          <KdxTRPCReactProvider>
            {children}
            <DevDesignHelper />
          </KdxTRPCReactProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </>
  );
}

function I18nZodMessages() {
  useI18nZodErrors();
  return null;
}
