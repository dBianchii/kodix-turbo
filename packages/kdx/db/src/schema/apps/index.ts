import { NANOID_SIZE } from "@kodix/shared/utils";
import { relations } from "drizzle-orm";
import { index, mysqlTable, unique } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { teams, userTeamAppRoles } from "../teams";
import { users } from "../users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "../utils";

export const devPartners = mysqlTable("devPartner", (t) => ({
  createdAt: t.timestamp().defaultNow().notNull(),
  id: nanoidPrimaryKey(t),
  name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
  partnerUrl: t.varchar({ length: DEFAULTLENGTH }),
  updatedAt: t.timestamp().onUpdateNow(),
}));
export const devPartnersRelations = relations(devPartners, ({ many }) => ({
  Apps: many(apps),
}));

export const apps = mysqlTable(
  "app",
  (t) => ({
    createdAt: t.timestamp().defaultNow().notNull(),
    devPartnerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => devPartners.id),
    id: nanoidPrimaryKey(t),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => [index("devPartnerId_idx").on(table.devPartnerId)],
);
export const appRelations = relations(apps, ({ many, one }) => ({
  AppsToTeams: many(appsToTeams),
  AppTeamConfigs: many(appTeamConfigs),
  DevPartners: one(devPartners, {
    fields: [apps.devPartnerId],
    references: [devPartners.id],
  }),
  UserTeamAppRoles: many(userTeamAppRoles),
}));
export const appSchema = createInsertSchema(apps);

export const appsToTeams = mysqlTable(
  "_appToTeam",
  (t) => ({
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
  (table) => [
    index("appId_idx").on(table.appId),
    index("teamId_idx").on(table.teamId),
    unique("unique_appId_teamId").on(table.appId, table.teamId),
  ],
);
export const appsToTeamsRelations = relations(appsToTeams, ({ one }) => ({
  App: one(apps, {
    fields: [appsToTeams.appId],
    references: [apps.id],
  }),
  Team: one(teams, {
    fields: [appsToTeams.teamId],
    references: [teams.id],
  }),
}));

export const appTeamConfigs = mysqlTable(
  "appTeamConfig",
  (t) => ({
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    config: t.json().notNull(),
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
  (table) => [
    index("appId_idx").on(table.appId),
    index("teamId_idx").on(table.teamId),

    unique("unique_appId_teamId").on(table.appId, table.teamId),
  ],
);
export const appTeamConfigsRelations = relations(appTeamConfigs, ({ one }) => ({
  App: one(apps, {
    fields: [appTeamConfigs.appId],
    references: [apps.id],
  }),
  Team: one(teams, {
    fields: [appTeamConfigs.teamId],
    references: [teams.id],
  }),
}));
export const appTeamConfigSchema = createInsertSchema(appTeamConfigs);

export const userAppTeamConfigs = mysqlTable(
  "userAppTeamConfig",
  (t) => ({
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    config: t.json().notNull(),
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
  }),
  (table) => [
    index("userId_idx").on(table.userId),
    index("appId_idx").on(table.appId),
    index("teamId_idx").on(table.teamId),

    unique("unique_userId_appId_teamId").on(
      table.userId,
      table.appId,
      table.teamId,
    ),
  ],
);
export const userAppTeamConfigsRelations = relations(
  userAppTeamConfigs,
  ({ one }) => ({
    App: one(apps, {
      fields: [userAppTeamConfigs.appId],
      references: [apps.id],
    }),
    Team: one(teams, {
      fields: [userAppTeamConfigs.teamId],
      references: [teams.id],
    }),
    User: one(users, {
      fields: [userAppTeamConfigs.userId],
      references: [users.id],
    }),
  }),
);
export const userAppTeamConfigSchema = createInsertSchema(userAppTeamConfigs);

export const appActivityLogs = mysqlTable(
  "appActivityLog",
  (t) => ({
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    diff: t.json().notNull(),
    id: nanoidPrimaryKey(t),
    loggedAt: t.timestamp().defaultNow().notNull(),
    rowId: t.varchar({ length: NANOID_SIZE }).notNull(),
    tableName: t.mysqlEnum(["careShift", "careTask"]).notNull(),
    teamId: teamIdReferenceCascadeDelete(t),
    type: t.mysqlEnum(["create", "update", "delete"]).notNull(),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
  }),
  (table) => [
    index("teamId_idx").on(table.teamId),
    index("appId_idx").on(table.appId),
    index("userId_idx").on(table.userId),
    index("tableName_idx").on(table.tableName),
    index("rowId_idx").on(table.rowId),
  ],
);
export const appActivityLogsRelations = relations(
  appActivityLogs,
  ({ one }) => ({
    App: one(apps, {
      fields: [appActivityLogs.appId],
      references: [apps.id],
    }),
    Team: one(teams, {
      fields: [appActivityLogs.teamId],
      references: [teams.id],
    }),
    User: one(users, {
      fields: [appActivityLogs.userId],
      references: [users.id],
    }),
  }),
);
