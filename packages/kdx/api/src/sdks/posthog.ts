import { PostHog } from "posthog-node";

import { env } from "@kdx/env";

export const posthog = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
  flushAt: 1,
  flushInterval: 0,
  host: env.NEXT_PUBLIC_POSTHOG_HOST,
});
