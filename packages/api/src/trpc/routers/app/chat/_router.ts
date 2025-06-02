import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { appRepository, chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";
import {
  atualizarChatFolderSchema,
  atualizarChatMessageSchema,
  atualizarChatSessionSchema,
  autoCreateSessionWithMessageSchema,
  buscarChatFoldersSchema,
  buscarChatMessagesSchema,
  buscarChatSessionsSchema,
  criarChatFolderSchema,
  criarChatMessageSchema,
  criarChatSessionSchema,
  duplicarSessaoSchema,
  enviarMensagemSchema,
  chatIdSchema as idSchema,
  iniciarNovaConversa as iniciarNovaConversaSchema,
  sessionIdSchema,
} from "@kdx/validators/trpc/app";

import { chatWithDependenciesMiddleware } from "../../../middlewares";
import { protectedProcedure } from "../../../procedures";

// ⚠️ PROCEDURE PROTEGIDO COM DEPENDÊNCIAS
// Use este procedure para operações que precisam do AI Studio
const chatProtectedProcedure = protectedProcedure.use(
  chatWithDependenciesMiddleware,
);

// Helper para fazer chamadas HTTP para o AI Studio
async function callAiStudioEndpoint(
  action: string,
  userId: string,
  teamId: string,
  params?: Record<string, string>,
  headers?: Record<string, string>,
): Promise<any> {
  const baseUrl = process.env.KODIX_API_URL || "http://localhost:3000";

  // Construir URL com parâmetros incluindo userId e teamId
  const searchParams = new URLSearchParams({
    action,
    userId,
    teamId,
    ...(params || {}),
  });
  const url = `${baseUrl}/api/ai-studio/chat-integration?${searchParams.toString()}`;

  console.log(
    `🔗 [CHAT_API] Calling AI Studio: ${action} | user: ${userId} | team: ${teamId}`,
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token":
        process.env.KODIX_INTERNAL_API_TOKEN || "dev-internal-token-123",
      ...headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `❌ [CHAT_API] AI Studio call failed: ${response.status} - ${errorText}`,
    );
    throw new Error(`AI Studio API Error: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as {
    success: boolean;
    data?: any;
    error?: string;
  };
  if (!result.success) {
    throw new Error(`AI Studio Error: ${result.error}`);
  }

  console.log(`✅ [CHAT_API] AI Studio response received for: ${action}`);
  return result.data;
}

// Helper para buscar modelo preferido seguindo hierarquia
async function getPreferredModelHelper(
  teamId: string,
  userId: string,
  token?: string | null,
): Promise<{
  source: "chat_config" | "ai_studio_default" | "first_available";
  modelId: string;
  model: any;
  config?: any;
  teamConfig?: any;
}> {
  // 1ª Prioridade: Verificar lastSelectedModelId no Chat Team Config
  try {
    const chatConfigs = await appRepository.findAppTeamConfigs({
      appId: chatAppId,
      teamIds: [teamId],
    });

    const chatConfig = chatConfigs.find((config) => config.teamId === teamId);
    const lastSelectedModelId = chatConfig
      ? (chatConfig.config as any)?.lastSelectedModelId
      : null;

    if (lastSelectedModelId) {
      console.log(
        "✅ [PREFERRED_MODEL] Encontrado lastSelectedModelId:",
        lastSelectedModelId,
      );

      try {
        const model = await callAiStudioEndpoint(
          "getModel",
          userId,
          teamId,
          { modelId: lastSelectedModelId },
          { Authorization: token || "" },
        );

        if (model) {
          console.log("✅ [PREFERRED_MODEL] Modelo encontrado:", model.name);
          return {
            source: "chat_config",
            modelId: model.id,
            model,
            config: chatConfig?.config,
          };
        }
      } catch (error) {
        console.log(
          "⚠️ [PREFERRED_MODEL] lastSelectedModelId inválido, continuando para próximo fallback",
        );
      }
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar chat config, continuando para AI Studio:",
      error,
    );
  }

  // 2ª Prioridade: Buscar modelo padrão no AI Studio VIA HTTP
  try {
    const defaultModelConfig = await callAiStudioEndpoint(
      "getDefaultModel",
      userId,
      teamId,
      undefined,
      { Authorization: token || "" },
    );

    if (defaultModelConfig?.model) {
      console.log(
        "✅ [PREFERRED_MODEL] Modelo padrão do AI Studio encontrado:",
        defaultModelConfig.model.name,
      );
      return {
        source: "ai_studio_default",
        modelId: defaultModelConfig.model.id,
        model: defaultModelConfig.model,
        teamConfig: defaultModelConfig,
      };
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar modelo padrão do AI Studio:",
      error,
    );
  }

  // 3ª Prioridade: Buscar primeiro modelo ativo disponível VIA HTTP
  try {
    const availableModels = await callAiStudioEndpoint(
      "getAvailableModels",
      userId,
      teamId,
      undefined,
      { Authorization: token || "" },
    );

    const firstActiveModel = (availableModels || []).find(
      (m: any) => m.teamConfig?.enabled,
    );

    if (firstActiveModel) {
      console.log(
        "🔄 [PREFERRED_MODEL] Usando primeiro modelo ativo como fallback:",
        firstActiveModel.name,
      );
      return {
        source: "first_available",
        modelId: firstActiveModel.id,
        model: firstActiveModel,
        teamConfig: firstActiveModel.teamConfig,
      };
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar modelos disponíveis:",
      error,
    );
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
  });
}

export const chatRouter: TRPCRouterRecord = {
  // ===============================
  // CHAT FOLDER ENDPOINTS
  // ===============================

  criarChatFolder: protectedProcedure
    .input(criarChatFolderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const folder = await chatRepository.ChatFolderRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
          createdById: ctx.auth.user.id,
        });
        return folder;
      } catch (error) {
        console.error("Erro ao criar pasta de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar pasta de chat",
          cause: error,
        });
      }
    }),

  atualizarChatFolder: protectedProcedure
    .input(atualizarChatFolderSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        const folderExistente =
          await chatRepository.ChatFolderRepository.findById(id);
        if (
          !folderExistente ||
          folderExistente.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pasta de chat não encontrada",
          });
        }

        const folder = await chatRepository.ChatFolderRepository.update(
          id,
          dadosAtualizacao,
        );
        return folder;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao atualizar pasta de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar pasta de chat",
          cause: error,
        });
      }
    }),

  buscarChatFolders: protectedProcedure
    .input(buscarChatFoldersSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limite, pagina, ...filtros } = input;
        const offset = (pagina - 1) * limite;

        const [folders, total] = await Promise.all([
          chatRepository.ChatFolderRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            ...filtros,
            limite,
            offset,
          }),
          chatRepository.ChatFolderRepository.countByTeam(
            ctx.auth.user.activeTeamId,
            filtros.busca,
            filtros.createdById,
          ),
        ]);

        return {
          folders,
          paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Erro ao buscar pastas de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar pastas de chat",
          cause: error,
        });
      }
    }),

  buscarChatFolderPorId: protectedProcedure
    .input(idSchema)
    .query(async ({ input, ctx }) => {
      try {
        const folder = await chatRepository.ChatFolderRepository.findById(
          input.id,
        );

        if (!folder || folder.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pasta de chat não encontrada",
          });
        }

        return folder;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar pasta de chat por ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar pasta de chat",
          cause: error,
        });
      }
    }),

  excluirChatFolder: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const folder = await chatRepository.ChatFolderRepository.findById(
          input.id,
        );
        if (!folder || folder.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pasta de chat não encontrada",
          });
        }

        await chatRepository.ChatFolderRepository.delete(input.id);
        return { sucesso: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao excluir pasta de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir pasta de chat",
          cause: error,
        });
      }
    }),

  // ===============================
  // CHAT SESSION ENDPOINTS
  // ===============================

  criarSession: protectedProcedure
    .input(criarChatSessionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await chatRepository.ChatSessionRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
          userId: ctx.auth.user.id,
        });

        return session;
      } catch (error) {
        console.error("Erro ao criar sessão de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar sessão de chat",
          cause: error,
        });
      }
    }),

  atualizarSession: protectedProcedure
    .input(atualizarChatSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        const sessionExistente =
          await chatRepository.ChatSessionRepository.findById(id);
        if (
          !sessionExistente ||
          sessionExistente.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        const session = await chatRepository.ChatSessionRepository.update(
          id,
          dadosAtualizacao,
        );
        return session;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao atualizar sessão de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar sessão de chat",
          cause: error,
        });
      }
    }),

  listarSessions: protectedProcedure
    .input(buscarChatSessionsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limite, pagina, ...filtros } = input;
        const offset = (pagina - 1) * limite;

        const [sessions, total] = await Promise.all([
          chatRepository.ChatSessionRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            ...filtros,
            limite,
            offset,
          }),
          chatRepository.ChatSessionRepository.countByTeam(
            ctx.auth.user.activeTeamId,
            filtros.userId,
            filtros.chatFolderId,
            filtros.busca,
          ),
        ]);

        return {
          sessions,
          paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Erro ao listar sessões de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar sessões de chat",
          cause: error,
        });
      }
    }),

  buscarSession: protectedProcedure
    .input(sessionIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        const session = await chatRepository.ChatSessionRepository.findById(
          input.sessionId,
        );

        if (!session) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        // Verificar se o usuário tem acesso (mesmo team)
        if (session.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        return session;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar sessão de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar sessão de chat",
          cause: error,
        });
      }
    }),

  excluirSession: protectedProcedure
    .input(sessionIdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await chatRepository.ChatSessionRepository.findById(
          input.sessionId,
        );
        if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        await chatRepository.ChatSessionRepository.delete(input.sessionId);
        return { sucesso: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao excluir sessão de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir sessão de chat",
          cause: error,
        });
      }
    }),

  // ===============================
  // CHAT MESSAGE ENDPOINTS
  // ===============================

  enviarMensagem: chatProtectedProcedure
    .input(enviarMensagemSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar se a sessão existe e pertence ao usuário/team
        const session = await chatRepository.ChatSessionRepository.findById(
          input.chatSessionId,
        );
        if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        // Criar mensagem do usuário
        const userMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: input.chatSessionId,
          senderRole: "user",
          content: input.content,
          status: "ok",
        });

        // Se useAgent for true, processar com IA
        if (input.useAgent) {
          try {
            // Buscar histórico de mensagens da sessão para contexto
            const messages =
              await chatRepository.ChatMessageRepository.findBySession({
                chatSessionId: input.chatSessionId,
                limite: 20,
                offset: 0,
                ordem: "asc",
              });

            // Incluir a nova mensagem do usuário no contexto
            const allMessages = [...messages, userMessage];

            // Formatar mensagens para o formato da OpenAI
            const formattedMessages: { role: string; content: string }[] = [];
            for (const msg of allMessages) {
              if (msg?.content) {
                formattedMessages.push({
                  role: msg.senderRole === "user" ? "user" : "assistant",
                  content: msg.content,
                });
              }
            }

            // Buscar modelo para obter o provider
            if (!session.aiModelId) {
              throw new Error("Sessão não possui modelo de IA configurado");
            }

            // 🔄 CHAMAR AI STUDIO VIA HTTP (respeitando isolamento)
            const model = await callAiStudioEndpoint(
              "getModel",
              ctx.auth.user.id,
              session.teamId,
              { modelId: session.aiModelId },
              { Authorization: ctx.token || "" },
            );

            if (!model?.providerId) {
              throw new Error("Modelo não possui provider configurado");
            }

            // Buscar token do provider via HTTP
            const providerToken = await callAiStudioEndpoint(
              "getProviderToken",
              ctx.auth.user.id,
              session.teamId,
              { providerId: model.providerId },
              { Authorization: ctx.token || "" },
            );

            if (!providerToken?.token) {
              throw new Error(
                `Token não configurado para o provider ${model.provider?.name || "provider"}`,
              );
            }

            // Configurar API baseada no provider
            const baseUrl =
              model.provider?.baseUrl || "https://api.openai.com/v1";
            const apiUrl = `${baseUrl}/chat/completions`;

            // Usar configurações do modelo
            const modelConfig = model.config || {};
            const modelName = modelConfig.version || model.name;
            const maxTokens = modelConfig.maxTokens || 500;
            const temperature = modelConfig.temperature || 0.7;

            console.log(
              `🟢 [TRPC] Usando modelo: ${modelName} (Provider: ${model.provider?.name})`,
            );

            if (!modelName) {
              throw new Error("Nome do modelo não configurado corretamente");
            }

            // Fazer chamada para OpenAI
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${providerToken.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: modelName,
                messages: formattedMessages,
                max_tokens: maxTokens,
                temperature: temperature,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `Erro na API do ${model.provider?.name || "provider"}: ${response.status} - ${errorText}`,
              );
            }

            const aiResponse = (await response.json()) as any;
            const aiContent =
              aiResponse.choices?.[0]?.message?.content ||
              "Desculpe, não consegui gerar uma resposta.";

            // Salvar resposta da IA
            const aiMessage = await chatRepository.ChatMessageRepository.create(
              {
                chatSessionId: input.chatSessionId,
                senderRole: "ai",
                content: aiContent,
                status: "ok",
              },
            );

            return {
              userMessage,
              aiMessage,
            };
          } catch (aiError) {
            console.error("Erro ao processar com IA:", aiError);

            // Salvar mensagem de erro da IA
            const errorMessage =
              await chatRepository.ChatMessageRepository.create({
                chatSessionId: input.chatSessionId,
                senderRole: "ai",
                content: `Erro: ${aiError instanceof Error ? aiError.message : "Erro ao processar mensagem"}`,
                status: "error",
              });

            return {
              userMessage,
              aiMessage: errorMessage,
            };
          }
        }

        return { userMessage };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao enviar mensagem:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar mensagem",
          cause: error,
        });
      }
    }),

  atualizarMensagem: protectedProcedure
    .input(atualizarChatMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        const messageExistente =
          await chatRepository.ChatMessageRepository.findById(id);
        if (
          !messageExistente ||
          messageExistente.chatSession.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mensagem não encontrada",
          });
        }

        const message = await chatRepository.ChatMessageRepository.update(
          id,
          dadosAtualizacao,
        );
        return message;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao atualizar mensagem:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar mensagem",
          cause: error,
        });
      }
    }),

  buscarMensagens: protectedProcedure
    .input(buscarChatMessagesSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Verificar se a sessão existe e pertence ao usuário/team
        const session = await chatRepository.ChatSessionRepository.findById(
          input.chatSessionId,
        );
        if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        const { limite, pagina, ...filtros } = input;
        const offset = (pagina - 1) * limite;

        const [messages, total] = await Promise.all([
          chatRepository.ChatMessageRepository.findBySession({
            chatSessionId: input.chatSessionId,
            limite,
            offset,
            ordem: filtros.ordem,
          }),
          chatRepository.ChatMessageRepository.countBySession(
            input.chatSessionId,
          ),
        ]);

        return {
          messages,
          paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar mensagens:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar mensagens",
          cause: error,
        });
      }
    }),

  excluirMensagem: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const message = await chatRepository.ChatMessageRepository.findById(
          input.id,
        );
        if (
          !message?.chatSession ||
          message.chatSession.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mensagem não encontrada",
          });
        }

        await chatRepository.ChatMessageRepository.delete(input.id);
        return { sucesso: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao excluir mensagem:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir mensagem",
          cause: error,
        });
      }
    }),

  // ===============================
  // SPECIAL CHAT OPERATIONS
  // ===============================

  iniciarNovaConversa: protectedProcedure
    .input(iniciarNovaConversaSchema)
    .mutation(async ({ input, ctx }) => {
      const { primeiraMessage, ...sessionData } = input;

      try {
        // Criar nova sessão
        const session = await chatRepository.ChatSessionRepository.create({
          ...sessionData,
          teamId: ctx.auth.user.activeTeamId,
          userId: ctx.auth.user.id,
        });

        if (!session?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar sessão de chat",
          });
        }

        // Criar primeira mensagem
        const firstMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: session.id,
          senderRole: "user",
          content: primeiraMessage,
          status: "ok",
        });

        return {
          session,
          firstMessage,
        };
      } catch (error) {
        console.error("Erro ao iniciar nova conversa:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao iniciar nova conversa",
          cause: error,
        });
      }
    }),

  duplicarSession: protectedProcedure
    .input(duplicarSessaoSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionOriginal =
          await chatRepository.ChatSessionRepository.findById(input.sessionId);
        if (
          !sessionOriginal ||
          sessionOriginal.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        // Criar nova sessão duplicada
        const novaTitulo =
          input.novoTitulo || `${sessionOriginal.title} (Cópia)`;
        const novaSession = await chatRepository.ChatSessionRepository.create({
          title: novaTitulo,
          aiModelId: sessionOriginal.aiModelId,
          chatFolderId: sessionOriginal.chatFolderId || undefined,
          aiAgentId: sessionOriginal.aiAgentId || undefined,
          teamId: ctx.auth.user.activeTeamId,
          userId: ctx.auth.user.id,
        });

        // TODO: Se incluirHistorico = true, copiar mensagens
        // if (input.incluirHistorico) {
        //   // Buscar e copiar mensagens da sessão original
        // }

        return novaSession;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao duplicar sessão:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao duplicar sessão",
          cause: error,
        });
      }
    }),

  /**
   * Busca o modelo preferido do team seguindo hierarquia de prioridade:
   * 1ª Prioridade: lastSelectedModelId do Chat Team Config
   * 2ª Prioridade: Modelo padrão do AI Studio (via HTTP)
   * 3ª Prioridade: Primeiro modelo ativo disponível (via HTTP)
   */
  getPreferredModel: chatProtectedProcedure.query(async ({ ctx }) => {
    const teamId = ctx.auth.user.activeTeamId;

    try {
      console.log(
        "🎯 [PREFERRED_MODEL] Buscando modelo preferido para team:",
        teamId,
      );

      // Chamar getPreferredModelHelper internamente
      const preferredModelResult = await getPreferredModelHelper(
        teamId,
        ctx.auth.user.id,
        ctx.token,
      );

      console.log(
        "🎉 [PREFERRED_MODEL] Modelo preferido encontrado:",
        preferredModelResult.model.name,
      );

      return preferredModelResult;
    } catch (error: any) {
      console.error("❌ [PREFERRED_MODEL] Erro:", error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Erro ao buscar modelo preferido",
      });
    }
  }),

  /**
   * Auto-cria uma sessão de chat com a primeira mensagem
   * Usa getPreferredModel para escolher o modelo
   * Gera título automaticamente baseado na primeira mensagem
   */
  autoCreateSessionWithMessage: chatProtectedProcedure
    .input(autoCreateSessionWithMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const teamId = ctx.auth.user.activeTeamId;
      const userId = ctx.auth.user.id;

      try {
        console.log(
          "🚀 [AUTO_CREATE] Iniciando auto-criação de sessão para team:",
          teamId,
        );

        // 1. Buscar modelo preferido
        let preferredModel;
        let aiModelId: string;

        try {
          // Chamar getPreferredModel internamente
          const preferredModelResult = await getPreferredModelHelper(
            teamId,
            userId,
            ctx.token,
          );

          preferredModel = preferredModelResult.model;
          aiModelId = preferredModelResult.modelId;

          console.log(
            "✅ [AUTO_CREATE] Modelo preferido encontrado:",
            preferredModel.name,
          );
        } catch (error) {
          console.error(
            "❌ [AUTO_CREATE] Erro ao buscar modelo preferido:",
            error,
          );
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
          });
        }

        // 2. Gerar título automaticamente (se habilitado)
        let title = "Nova Conversa";

        if (input.generateTitle) {
          try {
            console.log("🤖 [AUTO_CREATE] Gerando título automático...");

            // Buscar token do provider via HTTP
            const providerToken = await callAiStudioEndpoint(
              "getProviderToken",
              userId,
              teamId,
              { providerId: preferredModel.providerId },
              { Authorization: ctx.token || "" },
            );

            if (providerToken?.token) {
              // Configurar API baseada no provider
              const baseUrl =
                preferredModel.provider?.baseUrl || "https://api.openai.com/v1";
              const apiUrl = `${baseUrl}/chat/completions`;

              // Usar configurações do modelo
              const modelConfig = preferredModel.config || {};
              const modelName = modelConfig.version || preferredModel.name;

              // Prompt para gerar título
              const titlePrompt = [
                {
                  role: "system",
                  content:
                    "Você é um assistente especializado em criar títulos concisos. Crie um título curto (máximo 50 caracteres) que capture a essência da mensagem do usuário. Responda apenas com o título, sem aspas ou formatação adicional.",
                },
                {
                  role: "user",
                  content: `Crie um título para esta conversa: "${input.firstMessage}"`,
                },
              ];

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${providerToken.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: modelName,
                  messages: titlePrompt,
                  max_tokens: 20,
                  temperature: 0.7,
                }),
              });

              if (response.ok) {
                const aiResponse = (await response.json()) as any;
                const generatedTitle =
                  aiResponse.choices?.[0]?.message?.content?.trim();

                if (generatedTitle && generatedTitle.length <= 50) {
                  title = generatedTitle;
                  console.log("✅ [AUTO_CREATE] Título gerado:", title);
                }
              }
            }
          } catch (error) {
            console.log(
              "⚠️ [AUTO_CREATE] Erro ao gerar título, usando padrão:",
              error,
            );
            // Fallback: usar primeiros 50 caracteres da mensagem
            title = input.firstMessage.slice(0, 50);
            if (input.firstMessage.length > 50) {
              title += "...";
            }
          }
        }

        // 3. Criar sessão
        const session = await chatRepository.ChatSessionRepository.create({
          title,
          aiModelId,
          teamId,
          userId,
        });

        if (!session?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar sessão de chat",
          });
        }

        console.log("✅ [AUTO_CREATE] Sessão criada:", session.id);

        // 4. Criar primeira mensagem do usuário
        const userMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: session.id,
          senderRole: "user",
          content: input.firstMessage,
          status: "ok",
        });

        console.log("✅ [AUTO_CREATE] Primeira mensagem criada");

        // 5. Se useAgent, processar resposta da IA
        let aiMessage = null;
        if (input.useAgent) {
          try {
            // Buscar token do provider via HTTP
            const providerToken = await callAiStudioEndpoint(
              "getProviderToken",
              userId,
              teamId,
              { providerId: preferredModel.providerId },
              { Authorization: ctx.token || "" },
            );

            if (!providerToken?.token) {
              throw new Error(
                `Token não configurado para o provider ${preferredModel.provider?.name || "provider"}`,
              );
            }

            // Configurar API baseada no provider
            const baseUrl =
              preferredModel.provider?.baseUrl || "https://api.openai.com/v1";
            const apiUrl = `${baseUrl}/chat/completions`;

            // Usar configurações do modelo
            const modelConfig = preferredModel.config || {};
            const modelName = modelConfig.version || preferredModel.name;
            const maxTokens = modelConfig.maxTokens || 500;
            const temperature = modelConfig.temperature || 0.7;

            // Fazer chamada para IA
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${providerToken.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: modelName,
                messages: [
                  {
                    role: "user",
                    content: input.firstMessage,
                  },
                ],
                max_tokens: maxTokens,
                temperature: temperature,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `Erro na API do ${preferredModel.provider?.name || "provider"}: ${response.status} - ${errorText}`,
              );
            }

            const aiResponse = (await response.json()) as any;
            const aiContent =
              aiResponse.choices?.[0]?.message?.content ||
              "Desculpe, não consegui gerar uma resposta.";

            // Salvar resposta da IA
            aiMessage = await chatRepository.ChatMessageRepository.create({
              chatSessionId: session.id,
              senderRole: "ai",
              content: aiContent,
              status: "ok",
            });

            console.log("✅ [AUTO_CREATE] Resposta da IA processada");
          } catch (aiError) {
            console.error(
              "⚠️ [AUTO_CREATE] Erro ao processar com IA:",
              aiError,
            );

            // Salvar mensagem de erro da IA
            aiMessage = await chatRepository.ChatMessageRepository.create({
              chatSessionId: session.id,
              senderRole: "ai",
              content: `Erro: ${aiError instanceof Error ? aiError.message : "Erro ao processar mensagem"}`,
              status: "error",
            });
          }
        }

        console.log(
          "🎉 [AUTO_CREATE] Sessão criada com sucesso!",
          session.id,
          "- Título:",
          title,
        );

        return {
          session,
          userMessage,
          aiMessage,
        };
      } catch (error: any) {
        console.error("❌ [AUTO_CREATE] Erro:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao criar sessão automática",
        });
      }
    }),
} satisfies TRPCRouterRecord;
