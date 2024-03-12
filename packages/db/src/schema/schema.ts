import { relations, sql } from "drizzle-orm";
import {
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  primaryKey,
  timestamp,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

const DEFAULTLENGTH = 255;

export const accounts = mySqlTable(
  "Account",
  {
    userId: varchar("userId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => users.id, { onDelete: "cascade" }),
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

export const apps = mySqlTable(
  "App",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
    subscriptionCost: decimal("subscriptionCost", {
      precision: 65,
      scale: 30,
    }).notNull(),
    devPartnerId: varchar("devPartnerId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => devPartner.id),
  },
  (table) => {
    return {
      devPartnerIdIdx: index("App_devPartnerId_idx").on(table.devPartnerId),
      appId: primaryKey({ columns: [table.id], name: "App_id" }),
    };
  },
);

export const appPermissions = mySqlTable(
  "AppPermission",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    appId: varchar("appId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => app.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      appIdIdx: index("AppPermission_appId_idx").on(table.appId),
      appPermissionId: primaryKey({
        columns: [table.id],
        name: "AppPermission_id",
      }),
    };
  },
);

export const appRoleDefaults = mySqlTable(
  "AppRole_default",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    appId: varchar("appId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => app.id, { onDelete: "cascade" }),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    minUsers: int("minUsers").default(0).notNull(),
    maxUsers: int("maxUsers").default(0).notNull(),
  },
  (table) => {
    return {
      appIdIdx: index("AppRole_default_appId_idx").on(table.appId),
      appRoleDefaultId: primaryKey({
        columns: [table.id],
        name: "AppRole_default_id",
      }),
    };
  },
);

export const appTeamConfigs = mySqlTable(
  "AppTeamConfig",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    config: json("config").notNull(),
    appId: varchar("appId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => app.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      appIdIdx: index("AppTeamConfig_appId_idx").on(table.appId),
      teamIdIdx: index("AppTeamConfig_teamId_idx").on(table.teamId),
      appTeamConfigId: primaryKey({
        columns: [table.id],
        name: "AppTeamConfig_id",
      }),
      appTeamConfigAppIdTeamIdKey: unique("AppTeamConfig_appId_teamId_key").on(
        table.appId,
        table.teamId,
      ),
    };
  },
);

export const careShifts = mySqlTable(
  "CareShift",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    caregiverId: varchar("caregiverId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id, { onDelete: "cascade" }),
    checkIn: datetime("checkIn", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    checkOut: datetime("checkOut", { mode: "string", fsp: 3 }),
    shiftEndedAt: datetime("shiftEndedAt", { mode: "string", fsp: 3 }),
    notes: varchar("notes", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      caregiverIdIdx: index("CareShift_caregiverId_idx").on(table.caregiverId),
      teamIdIdx: index("CareShift_teamId_idx").on(table.teamId),
      careShiftId: primaryKey({ columns: [table.id], name: "CareShift_id" }),
    };
  },
);

export const careTasks = mySqlTable(
  "CareTask",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    eventDate: datetime("eventDate", { mode: "string", fsp: 3 }).notNull(),
    doneAt: datetime("doneAt", { mode: "string", fsp: 3 }),
    doneByUserId: varchar("doneByUserId", { length: DEFAULTLENGTH }),
    // .references(
    //   () => user.id,
    //   { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    // ),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id),
    eventMasterId: varchar("eventMasterId", { length: DEFAULTLENGTH }),
    // .references(
    //   () => eventMaster.id,
    // ),
    idCareShift: varchar("idCareShift", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => careShift.id),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    details: varchar("details", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      doneByUserIdIdx: index("CareTask_doneByUserId_idx").on(
        table.doneByUserId,
      ),
      eventMasterIdIdx: index("CareTask_eventMasterId_idx").on(
        table.eventMasterId,
      ),
      idCareShiftIdx: index("CareTask_idCareShift_idx").on(table.idCareShift),
      teamIdIdx: index("CareTask_teamId_idx").on(table.teamId),
      careTaskId: primaryKey({ columns: [table.id], name: "CareTask_id" }),
    };
  },
);

export const devPartners = mySqlTable(
  "DevPartner",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    partnerUrl: varchar("partnerUrl", { length: DEFAULTLENGTH }),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      devPartnerId: primaryKey({ columns: [table.id], name: "DevPartner_id" }),
    };
  },
);

export const eventCancellations = mySqlTable(
  "EventCancellation",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    originalDate: datetime("originalDate", {
      mode: "string",
      fsp: 3,
    }).notNull(),
    eventMasterId: varchar("eventMasterId", {
      length: DEFAULTLENGTH,
    }).notNull(),
    // .references(() => eventMaster.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      eventMasterIdIdx: index("EventCancellation_eventMasterId_idx").on(
        table.eventMasterId,
      ),
      eventCancellationId: primaryKey({
        columns: [table.id],
        name: "EventCancellation_id",
      }),
    };
  },
);

