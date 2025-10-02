import type { Metadata, Viewport } from "next";
import { sharedMetadata, sharedViewport } from "@kodix/ui/common/shared-meta";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "~/styles/globals.css";

import { getBaseUrl } from "@kodix/shared/utils";
import { cn } from "@kodix/ui";

import { Providers } from "./providers";

export const metadata: Metadata = {
  ...sharedMetadata,
  description: "Ganhe cashback em produtos e serviços",
  openGraph: {
    description: "Ganhe cashback em produtos e serviços",
    siteName: "Kodix Cash",
    title: "Kodix Cash",
    url: getBaseUrl(),
  },
  title: "Kodix Cash",
};

export const viewport: Viewport = {
  ...sharedViewport,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={"pt-BR"} suppressHydrationWarning>
      <body className={cn("font-sans", GeistSans.variable, GeistMono.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
