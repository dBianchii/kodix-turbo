import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@kdx/db/client";
import { aiStudioRepository } from "@kdx/db/repositories";
import { appTeamConfigs } from "@kdx/db/schema";
import { aiStudioAppId, aiStudioConfigSchema, kodixAppIds } from "@kdx/shared";
import {
  reorderModelsPrioritySchema,
  setDefaultModelSchema,
  setModelPrioritySchema,
  toggleModelSchema,
} from "@kdx/validators/trpc/app";

import { AiStudioService } from "../../../../internal/services";
import { protectedProcedure } from "../../../procedures";
import { t } from "../../../trpc";
import { aiAgentsRouter } from "./agents";
import { aiLibrariesRouter } from "./libraries";
import { aiModelsRouter } from "./models";
import { aiProvidersRouter } from "./providers";
import { aiTokensRouter } from "./tokens";

const aiStudioMainRouter = t.router({
  // =============================================================================
  // SYSTEM PROMPT
  // =============================================================================
  getSystemPromptForChat: protectedProcedure
    .input(
      z.object({
        requestingApp: z.enum(kodixAppIds),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await AiStudioService.getSystemPromptForChat({
        userId: ctx.auth.user.id,
        teamId: ctx.auth.user.activeTeamId,
        requestingApp: input.requestingApp,
      });
    }),
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
          input.modelId,
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
          input.modelId,
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
    .input(
      z.object({
        modelId: z.string(),
        testPrompt: z
          .string()
          .min(1)
          .default("Olá! Você está funcionando corretamente?"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await aiStudioRepository.AiTeamModelConfigRepository.testModel(
          ctx.auth.user.activeTeamId,
          input.modelId,
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
          input.modelId,
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
  // TEAM INSTRUCTIONS
  // =============================================================================

  getTeamInstructions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const teamConfig = await db.query.appTeamConfigs.findFirst({
        where: (appTeamConfig, { eq, and }) =>
          and(
            eq(appTeamConfig.appId, aiStudioAppId),
            eq(appTeamConfig.teamId, ctx.auth.user.activeTeamId),
          ),
        columns: {
          config: true,
        },
      });

      if (!teamConfig?.config) {
        // Retornar configuração padrão se não existir
        return aiStudioConfigSchema.parse({});
      }

      return aiStudioConfigSchema.parse(teamConfig.config);
    } catch (error: any) {
      console.error("[AI_STUDIO_ROUTER] getTeamInstructions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get team instructions",
      });
    }
  }),

  updateTeamInstructions: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        enabled: z.boolean(),
        appliesTo: z.enum(["chat", "all"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Buscar config existente
        const existingConfig = await db.query.appTeamConfigs.findFirst({
          where: (appTeamConfig, { eq, and }) =>
            and(
              eq(appTeamConfig.appId, aiStudioAppId),
              eq(appTeamConfig.teamId, ctx.auth.user.activeTeamId),
            ),
          columns: {
            config: true,
          },
        });

        const currentConfig = existingConfig?.config
          ? aiStudioConfigSchema.parse(existingConfig.config)
          : aiStudioConfigSchema.parse({});

        const newConfig = aiStudioConfigSchema.parse({
          ...currentConfig,
          teamInstructions: input,
        });

        if (existingConfig) {
          // Atualizar existente
          await db
            .update(appTeamConfigs)
            .set({ config: newConfig })
            .where(
              and(
                eq(appTeamConfigs.appId, aiStudioAppId),
                eq(appTeamConfigs.teamId, ctx.auth.user.activeTeamId),
              ),
            );
        } else {
          // Criar novo
          await db.insert(appTeamConfigs).values({
            appId: aiStudioAppId,
            teamId: ctx.auth.user.activeTeamId,
            config: newConfig,
          });
        }

        return { success: true };
      } catch (error: any) {
        console.error("[AI_STUDIO_ROUTER] updateTeamInstructions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update team instructions",
        });
      }
    }),
});

export const aiStudioRouter = t.mergeRouters(
  aiStudioMainRouter,
  t.router({ agents: aiAgentsRouter }),
  t.router({ libraries: aiLibrariesRouter }),
  t.router({ models: aiModelsRouter }),
  t.router({ providers: aiProvidersRouter }),
  t.router({ tokens: aiTokensRouter }),
);
