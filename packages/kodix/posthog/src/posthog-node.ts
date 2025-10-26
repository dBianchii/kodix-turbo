import { PostHog } from "posthog-node";

export const getPostHogServer = () =>
  // biome-ignore lint/style/noNonNullAssertion: Fix me
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    enableExceptionAutocapture: true,
    flushAt: 1,
    flushInterval: 0,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
