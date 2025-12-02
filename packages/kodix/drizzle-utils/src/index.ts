import type { PgColumn } from "drizzle-orm/pg-core";
import { ilike, or, sql } from "drizzle-orm";

export const getVectorSearchFilter = (column: PgColumn, query: string) =>
  or(
    sql`to_tsvector('portuguese', ${column}) @@ plainto_tsquery('portuguese', ${query})`,
    ilike(column, `%${query}%`),
  );
