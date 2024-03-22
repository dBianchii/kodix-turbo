import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  mysqlTable,
  timestamp,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "@kdx/shared";

import {
  appPermissionsToTeamAppRoles,
  appRoleDefaults,
  apps,
  appsToTeams,
  appTeamConfigs,
} from "./apps";
import { eventMasters } from "./apps/calendar";
import { careShifts, careTasks } from "./apps/kodixCare";
import { todos } from "./apps/todos";
import { users } from "./auth";
import { DEFAULTLENGTH } from "./utils";

export const teams = mysqlTable(
  "team",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    ownerId: varchar("ownerId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade" }),
  },
  (table) => {
    return {
      ownerIdIdx: index("ownerId_idx").on(table.ownerId),
    };
  },
);
export const teamsRelations = relations(teams, ({ many, one }) => ({
  Owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  UsersToTeams: many(usersToTeams),
  AppsToTeams: many(appsToTeams),
  TeamAppRoles: many(teamAppRoles),
  AppTeamConfigs: many(appTeamConfigs),
  CareShifts: many(careShifts),
  CareTasks: many(careTasks),
  EventMasters: many(eventMasters),
  Invitations: many(invitations),
  Todos: many(todos),
}));

export const usersToTeams = mysqlTable(
  "_UserTeam",
  {
    userId: varchar("A", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    teamId: varchar("B", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id),
  },
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      unique_userId_teamId: unique("unique_userId_teamId").on(
        table.userId,
        table.teamId,
      ),
    };
  },
);
export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  User: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
}));

export const teamAppRoles = mysqlTable(
  "teamAppRole",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    minUsers: int("minUsers").default(0).notNull(),
    maxUsers: int("maxUsers").default(0).notNull(),
    appId: varchar("appId", { length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    appRoleDefaultId: varchar("appRoleDefaultId", {
      length: NANOID_SIZE,
    }).references(() => appRoleDefaults.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      appRoleDefaultIdIdx: index("appRoleDefaultId_idx").on(
        table.appRoleDefaultId,
      ),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const teamAppRolesRelations = relations(
  teamAppRoles,
  ({ one, many }) => ({
    App: one(apps, {
      fields: [teamAppRoles.appId],
      references: [apps.id],
    }),
    Team: one(teams, {
      fields: [teamAppRoles.teamId],
      references: [teams.id],
    }),
    AppRoleDefault: one(appRoleDefaults, {
      fields: [teamAppRoles.appRoleDefaultId],
      references: [appRoleDefaults.id],
    }),
    AppPermissionsToTeamAppRoles: many(appPermissionsToTeamAppRoles),
    TeamAppRolesToUsers: many(teamAppRolesToUsers),
  }),
);

export const teamAppRolesToUsers = mysqlTable(
  "_TeamAppRoleToUser",
  {
    teamAppRoleId: varchar("A", { length: NANOID_SIZE })
      .notNull()
      .references(() => teamAppRoles.id, { onDelete: "cascade" }),
    userId: varchar("B", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      teamAppRoleIdIdx: index("teamAppRoleId_idx").on(table.teamAppRoleId),
      userIdIdx: index("userId_idx").on(table.userId),

      unique_teamAppRoleId_userId: unique("unique_teamAppRoleId_userId").on(
        table.teamAppRoleId,
        table.userId,
      ),
    };
  },
);
export const teamAppRolesToUsersRelations = relations(
  teamAppRolesToUsers,
  ({ one }) => ({
    TeamAppRole: one(teamAppRoles, {
      fields: [teamAppRolesToUsers.teamAppRoleId],
      references: [teamAppRoles.id],
    }),
    User: one(users, {
      fields: [teamAppRolesToUsers.userId],
      references: [users.id],
    }),
  }),
);

export const notifications = mysqlTable(
  "notification",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    userId: varchar("userId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
    };
  },
);
export const notificationsRelations = relations(notifications, ({ one }) => ({
  User: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const invitations = mysqlTable(
  "invitation",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull(),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull(),
    accepted: tinyint("accepted").default(0).notNull(), //Is this necessary? Since we just delete the invitation when the user accepts it
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    invitedById: varchar("invitedById", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      invitedByIdIdx: index("invitedById_idx").on(table.invitedById),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const invitationsRelations = relations(invitations, ({ one }) => ({
  InvitedBy: one(users, {
    fields: [invitations.invitedById],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
}));
