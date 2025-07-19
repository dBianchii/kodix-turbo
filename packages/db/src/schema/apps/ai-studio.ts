import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { NANOID_SIZE, MODEL_ID_SIZE } from "../../nanoid";
import { teams } from "../teams";
import { users } from "../users";
import {
  DEFAULTLENGTH,
  modelIdPrimaryKey,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
  aiModelIdPrimaryKey,
} from "../utils";

// AI Provider - Provedores de IA (OpenAI, Anthropic, etc.)
export const aiProvider = mysqlTable(
  "ai_provider",
  (t) => ({
    providerId: nanoidPrimaryKey(t), // Renamed from 'id'
    name: t.varchar({ length: 100 }).notNull(),
    baseUrl: t.text(),
    // createdAt: REMOVED COMPLETELY
  }),
  (table) => ({
    nameIdx: index("ai_provider_name_idx").on(table.name),
    // createdAtIdx: REMOVED - no longer needed
  }),
);

// AI Model - Modelos de IA disponíveis no sistema
export const aiModel = mysqlTable(
  "ai_model",
  (t) => ({
    modelId: aiModelIdPrimaryKey(t), // Renamed from 'id'
    // universalModelId: REMOVED COMPLETELY
    providerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull(),
      // .references(() => aiProvider.id), // FK removed
    status: mysqlEnum("status", ["active", "archived"])
      .default("active")
      .notNull(),
    config: t.text(),
    originalConfig: t.text("original_config"),
    enabled: t.boolean().default(true).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    // displayNameIdx: index("ai_model_display_name_idx").on(table.displayName), // REMOVED: displayName deprecated
    // universalModelIdIdx: REMOVED - no longer needed
    providerIdx: index("ai_model_provider_idx").on(table.providerId),
    statusIdx: index("ai_model_status_idx").on(table.status),
    enabledIdx: index("ai_model_enabled_idx").on(table.enabled),
    createdAtIdx: index("ai_model_created_at_idx").on(table.createdAt),
  }),
);

// AI Library - Biblioteca de arquivos por team
export const aiLibrary = mysqlTable(
  "ai_library",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    name: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    files: t.json(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    teamIdx: index("ai_library_team_idx").on(table.teamId),
    nameIdx: index("ai_library_name_idx").on(table.name),
    createdAtIdx: index("ai_library_created_at_idx").on(table.createdAt),
  }),
);

// AI Agent - Agentes inteligentes configuráveis
export const aiAgent = mysqlTable(
  "ai_agent",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    createdById: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    name: t.varchar({ length: 100 }).notNull(),
    instructions: t.text().notNull(), // Campo obrigatório conforme o plano
    libraryId: t
      .varchar({ length: NANOID_SIZE })
      .references(() => aiLibrary.id),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    teamIdx: index("ai_agent_team_idx").on(table.teamId),
    createdByIdx: index("ai_agent_created_by_idx").on(table.createdById),
    nameIdx: index("ai_agent_name_idx").on(table.name),
    libraryIdx: index("ai_agent_library_idx").on(table.libraryId),
    createdAtIdx: index("ai_agent_created_at_idx").on(table.createdAt),
  }),
);

// AI Team Provider Token - Tokens de acesso por team e provider
export const aiTeamProviderToken = mysqlTable(
  "ai_team_provider_token",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    providerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull(),
      // .references(() => aiProvider.id), // FK removed
    token: t.text().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    teamIdx: index("ai_team_provider_token_team_idx").on(table.teamId),
    providerIdx: index("ai_team_provider_token_provider_idx").on(
      table.providerId,
    ),
    createdAtIdx: index("ai_team_provider_token_created_at_idx").on(
      table.createdAt,
    ),
    // Constraint única para evitar múltiplos tokens por team/provider
    uniqueTeamProvider: unique(
      "ai_team_provider_token_team_provider_unique",
    ).on(table.teamId, table.providerId),
  }),
);

// AI Team Model Config - Configurações de modelos por team
export const aiTeamModelConfig = mysqlTable(
  "ai_team_model_config",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    aiModelId: t
      .varchar({ length: MODEL_ID_SIZE })
      .notNull(),
      // .references(() => aiModel.modelId, { onDelete: "cascade" }), // FK removed
    enabled: t.boolean().default(false).notNull(),
    isDefault: t.boolean().default(false).notNull(),
    priority: t.int().default(0),
    config: t.json(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    teamIdx: index("ai_team_model_config_team_idx").on(table.teamId),
    aiModelIdx: index("ai_team_model_config_ai_model_idx").on(table.aiModelId),
    enabledIdx: index("ai_team_model_config_enabled_idx").on(table.enabled),
    isDefaultIdx: index("ai_team_model_config_is_default_idx").on(
      table.isDefault,
    ),
    priorityIdx: index("ai_team_model_config_priority_idx").on(table.priority),
    createdAtIdx: index("ai_team_model_config_created_at_idx").on(
      table.createdAt,
    ),
    // Constraint única para evitar duplicatas team/model
    uniqueTeamModel: unique("ai_team_model_config_team_model_unique").on(
      table.teamId,
      table.aiModelId,
    ),
  }),
);

// Relacionamentos para AI Studio
export const aiProviderRelations = relations(aiProvider, ({ many }) => ({
  models: many(aiModel),
  tokens: many(aiTeamProviderToken),
}));

export const aiModelRelations = relations(aiModel, ({ one, many }) => ({
  provider: one(aiProvider, {
    fields: [aiModel.providerId],
    references: [aiProvider.providerId], // Updated reference
  }),
  teamConfigs: many(aiTeamModelConfig),
}));

export const aiLibraryRelations = relations(aiLibrary, ({ one, many }) => ({
  team: one(teams, {
    fields: [aiLibrary.teamId],
    references: [teams.id],
  }),
  agents: many(aiAgent),
}));

export const aiAgentRelations = relations(aiAgent, ({ one }) => ({
  team: one(teams, {
    fields: [aiAgent.teamId],
    references: [teams.id],
  }),
  createdBy: one(users, {
    fields: [aiAgent.createdById],
    references: [users.id],
  }),
  library: one(aiLibrary, {
    fields: [aiAgent.libraryId],
    references: [aiLibrary.id],
  }),
}));

export const aiTeamProviderTokenRelations = relations(
  aiTeamProviderToken,
  ({ one }) => ({
    team: one(teams, {
      fields: [aiTeamProviderToken.teamId],
      references: [teams.id],
    }),
    provider: one(aiProvider, {
      fields: [aiTeamProviderToken.providerId],
      references: [aiProvider.providerId], // Updated reference
    }),
  }),
);

export const aiTeamModelConfigRelations = relations(
  aiTeamModelConfig,
  ({ one }) => ({
    team: one(teams, {
      fields: [aiTeamModelConfig.teamId],
      references: [teams.id],
    }),
    model: one(aiModel, {
      fields: [aiTeamModelConfig.aiModelId],
      references: [aiModel.modelId],
    }),
  }),
);
