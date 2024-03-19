///
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type {
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import { Client } from "@planetscale/database";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { PrismaClient } from "@prisma/client";
import { drizzle } from "drizzle-orm/mysql2";
import { createInsertSchema } from "drizzle-zod";
import mysql from "mysql2/promise";
import { fetch as undiciFetch } from "undici";

import * as mySchema from "./schema/schema";

//* START PLANETSCALE ADAPTER SECTION
const client = new Client({
  url: `${process.env.DATABASE_URL}`,
  fetch: undiciFetch,
});
const adapter = new PrismaPlanetScale(client);
const isPlanetScaleConnection = `${process.env.DATABASE_URL}`.includes("psdb");
//* END PLANETSCALE ADAPTER SECTION

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: isPlanetScaleConnection ? adapter : null, //?  Only use Planetscale adapter if we are connecting to Planetscale
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";

//DRIZZLE ORM

export * from "drizzle-orm";

export const schema = { ...mySchema };

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

export const insertTodosSchema = createInsertSchema(schema.todos);
