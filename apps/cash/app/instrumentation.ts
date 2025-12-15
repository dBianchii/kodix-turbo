import type { Instrumentation } from "next";

export async function register() {
  // No-op for initialization
}

/**
 * Regex pattern to match PostHog cookies in the Cookie header.
 *
 * PostHog stores client identification in a cookie named `ph_<project_key>_posthog`.
 * The cookie value is a URL-encoded JSON object containing user session data.
 *
 * Pattern breakdown:
 * - `ph_phc_` - Cookie name prefix (ph_ + project key prefix phc_)
 * - `.*?` - Project key (non-greedy match)
 * - `_posthog=` - Cookie name suffix
 * - `([^;]+)` - Capture group for cookie value (everything until semicolon or end)
 *
 * Example cookie: `ph_phc_abc123_posthog=%7B%22distinct_id%22%3A%22user-123%22%7D`
 * Decoded value: `{"distinct_id":"user-123",...}`
 */
const POSTHOG_COOKIE_REGEX = /ph_phc_.*?_posthog=([^;]+)/;

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  errorRequest,
  _errorContext,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    //Skip in development
    return;
  }

  const { getPostHogServer } = await import("@kodix/posthog");
  const posthog = getPostHogServer();
  let distinctId: string | null = null;
  if (errorRequest.headers.cookie) {
    // Normalize multiple cookie arrays to string
    const cookieString = Array.isArray(errorRequest.headers.cookie)
      ? errorRequest.headers.cookie.join("; ")
      : errorRequest.headers.cookie;

    const postHogCookieMatch = cookieString.match(POSTHOG_COOKIE_REGEX);

    if (postHogCookieMatch?.[1]) {
      try {
        // PostHog cookie value is URL-encoded JSON containing distinct_id and session data
        const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
        const postHogData = JSON.parse(decodedCookie);
        distinctId = postHogData.distinct_id;
      } catch (e) {
        // biome-ignore lint/suspicious/noConsole: For observability
        console.error("Error parsing PostHog cookie:", e);
      }
    }
  }

  posthog.captureException(error, distinctId || undefined);
  await posthog.shutdown();
};
