import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const requiredInProductionOnly = (string: string | undefined) =>
  !!string || process.env.NODE_ENV !== "production";

export const env = createEnv({
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
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),

    QSTASH_CURRENT_SIGNING_KEY: z
      .string()
      .optional()
      .refine(requiredInProductionOnly, { message: "Required in production" }),
    QSTASH_NEXT_SIGNING_KEY: z
      .string()
      .optional()
      .refine(requiredInProductionOnly, { message: "Required in production" }),
    AUTH_GOOGLE_CLIENT_ID: z.string(),
    AUTH_GOOGLE_CLIENT_SECRET: z.string(),
    AUTH_DISCORD_ID: z.string().optional(),
    AUTH_DISCORD_SECRET: z.string().optional(),
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
    MYSQL_URL: process.env.MYSQL_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AWS_SMTP_USER: process.env.AWS_SMTP_USER,
    AWS_SMTP_PASSWORD: process.env.AWS_SMTP_PASSWORD,
    DISABLE_UPSTASH_CACHE: process.env.DISABLE_UPSTASH_CACHE,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
