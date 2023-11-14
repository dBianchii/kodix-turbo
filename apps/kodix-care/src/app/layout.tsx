import type { Metadata } from "next";

import "@/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { cookies } from "next/headers";

import { cn } from "@kdx/ui";

import { AuthProvider, NextThemeProvider } from "~/app/_components/providers";
import { TRPCReactProvider } from "~/trpc/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kodix App",
  description: "Example Kodix app description",
  // openGraph: {
  //   title: "Kodix App",
  //   description: "Simple monorepo with shared backend for web & mobile apps",
  //   url: "https://create-t3-turbo.vercel.app",
  //   siteName: "Kodix App",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   site: "Create T3 Turbo",
  //   creator: "@Gabriel",
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
          <AuthProvider>
            <NextThemeProvider>
              <div className="p-8">{props.children}</div>
            </NextThemeProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
