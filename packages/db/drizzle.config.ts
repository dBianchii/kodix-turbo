import type { Config } from "drizzle-kit";

// eslint-disable-next-line no-restricted-properties -- Disabled because we use it for studio
if (!process.env.MYSQL_URL) {
  throw new Error("Missing MYSQL_URL");
}

export default {
  schema: "./src/schema/**",
  out: "./drizzle",
  dialect: "mysql",
  // eslint-disable-next-line no-restricted-properties
  dbCredentials: { url: process.env.MYSQL_URL },
} satisfies Config;
