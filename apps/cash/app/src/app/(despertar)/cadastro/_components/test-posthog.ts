"use server";

import PostHogClient from "~/lib/posthog";

export async function testPosthog() {
  await PostHogClient().capture({
    distinctId: "123",
    event: "teste-posthog-node",
  });
}
