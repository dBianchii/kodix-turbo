"use server";

import { getPostHogServer } from "~/lib/posthog-server";

export async function testPosthog() {
  await getPostHogServer().captureException(
    new Error("Teste posthog com captureException no server!")
  );
}
