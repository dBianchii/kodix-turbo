import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type {
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import type { Pool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

import * as apps from "./schema/apps";
import * as calendar from "./schema/apps/calendar";
import * as kodixCare from "./schema/apps/kodixCare";
import * as todos from "./schema/apps/todos";
import * as auth from "./schema/auth";
import * as teams from "./schema/teams";

export * from "drizzle-orm";

export const schema = {
  ...auth,
  ...teams,
  ...apps,
  ...calendar,
  ...kodixCare,
  ...todos,
};

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};
const conn =
  globalForDb.conn ??
  createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, mode: "default" });

export type DrizzleTransaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
