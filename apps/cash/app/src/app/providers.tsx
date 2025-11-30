"use client";

import { CashTRPCReactProvider } from "@cash/api/trpc/react/client";
import { Toaster } from "@kodix/ui/sonner";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CashTRPCReactProvider>
      <NuqsAdapter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
      </NuqsAdapter>
    </CashTRPCReactProvider>
  );
}
