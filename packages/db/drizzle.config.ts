import type { Config } from "drizzle-kit";

const uri = [
  "mysql://",
  process.env.DB_USERNAME,
  ":",
  process.env.DB_PASSWORD,
  "@",
  process.env.DB_HOST,
  ":3306/",
  process.env.DB_NAME,
  '?ssl={"rejectUnauthorized":true}',
].join("");

console.log(uri);

export default {
  schema: "./src/schema",
  driver: "mysql2",
  dbCredentials: { uri },
  // tablesFilter: ["drizzlekdx_*"],
} satisfies Config;
