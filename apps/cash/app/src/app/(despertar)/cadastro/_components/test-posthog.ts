"use server";

import { getPostHogServer } from "~/lib/posthog-server";

export async function testPosthog() {
  await getPostHogServer().capture({
    distinctId: "123",
    event: "teste-posthog-node",
  });
}
