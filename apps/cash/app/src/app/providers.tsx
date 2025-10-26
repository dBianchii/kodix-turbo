"use client";

import { useEffect } from "react";
import { CashTRPCReactProvider } from "@cash/api/trpc/react/client";
import { Toaster } from "@kodix/ui/toast";
import { ThemeProvider } from "next-themes";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // biome-ignore lint/style/noNonNullAssertion: Fix me
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: "/ingest",
        capture_exceptions: true,
        debug: true,
        defaults: "2025-05-24",
        ui_host: "https://us.posthog.com",
      });
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <CashTRPCReactProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
      </CashTRPCReactProvider>
    </PostHogProvider>
  );
}
