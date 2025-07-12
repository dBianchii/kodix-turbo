import { sql } from "drizzle-orm";
import {
  AnyMySqlColumn,
  datetime,
  foreignKey,
  index,
  int,
  json,
  mysqlEnum,
  mysqlSchema,
  mysqlTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const appToTeam = mysqlTable(
  "_appToTeam",
  {
    appId: varchar({ length: 12 })
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      uniqueAppIdTeamId: unique("unique_appId_teamId").on(
        table.appId,
        table.teamId,
      ),
    };
  },
);

export const userToTeam = mysqlTable(
  "_userToTeam",
  {
    userId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      teamIdIdx: index("teamId_idx").on(table.teamId),
      userIdIdx: index("userId_idx").on(table.userId),
      uniqueUserIdTeamId: unique("unique_userId_teamId").on(
        table.userId,
        table.teamId,
      ),
    };
  },
);

export const account = mysqlTable(
  "account",
  {
    providerId: varchar({ length: 255 }).notNull(),
    providerUserId: varchar({ length: 255 }).notNull(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
      accountProviderIdProviderUserId: primaryKey({
        columns: [table.providerId, table.providerUserId],
        name: "account_providerId_providerUserId",
      }),
    };
  },
);

export const aiAgent = mysqlTable(
  "ai_agent",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    createdById: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    name: varchar({ length: 100 }).notNull(),
    instructions: text().notNull(),
    libraryId: varchar({ length: 12 }).references(() => aiLibrary.id),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
  },
  (table) => {
    return {
      createdAtIdx: index("ai_agent_created_at_idx").on(table.createdAt),
      createdByIdx: index("ai_agent_created_by_idx").on(table.createdById),
      libraryIdx: index("ai_agent_library_idx").on(table.libraryId),
      nameIdx: index("ai_agent_name_idx").on(table.name),
      teamIdx: index("ai_agent_team_idx").on(table.teamId),
      aiAgentId: primaryKey({ columns: [table.id], name: "ai_agent_id" }),
    };
  },
);

export const aiLibrary = mysqlTable(
  "ai_library",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    files: json(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
  },
  (table) => {
    return {
      createdAtIdx: index("ai_library_created_at_idx").on(table.createdAt),
      nameIdx: index("ai_library_name_idx").on(table.name),
      teamIdx: index("ai_library_team_idx").on(table.teamId),
      aiLibraryId: primaryKey({ columns: [table.id], name: "ai_library_id" }),
    };
  },
);

