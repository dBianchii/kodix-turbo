import { relations } from "drizzle-orm";
import { index, mysqlTable, unique } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { NANOID_SIZE } from "../nanoid";
import { apps, appsToTeams, appTeamConfigs } from "./apps";
import { eventMasters } from "./apps/calendar";
import { careShifts, careTasks } from "./apps/kodixCare";
import { todos } from "./apps/todos";
import { users } from "./users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  roleEnum,
  teamIdReferenceCascadeDelete,
} from "./utils";

export const teams = mysqlTable(
  "team",
  (t) => ({
    id: nanoidPrimaryKey(t),
    name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
    ownerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade" }),
  }),
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
export const teamSchema = createInsertSchema(teams);

export const usersToTeams = mysqlTable(
  "_userToTeam",
  (t) => ({
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
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
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    role: roleEnum(t),
  }),
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
    TeamAppRolesToUsers: many(teamAppRolesToUsers),
  }),
);

export const teamAppRolesToUsers = mysqlTable(
  "_teamAppRoleToUser",
  (t) => ({
    teamAppRoleId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => teamAppRoles.id, { onDelete: "cascade" }),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
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
export const teamAppRoleToUserSchema = createInsertSchema(teamAppRolesToUsers);

export const invitations = mysqlTable(
  "invitation",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    email: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
    invitedById: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
  }),
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
export const invitationSchema = createInsertSchema(invitations);
