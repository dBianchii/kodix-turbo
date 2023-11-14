import type { Metadata } from "next";

import "@kdx/ui/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { cookies } from "next/headers";

import { cn, Toaster } from "@kdx/ui";

import { Footer } from "~/app/_components/footer/footer";
import { Header } from "~/app/_components/header/header";
import { NextThemeProvider } from "~/app/_components/providers";
import { TailwindIndicator } from "~/app/_components/tailwind-indicator";
import { ThemeSwitcher } from "~/app/_components/theme-switcher";
import { TRPCReactProvider } from "~/trpc/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kodix",
  description: "Software on demand",
  // openGraph: {
  //   title: "Kodix",
  //   description: "Software on demand",
  //   url: "https://kodix.com.br",
  //   siteName: "Kodix",
  // },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider cookies={cookies().toString()}>
          <NextThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster richColors closeButton />

            <Header />
            <main className="p-8">{props.children}</main>
            <Footer />

            {/* UI Design Helpers */}
            {process.env.NODE_ENV !== "production" && (
              <div className="fixed bottom-1 z-50 flex flex-row items-center space-x-1">
                <ThemeSwitcher />
                <TailwindIndicator />
              </div>
            )}
          </NextThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
