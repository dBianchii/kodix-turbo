"use client";

import { CashTRPCReactProvider } from "@cash/api/trpc/react/client";
import { Toaster } from "@kodix/ui/toast";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CashTRPCReactProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster />
        {children}
      </ThemeProvider>
    </CashTRPCReactProvider>
  );
}