export const aiModel = mysqlTable(
  "ai_model",
  {
    id: varchar({ length: 12 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    providerId: varchar({ length: 12 })
      .notNull()
      .references(() => aiProvider.id),
    config: json(),
    enabled: tinyint().default(1).notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
    status: mysqlEnum(["active", "archived"]).default("active").notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("ai_model_created_at_idx").on(table.createdAt),
      enabledIdx: index("ai_model_enabled_idx").on(table.enabled),
      nameIdx: index("ai_model_name_idx").on(table.name),
      providerIdx: index("ai_model_provider_idx").on(table.providerId),
      statusIdx: index("ai_model_status_idx").on(table.status),
      aiModelId: primaryKey({ columns: [table.id], name: "ai_model_id" }),
    };
  },
);

export const aiProvider = mysqlTable(
  "ai_provider",
  {
    id: varchar({ length: 12 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    baseUrl: text(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("ai_provider_created_at_idx").on(table.createdAt),
      nameIdx: index("ai_provider_name_idx").on(table.name),
      aiProviderId: primaryKey({ columns: [table.id], name: "ai_provider_id" }),
    };
  },
);

export const aiTeamModelConfig = mysqlTable(
  "ai_team_model_config",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    modelId: varchar({ length: 12 })
      .notNull()
      .references(() => aiModel.id, { onDelete: "cascade" }),
    enabled: tinyint().default(0).notNull(),
    isDefault: tinyint().default(0).notNull(),
    priority: int().default(0),
    config: json(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
  },
  (table) => {
    return {
      createdAtIdx: index("ai_team_model_config_created_at_idx").on(
        table.createdAt,
      ),
      enabledIdx: index("ai_team_model_config_enabled_idx").on(table.enabled),
      isDefaultIdx: index("ai_team_model_config_is_default_idx").on(
        table.isDefault,
      ),
      modelIdx: index("ai_team_model_config_model_idx").on(table.modelId),
      priorityIdx: index("ai_team_model_config_priority_idx").on(
        table.priority,
      ),
      teamIdx: index("ai_team_model_config_team_idx").on(table.teamId),
      aiTeamModelConfigId: primaryKey({
        columns: [table.id],
        name: "ai_team_model_config_id",
      }),
      aiTeamModelConfigTeamModelUnique: unique(
        "ai_team_model_config_team_model_unique",
      ).on(table.teamId, table.modelId),
    };
  },
);

export const aiTeamProviderToken = mysqlTable(
  "ai_team_provider_token",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    providerId: varchar({ length: 12 })
      .notNull()
      .references(() => aiProvider.id),
    token: text().notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
  },
  (table) => {
    return {
      createdAtIdx: index("ai_team_provider_token_created_at_idx").on(
        table.createdAt,
      ),
      providerIdx: index("ai_team_provider_token_provider_idx").on(
        table.providerId,
      ),
      teamIdx: index("ai_team_provider_token_team_idx").on(table.teamId),
      aiTeamProviderTokenId: primaryKey({
        columns: [table.id],
        name: "ai_team_provider_token_id",
      }),
      aiTeamProviderTokenTeamProviderUnique: unique(
        "ai_team_provider_token_team_provider_unique",
      ).on(table.teamId, table.providerId),
    };
  },
);

export const app = mysqlTable(
  "app",
  {
    id: varchar({ length: 12 }).notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
    devPartnerId: varchar({ length: 12 })
      .notNull()
      .references(() => devPartner.id),
  },
  (table) => {
    return {
      devPartnerIdIdx: index("devPartnerId_idx").on(table.devPartnerId),
      appId: primaryKey({ columns: [table.id], name: "app_id" }),
    };
  },
);

export const appActivityLog = mysqlTable(
  "appActivityLog",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    appId: varchar({ length: 12 })
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    userId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    tableName: mysqlEnum(["careShift", "careTask"]).notNull(),
    rowId: varchar({ length: 12 }).notNull(),
    loggedAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    diff: json().notNull(),
    type: mysqlEnum(["create", "update", "delete"]).notNull(),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      rowIdIdx: index("rowId_idx").on(table.rowId),
      tableNameIdx: index("tableName_idx").on(table.tableName),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      userIdIdx: index("userId_idx").on(table.userId),
      appActivityLogId: primaryKey({
        columns: [table.id],
        name: "appActivityLog_id",
      }),
    };
  },
);

export const appTeamConfig = mysqlTable(
  "appTeamConfig",
  {
    id: varchar({ length: 12 }).notNull(),
    config: json().notNull(),
    appId: varchar({ length: 12 })
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      appTeamConfigId: primaryKey({
        columns: [table.id],
        name: "appTeamConfig_id",
      }),
      uniqueAppIdTeamId: unique("unique_appId_teamId").on(
        table.appId,
        table.teamId,
      ),
    };
  },
);

export const apps = mysqlTable(
  "apps",
  {
    id: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    iconUrl: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return {
      appsId: primaryKey({ columns: [table.id], name: "apps_id" }),
    };
  },
);

export const appsToTeams = mysqlTable(
  "appsToTeams",
  {
    appId: varchar({ length: 255 }).notNull(),
    teamId: varchar({ length: 30 }).notNull(),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      appsToTeamsAppIdTeamId: primaryKey({
        columns: [table.appId, table.teamId],
        name: "appsToTeams_appId_teamId",
      }),
    };
  },
);

