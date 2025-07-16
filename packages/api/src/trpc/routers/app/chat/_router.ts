import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

import { aiStudioRepository, chatRepository } from "@kdx/db/repositories";
import {
  atualizarChatFolderSchema,
  atualizarChatMessageSchema,
  atualizarChatSessionSchema,
  autoCreateSessionWithMessageSchema,
  buscarChatFoldersSchema,
  buscarChatMessagesSchema,
  buscarChatSessionsSchema,
  createEmptySessionSchema,
  criarChatFolderSchema,
  criarChatMessageSchema,
  criarChatSessionSchema,
  duplicarSessaoSchema,
  enviarMensagemSchema,
  generateSessionTitleSchema,
  getMessagesSchema,
  chatIdSchema as idSchema,
  iniciarNovaConversa as iniciarNovaConversaSchema,
  sessionIdSchema,
} from "@kdx/validators/trpc/app";

import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import {
  AgentImmutabilityError,
  ChatService,
} from "../../../../internal/services/chat.service";
import { getLocaleBasedOnCookie } from "../../../../utils/locales";
import { chatWithDependenciesMiddleware } from "../../../middlewares";
import { protectedProcedure } from "../../../procedures";
import { t } from "../../../trpc";
import { autoCreateSessionWithMessageHandler } from "./autoCreateSessionWithMessage.handler";
import { createEmptySessionHandler } from "./createEmptySession.handler";
import { enviarMensagemHandler } from "./enviarMensagem.handler";
import { findSessionHandler } from "./findSession.handler";
import { findSessionsHandler } from "./findSessions.handler";
import { generateSessionTitleHandler } from "./generateSessionTitle.handler";
import { getMessagesHandler } from "./getMessages.handler";
import { getPreferredModelHandler } from "./getPreferredModel.handler";

export const chatRouter = t.router({
  testQuery: protectedProcedure
    .input(z.object({ test: z.string() }))
    .query(async ({ input }) => ({ message: `Test: ${input.test}` })),

  createChatFolder: protectedProcedure
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

  updateChatFolder: protectedProcedure
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

  findChatFolders: protectedProcedure
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

  findChatFolderById: protectedProcedure
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

  deleteChatFolder: protectedProcedure
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

  createSession: protectedProcedure
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

  updateSession: protectedProcedure
    .input(atualizarChatSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        // Buscar sessão atual para comparar mudanças
        const sessaoAtual =
          await chatRepository.ChatSessionRepository.findById(id);
        if (!sessaoAtual || sessaoAtual.teamId !== ctx.auth.user.activeTeamId) {
          const locale = await getLocaleBasedOnCookie();
          const apiTranslations = await getTranslations({ locale, namespace: "api" });
          
          throw new TRPCError({
            code: "NOT_FOUND", 
            message: apiTranslations("Session not found"),
          });
        }

        // Reject any attempt to change agent after initial assignment
        if (dadosAtualizacao.aiAgentId !== undefined) {
          // Allow initial agent assignment (when no agent is set)
          if (sessaoAtual.aiAgentId && dadosAtualizacao.aiAgentId !== sessaoAtual.aiAgentId) {
            const locale = await getLocaleBasedOnCookie();
            const apiTranslations = await getTranslations({ locale, namespace: "api" });
            
            throw new TRPCError({
              code: "FORBIDDEN",
              message: apiTranslations("Agent cannot be changed after initial assignment"),
              cause: "AGENT_CHANGE_NOT_ALLOWED",
            });
          }
        }

        const dadosCompletos = { ...dadosAtualizacao };

        await chatRepository.ChatSessionRepository.update(id, dadosCompletos);

        const sessaoCompleta =
          await chatRepository.ChatSessionRepository.findById(id);

        if (!sessaoCompleta) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível buscar a sessão após a atualização.",
          });
        }

        return sessaoCompleta;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("❌ [BACKEND] Erro ao atualizar sessão de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar sessão de chat",
          cause: error,
        });
      }
    }),

  findSessions: protectedProcedure
    .input(buscarChatSessionsSchema)
    .query(async ({ input, ctx }) => {
      return findSessionsHandler({ input, ctx });
    }),

  findSession: protectedProcedure
    .input(sessionIdSchema)
    .query(async ({ input, ctx }) => {
      return findSessionHandler({ input, ctx });
    }),

  deleteSession: protectedProcedure
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

  moveSession: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        chatFolderId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await chatRepository.ChatSessionRepository.findById(
          input.id,
        );
        if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sessão de chat não encontrada",
          });
        }

        // Verificar se a pasta existe
        const folder = await chatRepository.ChatFolderRepository.findById(
          input.chatFolderId,
        );
        if (!folder || folder.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pasta de chat não encontrada",
          });
        }

        const updatedSession =
          await chatRepository.ChatSessionRepository.update(input.id, {
            chatFolderId: input.chatFolderId,
          });
        return updatedSession;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao mover sessão de chat:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao mover sessão de chat",
          cause: error,
        });
      }
    }),

  getMessages: protectedProcedure
    .input(getMessagesSchema)
    .query(async ({ input, ctx }) => {
      return getMessagesHandler({ input, ctx });
    }),

  sendMessage: protectedProcedure
    .use(chatWithDependenciesMiddleware)
    .input(enviarMensagemSchema)
    .mutation(async ({ input, ctx }) => {
      return enviarMensagemHandler({ input, ctx });
    }),

  updateMessage: protectedProcedure
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

  deleteMessage: protectedProcedure
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

  startNewConversation: protectedProcedure
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

  duplicateSession: protectedProcedure
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

  getPreferredModel: protectedProcedure
    .use(chatWithDependenciesMiddleware)
    .query(async ({ ctx }) => {
      return getPreferredModelHandler({ ctx });
    }),

  autoCreateSessionWithMessage: protectedProcedure
    .use(chatWithDependenciesMiddleware)
    .input(autoCreateSessionWithMessageSchema)
    .mutation(async ({ input, ctx }) => {
      return autoCreateSessionWithMessageHandler({ input, ctx });
    }),

  createEmptySession: protectedProcedure
    .use(chatWithDependenciesMiddleware)
    .input(createEmptySessionSchema)
    .mutation(async ({ input, ctx }) => {
      return createEmptySessionHandler({ input, ctx });
    }),

  generateSessionTitle: protectedProcedure
    .use(chatWithDependenciesMiddleware)
    .input(generateSessionTitleSchema)
    .mutation(async ({ input, ctx }) => {
      return generateSessionTitleHandler({ input, ctx });
    }),

});
