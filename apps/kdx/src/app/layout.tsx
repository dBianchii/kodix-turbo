import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Footer } from "~/app/_components/footer/footer";
import { TailwindIndicator } from "~/app/_components/tailwind-indicator";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { kdxProductionURL } from "@kdx/shared";
import { ThemeProvider, ThemeToggle } from "@kdx/ui/theme";
import { Toaster } from "@kdx/ui/toast";
import { cn } from "@kdx/ui/utils";

import { Header } from "./_components/header/header";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? kdxProductionURL
      : "http://localhost:3000",
  ),
  title: "Kodix",
  description: "Software on demand",
  openGraph: {
    title: "Kodix",
    description: "Software on demand",
    url: kdxProductionURL,
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

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <SpeedInsights />
        <Analytics />
        <Toaster richColors closeButton />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              {props.children}
              <Footer />
            </div>
          </TRPCReactProvider>

          {/* UI Design Helpers */}
          {process.env.NODE_ENV !== "production" && (
            <div className="fixed bottom-1 z-50 flex flex-row items-center space-x-1">
              <ThemeToggle />
              <TailwindIndicator />
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
