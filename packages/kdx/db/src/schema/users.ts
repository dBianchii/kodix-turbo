import { NANOID_SIZE, nanoid } from "@kodix/shared/utils";
import { relations } from "drizzle-orm";
import { index, mysqlTable, primaryKey } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { userAppTeamConfigs } from "./apps";
import { todos } from "./apps/todos";
import { invitations, teams, usersToTeams, userTeamAppRoles } from "./teams";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "./utils";

export const users = mysqlTable(
  "user",
  (t) => ({
    activeTeamId: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    email: t.varchar({ length: DEFAULTLENGTH }).notNull().unique(),
    id: nanoidPrimaryKey(t),
    image: t.varchar({ length: DEFAULTLENGTH }),
    kodixAdmin: t.boolean().default(false).notNull(),
    name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    passwordHash: t.varchar({ length: 255 }),
  }),
  (table) => [index("activeTeamId_idx").on(table.activeTeamId)],
);
export const usersRelations = relations(users, ({ many, one }) => ({
  ActiveTeam: one(teams, {
    fields: [users.activeTeamId],
    references: [teams.id],
  }),
  ExpoTokens: many(expoTokens),
  Invitations: many(invitations),
  Notifications: many(notifications),
  Sessions: many(sessions),
  Todos: many(todos),
  UserAppTeamConfigs: many(userAppTeamConfigs),
  UsersToTeams: many(usersToTeams),
  UserTeamAppRoles: many(userTeamAppRoles),
}));
export const userSchema = createInsertSchema(users);

export const accounts = mysqlTable(
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

export const sessions = mysqlTable("session", (t) => ({
  expiresAt: t.datetime().notNull(),
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

export const expoTokens = mysqlTable(
  "expoToken",
  (t) => ({
    id: nanoidPrimaryKey(t),
    token: t.varchar({ length: DEFAULTLENGTH }).unique().notNull(),
    userId: t
      .varchar({ length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  }),
  (table) => [index("userId_idx").on(table.userId)],
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
    channel: t.mysqlEnum(["EMAIL", "PUSH_NOTIFICATIONS"]).notNull(),
    id: nanoidPrimaryKey(t),
    message: t.text().notNull(),
    sentAt: t.timestamp().defaultNow().notNull(),
    sentToUserId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    subject: t.varchar({ length: 100 }), //?For email only!
    teamId: teamIdReferenceCascadeDelete(t),
  }),
  (table) => [
    index("sentToUserId_idx").on(table.sentToUserId),
    index("teamId_idx").on(table.teamId),
  ],
);
export const notificationsRelations = relations(notifications, ({ one }) => ({
  Team: one(teams, {
    fields: [notifications.teamId],
    references: [teams.id],
  }),
  User: one(users, {
    fields: [notifications.sentToUserId],
    references: [users.id],
  }),
}));
export const notificationSchema = createInsertSchema(notifications);

export const resetPasswordTokens = mysqlTable(
  "resetToken",
  (t) => ({
    id: nanoidPrimaryKey(t),
    token: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .$default(() => nanoid()),
    tokenExpiresAt: t.timestamp().notNull(),
    userId: t
      .varchar({ length: DEFAULTLENGTH })
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  }),
  (table) => [
    index("token_idx").on(table.token),
    index("userId_idx").on(table.userId),
  ],
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
export const resetPasswordTokenSchema = createInsertSchema(resetPasswordTokens);
