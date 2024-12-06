import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { getLocale } from "next-intl/server";

import { TailwindIndicator } from "~/app/[locale]/_components/tailwind-indicator";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import dynamic from "next/dynamic";
import { getMessages } from "next-intl/server";

import { getBaseUrl } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { ThemeProvider, ThemeToggle } from "@kdx/ui/theme";
import { Toaster } from "@kdx/ui/toast";

import { CCNextIntlClientProvider } from "./_components/cc-next-intl-client-provider";
import { CSPostHogProvider } from "./_components/posthog-provider";

const PostHogPageView = dynamic(
  () => import("./_components/posthog-page-view"),
  {
    ssr: false,
  },
);

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
  const messages = await getMessages();
  const locale = await getLocale();
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
            <Toaster richColors closeButton pauseWhenPageIsHidden />
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
