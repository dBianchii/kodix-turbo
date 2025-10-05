import type { AppRole } from "@kodix/shared/db";
import { NANOID_SIZE } from "@kodix/shared/utils";
import { relations } from "drizzle-orm";
import { index, mysqlTable, unique } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { apps, appsToTeams, appTeamConfigs } from "./apps";
import { eventMasters } from "./apps/calendar";
import { careShifts, careTasks } from "./apps/kodixCare";
import { todos } from "./apps/todos";
import { users } from "./users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "./utils";

export const teams = mysqlTable(
  "team",
  (t) => ({
    createdAt: t.timestamp().defaultNow().notNull(),
    id: nanoidPrimaryKey(t),
    name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    ownerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade" }),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => [index("ownerId_idx").on(table.ownerId)],
);
export const teamsRelations = relations(teams, ({ many, one }) => ({
  AppsToTeams: many(appsToTeams),
  AppTeamConfigs: many(appTeamConfigs),
  CareShifts: many(careShifts),
  CareTasks: many(careTasks),
  EventMasters: many(eventMasters),
  Invitations: many(invitations),
  Owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  Todos: many(todos),
  UsersToTeams: many(usersToTeams),
  UserTeamAppRoles: many(userTeamAppRoles),
}));
export const teamSchema = createInsertSchema(teams);

export const usersToTeams = mysqlTable(
  "_userToTeam",
  (t) => ({
    teamId: teamIdReferenceCascadeDelete(t),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("userId_idx").on(table.userId),
    index("teamId_idx").on(table.teamId),
    unique("unique_userId_teamId").on(table.userId, table.teamId),
  ],
);
export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  Team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
  User: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
}));

export const userTeamAppRoles = mysqlTable(
  "userTeamAppRole",
  (t) => ({
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    id: nanoidPrimaryKey(t),
    role: t
      .varchar("role", { length: DEFAULTLENGTH })
      .$type<AppRole>()
      .notNull(),
    teamId: teamIdReferenceCascadeDelete(t),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("userId_idx").on(table.userId),
    index("teamId_idx").on(table.teamId),
    index("appId_idx").on(table.appId),

    unique("unique_userId_teamId_appId_role").on(
      table.userId,
      table.teamId,
      table.appId,
      table.role,
    ),
  ],
);
export const userTeamAppRolesRelations = relations(
  userTeamAppRoles,
  ({ one }) => ({
    App: one(apps, {
      fields: [userTeamAppRoles.appId],
      references: [apps.id],
    }),
    Team: one(teams, {
      fields: [userTeamAppRoles.teamId],
      references: [teams.id],
    }),
    User: one(users, {
      fields: [userTeamAppRoles.userId],
      references: [users.id],
    }),
  }),
);
export const userTeamAppRolesSchema = createInsertSchema(userTeamAppRoles);

export const invitations = mysqlTable(
  "invitation",
  (t) => ({
    createdAt: t.timestamp().defaultNow().notNull(),
    email: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    id: nanoidPrimaryKey(t),
    invitedById: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    teamId: teamIdReferenceCascadeDelete(t),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => [
    index("invitedById_idx").on(table.invitedById),
    index("teamId_idx").on(table.teamId),
  ],
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
