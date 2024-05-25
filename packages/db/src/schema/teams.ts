import { relations, sql } from "drizzle-orm";
import {
  index,
  mysqlTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { nanoid, NANOID_SIZE } from "@kdx/shared";

import {
  appPermissionsToTeamAppRoles,
  apps,
  appsToTeams,
  appTeamConfigs,
} from "./apps";
import { eventMasters } from "./apps/calendar";
import { careShifts, careTasks } from "./apps/kodixCare";
import { todos } from "./apps/todos";
import { users } from "./users";
import { DEFAULTLENGTH, teamIdReferenceCascadeDelete } from "./utils";

export const teams = mysqlTable(
  "team",
  {
    id: varchar("id", { length: NANOID_SIZE })
      .notNull()
      .default(nanoid())
      .primaryKey(),
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
  "_userToTeam",
  {
    userId: varchar("userId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete,
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
    id: varchar("id", { length: NANOID_SIZE })
      .notNull()
      .default(nanoid())
      .primaryKey(),
    appId: varchar("appId", { length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete,
    appRoleDefaultId: varchar("appRoleDefaultId", {
      length: NANOID_SIZE, //? References a hardcoded default role id and not anything in db
    }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
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
    AppPermissionsToTeamAppRoles: many(appPermissionsToTeamAppRoles),
    TeamAppRolesToUsers: many(teamAppRolesToUsers),
  }),
);

export const teamAppRolesToUsers = mysqlTable(
  "_teamAppRoleToUser",
  {
    teamAppRoleId: varchar("teamAppRoleId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teamAppRoles.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: NANOID_SIZE })
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

export const invitations = mysqlTable(
  "invitation",
  {
    id: varchar("id", { length: NANOID_SIZE })
      .notNull()
      .default(nanoid())
      .primaryKey(),
    teamId: teamIdReferenceCascadeDelete,
    email: varchar("email", { length: DEFAULTLENGTH }).notNull(),
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
