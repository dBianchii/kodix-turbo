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

export const caSales = pgTable("caSale", (t) => ({
  caId: t.text().notNull().unique(), // CA field
  clienteEmail: t.text(), //CA field
  clienteId: t.text(), //CA field
  clienteNome: t.text(), //CA field
  criadoEm: t.timestamp(), // CA field
  id: nanoidPrimaryKey(t),
  numero: t.integer().notNull(), // CA field
  total: t.numeric({ mode: "number", precision: 10, scale: 2 }).notNull(), // CA field
}));

export const caSalesSchema = createInsertSchema(caSales);
