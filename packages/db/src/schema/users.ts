import { relations } from "drizzle-orm";
import { index, mysqlTable, primaryKey } from "drizzle-orm/mysql-core";

import { nanoid, NANOID_SIZE } from "../nanoid";
import { userAppTeamConfigs } from "./apps";
import { todos } from "./apps/todos";
import { invitations, teamAppRolesToUsers, teams, usersToTeams } from "./teams";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "./utils";

export const users = mysqlTable(
  "user",
  (t) => ({
    id: nanoidPrimaryKey(t),
    name: t.varchar({ length: DEFAULTLENGTH }),
    passwordHash: t.varchar({ length: 255 }),
    email: t.varchar({ length: DEFAULTLENGTH }).notNull().unique(),
    emailVerified: t.timestamp().defaultNow(),
    image: t.varchar({ length: DEFAULTLENGTH }),
    activeTeamId: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    kodixAdmin: t.boolean().default(false).notNull(),
  }),
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
  ExpoTokens: many(expoTokens),
  UserAppTeamConfigs: many(userAppTeamConfigs),
}));

export const accounts = mysqlTable(
  "account",
  (t) => ({
    providerId: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    providerUserId: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    userId: t
      .varchar({ length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id), //TODO: referential action?
  }),
  (table) => ({
    compoundKey: primaryKey(table.providerId, table.providerUserId),
    userIdIdx: index("userId_idx").on(table.userId),
  }),
);
export const accountsRelations = relations(accounts, ({ one }) => ({
  Users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable("session", (t) => ({
  id: t.varchar({ length: DEFAULTLENGTH }).primaryKey(),
  userId: t
    .varchar({ length: DEFAULTLENGTH })
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  expiresAt: t.datetime().notNull(),
  ipAddress: t.varchar({ length: 45 }),
  userAgent: t.text(),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  User: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const expoTokens = mysqlTable(
  "expoToken",
  (t) => ({
    id: nanoidPrimaryKey(t),
    userId: t
      .varchar({ length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
    token: t.varchar({ length: DEFAULTLENGTH }).unique().notNull(),
  }),
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
    };
  },
);
export const expoTokensRelations = relations(expoTokens, ({ one }) => ({
  User: one(users, {
    fields: [expoTokens.userId],
    references: [users.id],
  }),
}));

export const notifications = mysqlTable(
  "notification",
  (t) => ({
    id: nanoidPrimaryKey(t),
    sentToUserId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete(t),
    subject: t.varchar({ length: 100 }), //?For email only!
    sentAt: t.timestamp().defaultNow().notNull(),
    message: t.text().notNull(),
    channel: t.mysqlEnum(["EMAIL", "PUSH_NOTIFICATIONS"]).notNull(),
    read: t.boolean().default(false).notNull(),
  }),
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

export const resetPasswordTokens = mysqlTable(
  "resetToken",
  (t) => ({
    id: nanoidPrimaryKey(t),
    userId: t
      .varchar({ length: DEFAULTLENGTH })
      .unique()
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
    token: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .$default(() => nanoid()),
    tokenExpiresAt: t.timestamp().notNull(),
  }),
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
    };
  },
);
export const resetPasswordTokensRelations = relations(
  resetPasswordTokens,
  ({ one }) => ({
    User: one(users, {
      fields: [resetPasswordTokens.userId],
      references: [users.id],
    }),
  }),
);
