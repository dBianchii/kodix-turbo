import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@kdx/db/client";
import { aiStudioRepository, appRepository } from "@kdx/db/repositories";
import { appTeamConfigs } from "@kdx/db/schema";
import {
  aiStudioAppId,
  aiStudioConfigSchema,
  aiStudioUserAppTeamConfigSchema,
} from "@kdx/shared";

import { protectedProcedure, router } from "../../trpc";
import { aiAgentsRouter } from "./agents";
import { aiModelsRouter } from "./models";
import { aiProvidersRouter } from "./providers";
import { aiTokensRouter } from "./tokens";

export const aiStudioRouter = router({
  providers: aiProvidersRouter,
  models: aiModelsRouter,
  agents: aiAgentsRouter,
  tokens: aiTokensRouter,

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
        return aiStudioConfigSchema.parse({});
      }

      return aiStudioConfigSchema.parse(teamConfig.config);
    } catch (error: any) {
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

      const newConfig = { ...currentConfig, teamInstructions: input };

      await appRepository.upsertAppTeamConfigs({
        appId: aiStudioAppId,
        teamId: ctx.auth.user.activeTeamId,
        input: newConfig,
      });

      return { success: true };
    }),

  // User Personal Instructions
  getUserPersonalInstructions: protectedProcedure.query(async ({ ctx }) => {
    const [config] = await appRepository.findUserAppTeamConfigs({
      userIds: [ctx.auth.user.id],
      teamIds: [ctx.auth.user.activeTeamId],
      appId: aiStudioAppId,
    });
    const parsedConfig = aiStudioUserAppTeamConfigSchema.safeParse(
      config?.config,
    );
    return parsedConfig.success ? parsedConfig.data.userInstructions : null;
  }),

  saveUserPersonalInstructions: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .max(2500, "As instruções não podem exceder 2500 caracteres."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingUserConfig] = await appRepository.findUserAppTeamConfigs({
        userIds: [ctx.auth.user.id],
        teamIds: [ctx.auth.user.activeTeamId],
        appId: aiStudioAppId,
      });

      const currentUserConfig = existingUserConfig?.config
        ? aiStudioUserAppTeamConfigSchema.parse(existingUserConfig.config)
        : aiStudioUserAppTeamConfigSchema.parse({});

      const newUserConfig = {
        ...currentUserConfig,
        userInstructions: {
          content: input.content,
          enabled: input.content.length > 0,
        },
      };

      await appRepository.upsertUserAppTeamConfigs({
        userId: ctx.auth.user.id,
        teamId: ctx.auth.user.activeTeamId,
        appId: aiStudioAppId,
        input: newUserConfig,
      });
      return { success: true, message: "Instruções salvas com sucesso!" };
    }),
});
