import { z } from "zod";

// AI Model schemas
export const criarAiModelSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  provider: z
    .string()
    .min(2, "Provider deve ter pelo menos 2 caracteres")
    .max(50, "Provider muito longo"),
  config: z.any().optional(),
  enabled: z.boolean().default(true),
});

export const atualizarAiModelSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  provider: z.string().min(2).max(50).optional(),
  config: z.any().optional(),
  enabled: z.boolean().optional(),
});

export const buscarAiModelsSchema = z.object({
  enabled: z.boolean().optional(),
  provider: z.string().optional(),
  limite: z.number().min(1).max(100).default(50),
  pagina: z.number().min(1).default(1),
});

// AI Library schemas
export const criarAiLibrarySchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(255, "Nome muito longo"),
  files: z.any().optional(),
});

export const atualizarAiLibrarySchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(255).optional(),
  files: z.any().optional(),
});

export const buscarAiLibrariesSchema = z.object({
  busca: z.string().optional(),
  limite: z.number().min(1).max(100).default(20),
  pagina: z.number().min(1).default(1),
});

// AI Agent schemas
export const criarAiAgentSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  instructions: z
    .string()
    .min(1, "Instruções são obrigatórias")
    .max(10000, "Instruções muito longas"),
  libraryId: z.string().optional(),
});

export const atualizarAiAgentSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  instructions: z.string().max(10000).optional(),
  libraryId: z.string().optional(),
});

export const buscarAiAgentsSchema = z.object({
  busca: z.string().optional(),
  createdById: z.string().optional(),
  limite: z.number().min(1).max(100).default(20),
  pagina: z.number().min(1).default(1),
  ordenarPor: z.enum(["name", "createdAt"]).default("createdAt"),
  ordem: z.enum(["asc", "desc"]).default("desc"),
});

// AI Model Token schemas
export const criarAiModelTokenSchema = z.object({
  modelId: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});

export const atualizarAiModelTokenSchema = z.object({
  id: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});

export const buscarTokenPorModeloSchema = z.object({
  modelId: z.string(),
});

export const removerTokenPorModeloSchema = z.object({
  modelId: z.string(),
});

// Common schemas
export const idSchema = z.object({
  id: z.string(),
});

// Exportar tipos inferidos
export type CriarAiModelInput = z.infer<typeof criarAiModelSchema>;
export type AtualizarAiModelInput = z.infer<typeof atualizarAiModelSchema>;
export type BuscarAiModelsInput = z.infer<typeof buscarAiModelsSchema>;

export type CriarAiLibraryInput = z.infer<typeof criarAiLibrarySchema>;
export type AtualizarAiLibraryInput = z.infer<typeof atualizarAiLibrarySchema>;
export type BuscarAiLibrariesInput = z.infer<typeof buscarAiLibrariesSchema>;

export type CriarAiAgentInput = z.infer<typeof criarAiAgentSchema>;
export type AtualizarAiAgentInput = z.infer<typeof atualizarAiAgentSchema>;
export type BuscarAiAgentsInput = z.infer<typeof buscarAiAgentsSchema>;

export type CriarAiModelTokenInput = z.infer<typeof criarAiModelTokenSchema>;
export type AtualizarAiModelTokenInput = z.infer<
  typeof atualizarAiModelTokenSchema
>;
