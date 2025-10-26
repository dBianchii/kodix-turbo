"use server";

import { getPostHogServer } from "~/lib/posthog-server";

export async function testPosthog() {
  const posthog = getPostHogServer();
  posthog.captureException(
    new Error("Teste posthog com captureException no server!"),
    "123"
  );
  await posthog.shutdown();
}
