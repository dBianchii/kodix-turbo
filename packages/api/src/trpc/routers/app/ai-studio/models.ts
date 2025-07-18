import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aiStudioRepository } from "@kdx/db/repositories";
import {
  createAiModelSchema,
  findAiModelsSchema,
  updateAiModelSchema,
  modelIdSchema,
} from "@kdx/validators/trpc/app";

import { aiStudioInstalledMiddleware } from "../../../middlewares";
import { protectedProcedure } from "../../../procedures";


export const aiModelsRouter = {
  createAiModel: protectedProcedure
    .input(createAiModelSchema)
    .mutation(async ({ input }) => {
      //TODO: check if user has permission to create a model
      const model = await aiStudioRepository.AiModelRepository.create(input);
      return model;
    }),

  findModels: protectedProcedure
    .input(findAiModelsSchema)
    .use(aiStudioInstalledMiddleware)
    .query(async ({ input }) => {
      try {
        const { limite, offset, status, ...filters } = input;
        return await aiStudioRepository.AiModelRepository.findMany({
          limite,
          offset,
          status,
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
    .input(modelIdSchema)
    .query(async ({ input }) => {
      try {
        const model = await aiStudioRepository.AiModelRepository.findById(
          input.modelId,
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
      const { modelId, ...data } = input;
      try {
        // Rule: Prevent re-enabling an archived model
        if (data.enabled) {
          const existingModel =
            await aiStudioRepository.AiModelRepository.findById(modelId);
          if (existingModel?.status === "archived") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot enable a model that has been archived.",
            });
          }
        }

        const model = await aiStudioRepository.AiModelRepository.update(
          modelId,
          data,
        );
        return model;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating AI model:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI model",
          cause: error,
        });
      }
    }),

  deleteAiModel: protectedProcedure
    .input(modelIdSchema)
    .mutation(async ({ input }) => {
      try {
        await aiStudioRepository.AiModelRepository.delete(input.modelId);
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
