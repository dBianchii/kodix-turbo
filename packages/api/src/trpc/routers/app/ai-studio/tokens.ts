import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { aiStudioRepository } from "@kdx/db/repositories";
import {
  atualizarAiTeamProviderTokenSchema,
  buscarTokenPorProviderSchema,
  criarAiTeamProviderTokenSchema,
  removerTokenPorProviderSchema,
} from "@kdx/validators/trpc/app";

import { protectedProcedure } from "../../../procedures";

export const aiTokensRouter = {
  createAiTeamProviderToken: protectedProcedure
    .input(criarAiTeamProviderTokenSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const token =
          await aiStudioRepository.AiTeamProviderTokenRepository.create({
            ...input,
            teamId: ctx.auth.user.activeTeamId,
          });
        return token;
      } catch (error) {
        console.error("Error creating AI token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI token",
          cause: error,
        });
      }
    }),

  findAiTeamProviderTokens: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await aiStudioRepository.AiTeamProviderTokenRepository.findByTeam(
        ctx.auth.user.activeTeamId,
      );
    } catch (error) {
      console.error("Error finding AI tokens:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch AI tokens",
        cause: error,
      });
    }
  }),

  findTokenByProvider: protectedProcedure
    .input(buscarTokenPorProviderSchema)
    .query(async ({ input, ctx }) => {
      try {
        return await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
          ctx.auth.user.activeTeamId,
          input.providerId,
        );
      } catch (error) {
        console.error("Error finding provider token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch provider token",
          cause: error,
        });
      }
    }),

  updateAiTeamProviderToken: protectedProcedure
    .input(atualizarAiTeamProviderTokenSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, token } = input;
      try {
        // Check if the token belongs to the team
        const existingToken =
          await aiStudioRepository.AiTeamProviderTokenRepository.findById(id);
        if (
          !existingToken ||
          existingToken.teamId !== ctx.auth.user.activeTeamId
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token not found",
          });
        }

        const updatedToken =
          await aiStudioRepository.AiTeamProviderTokenRepository.update(
            id,
            token,
          );
        return updatedToken;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating AI token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI token",
          cause: error,
        });
      }
    }),

  removeTokenByProvider: protectedProcedure
    .input(removerTokenPorProviderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await aiStudioRepository.AiTeamProviderTokenRepository.deleteByTeamAndProvider(
          ctx.auth.user.activeTeamId,
          input.providerId,
        );
        return { success: true };
      } catch (error) {
        console.error("Error removing AI token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove AI token",
          cause: error,
        });
      }
    }),
} satisfies TRPCRouterRecord;
