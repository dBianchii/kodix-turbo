import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "@kdx/shared";

import { todos } from "./apps/todos";
import { invitations, teamAppRolesToUsers, teams, usersToTeams } from "./teams";
import { DEFAULTLENGTH } from "./utils";

export const users = mysqlTable(
  "user",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull().unique(),
    emailVerified: timestamp("emailVerified").default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: DEFAULTLENGTH }),
    activeTeamId: varchar("activeTeamId", { length: DEFAULTLENGTH }).notNull(),
    kodixAdmin: boolean("kodixAdmin").default(false).notNull(),
  },
  (table) => {
    return {
      activeTeamIdIdx: index("activeTeamId_idx").on(table.activeTeamId),
    };
  },
);
export const usersRelations = relations(users, ({ many, one }) => ({
  ActiveTeam: one(teams, {
    fields: [users.activeTeamId],
    references: [teams.id],
  }),
  Invitations: many(invitations),
  Notifications: many(notifications),
  Sessions: many(sessions),
  UsersToTeams: many(usersToTeams),
  Todos: many(todos),
  TeamAppRolesToUsers: many(teamAppRolesToUsers),
  Accounts: many(accounts),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: DEFAULTLENGTH })
      .$type<"oauth" | "oidc" | "email">()
      .notNull(),
    provider: varchar("provider", { length: DEFAULTLENGTH }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: DEFAULTLENGTH,
    }).notNull(),
    refresh_token: varchar("refresh_token", { length: DEFAULTLENGTH }),
    access_token: varchar("access_token", { length: DEFAULTLENGTH }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: DEFAULTLENGTH }),
    scope: varchar("scope", { length: DEFAULTLENGTH }),
    id_token: varchar("id_token", { length: 2048 }), //Must be larger than 255 at least. Trust me
    session_state: varchar("session_state", { length: DEFAULTLENGTH }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);
export const accountsRelations = relations(accounts, ({ one }) => ({
  Users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: DEFAULTLENGTH })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);
export const sessionsRelations = relations(sessions, ({ one }) => ({
  User: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: DEFAULTLENGTH }).notNull(),
    token: varchar("token", { length: DEFAULTLENGTH }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const notifications = mysqlTable(
  "notification",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    sentToUserId: varchar("sentToUserId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id, { onUpdate: "cascade", onDelete: "cascade" }),
    sentAt: timestamp("sentAt").notNull(),
    message: varchar("message", { length: 500 }).notNull(),
    channel: mysqlEnum("channel", ["EMAIL"]).notNull(),
    read: boolean("read").default(false).notNull(),
  },
  (table) => {
    return {
      sentToUserIdIdx: index("sentToUserId_idx").on(table.sentToUserId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const notificationsRelations = relations(notifications, ({ one }) => ({
  User: one(users, {
    fields: [notifications.sentToUserId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [notifications.teamId],
    references: [teams.id],
  }),
}));
