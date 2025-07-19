import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { aiStudioRepository } from "@kdx/db/repositories";
import {
  enableProviderModelsSchema,
  findAiProvidersSchema,
  toggleGlobalModelSchema,
} from "@kdx/validators/trpc/app";

// Provider validation is now handled by the sync service reading from supported-providers.json
import { AiModelSyncService } from "../../../../internal/services/ai-model-sync.service";
import { ProviderConfigService } from "../../../../internal/services/provider-config.service";
import { aiStudioInstalledMiddleware } from "../../../middlewares";
import { protectedProcedure } from "../../../procedures";

// Simple providerId schema
const providerIdSchema = z.object({
  providerId: z.string(),
});

export const aiProvidersRouter = {
  findAiProviders: protectedProcedure
    .input(findAiProvidersSchema)
    .use(aiStudioInstalledMiddleware)
    .query(async ({ input }) => {
      try {
        const { limite, offset } = input;
        
        // Get providers from configuration file instead of database
        const allProviders = ProviderConfigService.getProviders();
        
        // Apply pagination
        const startIndex = offset || 0;
        const endIndex = startIndex + (limite || 50);
        const providers = allProviders.slice(startIndex, endIndex);
        
        // Transform to match expected response format
        const transformedProviders = providers.map(provider => ({
          ...provider,
          models: [], // Models will be fetched separately if needed
          tokens: [], // Tokens will be fetched separately if needed
        }));
        
        return transformedProviders;
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] findAiProviders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch providers",
        });
      }
    }),

  findAiProviderById: protectedProcedure
    .input(providerIdSchema)
    .query(async ({ input }) => {
      try {
        const provider = ProviderConfigService.getProviderById(input.providerId);
        
        if (!provider) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Provider with ID ${input.providerId} not found`,
          });
        }
        
        // Transform to match expected response format
        return {
          ...provider,
          models: [], // Models will be fetched separately if needed
          tokens: [], // Tokens will be fetched separately if needed
        };
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] findAiProviderById:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch provider",
        });
      }
    }),

  // Enable all models from a provider globally
  enableProviderModels: protectedProcedure
    .input(enableProviderModelsSchema)
    .mutation(async ({ input }) => {
      try {
        // Find all models from the provider
        const models = await aiStudioRepository.AiModelRepository.findMany({
          providerId: input.providerId,
        });

        // Update all models from the provider
        const updatePromises = models.map((model) =>
          aiStudioRepository.AiModelRepository.update(model.modelId, {
            enabled: input.enabled,
          }),
        );

        await Promise.allSettled(updatePromises);

        return {
          message: `${models.length} models ${input.enabled ? "enabled" : "disabled"} successfully`,
          modelsUpdated: models.length,
        };
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] enableProviderModels:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enable provider models",
        });
      }
    }),

  // Enable/disable individual global model
  toggleGlobalModel: protectedProcedure
    .input(toggleGlobalModelSchema)
    .mutation(async ({ input }) => {
      try {
        const model = await aiStudioRepository.AiModelRepository.update(
          input.aiModelId,
          { enabled: input.enabled },
        );

        return {
          message: `Model ${input.enabled ? "enabled" : "disabled"} globally successfully`,
          model,
        };
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] toggleGlobalModel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle global model status",
        });
      }
    }),

  // Sync models from a provider
  syncModels: protectedProcedure
    .input(z.object({ providerId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const syncService = new AiModelSyncService();
        
        // Sync with provider to get diff
        const syncResult = await syncService.syncWithProvider(input.providerId as "openai" | "google" | "anthropic");
        
        // Apply the sync results to database
        const applyResult = await syncService.applySync(syncResult);
        
        return {
          success: true,
          message: `Successfully synced ${applyResult.modelsProcessed} models for ${input.providerId}`,
          modelsProcessed: applyResult.modelsProcessed,
          modelsCreated: applyResult.modelsCreated,
          modelsUpdated: applyResult.modelsUpdated,
          modelsArchived: applyResult.modelsArchived,
          errors: applyResult.errors,
          providerName: input.providerId,
        };
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] syncModels:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync models from provider",
          cause: error,
        });
      }
    }),

  // Archive models from unsupported providers
  archiveUnsupportedProviderModels: protectedProcedure
    .mutation(async () => {
      try {
        const syncService = new AiModelSyncService();
        const result = await syncService.archiveModelsFromUnsupportedProviders();
        
        return {
          success: true,
          message: `Archived ${result.archivedCount} models from unsupported providers`,
          archivedCount: result.archivedCount,
          supportedProviders: result.supportedProviders,
        };
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] archiveUnsupportedProviderModels:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to archive models from unsupported providers",
          cause: error,
        });
      }
    }),
} satisfies TRPCRouterRecord;
