import type { SQL } from "drizzle-orm";

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;

export type { Column, ColumnBaseConfig, ColumnDataType } from "drizzle-orm";
export * from "drizzle-orm/expressions";

export { alias } from "drizzle-orm/mysql-core";
export * from "drizzle-orm/sql";