export const eventExceptions = mySqlTable(
  "EventException",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    originalDate: datetime("originalDate", {
      mode: "string",
      fsp: 3,
    }).notNull(),
    newDate: datetime("newDate", { mode: "string", fsp: 3 }).notNull(),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    eventMasterId: varchar("eventMasterId", {
      length: DEFAULTLENGTH,
    }).notNull(),
    // .references(() => eventMaster.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      eventMasterIdIdx: index("EventException_eventMasterId_idx").on(
        table.eventMasterId,
      ),
      eventExceptionId: primaryKey({
        columns: [table.id],
        name: "EventException_id",
      }),
    };
  },
);

export const eventMasters = mySqlTable(
  "EventMaster",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    rule: varchar("rule", { length: DEFAULTLENGTH }).notNull(),
    dateStart: datetime("DateStart", { mode: "string", fsp: 3 }).notNull(),
    dateUntil: datetime("DateUntil", { mode: "string", fsp: 3 }),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      teamIdIdx: index("EventMaster_teamId_idx").on(table.teamId),
      eventMasterId: primaryKey({
        columns: [table.id],
        name: "EventMaster_id",
      }),
    };
  },
);

export const invitations = mySqlTable(
  "Invitation",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id, { onDelete: "cascade" }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull(),
    accepted: tinyint("accepted").default(0).notNull(), //Is this necessary? Since we just delete the invitation when the user accepts it
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
    invitedById: varchar("invitedById", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id),
  },
  (table) => {
    return {
      invitedByIdIdx: index("Invitation_invitedById_idx").on(table.invitedById),
      teamIdIdx: index("Invitation_teamId_idx").on(table.teamId),
      invitationId: primaryKey({ columns: [table.id], name: "Invitation_id" }),
    };
  },
);

export const notifications = mySqlTable(
  "Notification",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    userId: varchar("userId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      userIdIdx: index("Notification_userId_idx").on(table.userId),
      notificationId: primaryKey({
        columns: [table.id],
        name: "Notification_id",
      }),
    };
  },
);

// export const posts = mySqlTable(
//   "Post",
//   {
//     id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
//     title: varchar("title", { length: DEFAULTLENGTH }).notNull(),
//     content: varchar("content", { length: DEFAULTLENGTH }).notNull(),
//   },
//   (table) => {
//     return {
//       postId: primaryKey({ columns: [table.id], name: "Post_id" }),
//     };
//   },
// );

export const sessions = mySqlTable(
  "Session",
  {
    sessionToken: varchar("sessionToken", { length: DEFAULTLENGTH })
      .notNull()
      .primaryKey()
      .unique(), //REMOVE UNIQUE AFTER PRISMA
    userId: varchar("userId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const teams = mySqlTable(
  "Team",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    ownerId: varchar("ownerId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id, { onUpdate: "cascade" }),
  },
  (table) => {
    return {
      ownerIdIdx: index("Team_ownerId_idx").on(table.ownerId),
      teamId: primaryKey({ columns: [table.id], name: "Team_id" }),
      asd: relations,
    };
  },
);

export const teamAppRoles = mySqlTable(
  "TeamAppRole",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    minUsers: int("minUsers").default(0).notNull(),
    maxUsers: int("maxUsers").default(0).notNull(),
    appId: varchar("appId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => app.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id, { onDelete: "cascade" }),
    appRoleDefaultId: varchar("appRole_defaultId", { length: DEFAULTLENGTH }),
    // .references(
    //   () => appRoleDefault.id,
    //   { onDelete: "set null", onUpdate: "cascade" },
    // ),
  },
  (table) => {
    return {
      appIdIdx: index("TeamAppRole_appId_idx").on(table.appId),
      appRoleDefaultIdIdx: index("TeamAppRole_appRole_defaultId_idx").on(
        table.appRoleDefaultId,
      ),
      teamIdIdx: index("TeamAppRole_teamId_idx").on(table.teamId),
      teamAppRoleId: primaryKey({
        columns: [table.id],
        name: "TeamAppRole_id",
      }),
    };
  },
);

export const todos = mySqlTable(
  "Todo",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    title: varchar("title", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    dueDate: datetime("dueDate", { mode: "string", fsp: 3 }),
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
    assignedToUserId: varchar("assignedToUserId", { length: DEFAULTLENGTH }),
    // .references(
    //   () => user.id,
    // ),
    teamId: varchar("teamId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id),
  },
  (table) => {
    return {
      assignedToUserIdIdx: index("Todo_assignedToUserId_idx").on(
        table.assignedToUserId,
      ),
      teamIdIdx: index("Todo_teamId_idx").on(table.teamId),
      todoId: primaryKey({ columns: [table.id], name: "Todo_id" }),
    };
  },
);

export const users = mySqlTable(
  "User",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull(),
    emailVerified: datetime("emailVerified", {
      mode: "date",
      fsp: 3,
    }).default(sql`CURRENT_TIMESTAMP(3)`),
    image: varchar("image", { length: DEFAULTLENGTH }),
    activeTeamId: varchar("activeTeamId", { length: DEFAULTLENGTH }).notNull(),
    kodixAdmin: tinyint("kodixAdmin").default(0).notNull(),
  },
  (table) => {
    return {
      activeTeamIdIdx: index("User_activeTeamId_idx").on(table.activeTeamId),
      userEmailKey: unique("User_email_key").on(table.email),
    };
  },
);

export const verificationTokens = mySqlTable(
  "VerificationToken",
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

export const appPermissionsToAppRoleDefaults = mySqlTable(
  "_AppPermissionToAppRole_default",
  {
    a: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => appPermission.id),
    b: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => appRoleDefault.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.b),
      appPermissionToAppRoleDefaultAbUnique: unique(
        "_AppPermissionToAppRole_default_AB_unique",
      ).on(table.a, table.b),
    };
  },
);

