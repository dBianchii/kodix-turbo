import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

import { env as authEnv } from "@kdx/auth/env";

const requiredInProductionOnly = (string: string | undefined) =>
  !!string || process.env.NODE_ENV !== "production";

export const env = createEnv({
  extends: [authEnv, vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    MYSQL_URL: z.string(),

    RESEND_API_KEY: z.string(),
    AWS_SMTP_USER: z.string().optional(), //TODO: Remove once we know
    AWS_SMTP_PASSWORD: z.string().optional(),

    DISABLE_UPSTASH_CACHE: z.coerce.boolean().default(false),
    UPSTASH_REDIS_REST_URL: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),

    QSTASH_CURRENT_SIGNING_KEY: z
      .string()
      .optional()
      .refine(requiredInProductionOnly, { message: "Required in production" }),
    QSTASH_NEXT_SIGNING_KEY: z
      .string()
      .optional()
      .refine(requiredInProductionOnly, { message: "Required in production" }),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
