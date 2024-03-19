import { relations, sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  timestamp,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

const DEFAULTLENGTH = 255;
const moneyDecimal = customType<{ data: number }>({
  dataType: () => "decimal(15,2)",
  fromDriver: (value) => Number(value), //Remember that JavaScript number is a 64-bit floating point value
});

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: DEFAULTLENGTH })
      .$type<"oauth" | "oidc" | "email">()
      .notNull(),
    provider: varchar("provider", { length: DEFAULTLENGTH }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: DEFAULTLENGTH,
    }).notNull(),
    refresh_token: varchar("refresh_token", { length: DEFAULTLENGTH }),
    access_token: varchar("access_token", { length: DEFAULTLENGTH }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: DEFAULTLENGTH }),
    scope: varchar("scope", { length: DEFAULTLENGTH }),
    id_token: varchar("id_token", { length: 2048 }),
    session_state: varchar("session_state", { length: DEFAULTLENGTH }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const apps = mysqlTable(
  "app",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    subscriptionCost: moneyDecimal("subscriptionCost").notNull(),
    devPartnerId: varchar("devPartnerId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => devPartners.id),
  },
  (table) => {
    return {
      devPartnerIdIdx: index("devPartnerId_idx").on(table.devPartnerId),
    };
  },
);

export const appPermissions = mysqlTable(
  "appPermission",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    appId: varchar("appId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
    };
  },
);

export const appRoleDefaults = mysqlTable(
  "appRoleDefault",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    appId: varchar("appId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    minUsers: int("minUsers").default(0).notNull(),
    maxUsers: int("maxUsers").default(0).notNull(),
  },
  (table) => {
    return {
      appIdIdx: index("appId_Idx").on(table.appId),
    };
  },
);

export const appTeamConfigs = mysqlTable(
  "appTeamConfig",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    config: json("config").notNull(),
    appId: varchar("appId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
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

export const careShifts = mysqlTable(
  "careShift",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    caregiverId: varchar("caregiverId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    checkIn: timestamp("checkIn")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    checkOut: timestamp("checkOut"),
    shiftEndedAt: timestamp("shiftEndedAt"),
    notes: varchar("notes", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      caregiverIdIdx: index("caregiverId_idx").on(table.caregiverId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);

export const careTasks = mysqlTable(
  "careTask",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    eventDate: timestamp("eventDate").notNull(),
    doneAt: timestamp("doneAt"),
    doneByUserId: varchar("doneByUserId", { length: DEFAULTLENGTH }).references(
      () => users.id,
      { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    ),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teams.id),
    eventMasterId: varchar("eventMasterId", {
      length: DEFAULTLENGTH,
    }).references(() => eventMasters.id),
    idCareShift: varchar("idCareShift", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => careShifts.id),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    details: varchar("details", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      doneByUserIdIdx: index("doneByUserId_idx").on(table.doneByUserId),
      eventMasterIdIdx: index("eventMasterId_Idx").on(table.eventMasterId),
      idCareShiftIdx: index("idCareShift_idx").on(table.idCareShift),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);

export const devPartners = mysqlTable("devPartner", {
  id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
  name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
  partnerUrl: varchar("partnerUrl", { length: DEFAULTLENGTH }),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const eventCancellations = mysqlTable(
  "eventCancellation",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    originalDate: timestamp("originalDate").notNull(),
    eventMasterId: varchar("eventMasterId", {
      length: DEFAULTLENGTH,
    })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      eventMasterIdIdx: index("eventMasterId_idx").on(table.eventMasterId),
    };
  },
);

export const eventExceptions = mysqlTable(
  "eventException",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    originalDate: timestamp("originalDate").notNull(),
    newDate: timestamp("newDate", { mode: "date", fsp: 3 }).notNull(),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    eventMasterId: varchar("eventMasterId", {
      length: DEFAULTLENGTH,
    })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      eventMasterIdIdx: index("eventMasterId_idx").on(table.eventMasterId),
    };
  },
);

export const eventMasters = mysqlTable(
  "eventMaster",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    rule: varchar("rule", { length: DEFAULTLENGTH }).notNull(),
    dateStart: timestamp("DateStart", { mode: "date", fsp: 3 }).notNull(),
    dateUntil: timestamp("DateUntil", { mode: "date", fsp: 3 }),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);

export const invitations = mysqlTable(
  "invitation",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull(),
    accepted: tinyint("accepted").default(0).notNull(), //Is this necessary? Since we just delete the invitation when the user accepts it
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    invitedById: varchar("invitedById", { length: DEFAULTLENGTH })
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

export const notifications = mysqlTable(
  "notification",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    userId: varchar("userId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
    };
  },
);

export const posts = mysqlTable("post", {
  id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
  title: varchar("title", { length: DEFAULTLENGTH }).notNull(),
  content: varchar("content", { length: DEFAULTLENGTH }).notNull(),
});

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: DEFAULTLENGTH })
      .notNull()
      .primaryKey()
      .unique(), //REMOVE UNIQUE AFTER PRISMA
    userId: varchar("userId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const teams = mysqlTable(
  "team",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    ownerId: varchar("ownerId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade" }),
  },
  (table) => {
    return {
      ownerIdIdx: index("ownerId_idx").on(table.ownerId),
    };
  },
);