export const appPermissionsToAppRoleDefaultsRelations = relations(
  appPermissionsToAppRoleDefaults,
  ({ one }) => ({
    AppPermission: one(appPermissions, {
      fields: [appPermissionsToAppRoleDefaults.a],
      references: [appPermissions.id],
    }),
    AppRoleDefault: one(appRoleDefaults, {
      fields: [appPermissionsToAppRoleDefaults.b],
      references: [appRoleDefaults.id],
    }),
  }),
);

export const appPermissionsToTeamAppRoles = mySqlTable(
  "_AppPermissionToTeamAppRole",
  {
    a: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => appPermission.id),
    b: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => teamAppRole.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.b),
      appPermissionToTeamAppRoleAbUnique: unique(
        "_AppPermissionToTeamAppRole_AB_unique",
      ).on(table.a, table.b),
    };
  },
);

export const appPermissionsToTeamAppRolesRelations = relations(
  appPermissionsToTeamAppRoles,
  ({ one }) => ({
    AppPermission: one(appPermissions, {
      fields: [appPermissionsToTeamAppRoles.a],
      references: [appPermissions.id],
    }),
    TeamAppRole: one(teamAppRoles, {
      fields: [appPermissionsToTeamAppRoles.b],
      references: [teamAppRoles.id],
    }),
  }),
);

export const appsToTeams = mySqlTable(
  "_AppTeam",
  {
    a: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => app.id),
    b: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.b),
      appTeamAbUnique: unique("_AppTeam_AB_unique").on(table.a, table.b),
    };
  },
);

export const appsToTeamsRelations = relations(appsToTeams, ({ one }) => ({
  App: one(apps, {
    fields: [appsToTeams.a],
    references: [apps.id],
  }),
  Team: one(teams, {
    fields: [appsToTeams.b],
    references: [teams.id],
  }),
}));

export const teamAppRolesToUsers = mySqlTable(
  "_TeamAppRoleToUser",
  {
    a: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => teamAppRole.id),
    b: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.b),
      teamAppRoleToUserAbUnique: unique("_TeamAppRoleToUser_AB_unique").on(
        table.a,
        table.b,
      ),
    };
  },
);

export const teamAppRolesToUsersRelations = relations(
  teamAppRolesToUsers,
  ({ one }) => ({
    TeamAppRole: one(teamAppRoles, {
      fields: [teamAppRolesToUsers.a],
      references: [teamAppRoles.id],
    }),
    User: one(users, {
      fields: [teamAppRolesToUsers.b],
      references: [users.id],
    }),
  }),
);

export const usersToTeams = mySqlTable(
  "_UserTeam",
  {
    a: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id),
    b: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.b),
      userTeamAbUnique: unique("_UserTeam_AB_unique").on(table.a, table.b),
    };
  },
);

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  User: one(users, {
    fields: [usersToTeams.a],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [usersToTeams.b],
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
  AppRole_defaults: many(appRoleDefaults),
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
    AppRoles: many(appPermissionsToAppRoleDefaults),
    TeamAppRoles: many(appPermissionsToTeamAppRoles),
    AppRoleDefaults: many(appPermissionsToAppRoleDefaults),
  }),
);

export const appRoleDefaultsRelations = relations(
  appRoleDefaults,
  ({ many, one }) => ({
    App: one(apps, {
      fields: [appRoleDefaults.appId],
      references: [apps.id],
    }),
    AppPermissions: many(appPermissionsToAppRoleDefaults),
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
  Users: many(usersToTeams),
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
    AppPermissions: many(appPermissionsToTeamAppRoles),
    Users: many(teamAppRolesToUsers),
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
  TeamAppRoles: many(teamAppRolesToUsers),
  Accounts: many(accounts),
}));
