"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { env } from "@kdx/env";

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (env.NODE_ENV === "development") return;
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    });
  }, []);

  if (env.NODE_ENV === "development") return children;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