export const careShift = mysqlTable(
  "careShift",
  {
    id: varchar({ length: 12 }).notNull(),
    caregiverId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    startAt: timestamp({ mode: "string" }).notNull(),
    endAt: timestamp({ mode: "string" }).notNull(),
    checkIn: timestamp({ mode: "string" }),
    checkOut: timestamp({ mode: "string" }),
    notes: varchar({ length: 255 }),
    createdById: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    finishedByUserId: varchar({ length: 12 }).references(() => user.id, {
      onDelete: "restrict",
    }),
  },
  (table) => {
    return {
      caregiverIdIdx: index("caregiverId_idx").on(table.caregiverId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      careShiftId: primaryKey({ columns: [table.id], name: "careShift_id" }),
    };
  },
);

export const careTask = mysqlTable(
  "careTask",
  {
    id: varchar({ length: 12 }).notNull(),
    date: timestamp({ mode: "string" }).notNull(),
    doneAt: timestamp({ mode: "string" }),
    doneByUserId: varchar({ length: 12 }).references(() => user.id, {
      onDelete: "restrict",
    }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    eventMasterId: varchar({ length: 12 }),
    title: varchar({ length: 255 }),
    description: varchar({ length: 255 }),
    details: varchar({ length: 255 }),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
    type: mysqlEnum(["NORMAL", "CRITICAL"]).default("NORMAL").notNull(),
    createdBy: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    createdFromCalendar: tinyint().notNull(),
  },
  (table) => {
    return {
      doneByUserIdIdx: index("doneByUserId_idx").on(table.doneByUserId),
      eventMasterIdIdx: index("eventMasterId_Idx").on(table.eventMasterId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      careTaskId: primaryKey({ columns: [table.id], name: "careTask_id" }),
    };
  },
);

export const chatFolder = mysqlTable(
  "chat_folder",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    createdById: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    name: varchar({ length: 100 }).notNull(),
    aiAgentId: varchar({ length: 12 }).references(() => aiAgent.id),
    aiModelId: varchar({ length: 12 }).references(() => aiModel.id),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
  },
  (table) => {
    return {
      aiAgentIdx: index("chat_folder_ai_agent_idx").on(table.aiAgentId),
      aiModelIdx: index("chat_folder_ai_model_idx").on(table.aiModelId),
      createdAtIdx: index("chat_folder_created_at_idx").on(table.createdAt),
      createdByIdx: index("chat_folder_created_by_idx").on(table.createdById),
      nameIdx: index("chat_folder_name_idx").on(table.name),
      teamIdx: index("chat_folder_team_idx").on(table.teamId),
      chatFolderId: primaryKey({ columns: [table.id], name: "chat_folder_id" }),
    };
  },
);

export const chatMessage = mysqlTable(
  "chat_message",
  {
    id: varchar({ length: 12 }).notNull(),
    chatSessionId: varchar({ length: 12 })
      .notNull()
      .references(() => chatSession.id, { onDelete: "cascade" }),
    senderRole: varchar({ length: 50 }).notNull(),
    content: text().notNull(),
    metadata: json(),
    status: varchar({ length: 50 }).notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("chat_message_created_at_idx").on(table.createdAt),
      senderRoleIdx: index("chat_message_sender_role_idx").on(table.senderRole),
      sessionIdx: index("chat_message_session_idx").on(table.chatSessionId),
      statusIdx: index("chat_message_status_idx").on(table.status),
      chatMessageId: primaryKey({
        columns: [table.id],
        name: "chat_message_id",
      }),
    };
  },
);

export const chatSession = mysqlTable(
  "chat_session",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    chatFolderId: varchar({ length: 12 }).references(() => chatFolder.id),
    aiAgentId: varchar({ length: 12 }).references(() => aiAgent.id),
    aiModelId: varchar({ length: 12 })
      .notNull()
      .references(() => aiModel.id),
    title: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
    activeAgentId: varchar({ length: 12 }),
    agentHistory: json(),
  },
  (table) => {
    return {
      activeAgentIdx: index("chat_session_active_agent_idx").on(
        table.activeAgentId,
      ),
      aiAgentIdx: index("chat_session_ai_agent_idx").on(table.aiAgentId),
      aiModelIdx: index("chat_session_ai_model_idx").on(table.aiModelId),
      createdAtIdx: index("chat_session_created_at_idx").on(table.createdAt),
      folderIdx: index("chat_session_folder_idx").on(table.chatFolderId),
      teamIdx: index("chat_session_team_idx").on(table.teamId),
      titleIdx: index("chat_session_title_idx").on(table.title),
      userIdx: index("chat_session_user_idx").on(table.userId),
      chatSessionId: primaryKey({
        columns: [table.id],
        name: "chat_session_id",
      }),
    };
  },
);

