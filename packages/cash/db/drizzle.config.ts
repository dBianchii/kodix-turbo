import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

export default {
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/**",
} satisfies Config;
