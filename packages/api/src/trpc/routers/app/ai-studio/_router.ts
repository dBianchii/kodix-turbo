import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aiStudioRepository } from "@kdx/db/repositories";
import {
  atualizarAiAgentSchema,
  atualizarAiLibrarySchema,
  atualizarAiModelSchema,
  atualizarAiModelTokenSchema,
  buscarAiAgentsSchema,
  buscarAiLibrariesSchema,
  buscarAiModelsSchema,
  buscarTokenPorModeloSchema,
  criarAiAgentSchema,
  criarAiLibrarySchema,
  criarAiModelSchema,
  criarAiModelTokenSchema,
  aiStudioIdSchema as idSchema,
  removerTokenPorModeloSchema,
} from "@kdx/validators/trpc/app";

import { protectedProcedure } from "../../../procedures";

export const aiStudioRouter = {
  // ===============================
  // AI MODEL ENDPOINTS
  // ===============================

  criarAiModel: protectedProcedure
    .input(criarAiModelSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const model = await aiStudioRepository.AiModelRepository.create(input);
        return model;
      } catch (error) {
        console.error("Erro ao criar modelo AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar modelo de IA",
          cause: error,
        });
      }
    }),

  atualizarAiModel: protectedProcedure
    .input(atualizarAiModelSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        const modeloExistente =
          await aiStudioRepository.AiModelRepository.findById(id);
        if (!modeloExistente) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo de IA não encontrado",
          });
        }

        const model = await aiStudioRepository.AiModelRepository.update(
          id,
          dadosAtualizacao,
        );
        return model;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao atualizar modelo AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar modelo de IA",
          cause: error,
        });
      }
    }),

  buscarAiModels: protectedProcedure
    .input(buscarAiModelsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limite, pagina, ...filtros } = input;
        const offset = (pagina - 1) * limite;

        const models = await aiStudioRepository.AiModelRepository.findMany({
          ...filtros,
          limite,
          offset,
        });

        return {
          models,
          paginacao: {
            pagina,
            limite,
            // TODO: Add total count for proper pagination
          },
        };
      } catch (error) {
        console.error("Erro ao buscar modelos AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar modelos de IA",
          cause: error,
        });
      }
    }),

  buscarAiModelPorId: protectedProcedure
    .input(idSchema)
    .query(async ({ input, ctx }) => {
      try {
        const model = await aiStudioRepository.AiModelRepository.findById(
          input.id,
        );

        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo de IA não encontrado",
          });
        }

        return model;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar modelo AI por ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar modelo de IA",
          cause: error,
        });
      }
    }),

  excluirAiModel: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const modelo = await aiStudioRepository.AiModelRepository.findById(
          input.id,
        );
        if (!modelo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo de IA não encontrado",
          });
        }

        await aiStudioRepository.AiModelRepository.delete(input.id);
        return { sucesso: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao excluir modelo AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir modelo de IA",
          cause: error,
        });
      }
    }),

  // ===============================
  // AI LIBRARY ENDPOINTS
  // ===============================

  criarAiLibrary: protectedProcedure
    .input(criarAiLibrarySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
        });
        return library;
      } catch (error) {
        console.error("Erro ao criar biblioteca AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar biblioteca de IA",
          cause: error,
        });
      }
    }),

  atualizarAiLibrary: protectedProcedure
    .input(atualizarAiLibrarySchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        const libraryExistente =
          await aiStudioRepository.AiLibraryRepository.findById(id);
        if (
          !libraryExistente ||
          libraryExistente.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Biblioteca de IA não encontrada",
          });
        }

        const library = await aiStudioRepository.AiLibraryRepository.update(
          id,
          dadosAtualizacao,
        );
        return library;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao atualizar biblioteca AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar biblioteca de IA",
          cause: error,
        });
      }
    }),

  buscarAiLibraries: protectedProcedure
    .input(buscarAiLibrariesSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limite, pagina, ...filtros } = input;
        const offset = (pagina - 1) * limite;

        const [libraries, total] = await Promise.all([
          aiStudioRepository.AiLibraryRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            ...filtros,
            limite,
            offset,
          }),
          aiStudioRepository.AiLibraryRepository.countByTeam(
            ctx.auth.user.activeTeamId,
            filtros.busca,
          ),
        ]);

        return {
          libraries,
          paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Erro ao buscar bibliotecas AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar bibliotecas de IA",
          cause: error,
        });
      }
    }),

  buscarAiLibraryPorId: protectedProcedure
    .input(idSchema)
    .query(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.findById(
          input.id,
        );

        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Biblioteca de IA não encontrada",
          });
        }

        return library;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar biblioteca AI por ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar biblioteca de IA",
          cause: error,
        });
      }
    }),

  excluirAiLibrary: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.findById(
          input.id,
        );
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Biblioteca de IA não encontrada",
          });
        }

        await aiStudioRepository.AiLibraryRepository.delete(input.id);
        return { sucesso: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao excluir biblioteca AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir biblioteca de IA",
          cause: error,
        });
      }
    }),

  // ===============================
  // AI AGENT ENDPOINTS
  // ===============================

  criarAiAgent: protectedProcedure
    .input(criarAiAgentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const agent = await aiStudioRepository.AiAgentRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
          createdById: ctx.auth.user.id,
        });
        return agent;
      } catch (error) {
        console.error("Erro ao criar agente AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar agente de IA",
          cause: error,
        });
      }
    }),

  atualizarAiAgent: protectedProcedure
    .input(atualizarAiAgentSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...dadosAtualizacao } = input;

      try {
        const agentExistente =
          await aiStudioRepository.AiAgentRepository.findById(id);
        if (
          !agentExistente ||
          agentExistente.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agente de IA não encontrado",
          });
        }

        const agent = await aiStudioRepository.AiAgentRepository.update(
          id,
          dadosAtualizacao,
        );
        return agent;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao atualizar agente AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar agente de IA",
          cause: error,
        });
      }
    }),

  buscarAiAgents: protectedProcedure
    .input(buscarAiAgentsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limite, pagina, ...filtros } = input;
        const offset = (pagina - 1) * limite;

        const [agents, total] = await Promise.all([
          aiStudioRepository.AiAgentRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            ...filtros,
            limite,
            offset,
          }),
          aiStudioRepository.AiAgentRepository.countByTeam(
            ctx.auth.user.activeTeamId,
            filtros.busca,
            filtros.createdById,
          ),
        ]);

        return {
          agents,
          paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Erro ao buscar agentes AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar agentes de IA",
          cause: error,
        });
      }
    }),

  buscarAiAgentPorId: protectedProcedure
    .input(idSchema)
    .query(async ({ input, ctx }) => {
      try {
        const agent = await aiStudioRepository.AiAgentRepository.findById(
          input.id,
        );

        if (!agent || agent.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agente de IA não encontrado",
          });
        }

        return agent;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar agente AI por ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar agente de IA",
          cause: error,
        });
      }
    }),

  excluirAiAgent: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const agent = await aiStudioRepository.AiAgentRepository.findById(
          input.id,
        );
        if (!agent || agent.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agente de IA não encontrado",
          });
        }

        await aiStudioRepository.AiAgentRepository.delete(input.id);
        return { sucesso: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao excluir agente AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir agente de IA",
          cause: error,
        });
      }
    }),

  // ===============================
  // AI MODEL TOKEN ENDPOINTS
  // ===============================

  criarAiModelToken: protectedProcedure
    .input(criarAiModelTokenSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const token = await aiStudioRepository.AiModelTokenRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
        });
        return token;
      } catch (error) {
        console.error("Erro ao criar token do modelo AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar token do modelo de IA",
          cause: error,
        });
      }
    }),

  atualizarAiModelToken: protectedProcedure
    .input(atualizarAiModelTokenSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, token } = input;

      try {
        const updatedToken =
          await aiStudioRepository.AiModelTokenRepository.update(id, token);
        return updatedToken;
      } catch (error) {
        console.error("Erro ao atualizar token do modelo AI:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar token do modelo de IA",
          cause: error,
        });
      }
    }),

  buscarTokens: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tokens = await aiStudioRepository.AiModelTokenRepository.findByTeam(
        ctx.auth.user.activeTeamId,
      );
      return tokens;
    } catch (error) {
      console.error("Erro ao buscar tokens:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao buscar tokens",
        cause: error,
      });
    }
  }),

  buscarTokenPorModelo: protectedProcedure
    .input(buscarTokenPorModeloSchema)
    .query(async ({ input, ctx }) => {
      try {
        const token =
          await aiStudioRepository.AiModelTokenRepository.findByTeamAndModel(
            ctx.auth.user.activeTeamId,
            input.modelId,
          );
        return token;
      } catch (error) {
        console.error("Erro ao buscar token por modelo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar token por modelo",
          cause: error,
        });
      }
    }),

  removerTokenPorModelo: protectedProcedure
    .input(removerTokenPorModeloSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await aiStudioRepository.AiModelTokenRepository.deleteByTeamAndModel(
          ctx.auth.user.activeTeamId,
          input.modelId,
        );
        return { sucesso: true };
      } catch (error) {
        console.error("Erro ao remover token por modelo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao remover token por modelo",
          cause: error,
        });
      }
    }),
} satisfies TRPCRouterRecord;
