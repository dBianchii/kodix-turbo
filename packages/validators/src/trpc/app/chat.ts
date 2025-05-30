import { z } from "zod";

// Chat Folder schemas
export const criarChatFolderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  aiAgentId: z.string().optional(),
  aiModelId: z.string().optional(),
});

export const atualizarChatFolderSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  aiAgentId: z.string().optional(),
  aiModelId: z.string().optional(),
});

export const buscarChatFoldersSchema = z.object({
  busca: z.string().optional(),
  createdById: z.string().optional(),
  limite: z.number().min(1).max(100).default(20),
  pagina: z.number().min(1).default(1),
  ordenarPor: z.enum(["name", "createdAt"]).default("createdAt"),
  ordem: z.enum(["asc", "desc"]).default("desc"),
});

// Chat Session schemas
export const criarChatSessionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255),
  chatFolderId: z.string().optional(),
  aiAgentId: z.string().optional(),
  aiModelId: z.string(), // Obrigatório conforme plano
});

export const atualizarChatSessionSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  aiAgentId: z.string().optional(),
  aiModelId: z.string().optional(),
});

export const buscarChatSessionsSchema = z.object({
  userId: z.string().optional(),
  chatFolderId: z.string().optional(),
  busca: z.string().optional(),
  limite: z.number().min(1).max(100).default(20),
  pagina: z.number().min(1).default(1),
  ordenarPor: z.enum(["title", "createdAt", "updatedAt"]).default("updatedAt"),
  ordem: z.enum(["asc", "desc"]).default("desc"),
});

// Chat Message schemas
export const criarChatMessageSchema = z.object({
  chatSessionId: z.string(),
  senderRole: z.enum(["user", "ai", "human_operator"]),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  metadata: z.record(z.unknown()).optional(),
  status: z.enum(["ok", "error", "pending"]).default("ok"),
});

export const atualizarChatMessageSchema = z.object({
  id: z.string(),
  content: z.string().min(1).optional(),
  status: z.enum(["ok", "error", "processing"]).optional(),
  metadata: z.any().optional(),
});

export const buscarChatMessagesSchema = z.object({
  chatSessionId: z.string().min(1, "ID da sessão é obrigatório"),
  limite: z.number().min(1).max(100).default(50),
  pagina: z.number().min(1).default(1),
  ordem: z.enum(["asc", "desc"]).default("asc"),
});

// Schemas para ações especiais
export const enviarMensagemSchema = z.object({
  chatSessionId: z.string().min(1, "ID da sessão é obrigatório"),
  content: z.string().min(1, "Conteúdo da mensagem é obrigatório"),
  useAgent: z.boolean().default(true),
});

export const iniciarNovaConversa = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255),
  aiModelId: z.string().min(1, "Modelo de IA é obrigatório"),
  chatFolderId: z.string().optional(),
  aiAgentId: z.string().optional(),
  primeiraMessage: z.string().min(1, "Primeira mensagem é obrigatória"),
});

export const duplicarSessaoSchema = z.object({
  sessionId: z.string().min(1, "ID da sessão é obrigatório"),
  novoTitulo: z.string().min(1).max(255).optional(),
  incluirHistorico: z.boolean().default(false),
});

// Common schemas
export const idSchema = z.object({
  id: z.string(),
});

export const sessionIdSchema = z.object({
  sessionId: z.string(),
});

export const buscarPorTeamSchema = z.object({
  limite: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  busca: z.string().optional(),
  ordenarPor: z.enum(["name", "title", "createdAt"]).default("createdAt"),
  ordem: z.enum(["asc", "desc"]).default("desc"),
});

export const buscarMensagensSchema = z.object({
  chatSessionId: z.string(),
  limite: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Exportar tipos inferidos
export type CriarChatFolderInput = z.infer<typeof criarChatFolderSchema>;
export type AtualizarChatFolderInput = z.infer<
  typeof atualizarChatFolderSchema
>;
export type BuscarChatFoldersInput = z.infer<typeof buscarChatFoldersSchema>;

export type CriarChatSessionInput = z.infer<typeof criarChatSessionSchema>;
export type AtualizarChatSessionInput = z.infer<
  typeof atualizarChatSessionSchema
>;
export type BuscarChatSessionsInput = z.infer<typeof buscarChatSessionsSchema>;

export type CriarChatMessageInput = z.infer<typeof criarChatMessageSchema>;
export type AtualizarChatMessageInput = z.infer<
  typeof atualizarChatMessageSchema
>;
export type BuscarChatMessagesInput = z.infer<typeof buscarChatMessagesSchema>;

export type EnviarMensagemInput = z.infer<typeof enviarMensagemSchema>;
export type IniciarNovaConversaInput = z.infer<typeof iniciarNovaConversa>;
export type DuplicarSessaoInput = z.infer<typeof duplicarSessaoSchema>;

export type BuscarPorTeamInput = z.infer<typeof buscarPorTeamSchema>;
export type BuscarMensagensInput = z.infer<typeof buscarMensagensSchema>;
