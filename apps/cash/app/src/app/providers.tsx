"use client";

import { Toaster } from "@kodix/ui/toast";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Toaster />
      {children}
    </ThemeProvider>
  );
}
