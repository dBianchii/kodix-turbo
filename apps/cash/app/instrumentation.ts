import type { Instrumentation } from "next";

export async function register() {
  // No-op for initialization
}

const POSTHOG_COOKIE_REGEX = /ph_phc_.*?_posthog=([^;]+)/;

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  errorRequest,
  _errorContext
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.VERCEL_ENV === "development") {
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
