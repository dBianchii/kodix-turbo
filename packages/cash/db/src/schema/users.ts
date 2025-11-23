import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

import { clients } from "./ca";
import { DEFAULTLENGTH, nanoidPrimaryKey } from "./utils";

export const users = pgTable("user", (t) => ({
  clientId: t
    .text()
    .notNull()
    .references(() => clients.id, { onDelete: "cascade", onUpdate: "cascade" }),
  email: t.varchar({ length: DEFAULTLENGTH }).notNull().unique(),
  id: nanoidPrimaryKey(t),
  image: t.varchar({ length: DEFAULTLENGTH }),
  isAdmin: t.boolean().notNull().default(false),
  name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
  passwordHash: t.varchar({ length: 255 }),
}));
export const usersRelations = relations(users, ({ many, one }) => ({
  Client: one(clients, { fields: [users.clientId], references: [clients.id] }),
  Sessions: many(sessions),
}));
export const userSchema = createInsertSchema(users);

export const accounts = pgTable(
  "account",
  (t) => ({
    providerId: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    providerUserId: t
      .varchar({
        length: DEFAULTLENGTH,
      })
      .notNull(),
    userId: t
      .varchar({ length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id), //TODO: referential action?
  }),
  (account) => [
    primaryKey({
      columns: [account.providerId, account.providerUserId],
    }),
    index("userId_idx").on(account.userId),
  ],
);
export const accountsRelations = relations(accounts, ({ one }) => ({
  Users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
export const accountSchema = createInsertSchema(accounts);

export const sessions = pgTable("session", (t) => ({
  expiresAt: t.timestamp().notNull(),
  id: t
    .varchar({
      length: DEFAULTLENGTH,
    })
    .primaryKey(),
  ipAddress: t.varchar({ length: 45 }).notNull(),
  userAgent: t.text(),
  userId: t
    .varchar({
      length: DEFAULTLENGTH,
    })
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  User: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
export const sessionSchema = createInsertSchema(sessions);

export const magicLinkTokens = pgTable(
  "magicLinkToken",
  (t) => ({
    clientId: t
      .text()
      .notNull()
      .references(() => clients.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: t
      .timestamp({
        mode: "string",
        precision: 3,
        withTimezone: true,
      })
      .notNull()
      .defaultNow(),
    expiresAt: t
      .timestamp({
        mode: "string",
        precision: 3,
        withTimezone: true,
      })
      .notNull(),
    id: nanoidPrimaryKey(t),
    token: t.text().notNull().unique(),
  }),
  (table) => [index().on(table.token), index().on(table.clientId)],
);
export const magicLinkTokenRelations = relations(
  magicLinkTokens,
  ({ one }) => ({
    Client: one(clients, {
      fields: [magicLinkTokens.clientId],
      references: [clients.id],
    }),
  }),
);
export const magicLinkTokenSchema = createInsertSchema(magicLinkTokens);
