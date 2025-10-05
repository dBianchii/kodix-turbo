import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "~/styles/globals.css";

import { notFound } from "next/navigation";
import { getBaseUrl } from "@kodix/shared/utils";
import { cn } from "@kodix/ui";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { routing } from "~/i18n/routing";

import { CSPostHogProvider } from "./_components/posthog-provider";
import { Providers } from "./providers";

export const metadata: Metadata = {
  description: "Software on demand",
  metadataBase: new URL(getBaseUrl()),
  openGraph: {
    description: "Software on demand",
    siteName: "Kodix",
    title: "Kodix",
    url: getBaseUrl(),
  },
  title: "Kodix",
};

export const viewport: Viewport = {
  themeColor: [
    { color: "white", media: "(prefers-color-scheme: light)" },
    { color: "black", media: "(prefers-color-scheme: dark)" },
  ],
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: requestedLocale } = await props.params;
  if (!hasLocale(routing.locales, requestedLocale)) return notFound();
  setRequestLocale(requestedLocale);

  const messages = await getMessages();
  return (
    <html lang={(await props.params).locale} suppressHydrationWarning>
      <CSPostHogProvider>
        <body
          className={cn("font-sans", GeistSans.variable, GeistMono.variable)}
        >
          <Providers locale={requestedLocale} messages={messages}>
            <div className="flex min-h-screen flex-col">{props.children}</div>
          </Providers>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
