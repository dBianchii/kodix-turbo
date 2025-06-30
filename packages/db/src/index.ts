import type { SQL } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import { getTableColumns, sql } from "drizzle-orm";

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;

/** @see https://orm.drizzle.team/learn/guides/upsert#mysql */
export const buildConflictUpdateColumns = <
  T extends MySqlTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      acc[column] = sql`values(${cls[column]})`;
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export type { Column, ColumnBaseConfig, ColumnDataType } from "drizzle-orm";
export * from "drizzle-orm/expressions";

export { alias } from "drizzle-orm/mysql-core";
export * from "drizzle-orm/sql";

// Expose repositories for consumption by other packages
export * from "./repositories";
