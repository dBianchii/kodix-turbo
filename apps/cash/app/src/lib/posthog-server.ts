import { PostHog } from "posthog-node";

// NOTE: This is a Node.js client, so you can use it for sending events from the server side to PostHog.
export function getPostHogServer() {
  // biome-ignore lint/style/noNonNullAssertion: Fix me
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    flushAt: 1,
    flushInterval: 0,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
  return posthogClient;
}
