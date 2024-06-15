import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type {
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import type { Pool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

import { schema } from "./schema";

if (!process.env.MYSQL_URL) {
  throw new Error("Missing MYSQL_URL");
}

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};
const url = new URL(process.env.MYSQL_URL);

const conn =
  globalForDb.conn ??
  createPool({
    host: url.host.split(":")[0],
    user: url.username,
    database: url.pathname.slice(1),
    password: url.password,
    port: Number(url.port),
  });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, mode: "default" });

export type Drizzle = typeof db;
export type DrizzleTransaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
