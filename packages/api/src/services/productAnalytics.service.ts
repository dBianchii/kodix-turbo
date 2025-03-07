import { after } from "next/server";

import { posthog } from "../sdks/posthog";

export const captureProductAnalytic = ({
  userId,
  event,
  properties,
}: {
  userId: string;
  event: string;
  properties: Record<string, unknown>;
}) =>
  after(async () => {
    posthog.capture({
      distinctId: userId,
      event,
      properties,
    });
    await posthog.shutdown();
  });
