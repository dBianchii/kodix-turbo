import type { Config } from "drizzle-kit";

const uri = [
  "mysql://",
  process.env.DB_USERNAME,
  ":",
  process.env.DB_PASSWORD,
  "@",
  process.env.DB_HOST,
  ":",
  process.env.DB_PORT,
  "/",
  process.env.DB_NAME,
].join("");

export default {
  schema: "./src/schema/**",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: { uri: uri },
} satisfies Config;
