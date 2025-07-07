import type { Config } from "drizzle-kit";

import { env } from "@kdx/env";

if (!env.MYSQL_URL) {
  throw new Error("Missing MYSQL_URL");
}

export default {
  schema: "./src/schema/**",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: { url: env.MYSQL_URL },
} satisfies Config;
