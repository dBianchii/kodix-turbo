import { z } from "zod";

// AI Provider schemas
export const createAiProviderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  baseUrl: z.string().url("URL base deve ser válida").optional(),
  apiKeyTemplate: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().default(true),
});
export type CreateAiProviderInput = z.infer<typeof createAiProviderSchema>;

export const updateAiProviderSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  baseUrl: z.string().url("URL base deve ser válida").optional(),
  apiKeyTemplate: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().optional(),
});
export type UpdateAiProviderInput = z.infer<typeof updateAiProviderSchema>;

export const findAiProvidersSchema = z.object({
  enabled: z.boolean().optional(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export type FindAiProvidersInput = z.infer<typeof findAiProvidersSchema>;

// AI Model schemas
export const createAiModelSchema = z.object({
  displayName: z.string().min(1, "Nome é obrigatório"),
  providerId: z.string(),
  config: z.any().optional(),
  enabled: z.boolean().default(true),
});
export type CreateAiModelInput = z.infer<typeof createAiModelSchema>;

export const updateAiModelSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1, "Nome é obrigatório").optional(),
  providerId: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().optional(),
});
export type UpdateAiModelInput = z.infer<typeof updateAiModelSchema>;

export const findAiModelsSchema = z.object({
  providerId: z.string().optional(),
  enabled: z.boolean().optional(),
  status: z.enum(["active", "archived"]).optional(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export type FindAiModelsInput = z.infer<typeof findAiModelsSchema>;

// AI Team Provider Token schemas
export const createAiTeamProviderTokenSchema = z.object({
  providerId: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});
export type CreateAiTeamProviderTokenInput = z.infer<
  typeof createAiTeamProviderTokenSchema
>;

export const updateAiTeamProviderTokenSchema = z.object({
  id: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});
export type UpdateAiTeamProviderTokenInput = z.infer<
  typeof updateAiTeamProviderTokenSchema
>;

export const findTokenByProviderSchema = z.object({
  providerId: z.string(),
});
export type FindTokenByProviderInput = z.infer<
  typeof findTokenByProviderSchema
>;

export const removeTokenByProviderSchema = z.object({
  providerId: z.string(),
});
export type RemoveTokenByProviderInput = z.infer<
  typeof removeTokenByProviderSchema
>;

// AI Team Model Config schemas
export const createAiTeamModelConfigSchema = z.object({
  modelId: z.string(),
  enabled: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  priority: z.number().default(0),
  config: z.any().optional(),
});
export type CreateAiTeamModelConfigInput = z.infer<
  typeof createAiTeamModelConfigSchema
>;

export const updateAiTeamModelConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  priority: z.number().min(0).max(999).optional(),
  config: z.any().optional(),
});
export type UpdateAiTeamModelConfigInput = z.infer<
  typeof updateAiTeamModelConfigSchema
>;

export const toggleModelSchema = z.object({
  modelId: z.string(),
  enabled: z.boolean(),
});
export type ToggleModelInput = z.infer<typeof toggleModelSchema>;

export const setDefaultModelSchema = z.object({
  modelId: z.string(),
});
export type SetDefaultModelInput = z.infer<typeof setDefaultModelSchema>;

export const setModelPrioritySchema = z.object({
  modelId: z.string(),
  priority: z.number().min(0).max(999),
});
export type SetModelPriorityInput = z.infer<typeof setModelPrioritySchema>;

export const reorderModelsPrioritySchema = z.object({
  orderedModelIds: z.array(z.string()).min(1),
});
export type ReorderModelsPriorityInput = z.infer<
  typeof reorderModelsPrioritySchema
>;

export const findTeamModelConfigSchema = z.object({
  enabled: z.boolean().optional(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export type FindTeamModelConfigInput = z.infer<
  typeof findTeamModelConfigSchema
>;

export const teamModelIdSchema = z.object({
  teamId: z.string(),
  modelId: z.string(),
});
export type TeamModelIdInput = z.infer<typeof teamModelIdSchema>;

// AI Library schemas
export const createAiLibrarySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  files: z.any().optional(),
});
export type CreateAiLibraryInput = z.infer<typeof createAiLibrarySchema>;

export const updateAiLibrarySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  files: z.any().optional(),
});
export type UpdateAiLibraryInput = z.infer<typeof updateAiLibrarySchema>;

export const findAiLibrariesSchema = z.object({
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export type FindAiLibrariesInput = z.infer<typeof findAiLibrariesSchema>;

// AI Agent schemas
export const createAiAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  instructions: z.string().min(1, "Instruções são obrigatórias"),
  libraryId: z.string().optional(),
});
export type CreateAiAgentInput = z.infer<typeof createAiAgentSchema>;

export const updateAiAgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  instructions: z.string().min(1, "Instruções são obrigatórias").optional(),
  libraryId: z.string().optional(),
});
export type UpdateAiAgentInput = z.infer<typeof updateAiAgentSchema>;

export const findAiAgentsSchema = z.object({
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export type FindAiAgentsInput = z.infer<typeof findAiAgentsSchema>;

// Schema de ID genérico
export const idSchema = z.object({
  id: z.string(),
});
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
