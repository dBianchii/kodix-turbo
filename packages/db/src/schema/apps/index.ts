import { relations, sql } from "drizzle-orm";
import {
  index,
  json,
  mysqlTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "@kdx/shared";

import { teamAppRoles, teams } from "../teams";
import { DEFAULTLENGTH, moneyDecimal } from "../utils";

export const devPartners = mysqlTable("devPartner", {
  id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
  name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
  partnerUrl: varchar("partnerUrl", { length: DEFAULTLENGTH }),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});
export const devPartnersRelations = relations(devPartners, ({ many }) => ({
  Apps: many(apps),
}));

export const apps = mysqlTable(
  "app",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    subscriptionCost: moneyDecimal("subscriptionCost").notNull(),
    devPartnerId: varchar("devPartnerId", { length: NANOID_SIZE })
      .notNull()
      .references(() => devPartners.id),
  },
  (table) => {
    return {
      devPartnerIdIdx: index("devPartnerId_idx").on(table.devPartnerId),
    };
  },
);
export const appRelations = relations(apps, ({ many, one }) => ({
  AppsToTeams: many(appsToTeams),
  DevPartners: one(devPartners, {
    fields: [apps.devPartnerId],
    references: [devPartners.id],
  }),
  AppTeamConfigs: many(appTeamConfigs),
  TeamAppRoles: many(teamAppRoles),
  AppPermissions: many(appPermissions),
}));

export const appsToTeams = mysqlTable(
  "_AppTeam",
  {
    appId: varchar("A", { length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id),
    teamId: varchar("B", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id),
  },
  (table) => {
    return {
      appId: index("appId_idx").on(table.appId),
      teamId: index("teamId_idx").on(table.teamId),
      unique_appId_teamId: unique("unique_appId_teamId").on(
        table.appId,
        table.teamId,
      ),
    };
  },
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

export const appPermissions = mysqlTable(
  "appPermission",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    appId: varchar("appId", { length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
    };
  },
);
export const appPermissionsRelations = relations(
  appPermissions,
  ({ many, one }) => ({
    App: one(apps, {
      fields: [appPermissions.appId],
      references: [apps.id],
    }),
    AppPermissionsToTeamAppRoles: many(appPermissionsToTeamAppRoles),
  }),
);

export const appTeamConfigs = mysqlTable(
  "appTeamConfig",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    config: json("config").notNull(),
    appId: varchar("appId", { length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),

      unique_appId_teamId: unique("unique_appId_teamId").on(
        table.appId,
        table.teamId,
      ),
    };
  },
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

export const appPermissionsToTeamAppRoles = mysqlTable(
  "_AppPermissionToTeamAppRole",
  {
    appPermissionId: varchar("A", { length: NANOID_SIZE })
      .notNull()
      .references(() => appPermissions.id, { onDelete: "cascade" }),
    teamAppRoleId: varchar("B", { length: NANOID_SIZE })
      .notNull()
      .references(() => teamAppRoles.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      appPermissionIdIdx: index("appPermissionId_idx").on(
        table.appPermissionId,
      ),
      teamAppRoleIdIdx: index("teamAppRoleId_idx").on(table.teamAppRoleId),
      unique_appPermissionId_teamAppRoleId: unique(
        "unique_appPermissionId_teamAppRoleId",
      ).on(table.appPermissionId, table.teamAppRoleId),
    };
  },
);
export const appPermissionsToTeamAppRolesRelations = relations(
  appPermissionsToTeamAppRoles,
  ({ one }) => ({
    AppPermission: one(appPermissions, {
      fields: [appPermissionsToTeamAppRoles.appPermissionId],
      references: [appPermissions.id],
    }),
    TeamAppRole: one(teamAppRoles, {
      fields: [appPermissionsToTeamAppRoles.teamAppRoleId],
      references: [teamAppRoles.id],
    }),
  }),
);
