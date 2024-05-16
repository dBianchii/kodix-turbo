import type { Config } from "drizzle-kit";
import { createEnv } from "@t3-oss/env-core";
import z from "zod";

const env = createEnv({
  server: {
    DB_HOST: z.string(),
    DB_NAME: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_PORT: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export const connectionStr = new URL(
  `mysql://${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
);
connectionStr.username = env.DB_USERNAME;
connectionStr.password = env.DB_PASSWORD;

export default {
  schema: "./src/schema/**",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: { url: connectionStr.href },
} satisfies Config;
