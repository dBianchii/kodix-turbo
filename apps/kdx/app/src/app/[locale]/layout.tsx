import type { Metadata, Viewport } from "next";
import { TailwindIndicator } from "@kodix/ui/common/tailwind-indicator";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { env } from "@kdx/env";

import { KdxTRPCReactProvider } from "~/trpc/react";

import "~/styles/globals.css";

import { notFound } from "next/navigation";
import { getBaseUrl } from "@kodix/shared/utils";
import { cn } from "@kodix/ui";
import { ThemeToggle } from "@kodix/ui/theme";
import { Toaster } from "@kodix/ui/toast";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";

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
          className={cn("font-sans", GeistSans.variable, GeistMono.variable)}
        >
          <SpeedInsights />
          <Analytics />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster
              closeButton
              duration={7000}
              pauseWhenPageIsHidden
              richColors
            />
            <CCNextIntlClientProvider locale={locale} messages={messages}>
              <PostHogPageView />
              <KdxTRPCReactProvider>
                <div className="flex min-h-screen flex-col">
                  {props.children}
                </div>
                {/* UI Design Helpers */}
                {env.NODE_ENV !== "production" && (
                  <div className="fixed bottom-2 left-16 z-50 flex flex-row items-center space-x-1">
                    <ThemeToggle />
                    <TailwindIndicator />
                  </div>
                )}
              </KdxTRPCReactProvider>
            </CCNextIntlClientProvider>
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
