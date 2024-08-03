import type { Metadata, Viewport } from "next";

import { NextIntlClientProvider } from "@kdx/locales/next-intl/provider";

import "~/app/globals.css";

import { getMessages } from "@kdx/locales/next-intl/server";

export const metadata: Metadata = {
  title: "Kodix",
  description: "Software on demand",

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
      <body
        className={
          "min-h-screen bg-background font-sans text-foreground antialiased"
        }
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">{props.children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
