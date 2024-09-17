import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { NextIntlClientProvider } from "@kdx/locales/next-intl/provider";

import { TailwindIndicator } from "~/app/[locale]/_components/tailwind-indicator";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { formats } from "@kdx/locales";
import { getMessages } from "@kdx/locales/next-intl/server";
import { getBaseUrl } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { ThemeProvider, ThemeToggle } from "@kdx/ui/theme";
import { Toaster } from "@kdx/ui/toast";

import { Header } from "./_components/header/header";
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

// export function generateStaticParams() {
//   return getStaticParams();
// }

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={props.params.locale} suppressHydrationWarning>
      <CSPostHogProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans text-foreground antialiased",
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          <SpeedInsights />
          <Analytics />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster richColors closeButton />
            <NextIntlClientProvider messages={messages} formats={formats}>
              <TRPCReactProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
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
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
