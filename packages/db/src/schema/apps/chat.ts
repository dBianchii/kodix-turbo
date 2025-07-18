import { relations } from "drizzle-orm";
import { index, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";

import { NANOID_SIZE, MODEL_ID_SIZE } from "../../nanoid";
import { teams } from "../teams";
import { users } from "../users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "../utils";
import { aiAgent, aiModel } from "./ai-studio";

// Tipo para histórico de agentes
export interface AgentHistoryEntry {
  agentId: string;
  agentName: string;
  switchedAt: string;
  messageCount: number;
}

// Chat Folder - Pastas para organizar sessões de chat
export const chatFolder = mysqlTable(
  "chat_folder",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    createdById: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    name: t.varchar({ length: 100 }).notNull(),
    aiAgentId: t.varchar({ length: NANOID_SIZE }).references(() => aiAgent.id),
    aiModelId: t.varchar({ length: MODEL_ID_SIZE }).references(() => aiModel.modelId),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    teamIdx: index("chat_folder_team_idx").on(table.teamId),
    createdByIdx: index("chat_folder_created_by_idx").on(table.createdById),
    aiAgentIdx: index("chat_folder_ai_agent_idx").on(table.aiAgentId),
    aiModelIdx: index("chat_folder_ai_model_idx").on(table.aiModelId),
    nameIdx: index("chat_folder_name_idx").on(table.name),
    createdAtIdx: index("chat_folder_created_at_idx").on(table.createdAt),
  }),
);

// Chat Session - Sessões de conversa
export const chatSession = mysqlTable(
  "chat_session",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    userId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    chatFolderId: t
      .varchar({ length: NANOID_SIZE })
      .references(() => chatFolder.id),
    aiAgentId: t.varchar({ length: NANOID_SIZE }).references(() => aiAgent.id),
    aiModelId: t
      .varchar({ length: MODEL_ID_SIZE })
      .notNull()
      .references(() => aiModel.modelId),
    title: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
    activeAgentId: t.varchar({ length: NANOID_SIZE }),
    agentHistory: t.json().$type<AgentHistoryEntry[]>(),
  }),
  (table) => ({
    teamIdx: index("chat_session_team_idx").on(table.teamId),
    userIdx: index("chat_session_user_idx").on(table.userId),
    chatFolderIdx: index("chat_session_folder_idx").on(table.chatFolderId),
    aiAgentIdx: index("chat_session_ai_agent_idx").on(table.aiAgentId),
    aiModelIdx: index("chat_session_ai_model_idx").on(table.aiModelId),
    titleIdx: index("chat_session_title_idx").on(table.title),
    createdAtIdx: index("chat_session_created_at_idx").on(table.createdAt),
    activeAgentIdx: index("chat_session_active_agent_idx").on(
      table.activeAgentId,
    ),
  }),
);

// Chat Message - Mensagens das conversas
export const chatMessage = mysqlTable(
  "chat_message",
  (t) => ({
    id: nanoidPrimaryKey(t),
    chatSessionId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => chatSession.id, { onDelete: "cascade" }),
    senderRole: t.varchar({ length: 50 }).notNull(), // 'user', 'ai', 'human_operator'
    content: t.text().notNull(),
    metadata: t.json(),
    status: t.varchar({ length: 50 }).notNull(), // 'ok', 'error', etc.
    createdAt: t.timestamp().defaultNow().notNull(),
  }),
  (table) => ({
    chatSessionIdx: index("chat_message_session_idx").on(table.chatSessionId),
    senderRoleIdx: index("chat_message_sender_role_idx").on(table.senderRole),
    statusIdx: index("chat_message_status_idx").on(table.status),
    createdAtIdx: index("chat_message_created_at_idx").on(table.createdAt),
  }),
);

// Relacionamentos para Chat App
export const chatFolderRelations = relations(chatFolder, ({ one, many }) => ({
  team: one(teams, {
    fields: [chatFolder.teamId],
    references: [teams.id],
  }),
  createdBy: one(users, {
    fields: [chatFolder.createdById],
    references: [users.id],
  }),
  aiAgent: one(aiAgent, {
    fields: [chatFolder.aiAgentId],
    references: [aiAgent.id],
  }),
  aiModel: one(aiModel, {
    fields: [chatFolder.aiModelId],
    references: [aiModel.modelId],
  }),
  sessions: many(chatSession),
}));

export const chatSessionRelations = relations(chatSession, ({ one, many }) => ({
  team: one(teams, {
    fields: [chatSession.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [chatSession.userId],
    references: [users.id],
  }),
  chatFolder: one(chatFolder, {
    fields: [chatSession.chatFolderId],
    references: [chatFolder.id],
  }),
  aiAgent: one(aiAgent, {
    fields: [chatSession.aiAgentId],
    references: [aiAgent.id],
  }),
  aiModel: one(aiModel, {
    fields: [chatSession.aiModelId],
    references: [aiModel.modelId],
  }),
  messages: many(chatMessage),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
  chatSession: one(chatSession, {
    fields: [chatMessage.chatSessionId],
    references: [chatSession.id],
  }),
}));
