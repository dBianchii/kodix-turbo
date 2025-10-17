import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
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

export const clientTypeEnum = pgEnum("clientType", [
  "Estrangeira",
  "Física",
  "Jurídica",
]);

export const clients = pgTable("client", (t) => ({
  bairro: t.text(),
  caId: t.text().notNull().unique(),
  cep: t.text(),
  cidade: t.text(),
  complemento: t.text(),
  document: t.text(),
  email: t.text(),
  estado: t.text(),
  id: nanoidPrimaryKey(t),
  logradouro: t.text(),
  name: t.text().notNull(),
  numero: t.text(),
  pais: t.text(),
  phone: t.text(),
  type: clientTypeEnum().notNull(),
}));
export const clientsRelations = relations(clients, ({ many }) => ({
  Sales: many(sales),
}));
export const clientsSchema = createInsertSchema(clients);

export const sales = pgTable("sale", (t) => ({
  caCreatedAt: t.timestamp().notNull(),
  caId: t.text().notNull().unique(),
  caNumero: t.text().notNull().unique(),
  clientId: t
    .text()
    .notNull()
    .references(() => clients.id),
  id: nanoidPrimaryKey(t),
  total: t.numeric({ mode: "number", precision: 10, scale: 2 }).notNull(),
}));
export const salesRelations = relations(sales, ({ one }) => ({
  Client: one(clients, { fields: [sales.clientId], references: [clients.id] }),
}));
export const salesSchema = createInsertSchema(sales);
