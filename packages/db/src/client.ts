import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type {
  MySql2Database,
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import type { Pool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

import * as schema from "./schema";

if (!process.env.MYSQL_URL) {
  throw new Error("Missing MYSQL_URL");
}

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
  db: MySql2Database<typeof schema> | undefined;
};
export const dbURl = new URL(process.env.MYSQL_URL);

function getConnectionPool() {
  if (globalForDb.conn) {
    return globalForDb.conn;
  }

  const connectionPool = createPool({
    host: dbURl.host.split(":")[0],
    user: dbURl.username,
    database: dbURl.pathname.slice(1),
    password: dbURl.password,
    port: Number(dbURl.port),
  });

  globalForDb.conn = connectionPool;
  return connectionPool;
}

const pool = getConnectionPool();

// TODO: Remove typecasting once https://github.com/drizzle-team/drizzle-orm/issues/3282 is resolved
export const db =
  globalForDb.db ??
  (drizzle(pool, { schema, mode: "default" }) as MySql2Database<typeof schema>);
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export type Drizzle = typeof db;

// export { getTeamDb as createTeamDb };
// export type DrizzleTeam = ReturnType<typeof getTeamDb>;

export type DrizzleTransaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
