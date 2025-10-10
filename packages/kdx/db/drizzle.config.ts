import type { Config } from "drizzle-kit";

if (!process.env.MYSQL_URL) {
  throw new Error("Missing MYSQL_URL");
}

export default {
  dbCredentials: { url: process.env.MYSQL_URL },
  dialect: "mysql",
  out: "./drizzle",
  schema: "./src/schema/**",
} satisfies Config;
