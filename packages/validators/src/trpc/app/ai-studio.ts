import { z } from "zod";

// AI Provider schemas
export const criarAiProviderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  baseUrl: z.string().url("URL base deve ser válida").optional(),
  apiKeyTemplate: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().default(true),
});

export const atualizarAiProviderSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  baseUrl: z.string().url("URL base deve ser válida").optional(),
  apiKeyTemplate: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().optional(),
});

export const buscarAiProvidersSchema = z.object({
  enabled: z.boolean().optional(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// AI Model schemas
export const criarAiModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  providerId: z.string(),
  config: z.any().optional(),
  enabled: z.boolean().default(true),
});

export const atualizarAiModelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  providerId: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().optional(),
});

export const buscarAiModelsSchema = z.object({
  providerId: z.string().optional(),
  enabled: z.boolean().optional(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// AI Team Provider Token schemas (novos)
export const criarAiTeamProviderTokenSchema = z.object({
  providerId: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});

export const atualizarAiTeamProviderTokenSchema = z.object({
  id: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});

export const buscarTokenPorProviderSchema = z.object({
  providerId: z.string(),
});

export const removerTokenPorProviderSchema = z.object({
  providerId: z.string(),
});

// AI Team Model Config schemas (novos)
export const criarAiTeamModelConfigSchema = z.object({
  modelId: z.string(),
  enabled: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  priority: z.number().default(0),
  config: z.any().optional(),
});

export const atualizarAiTeamModelConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  priority: z.number().min(0).max(999).optional(),
  config: z.any().optional(),
});

export const toggleModelSchema = z.object({
  modelId: z.string(),
  enabled: z.boolean(),
});

export const setDefaultModelSchema = z.object({
  modelId: z.string(),
});

export const setModelPrioritySchema = z.object({
  modelId: z.string(),
  priority: z.number().min(0).max(999),
});

export const reorderModelsPrioritySchema = z.object({
  orderedModelIds: z.array(z.string()).min(1),
});

export const buscarTeamModelConfigSchema = z.object({
  enabled: z.boolean().optional(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const teamModelIdSchema = z.object({
  teamId: z.string(),
  modelId: z.string(),
});

// AI Library schemas
export const criarAiLibrarySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  files: z.any().optional(),
});

export const atualizarAiLibrarySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  files: z.any().optional(),
});

export const buscarAiLibrariesSchema = z.object({
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// AI Agent schemas
export const criarAiAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  instructions: z.string().min(1, "Instruções são obrigatórias"),
  libraryId: z.string().optional(),
});

export const atualizarAiAgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  instructions: z.string().min(1, "Instruções são obrigatórias").optional(),
  libraryId: z.string().optional(),
});

export const buscarAiAgentsSchema = z.object({
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Schema de ID genérico
export const idSchema = z.object({
  id: z.string(),
});

// Types
export type CriarAiModelInput = z.infer<typeof criarAiModelSchema>;
export type AtualizarAiModelInput = z.infer<typeof atualizarAiModelSchema>;
export type BuscarAiModelsInput = z.infer<typeof buscarAiModelsSchema>;

export type CriarAiProviderInput = z.infer<typeof criarAiProviderSchema>;
export type AtualizarAiProviderInput = z.infer<
  typeof atualizarAiProviderSchema
>;
export type BuscarAiProvidersInput = z.infer<typeof buscarAiProvidersSchema>;

export type CriarAiTeamProviderTokenInput = z.infer<
  typeof criarAiTeamProviderTokenSchema
>;
export type AtualizarAiTeamProviderTokenInput = z.infer<
  typeof atualizarAiTeamProviderTokenSchema
>;
export type BuscarTokenPorProviderInput = z.infer<
  typeof buscarTokenPorProviderSchema
>;
export type RemoverTokenPorProviderInput = z.infer<
  typeof removerTokenPorProviderSchema
>;

export type CriarAiTeamModelConfigInput = z.infer<
  typeof criarAiTeamModelConfigSchema
>;
export type AtualizarAiTeamModelConfigInput = z.infer<
  typeof atualizarAiTeamModelConfigSchema
>;
export type ToggleModelInput = z.infer<typeof toggleModelSchema>;
export type SetDefaultModelInput = z.infer<typeof setDefaultModelSchema>;
export type SetModelPriorityInput = z.infer<typeof setModelPrioritySchema>;
export type ReorderModelsPriorityInput = z.infer<
  typeof reorderModelsPrioritySchema
>;
export type BuscarTeamModelConfigInput = z.infer<
  typeof buscarTeamModelConfigSchema
>;
export type TeamModelIdInput = z.infer<typeof teamModelIdSchema>;

export type CriarAiLibraryInput = z.infer<typeof criarAiLibrarySchema>;
export type AtualizarAiLibraryInput = z.infer<typeof atualizarAiLibrarySchema>;
export type BuscarAiLibrariesInput = z.infer<typeof buscarAiLibrariesSchema>;

export type CriarAiAgentInput = z.infer<typeof criarAiAgentSchema>;
export type AtualizarAiAgentInput = z.infer<typeof atualizarAiAgentSchema>;
export type BuscarAiAgentsInput = z.infer<typeof buscarAiAgentsSchema>;

export type IdInput = z.infer<typeof idSchema>;

// Novo schema para habilitar modelos globalmente por provedor
export const enableProviderModelsSchema = z.object({
  providerId: z.string(),
  enabled: z.boolean().default(true),
});

// Schema para habilitar/desabilitar modelo global individual
export const toggleGlobalModelSchema = z.object({
  modelId: z.string(),
  enabled: z.boolean(),
});

// Schema para testar modelo
export const testModelSchema = z.object({
  modelId: z.string(),
  testPrompt: z
    .string()
    .min(1)
    .default("Olá! Você está funcionando corretamente?"),
});

export type TestModelInput = z.infer<typeof testModelSchema>;
