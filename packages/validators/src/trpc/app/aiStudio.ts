import { z } from "zod";

// AI Model schemas
export const criarAiModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  provider: z.string().min(1, "Provider é obrigatório").max(50),
  config: z.record(z.unknown()).optional(),
  enabled: z.boolean().default(true),
});

export const atualizarAiModelSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  provider: z.string().min(1).max(50).optional(),
  config: z.record(z.unknown()).optional(),
  enabled: z.boolean().optional(),
});

// AI Library schemas
export const criarAiLibrarySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  files: z.record(z.unknown()).optional(),
});

export const atualizarAiLibrarySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255).optional(),
  files: z.record(z.unknown()).optional(),
});

// AI Agent schemas
export const criarAiAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  instructions: z.string().min(1, "Instruções são obrigatórias"), // Obrigatório
  libraryId: z.string().optional(),
});

export const atualizarAiAgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  instructions: z.string().min(1).optional(),
  libraryId: z.string().optional(),
});

// AI Model Token schemas
export const criarAiModelTokenSchema = z.object({
  modelId: z.string(),
  token: z.string().min(1, "Token é obrigatório"),
});

export const atualizarAiModelTokenSchema = z.object({
  id: z.string(),
  token: z.string().min(1).optional(),
});

// Common schemas
export const buscarPorIdSchema = z.object({
  id: z.string(),
});

export const buscarPorTeamSchema = z.object({
  limite: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  busca: z.string().optional(),
  ordenarPor: z.enum(["name", "createdAt"]).default("createdAt"),
  ordem: z.enum(["asc", "desc"]).default("desc"),
});

// Tipos inferidos
export type CriarAiModelInput = z.infer<typeof criarAiModelSchema>;
export type AtualizarAiModelInput = z.infer<typeof atualizarAiModelSchema>;
export type CriarAiLibraryInput = z.infer<typeof criarAiLibrarySchema>;
export type AtualizarAiLibraryInput = z.infer<typeof atualizarAiLibrarySchema>;
export type CriarAiAgentInput = z.infer<typeof criarAiAgentSchema>;
export type AtualizarAiAgentInput = z.infer<typeof atualizarAiAgentSchema>;
export type CriarAiModelTokenInput = z.infer<typeof criarAiModelTokenSchema>;
export type AtualizarAiModelTokenInput = z.infer<
  typeof atualizarAiModelTokenSchema
>;
export type BuscarPorTeamInput = z.infer<typeof buscarPorTeamSchema>;