export const devPartner = mysqlTable(
  "devPartner",
  {
    id: varchar({ length: 12 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    partnerUrl: varchar({ length: 255 }),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
  },
  (table) => {
    return {
      devPartnerId: primaryKey({ columns: [table.id], name: "devPartner_id" }),
    };
  },
);

export const eventCancellation = mysqlTable(
  "eventCancellation",
  {
    id: varchar({ length: 12 }).notNull(),
    originalDate: timestamp({ mode: "string" }).notNull(),
    eventMasterId: varchar({ length: 12 })
      .notNull()
      .references(() => eventMaster.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      eventMasterIdIdx: index("eventMasterId_idx").on(table.eventMasterId),
      eventCancellationId: primaryKey({
        columns: [table.id],
        name: "eventCancellation_id",
      }),
    };
  },
);

export const eventException = mysqlTable(
  "eventException",
  {
    id: varchar({ length: 12 }).notNull(),
    originalDate: timestamp({ mode: "string" }).notNull(),
    newDate: timestamp({ fsp: 3, mode: "string" }).notNull(),
    title: varchar({ length: 255 }),
    description: varchar({ length: 255 }),
    eventMasterId: varchar({ length: 12 })
      .notNull()
      .references(() => eventMaster.id, { onDelete: "cascade" }),
    type: mysqlEnum(["NORMAL", "CRITICAL"]),
  },
  (table) => {
    return {
      eventMasterIdIdx: index("eventMasterId_idx").on(table.eventMasterId),
      eventExceptionId: primaryKey({
        columns: [table.id],
        name: "eventException_id",
      }),
    };
  },
);

export const eventMaster = mysqlTable(
  "eventMaster",
  {
    id: varchar({ length: 12 }).notNull(),
    rule: varchar({ length: 255 }).notNull(),
    dateStart: timestamp({ fsp: 3, mode: "string" }).notNull(),
    dateUntil: timestamp({ fsp: 3, mode: "string" }),
    title: varchar({ length: 255 }),
    description: varchar({ length: 255 }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    type: mysqlEnum(["NORMAL", "CRITICAL"]).default("NORMAL").notNull(),
    createdBy: varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      teamIdIdx: index("teamId_idx").on(table.teamId),
      eventMasterId: primaryKey({
        columns: [table.id],
        name: "eventMaster_id",
      }),
    };
  },
);

export const expoToken = mysqlTable(
  "expoToken",
  {
    id: varchar({ length: 12 }).notNull(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    token: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("userId_idx").on(table.userId),
      expoTokenId: primaryKey({ columns: [table.id], name: "expoToken_id" }),
      expoTokenTokenUnique: unique("expoToken_token_unique").on(table.token),
    };
  },
);

export const invitation = mysqlTable(
  "invitation",
  {
    id: varchar({ length: 12 }).notNull(),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    email: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
    invitedById: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      emailIdx: index("email_idx").on(table.email),
      invitedByIdIdx: index("invitedById_idx").on(table.invitedById),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      invitationId: primaryKey({ columns: [table.id], name: "invitation_id" }),
    };
  },
);

export const notification = mysqlTable(
  "notification",
  {
    id: varchar({ length: 12 }).notNull(),
    sentToUserId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    subject: varchar({ length: 100 }),
    sentAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    message: text().notNull(),
    channel: mysqlEnum(["EMAIL", "PUSH_NOTIFICATIONS"]).notNull(),
  },
  (table) => {
    return {
      sentToUserIdIdx: index("sentToUserId_idx").on(table.sentToUserId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      notificationId: primaryKey({
        columns: [table.id],
        name: "notification_id",
      }),
    };
  },
);

export const resetToken = mysqlTable(
  "resetToken",
  {
    id: varchar({ length: 12 }).notNull(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    token: varchar({ length: 12 }).notNull(),
    tokenExpiresAt: timestamp({ mode: "string" }).notNull(),
  },
  (table) => {
    return {
      tokenIdx: index("token_idx").on(table.token),
      userIdIdx: index("userId_idx").on(table.userId),
      resetTokenId: primaryKey({ columns: [table.id], name: "resetToken_id" }),
      resetTokenUserIdUnique: unique("resetToken_userId_unique").on(
        table.userId,
      ),
    };
  },
);

export const session = mysqlTable(
  "session",
  {
    id: varchar({ length: 255 }).notNull(),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expiresAt: datetime({ mode: "string" }).notNull(),
    ipAddress: varchar({ length: 45 }).notNull(),
    userAgent: text(),
  },
  (table) => {
    return {
      sessionId: primaryKey({ columns: [table.id], name: "session_id" }),
    };
  },
);

export const team = mysqlTable(
  "team",
  {
    id: varchar({ length: 12 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ mode: "string" })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp({ mode: "string" }).onUpdateNow(),
    ownerId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id, { onUpdate: "cascade" }),
  },
  (table) => {
    return {
      ownerIdIdx: index("ownerId_idx").on(table.ownerId),
      teamId: primaryKey({ columns: [table.id], name: "team_id" }),
    };
  },
);

export const todo = mysqlTable(
  "todo",
  {
    id: varchar({ length: 12 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    dueDate: timestamp({ mode: "string" }),
    priority: smallint(),
    status: mysqlEnum(["TODO", "INPROGRESS", "INREVIEW", "DONE", "CANCELED"]),
    assignedToUserId: varchar({ length: 255 }).references(() => user.id),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      assignedToUserIdIdx: index("assignedToUserId_idx").on(
        table.assignedToUserId,
      ),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      todoId: primaryKey({ columns: [table.id], name: "todo_id" }),
    };
  },
);

export const user = mysqlTable(
  "user",
  {
    id: varchar({ length: 12 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    passwordHash: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    image: varchar({ length: 255 }),
    activeTeamId: varchar({ length: 255 }).notNull(),
    kodixAdmin: tinyint().default(0).notNull(),
  },
  (table) => {
    return {
      activeTeamIdIdx: index("activeTeamId_idx").on(table.activeTeamId),
      userId: primaryKey({ columns: [table.id], name: "user_id" }),
      userEmailUnique: unique("user_email_unique").on(table.email),
    };
  },
);

export const userAppTeamConfig = mysqlTable(
  "userAppTeamConfig",
  {
    id: varchar({ length: 12 }).notNull(),
    config: json().notNull(),
    userId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id),
    appId: varchar({ length: 12 })
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      userIdIdx: index("userId_idx").on(table.userId),
      userAppTeamConfigId: primaryKey({
        columns: [table.id],
        name: "userAppTeamConfig_id",
      }),
      uniqueUserIdAppIdTeamId: unique("unique_userId_appId_teamId").on(
        table.userId,
        table.appId,
        table.teamId,
      ),
    };
  },
);

export const userTeamAppRole = mysqlTable(
  "userTeamAppRole",
  {
    id: varchar({ length: 12 }).notNull(),
    userId: varchar({ length: 12 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: varchar({ length: 12 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    appId: varchar({ length: 12 })
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    role: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return {
      appIdIdx: index("appId_idx").on(table.appId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
      userIdIdx: index("userId_idx").on(table.userId),
      userTeamAppRoleId: primaryKey({
        columns: [table.id],
        name: "userTeamAppRole_id",
      }),
      uniqueUserIdTeamIdAppIdRole: unique("unique_userId_teamId_appId_role").on(
        table.userId,
        table.teamId,
        table.appId,
        table.role,
      ),
    };
  },
);
