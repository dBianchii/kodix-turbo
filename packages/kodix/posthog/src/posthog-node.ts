import { PostHog } from "posthog-node";

export const getPostHogServer = () =>
  // biome-ignore lint/style/noNonNullAssertion: Fix me
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    enableExceptionAutocapture: true,
    flushAt: 1,
    flushInterval: 0,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

type CaptureExceptionParams = Parameters<
  ReturnType<typeof getPostHogServer>["captureException"]
>;

export const captureException = (...args: CaptureExceptionParams) => {
  // Don't send any events to PostHog locally
  if (process.env.NODE_ENV === "development") {
    return;
  }

  getPostHogServer().captureException(...args);
};
