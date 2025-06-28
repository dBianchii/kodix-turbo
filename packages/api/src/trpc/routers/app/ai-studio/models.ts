import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aiStudioRepository } from "@kdx/db/repositories";
import {
  createAiModelSchema,
  findAiModelsSchema,
  updateAiModelSchema,
} from "@kdx/validators/trpc/app";

import { protectedProcedure } from "../../../procedures";

// Simple ID schema
const idSchema = z.object({
  id: z.string(),
});

export const aiModelsRouter = {
  createAiModel: protectedProcedure
    .input(createAiModelSchema)
    .mutation(async ({ input }) => {
      try {
        const model = await aiStudioRepository.AiModelRepository.create(input);
        return model;
      } catch (error) {
        console.error("Error creating AI model:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI model",
          cause: error,
        });
      }
    }),

  findModels: protectedProcedure
    .input(findAiModelsSchema)
    .query(async ({ input }) => {
      try {
        const { limite, offset, ...filters } = input;
        return await aiStudioRepository.AiModelRepository.findMany({
          limite,
          offset,
          ...filters,
        });
      } catch (error) {
        console.error("[AI_MODELS_ROUTER] findModels:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch models",
        });
      }
    }),

  findAiModelById: protectedProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      try {
        const model = await aiStudioRepository.AiModelRepository.findById(
          input.id,
        );
        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI model not found",
          });
        }
        return model;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error finding AI model:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI model",
          cause: error,
        });
      }
    }),

  updateAiModel: protectedProcedure
    .input(updateAiModelSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        const model = await aiStudioRepository.AiModelRepository.update(
          id,
          data,
        );
        return model;
      } catch (error) {
        console.error("Error updating AI model:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI model",
          cause: error,
        });
      }
    }),

  deleteAiModel: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input }) => {
      try {
        await aiStudioRepository.AiModelRepository.delete(input.id);
        return { success: true };
      } catch (error) {
        console.error("Error deleting AI model:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete AI model",
          cause: error,
        });
      }
    }),
} satisfies TRPCRouterRecord;
