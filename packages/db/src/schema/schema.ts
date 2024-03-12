import { relations, sql } from "drizzle-orm";
import {
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

const DEFAULTLENGTH = 255;

export const account = mysqlTable(
  "Account",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    userId: varchar("userId", { length: DEFAULTLENGTH })
      .notNull()
      // .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: DEFAULTLENGTH }).notNull(),
    provider: varchar("provider", { length: DEFAULTLENGTH }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: DEFAULTLENGTH,
    }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: int("expires_at"),
    tokenType: varchar("token_type", { length: DEFAULTLENGTH }),
    scope: varchar("scope", { length: DEFAULTLENGTH }),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      userIdIdx: index("Account_userId_idx").on(table.userId),
      accountId: primaryKey({ columns: [table.id], name: "Account_id" }),
      accountProviderProviderAccountIdKey: unique(
        "Account_provider_providerAccountId_key",
      ).on(table.provider, table.providerAccountId),
    };
  },
);

export const app = mysqlTable(
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

export const appPermission = mysqlTable(
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

export const appRoleDefault = mysqlTable(
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

export const appTeamConfig = mysqlTable(
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

export const careShift = mysqlTable(
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

export const careTask = mysqlTable(
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

export const devPartner = mysqlTable(
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

export const eventCancellation = mysqlTable(
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

export const eventException = mysqlTable(
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

export const eventMaster = mysqlTable(
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

export const invitation = mysqlTable(
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

export const notification = mysqlTable(
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

export const post = mysqlTable(
  "Post",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    title: varchar("title", { length: DEFAULTLENGTH }).notNull(),
    content: varchar("content", { length: DEFAULTLENGTH }).notNull(),
  },
  (table) => {
    return {
      postId: primaryKey({ columns: [table.id], name: "Post_id" }),
    };
  },
);

export const session = mysqlTable(
  "Session",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    sessionToken: varchar("sessionToken", { length: DEFAULTLENGTH }).notNull(),
    userId: varchar("userId", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id, { onDelete: "cascade" }),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("Session_userId_idx").on(table.userId),
      sessionId: primaryKey({ columns: [table.id], name: "Session_id" }),
      sessionSessionTokenKey: unique("Session_sessionToken_key").on(
        table.sessionToken,
      ),
    };
  },
);

export const team = mysqlTable(
  "Team",
  {
    id: varchar("id", { length: DEFAULTLENGTH }).notNull(),
    name: varchar("name", { length: DEFAULTLENGTH }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
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

export const teamAppRole = mysqlTable(
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

export const todo = mysqlTable(
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

export const user = mysqlTable(
  "User",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    name: varchar("name", { length: DEFAULTLENGTH }),
    email: varchar("email", { length: DEFAULTLENGTH }).notNull(),
    emailVerified: datetime("emailVerified", { mode: "string", fsp: 3 }),
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

export const verificationToken = mysqlTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: DEFAULTLENGTH }).notNull(),
    token: varchar("token", { length: DEFAULTLENGTH }).notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      verificationTokenIdentifierTokenKey: unique(
        "VerificationToken_identifier_token_key",
      ).on(table.identifier, table.token),
      verificationTokenTokenKey: unique("VerificationToken_token_key").on(
        table.token,
      ),
    };
  },
);

export const appPermissionToAppRoleDefault = mysqlTable(
  "_AppPermissionToAppRole_default",
  {
    appPermissionId: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => appPermission.id),
    appRoleDefaultId: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => appRoleDefault.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.appRoleDefaultId),
      appPermissionToAppRoleDefaultAbUnique: unique(
        "_AppPermissionToAppRole_default_AB_unique",
      ).on(table.appPermissionId, table.appRoleDefaultId),
    };
  },
);

export const appPermissionToAppRoleDefaultRelations = relations(
  appPermissionToAppRoleDefault,
  ({ one }) => ({
    AppPermission: one(appPermission, {
      fields: [appPermissionToAppRoleDefault.appPermissionId],
      references: [appPermission.id],
    }),
    AppRoleDefault: one(appRoleDefault, {
      fields: [appPermissionToAppRoleDefault.appRoleDefaultId],
      references: [appRoleDefault.id],
    }),
  }),
);

export const appPermissionToTeamAppRole = mysqlTable(
  "_AppPermissionToTeamAppRole",
  {
    appPermissionId: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => appPermission.id),
    teamAppRoleId: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => teamAppRole.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.teamAppRoleId),
      appPermissionToTeamAppRoleAbUnique: unique(
        "_AppPermissionToTeamAppRole_AB_unique",
      ).on(table.appPermissionId, table.teamAppRoleId),
    };
  },
);

export const appPermissionToTeamAppRoleRelations = relations(
  appPermissionToTeamAppRole,
  ({ one }) => ({
    AppPermission: one(appPermission, {
      fields: [appPermissionToTeamAppRole.appPermissionId],
      references: [appPermission.id],
    }),
    TeamAppRole: one(teamAppRole, {
      fields: [appPermissionToTeamAppRole.teamAppRoleId],
      references: [teamAppRole.id],
    }),
  }),
);

export const appToTeam = mysqlTable(
  "_AppTeam",
  {
    appId: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => app.id),
    teamId: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => team.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.teamId),
      appTeamAbUnique: unique("_AppTeam_AB_unique").on(
        table.appId,
        table.teamId,
      ),
    };
  },
);

export const appToTeamRelations = relations(appToTeam, ({ one }) => ({
  App: one(app, {
    fields: [appToTeam.appId],
    references: [app.id],
  }),
  Team: one(team, {
    fields: [appToTeam.teamId],
    references: [team.id],
  }),
}));

export const teamAppRoleToUser = mysqlTable(
  "_TeamAppRoleToUser",
  {
    teamAppRoleId: varchar("A", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => teamAppRole.id),
    userId: varchar("B", { length: DEFAULTLENGTH }).notNull(),
    // .references(() => user.id),
  },
  (table) => {
    return {
      bIdx: index("bIdx").on(table.userId),
      teamAppRoleToUserAbUnique: unique("_TeamAppRoleToUser_AB_unique").on(
        table.teamAppRoleId,
        table.userId,
      ),
    };
  },
);

export const teamAppRoleToUserRelations = relations(
  teamAppRoleToUser,
  ({ one }) => ({
    TeamAppRole: one(teamAppRole, {
      fields: [teamAppRoleToUser.teamAppRoleId],
      references: [teamAppRole.id],
    }),
    User: one(user, {
      fields: [teamAppRoleToUser.userId],
      references: [user.id],
    }),
  }),
);

export const userTeam = mysqlTable(
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

export const accountRelations = relations(account, ({ many }) => ({
  Users: many(account),
}));

export const appRelations = relations(app, ({ many, one }) => ({
  AppsToTeams: many(appToTeam),
  DevPartners: one(devPartner, {
    fields: [app.devPartnerId],
    references: [devPartner.id],
  }),
  AppTeamConfigs: many(appTeamConfig),
  AppRole_defaults: many(appRoleDefault),
  TeamAppRoles: many(teamAppRole),
  AppPermissions: many(appPermission),
}));

export const appPermissionRelations = relations(
  appPermission,
  ({ many, one }) => ({
    App: one(app, {
      fields: [appPermission.appId],
      references: [app.id],
    }),
    AppRoles: many(appRoleDefault),
    TeamAppRoles: many(teamAppRole),
  }),
);

export const appRoleDefaultRelations = relations(
  appRoleDefault,
  ({ many, one }) => ({
    App: one(app, {
      fields: [appRoleDefault.appId],
      references: [app.id],
    }),
    AppPermissions: many(appPermission),
    TeamAppRoles: many(teamAppRole),
  }),
);

export const appTeamConfigRelations = relations(appTeamConfig, ({ one }) => ({
  App: one(app, {
    fields: [appTeamConfig.appId],
    references: [app.id],
  }),
  Team: one(team, {
    fields: [appTeamConfig.teamId],
    references: [team.id],
  }),
}));

export const careShiftRelations = relations(careShift, ({ one }) => ({
  Caregiver: one(user, {
    fields: [careShift.caregiverId],
    references: [user.id],
  }),
  Team: one(team, {
    fields: [careShift.teamId],
    references: [team.id],
  }),
}));

export const careTaskRelations = relations(careTask, ({ one, many }) => ({
  DoneByUser: one(user, {
    fields: [careTask.doneByUserId],
    references: [user.id],
  }),
  Team: one(team, {
    fields: [careTask.teamId],
    references: [team.id],
  }),
  CareShift: one(careShift, {
    fields: [careTask.idCareShift],
    references: [careShift.id],
  }),
}));

export const devPartnerRelations = relations(devPartner, ({ many }) => ({
  Apps: many(app),
}));

export const eventCancellationRelations = relations(
  eventCancellation,
  ({ one }) => ({
    EventMaster: one(eventMaster, {
      fields: [eventCancellation.eventMasterId],
      references: [eventMaster.id],
    }),
  }),
);

export const eventExceptionRelations = relations(eventException, ({ one }) => ({
  EventMaster: one(eventMaster, {
    fields: [eventException.eventMasterId],
    references: [eventMaster.id],
  }),
}));

export const eventMasterRelations = relations(eventMaster, ({ many, one }) => ({
  Team: one(team, {
    fields: [eventMaster.teamId],
    references: [team.id],
  }),
  CareTasks: many(careTask),
  EventExceptions: many(eventException),
  EventCancellations: many(eventCancellation),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  InvitedBy: one(user, {
    fields: [invitation.invitedById],
    references: [user.id],
  }),
  Team: one(team, {
    fields: [invitation.teamId],
    references: [team.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  User: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const postRelations = relations(post, ({ many }) => ({
  Users: many(user),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  User: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const teamRelations = relations(team, ({ many, one }) => ({
  Owner: one(user, {
    fields: [team.ownerId],
    references: [user.id],
  }),
  Users: many(user),
  AppsToTeams: many(appToTeam),
  TeamAppRoles: many(teamAppRole),
  AppTeamConfigs: many(appTeamConfig),
  CareShifts: many(careShift),
  CareTasks: many(careTask),
  EventMasters: many(eventMaster),
  Invitations: many(invitation),
  Notifications: many(notification),
  Todos: many(todo),
}));

export const teamAppRoleRelations = relations(teamAppRole, ({ one, many }) => ({
  App: one(app, {
    fields: [teamAppRole.appId],
    references: [app.id],
  }),
  Team: one(team, {
    fields: [teamAppRole.teamId],
    references: [team.id],
  }),
  AppRoleDefault: one(appRoleDefault, {
    fields: [teamAppRole.appRoleDefaultId],
    references: [appRoleDefault.id],
  }),
  AppPermissions: many(appPermission),
  Users: many(user),
}));

export const todoRelations = relations(todo, ({ one }) => ({
  AssignedToUser: one(user, {
    fields: [todo.assignedToUserId],
    references: [user.id],
  }),
  Team: one(team, {
    fields: [todo.teamId],
    references: [team.id],
  }),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  ActiveTeam: one(team, {
    fields: [user.activeTeamId],
    references: [team.id],
  }),
  Invitations: many(invitation),
  Notifications: many(notification),
  Posts: many(post),
  Sessions: many(session),
  Teams: many(team),
  Todos: many(todo),
  TeamAppRoles: many(teamAppRole),
}));
