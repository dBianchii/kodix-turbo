import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { chatRepository } from "@kdx/db/repositories";
import {
  atualizarChatFolderSchema,
  atualizarChatMessageSchema,
  atualizarChatSessionSchema,
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

import { protectedProcedure } from "../../../procedures";

export const chatRouter = {
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

  enviarMensagem: protectedProcedure
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

        // TODO: Implementar lógica de AI para resposta automática
        // if (input.useAgent && session.aiAgentId) {
        //   // Processar com AI Agent
        // }

        return userMessage;
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
} satisfies TRPCRouterRecord;
