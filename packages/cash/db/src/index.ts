import type { PgTable } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { getTableColumns, type SQL, sql } from "drizzle-orm";

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;

export const buildConflictUpdateColumns = <
  T extends PgTable | SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);

  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      acc[column] = sql.raw(`excluded.${colName}`);

      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export const buildConflictUpdateAllColumns = <T extends PgTable | SQLiteTable>(
  table: T,
  exclude: (keyof T["_"]["columns"])[] = [],
) => {
  const cls = getTableColumns(table);
  const excludeSet = new Set(exclude);

  return Object.keys(cls).reduce(
    (acc, column) => {
      if (!excludeSet.has(column)) {
        const colName = cls[column]?.name;
        acc[column] = sql.raw(`excluded."${colName}"`);
      }
      return acc;
    },
    {} as Record<string, SQL>,
  );
};

export type { Column, ColumnBaseConfig, ColumnDataType } from "drizzle-orm";
