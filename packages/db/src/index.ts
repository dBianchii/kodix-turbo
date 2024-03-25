import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type {
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as apps from "./schema/apps";
import * as calendar from "./schema/apps/calendar";
import * as kodixCare from "./schema/apps/kodixCare";
import * as todos from "./schema/apps/todos";
import * as auth from "./schema/auth";
import * as teams from "./schema/teams";

export * from "drizzle-orm";
export * from "./zod";

export const schema = {
  ...auth,
  ...teams,
  ...apps,
  ...calendar,
  ...kodixCare,
  ...todos,
};

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 58247,
});

export const db = drizzle(connection, { mode: "default", schema });

export type DrizzleTransaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
