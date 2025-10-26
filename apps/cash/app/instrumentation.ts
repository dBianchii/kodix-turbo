// instrumentation.js
export function register() {
  // No-op for initialization
}

import type { Instrumentation } from "next";

const POSTHOG_COOKIE_REGEX = /ph_phc_.*?_posthog=([^;]+)/;

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request
) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getPostHogServer } = await import("~/lib/posthog-server");
    const posthog = getPostHogServer();
    let distinctId: string | null = null;
    if (request.headers.cookie) {
      // Normalize multiple cookie arrays to string
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join("; ")
        : request.headers.cookie;

      const postHogCookieMatch = cookieString.match(POSTHOG_COOKIE_REGEX);

      if (postHogCookieMatch?.[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
          const postHogData = JSON.parse(decodedCookie);
          distinctId = postHogData.distinct_id;
        } catch (e) {
          // biome-ignore lint/suspicious/noConsole: For observability
          console.error("Error parsing PostHog cookie:", e);
        }
      }
    }

    await posthog.captureException(err, distinctId || undefined);
  }
};
