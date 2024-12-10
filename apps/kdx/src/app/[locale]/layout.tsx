import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { TailwindIndicator } from "~/app/[locale]/_components/tailwind-indicator";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";

import { getBaseUrl } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { ThemeProvider, ThemeToggle } from "@kdx/ui/theme";
import { Toaster } from "@kdx/ui/toast";

import { routing } from "~/i18n/routing";
import { CCNextIntlClientProvider } from "./_components/cc-next-intl-client-provider";
import PostHogPageView from "./_components/posthog-page-view";
import { CSPostHogProvider } from "./_components/posthog-provider";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Kodix",
  description: "Software on demand",
  openGraph: {
    title: "Kodix",
    description: "Software on demand",
    url: getBaseUrl(),
    siteName: "Kodix",
  },
  twitter: {
    card: "summary_large_image",
    site: "@dbianchii",
    creator: "@dbianchii",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  if (!routing.locales.includes(locale as never)) return notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  return (
    <html lang={(await props.params).locale} suppressHydrationWarning>
      <CSPostHogProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans text-foreground antialiased",
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          <PostHogPageView />
          <SpeedInsights />
          <Analytics />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster
              richColors
              closeButton
              pauseWhenPageIsHidden
              duration={7000}
            />
            <CCNextIntlClientProvider messages={messages} locale={locale}>
              <TRPCReactProvider>
                <div className="flex min-h-screen flex-col">
                  {props.children}
                </div>
                {/* UI Design Helpers */}
                {env.NODE_ENV !== "production" && (
                  <div className="fixed bottom-1 z-50 flex flex-row items-center space-x-1">
                    <ThemeToggle />
                    <TailwindIndicator />
                  </div>
                )}
              </TRPCReactProvider>
            </CCNextIntlClientProvider>
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
