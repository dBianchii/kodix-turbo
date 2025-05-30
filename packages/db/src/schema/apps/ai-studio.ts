import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "../../nanoid";
import { teams } from "../teams";
import { users } from "../users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "../utils";

// AI Model - Modelos de IA disponíveis no sistema
export const aiModel = mysqlTable(
  "ai_model",
  (t) => ({
    id: nanoidPrimaryKey(t),
    name: t.varchar({ length: 100 }).notNull(),
    provider: t.varchar({ length: 50 }).notNull(),
    config: t.json(),
    enabled: t.boolean().default(true).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    nameIdx: index("ai_model_name_idx").on(table.name),
    providerIdx: index("ai_model_provider_idx").on(table.provider),
    enabledIdx: index("ai_model_enabled_idx").on(table.enabled),
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

// AI Model Token - Tokens de acesso por team e modelo
export const aiModelToken = mysqlTable(
  "ai_model_token",
  (t) => ({
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    modelId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => aiModel.id),
    token: t.text().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    teamIdx: index("ai_model_token_team_idx").on(table.teamId),
    modelIdx: index("ai_model_token_model_idx").on(table.modelId),
    createdAtIdx: index("ai_model_token_created_at_idx").on(table.createdAt),
    // Índice único para evitar duplicatas
    uniqueTeamModel: index("ai_model_token_unique_team_model").on(
      table.teamId,
      table.modelId,
    ),
  }),
);

// Relacionamentos para AI Studio
export const aiModelRelations = relations(aiModel, ({ many }) => ({
  tokens: many(aiModelToken),
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

export const aiModelTokenRelations = relations(aiModelToken, ({ one }) => ({
  team: one(teams, {
    fields: [aiModelToken.teamId],
    references: [teams.id],
  }),
  model: one(aiModel, {
    fields: [aiModelToken.modelId],
    references: [aiModel.id],
  }),
}));
