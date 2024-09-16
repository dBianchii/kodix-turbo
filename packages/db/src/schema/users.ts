import { relations, sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { nanoid, NANOID_SIZE } from "../nanoid";
import { todos } from "./apps/todos";
import { invitations, teamAppRolesToUsers, teams, usersToTeams } from "./teams";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "./utils";

export const users = mysqlTable(
  "user",
  {
    id: nanoidPrimaryKey,
    name: varchar("name", { length: DEFAULTLENGTH }),
    passwordHash: varchar("passwordHash", { length: 255 }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull().unique(),
    emailVerified: timestamp("emailVerified").defaultNow(),
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
}));

export const accounts = mysqlTable(
  "account",
  {
    providerId: varchar("providerId", { length: DEFAULTLENGTH }).notNull(),
    providerUserId: varchar("providerUserId", {
      length: DEFAULTLENGTH,
    }).notNull(),
    userId: varchar("userId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id), //TODO: referential action?
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.providerId, account.providerUserId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);
export const accountsRelations = relations(accounts, ({ one }) => ({
  Users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable("session", {
  id: varchar("id", {
    length: DEFAULTLENGTH,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: DEFAULTLENGTH,
  })
    .notNull()
    .references(() => users.id),
  expiresAt: datetime("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});
export const sessionsRelations = relations(sessions, ({ one }) => ({
  User: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const notifications = mysqlTable(
  "notification",
  {
    id: nanoidPrimaryKey,
    sentToUserId: varchar("sentToUserId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete,
    subject: varchar("subject", { length: 100 }), //For email
    sentAt: timestamp("sentAt").notNull(),
    message: text("message").notNull(),
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

export const resetPasswordTokens = mysqlTable(
  "resetToken",
  {
    id: nanoidPrimaryKey,
    userId: varchar("userId", { length: DEFAULTLENGTH })
      .unique()
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
    token: varchar("token", { length: NANOID_SIZE })
      .notNull()
      .$default(() => nanoid()),
    tokenExpiresAt: timestamp("tokenExpiresAt").notNull(),
  },
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
