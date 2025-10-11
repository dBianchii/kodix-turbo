import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

import { nanoidPrimaryKey } from "./utils";

export const caTokens = pgTable("caToken", (t) => ({
  accessToken: t.text().notNull(),
  createdAt: t
    .timestamp()
    .notNull()
    .$default(() => new Date()),
  expiresAt: t.timestamp().notNull(),
  id: nanoidPrimaryKey(t),
  refreshToken: t.text().notNull(),
  updatedAt: t
    .timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
}));

export const caTokenschema = createInsertSchema(caTokens);
