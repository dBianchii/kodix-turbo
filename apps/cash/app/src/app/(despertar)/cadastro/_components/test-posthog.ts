"use server";

import PostHogClient from "~/lib/posthog";

export function testPosthog() {
  PostHogClient().capture({ distinctId: "123", event: "teste-posthog-node" });
}
