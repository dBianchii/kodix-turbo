import type { Config } from "drizzle-kit";

if (!process.env.MYSQL_URL) {
  throw new Error("Missing MYSQL_URL");
}

export default {
  schema: "./src/schema/**",
  out: "./drizzle",
  dialect: "mysql",

  dbCredentials: { url: process.env.MYSQL_URL },
} satisfies Config;
