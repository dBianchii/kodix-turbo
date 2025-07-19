import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@kdx/db/client";
import { aiStudioRepository } from "@kdx/db/repositories";
import { appTeamConfigs } from "@kdx/db/schema";
import { aiStudioAppId, aiStudioConfigSchema } from "@kdx/shared";
import {
  createAiAgentSchema,
  createAiLibrarySchema,
  createAiTeamModelConfigSchema,
  createAiTeamProviderTokenSchema,
  findAiAgentsSchema,
  findAiLibrariesSchema,
  findTeamModelConfigSchema,
  findTokenByProviderSchema,
  removeTokenByProviderSchema,
  reorderModelsPrioritySchema,
  setDefaultModelSchema,
  setModelPrioritySchema,
  teamModelIdSchema,
  testModelSchema,
  toggleModelSchema,
  // AI Agent
  updateAiAgentSchema,
  // AI Library
  updateAiLibrarySchema,
  // AI Team Model Config
  updateAiTeamModelConfigSchema,
  // AI Team Provider Token
  updateAiTeamProviderTokenSchema,
} from "@kdx/validators/trpc/app";

import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../../../internal/services/errors";
import { protectedProcedure } from "../../../procedures";
import { aiAgentsRouter } from "./agents";
import { aiModelsRouter } from "./models";
import { aiProvidersRouter } from "./providers";
import { aiTokensRouter } from "./tokens";

export const aiStudioRouter = {
  // =============================================================================
  // AI PROVIDERS
  // =============================================================================
  ...aiProvidersRouter,

  // =============================================================================
  // AI MODELS
  // =============================================================================
  ...aiModelsRouter,

  // =============================================================================
  // AI LIBRARIES
  // =============================================================================
  createAiLibrary: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        files: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
        });
        return library;
      } catch (error) {
        console.error("Error creating AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI library",
          cause: error,
        });
      }
    }),

  findAiLibraries: protectedProcedure
    .input(
      z.object({
        limite: z.number().default(10),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      console.log("🔍 [AI_STUDIO_ROUTER] findAiLibraries called");
      console.log("Call stack:", new Error().stack);
      try {
        const { limite, offset } = input;

        const [libraries, total] = await Promise.all([
          aiStudioRepository.AiLibraryRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            limite,
            offset,
          }),
          aiStudioRepository.AiLibraryRepository.countByTeam(
            ctx.auth.user.activeTeamId,
          ),
        ]);

        return {
          libraries,
          pagination: {
            total,
            limit: limite,
            totalPages: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Error finding AI libraries:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI libraries",
          cause: error,
        });
      }
    }),

  findAiLibraryById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.findById(
          input.id,
        );
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI library not found",
          });
        }
        return library;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error finding AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI library",
          cause: error,
        });
      }
    }),

  updateAiLibrary: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        files: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      try {
        const library =
          await aiStudioRepository.AiLibraryRepository.findById(id);
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI library not found",
          });
        }

        const updatedLibrary =
          await aiStudioRepository.AiLibraryRepository.update(id, data);
        return updatedLibrary;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI library",
          cause: error,
        });
      }
    }),

  deleteAiLibrary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.findById(
          input.id,
        );
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI library not found",
          });
        }

        await aiStudioRepository.AiLibraryRepository.delete(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete AI library",
          cause: error,
        });
      }
    }),

  // =============================================================================
  // AI AGENTS
  // =============================================================================
  ...aiAgentsRouter,

  // =============================================================================
  // AI TEAM PROVIDER TOKENS
  // =============================================================================
  ...aiTokensRouter,

  // =============================================================================
  // AI TEAM MODEL CONFIG
  // =============================================================================

  findAvailableModels: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await aiStudioRepository.AiTeamModelConfigRepository.findAvailableModelsByTeam(
        ctx.auth.user.activeTeamId,
      );
    } catch (error: any) {
      console.error("[AI_STUDIO_ROUTER] findAvailableModels:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch available models",
      });
    }
  }),

  toggleModel: protectedProcedure
    .input(toggleModelSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await aiStudioRepository.AiTeamModelConfigRepository.toggleModel(
          ctx.auth.user.activeTeamId,
          input.aiModelId,
          input.enabled,
        );
      } catch (error: any) {
        console.error("[AI_STUDIO_ROUTER] toggleModel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to toggle model status",
        });
      }
    }),

  setModelPriority: protectedProcedure
    .input(setModelPrioritySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await aiStudioRepository.AiTeamModelConfigRepository.setPriority(
          ctx.auth.user.activeTeamId,
          input.aiModelId,
          input.priority,
        );
      } catch (error: any) {
        console.error("[AI_STUDIO_ROUTER] setModelPriority:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set model priority",
        });
      }
    }),

  reorderModelsPriority: protectedProcedure
    .input(reorderModelsPrioritySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await aiStudioRepository.AiTeamModelConfigRepository.reorderAllPriorities(
          ctx.auth.user.activeTeamId,
          input.orderedModelIds,
        );
      } catch (error: any) {
        console.error("[AI_STUDIO_ROUTER] reorderModelsPriority:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reorder models priority",
        });
      }
    }),

  testModel: protectedProcedure
    .input(testModelSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await aiStudioRepository.AiTeamModelConfigRepository.testModel(
          ctx.auth.user.activeTeamId,
          input.aiModelId,
          input.testPrompt,
        );
      } catch (error: any) {
        console.error("[AI_STUDIO_ROUTER] testModel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to test model",
        });
      }
    }),

  setDefaultModel: protectedProcedure
    .input(setDefaultModelSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await aiStudioRepository.AiTeamModelConfigRepository.setDefaultModel(
          ctx.auth.user.activeTeamId,
          input.aiModelId,
        );
      } catch (error: any) {
        console.error("[AI_STUDIO_ROUTER] setDefaultModel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to set default model",
        });
      }
    }),

  getDefaultModel: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await aiStudioRepository.AiTeamModelConfigRepository.getDefaultModel(
        ctx.auth.user.activeTeamId,
      );
    } catch (error: any) {
      console.error("[AI_STUDIO_ROUTER] getDefaultModel:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get default model",
      });
    }
  }),

  // =============================================================================
  // SYSTEM PROMPT ORCHESTRATION
  // =============================================================================

  getSystemPrompt: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const userId = input.userId || ctx.auth.user.id;

        const systemPrompt = await AiStudioService.getSystemPrompt({
          teamId: ctx.auth.user.activeTeamId,
          userId,
        });

        return { systemPrompt };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new TRPCError({ code: "NOT_FOUND", message: error.message });
        }
        if (error instanceof ValidationError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        console.error("[AI_STUDIO_ROUTER] getSystemPrompt:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao buscar prompt do sistema",
        });
      }
    }),
} satisfies TRPCRouterRecord;
