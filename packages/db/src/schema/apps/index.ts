import { relations } from "drizzle-orm";
import { index, mysqlTable, unique } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { NANOID_SIZE } from "../../nanoid";
import { teamAppRoles, teams } from "../teams";
import { users } from "../users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "../utils";

export const devPartners = mysqlTable("devPartner", (t) => ({
  id: nanoidPrimaryKey(t),
  name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
  partnerUrl: t.varchar({ length: DEFAULTLENGTH }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().onUpdateNow(),
}));
export const devPartnersRelations = relations(devPartners, ({ many }) => ({
  Apps: many(apps),
}));

export const apps = mysqlTable(
  "app",
  (t) => ({
    id: nanoidPrimaryKey(t),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
    devPartnerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => devPartners.id),
  }),
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

export const appTeamConfigs = mysqlTable(
  "appTeamConfig",
  (t) => ({
    id: nanoidPrimaryKey(t),
    config: t.json().notNull(),
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
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
export const appTeamConfigSchema = createInsertSchema(appTeamConfigs);

export const userAppTeamConfigs = mysqlTable(
  "userAppTeamConfig",
  (t) => ({
    id: nanoidPrimaryKey(t),
    config: t.json().notNull(),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),

      unique_userId_appId_teamId: unique("unique_userId_appId_teamId").on(
        table.userId,
        table.appId,
        table.teamId,
      ),
    };
  },
);
export const userAppTeamConfigsRelations = relations(
  userAppTeamConfigs,
  ({ one }) => ({
    User: one(users, {
      fields: [userAppTeamConfigs.userId],
      references: [users.id],
    }),
    App: one(apps, {
      fields: [userAppTeamConfigs.appId],
      references: [apps.id],
    }),
    Team: one(teams, {
      fields: [userAppTeamConfigs.teamId],
      references: [teams.id],
    }),
  }),
);
export const userAppTeamConfigSchema = createInsertSchema(userAppTeamConfigs);

export const appActivityLogs = mysqlTable(
  "appActivityLog",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    appId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    tableName: t.mysqlEnum(["careShift", "careTask"]).notNull(),
    rowId: t.varchar({ length: NANOID_SIZE }).notNull(),
    loggedAt: t.timestamp().defaultNow().notNull(),
    diff: t.json().notNull(),
    type: t.mysqlEnum(["create", "update", "delete"]).notNull(),
  }),
  (table) => {
    return {
      teamIdIdx: index("teamId_idx").on(table.teamId),
      appIdIdx: index("appId_idx").on(table.appId),
      userIdIdx: index("userId_idx").on(table.userId),
      tableNameIdx: index("tableName_idx").on(table.tableName),
      rowIdIdx: index("rowId_idx").on(table.rowId),
    };
  },
);
export const appActivityLogsRelations = relations(
  appActivityLogs,
  ({ one }) => ({
    User: one(users, {
      fields: [appActivityLogs.userId],
      references: [users.id],
    }),
    App: one(apps, {
      fields: [appActivityLogs.appId],
      references: [apps.id],
    }),
    Team: one(teams, {
      fields: [appActivityLogs.teamId],
      references: [teams.id],
    }),
  }),
);
