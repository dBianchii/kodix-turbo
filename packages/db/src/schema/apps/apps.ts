import { relations } from "drizzle-orm";
import { index, mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core";

import { teams } from "../teams";

export const apps = mysqlTable("apps", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  iconUrl: varchar("iconUrl", { length: 255 }).notNull(),
});

export const appsToTeams = mysqlTable(
  "appsToTeams",
  {
    appId: varchar("appId", { length: 255 }).notNull(),
    teamId: varchar("teamId", { length: 30 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.appId, table.teamId] }),
    appIdIdx: index("appId_idx").on(table.appId),
    teamIdIdx: index("teamId_idx").on(table.teamId),
  }),
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