export const teamAppRoles = mysqlTable(
  "teamAppRole",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    minUsers: int("minUsers").default(0).notNull(),
    maxUsers: int("maxUsers").default(0).notNull(),
    appId: varchar("appId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    appRoleDefaultId: varchar("appRoleDefaultId", {
      length: DEFAULTLENGTH,
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

export const todos = mysqlTable(
  "todo",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    title: varchar("title", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    dueDate: timestamp("dueDate"),
    priority: int("priority"),
    category: varchar("category", { length: DEFAULTLENGTH }),
    status: mysqlEnum("status", [
      "TODO",
      "INPROGRESS",
      "INREVIEW",
      "DONE",
      "CANCELED",
    ]),
    reminder: tinyint("reminder"),
    assignedToUserId: varchar("assignedToUserId", {
      length: DEFAULTLENGTH,
    }).references(() => users.id),
    teamId: varchar("teamId", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teams.id),
  },
  (table) => {
    return {
      assignedToUserIdIdx: index("assignedToUserId_idx").on(
        table.assignedToUserId,
      ),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);

export const users = mysqlTable(
  "user",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull().unique(),
    emailVerified: timestamp("emailVerified").default(sql`CURRENT_TIMESTAMP`),
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

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: DEFAULTLENGTH })
      .notNull()
      .unique(), //REMOVE UNIQUE AFTER PRISMA
    token: varchar("token", { length: DEFAULTLENGTH }).notNull().unique(), //REMOVE UNIQUE AFTER PRISMA
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const appPermissionsToAppRoleDefaults = mysqlTable(
  "_AppPermissionToAppRole_default",
  {
    appPermissionId: varchar("A", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => appPermissions.id),
    appRoleDefaultId: varchar("B", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => appRoleDefaults.id),
  },
  (table) => {
    return {
      appRoleDefaultIdIdx: index("appRoleDefaultId_idx").on(
        table.appRoleDefaultId,
      ),
      unique_appPermissionId_appRoleDefaultId: unique(
        "unique_appPermissionId_appRoleDefaultId",
      ).on(table.appPermissionId, table.appRoleDefaultId),
    };
  },
);

export const appPermissionsToAppRoleDefaultsRelations = relations(
  appPermissionsToAppRoleDefaults,
  ({ one }) => ({
    AppPermission: one(appPermissions, {
      fields: [appPermissionsToAppRoleDefaults.appPermissionId],
      references: [appPermissions.id],
    }),
    AppRoleDefault: one(appRoleDefaults, {
      fields: [appPermissionsToAppRoleDefaults.appRoleDefaultId],
      references: [appRoleDefaults.id],
    }),
  }),
);

export const appPermissionsToTeamAppRoles = mysqlTable(
  "_AppPermissionToTeamAppRole",
  {
    appPermissionId: varchar("A", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => appPermissions.id, { onDelete: "cascade" }),
    teamAppRoleId: varchar("B", { length: DEFAULTLENGTH })
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

export const appsToTeams = mysqlTable(
  "_AppTeam",
  {
    appId: varchar("A", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => apps.id),
    teamId: varchar("B", { length: DEFAULTLENGTH })
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

export const teamAppRolesToUsers = mysqlTable(
  "_TeamAppRoleToUser",
  {
    teamAppRoleId: varchar("A", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => teamAppRoles.id, { onDelete: "cascade" }),
    userId: varchar("B", { length: DEFAULTLENGTH })
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

export const usersToTeams = mysqlTable(
  "_UserTeam",
  {
    userId: varchar("A", { length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id),
    teamId: varchar("B", { length: DEFAULTLENGTH })
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

export const accountsRelations = relations(accounts, ({ one }) => ({
  Users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const appRelations = relations(apps, ({ many, one }) => ({
  AppsToTeams: many(appsToTeams),
  DevPartners: one(devPartners, {
    fields: [apps.devPartnerId],
    references: [devPartners.id],
  }),
  AppTeamConfigs: many(appTeamConfigs),
  AppRoleDefaults: many(appRoleDefaults),
  TeamAppRoles: many(teamAppRoles),
  AppPermissions: many(appPermissions),
}));

export const appPermissionsRelations = relations(
  appPermissions,
  ({ many, one }) => ({
    App: one(apps, {
      fields: [appPermissions.appId],
      references: [apps.id],
    }),
    AppPermissionsToAppRoleDefaults: many(appPermissionsToAppRoleDefaults),
    AppPermissionsToTeamAppRoles: many(appPermissionsToTeamAppRoles),
  }),
);

export const appRoleDefaultsRelations = relations(
  appRoleDefaults,
  ({ many, one }) => ({
    App: one(apps, {
      fields: [appRoleDefaults.appId],
      references: [apps.id],
    }),
    AppPermissionsToAppRoleDefaults: many(appPermissionsToAppRoleDefaults),
    TeamAppRoles: many(teamAppRoles),
  }),
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

export const careShiftsRelations = relations(careShifts, ({ one }) => ({
  Caregiver: one(users, {
    fields: [careShifts.caregiverId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [careShifts.teamId],
    references: [teams.id],
  }),
}));

export const careTasksRelations = relations(careTasks, ({ one }) => ({
  DoneByUser: one(users, {
    fields: [careTasks.doneByUserId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [careTasks.teamId],
    references: [teams.id],
  }),
  CareShift: one(careShifts, {
    fields: [careTasks.idCareShift],
    references: [careShifts.id],
  }),
  EventMaster: one(eventMasters, {
    fields: [careTasks.eventMasterId],
    references: [eventMasters.id],
  }),
}));

export const devPartnersRelations = relations(devPartners, ({ many }) => ({
  Apps: many(apps),
}));

export const eventCancellationsRelations = relations(
  eventCancellations,
  ({ one }) => ({
    EventMaster: one(eventMasters, {
      fields: [eventCancellations.eventMasterId],
      references: [eventMasters.id],
    }),
  }),
);

export const eventExceptionsRelations = relations(
  eventExceptions,
  ({ one }) => ({
    EventMaster: one(eventMasters, {
      fields: [eventExceptions.eventMasterId],
      references: [eventMasters.id],
    }),
  }),
);

export const eventMastersRelations = relations(
  eventMasters,
  ({ many, one }) => ({
    Team: one(teams, {
      fields: [eventMasters.teamId],
      references: [teams.id],
    }),
    CareTasks: many(careTasks),
    EventExceptions: many(eventExceptions),
    EventCancellations: many(eventCancellations),
  }),
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
  User: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  User: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

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

export const todosRelations = relations(todos, ({ one }) => ({
  AssignedToUser: one(users, {
    fields: [todos.assignedToUserId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [todos.teamId],
    references: [teams.id],
  }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  ActiveTeam: one(teams, {
    fields: [users.activeTeamId],
    references: [teams.id],
  }),
  Invitations: many(invitations),
  Notifications: many(notifications),
  Sessions: many(sessions),
  Teams: many(usersToTeams),
  Todos: many(todos),
  TeamAppRolesToUsers: many(teamAppRolesToUsers),
  Accounts: many(accounts),
}));
