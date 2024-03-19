import type { Config } from "drizzle-kit";

// const uri = [
//   "mysql://",
//   process.env.DB_USERNAME,
//   ":",
//   process.env.DB_PASSWORD,
//   "@",
//   process.env.DB_HOST,
//   ":58247/",
//   process.env.DB_NAME,
//   !process.env.DB_HOST?.includes("localhost")
//     ? '?ssl={"rejectUnauthorized":true}'
//     : "",
// ].join("");

export default {
  schema: "./src/schema",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: { uri: process.env.DATABASE_URL! },
} satisfies Config;
