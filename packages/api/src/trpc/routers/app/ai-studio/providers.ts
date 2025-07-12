import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@kdx/db/client";
import { aiStudioRepository } from "@kdx/db/repositories";
import { aiProvider } from "@kdx/db/schema";
import {
  createAiProviderSchema,
  enableProviderModelsSchema,
  findAiProvidersSchema,
  toggleGlobalModelSchema,
  updateAiProviderSchema,
} from "@kdx/validators/trpc/app";

import type { SupportedProvider } from "../../../../internal/services/ai-model-sync.service";
import { AiModelSyncService } from "../../../../internal/services/ai-model-sync.service";
import { protectedProcedure } from "../../../procedures";

// Simple ID schema
const idSchema = z.object({
  id: z.string(),
});

export const aiProvidersRouter = {
  createAiProvider: protectedProcedure
    .input(createAiProviderSchema)
    .mutation(async ({ input }) => {
      try {
        const provider =
          await aiStudioRepository.AiProviderRepository.create(input);
        return provider;
      } catch (error) {
        console.error("Error creating AI provider:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI provider",
          cause: error,
        });
      }
    }),

  findAiProviders: protectedProcedure
    .input(findAiProvidersSchema)
    .query(async ({ input }) => {
      try {
        const { limite, offset, ...filters } = input;
        return await aiStudioRepository.AiProviderRepository.findMany({
          limite,
          offset,
          ...filters,
        });
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] findAiProviders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch providers",
        });
      }
    }),

  findAiProviderById: protectedProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      try {
        return await aiStudioRepository.AiProviderRepository.findById(input.id);
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] findAiProviderById:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch provider",
        });
      }
    }),

  updateAiProvider: protectedProcedure
    .input(updateAiProviderSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        const provider = await aiStudioRepository.AiProviderRepository.update(
          id,
          data,
        );
        return provider;
      } catch (error) {
        console.error("Error updating AI provider:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI provider",
          cause: error,
        });
      }
    }),

  deleteAiProvider: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input }) => {
      try {
        await aiStudioRepository.AiProviderRepository.delete(input.id);
        return { success: true };
      } catch (error) {
        console.error("Error deleting AI provider:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete AI provider",
          cause: error,
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
          aiStudioRepository.AiModelRepository.update(model.id, {
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
          input.modelId,
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
      const supportedProviders: SupportedProvider[] = [
        "openai",
        "google",
        "anthropic",
      ];

      if (!supportedProviders.includes(input.providerId as SupportedProvider)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This provider is not available yet. Please contact a Kodix admin to request access.",
        });
      }

      try {
        const syncService = new AiModelSyncService();
        const diff = await syncService.syncWithProvider(
          input.providerId as SupportedProvider,
        );

        return diff;
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] syncModels:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync models from provider",
          cause: error,
        });
      }
    }),

  // Apply sync changes to the database
  applySync: protectedProcedure
    .input(
      z.object({
        providerId: z.string(),
        newModels: z.array(
          z.object({
            modelId: z.string(),
            name: z.string(),
            displayName: z.string().optional(),
            maxTokens: z.number().optional(),
            pricing: z
              .object({
                input: z.union([z.string(), z.number()]).transform(String),
                output: z.union([z.string(), z.number()]).transform(String),
                unit: z
                  .union([z.literal("per_million_tokens"), z.null()])
                  .transform(() => "per_million_tokens"),
              })
              .optional(),
            version: z.string().optional(),
            description: z.string().optional(),
            status: z.enum(["active", "archived"]).optional(),
          }),
        ),
        updatedModels: z.array(
          z.object({
            id: z.string(),
            updates: z.object({
              name: z.string().optional(),
              displayName: z.string().optional(),
              maxTokens: z.number().optional(),
              pricing: z
                .object({
                  input: z.union([z.string(), z.number()]).transform(String),
                  output: z.union([z.string(), z.number()]).transform(String),
                  unit: z
                    .union([
                      z.literal("per_million_tokens"),
                      z.null(),
                      z.undefined(),
                    ])
                    .transform(() => "per_million_tokens"),
                })
                .optional(),
              version: z.string().optional(),
              description: z.string().optional(),
              status: z.enum(["active", "archived"]).optional(),
            }),
          }),
        ),
        archivedModels: z.array(
          z.object({
            modelId: z.string(),
            name: z.string(),
            displayName: z.string().optional(),
            maxTokens: z.number().optional(),
            pricing: z
              .object({
                input: z.union([z.string(), z.number()]).transform(String),
                output: z.union([z.string(), z.number()]).transform(String),
                unit: z
                  .union([
                    z.literal("per_million_tokens"),
                    z.null(),
                    z.undefined(),
                  ])
                  .transform(() => "per_million_tokens"),
              })
              .optional(),
            version: z.string().optional(),
            description: z.string().optional(),
            status: z.enum(["active", "archived"]).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[AI_PROVIDERS_ROUTER] applySync called with:`, {
          providerId: input.providerId,
          newModelsCount: input.newModels.length,
          updatedModelsCount: input.updatedModels.length,
          archivedModelsCount: input.archivedModels.length,
        });

        // Resolve provider name to database ID
        const provider = await db
          .select({ id: aiProvider.id })
          .from(aiProvider)
          .where(eq(aiProvider.name, input.providerId))
          .limit(1);

        if (!provider.length || !provider[0]) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Provider '${input.providerId}' not found in database.`,
          });
        }

        const actualProviderId = provider[0].id;
        console.log(
          `[AI_PROVIDERS_ROUTER] Resolved provider '${input.providerId}' to database ID: ${actualProviderId}`,
        );

        const results = {
          newModelsCreated: 0,
          modelsUpdated: 0,
          modelsArchived: 0,
          errors: [] as string[],
        };

        // Process new models
        console.log(
          `[AI_PROVIDERS_ROUTER] Processing ${input.newModels.length} new models for provider ${input.providerId}`,
        );
        for (const newModel of input.newModels) {
          try {
            console.log(`[AI_PROVIDERS_ROUTER] Creating model:`, {
              name: newModel.name,
              modelId: newModel.modelId,
              providerId: input.providerId,
              status: newModel.status ?? "active",
            });

            const createdModel =
              await aiStudioRepository.AiModelRepository.create({
                displayName: newModel.name,
                universalModelId: newModel.modelId, // Corrigido
                providerId: actualProviderId,
                config: {
                  modelId: newModel.modelId,
                  displayName: newModel.displayName,
                  maxTokens: newModel.maxTokens,
                  pricing: newModel.pricing,
                  version: newModel.version,
                  description: newModel.description,
                },
                enabled: true,
                status: newModel.status ?? "active",
              });

            console.log(
              `[AI_PROVIDERS_ROUTER] Successfully created model ${newModel.modelId} with DB ID: ${createdModel?.id} at ${new Date().toISOString()}`,
            );
            results.newModelsCreated++;
          } catch (error) {
            console.error(
              `[AI_PROVIDERS_ROUTER] Error creating model ${newModel.modelId}:`,
              error,
            );
            results.errors.push(
              `Failed to create model ${newModel.modelId}: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }

        // Process updated models (including explicit status changes)
        for (const updateRequest of input.updatedModels) {
          try {
            const existingModel =
              await aiStudioRepository.AiModelRepository.findById(
                updateRequest.id,
              );
            if (!existingModel) {
              results.errors.push(
                `Model with ID ${updateRequest.id} not found`,
              );
              continue;
            }

            const existingConfig = (existingModel.config ?? {}) as Record<
              string,
              unknown
            >;
            const updatedConfig = {
              ...existingConfig,
              ...(updateRequest.updates.displayName && {
                displayName: updateRequest.updates.displayName,
              }),
              ...(updateRequest.updates.maxTokens !== undefined && {
                maxTokens: updateRequest.updates.maxTokens,
              }),
              ...(updateRequest.updates.pricing && {
                pricing: updateRequest.updates.pricing,
              }),
              ...(updateRequest.updates.version && {
                version: updateRequest.updates.version,
              }),
              ...(updateRequest.updates.description && {
                description: updateRequest.updates.description,
              }),
            };

            const updatePayload: Partial<{
              displayName: string;
              status: "active" | "archived";
              config: Record<string, unknown>;
              enabled?: boolean;
            }> = {
              ...(updateRequest.updates.name && {
                displayName: updateRequest.updates.name,
              }),
              config: updatedConfig,
            };

            if (updateRequest.updates.status) {
              updatePayload.status = updateRequest.updates.status;
              if (updateRequest.updates.status === "archived") {
                updatePayload.enabled = false; // Force disable if archived
              }
            }

            await aiStudioRepository.AiModelRepository.update(
              updateRequest.id,
              updatePayload,
            );
            console.log(
              `[AI_PROVIDERS_ROUTER] Successfully updated model ${updateRequest.id} at ${new Date().toISOString()}`,
            );
            results.modelsUpdated++;
          } catch (error) {
            console.error(
              `[AI_PROVIDERS_ROUTER] Error updating model ${updateRequest.id}:`,
              error,
            );
            results.errors.push(
              `Failed to update model ${updateRequest.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }

        // Process archived models using efficient bulk operation
        if (input.archivedModels.length > 0) {
          try {
            // Step 1: Get all model IDs that need to be archived
            const modelIdsToArchive = new Set(
              input.archivedModels.map((model) => model.modelId),
            );

            // Step 2: Find existing models that match these modelIds for this provider
            const existingModels =
              await aiStudioRepository.AiModelRepository.findMany({
                providerId: actualProviderId,
              });

            // Step 3: Extract IDs of models that need to be archived
            const dbIdsToArchive: string[] = [];
            for (const existingModel of existingModels) {
              const config = existingModel.config as {
                modelId?: string;
              } | null;
              const modelId = config?.modelId ?? existingModel.displayName;

              if (
                modelIdsToArchive.has(modelId) &&
                existingModel.status === "active"
              ) {
                dbIdsToArchive.push(existingModel.id);
              }
            }

            // Step 4: Perform bulk archive operation using efficient SQL
            if (dbIdsToArchive.length > 0) {
              const archiveCount =
                await aiStudioRepository.AiModelRepository.bulkArchive(
                  dbIdsToArchive,
                );
              console.log(
                `[AI_PROVIDERS_ROUTER] Successfully archived ${archiveCount} models at ${new Date().toISOString()}`,
              );
              results.modelsArchived = archiveCount;
            }
          } catch (error) {
            console.error(
              `[AI_PROVIDERS_ROUTER] Error archiving models:`,
              error,
            );
            results.errors.push(
              `Failed to archive models: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }

        return {
          message: "Sync changes applied successfully",
          newModelsCount: results.newModelsCreated,
          updatedModelsCount: results.modelsUpdated,
          archivedModelsCount: results.modelsArchived,
          errors: results.errors,
        };
      } catch (error) {
        console.error("[AI_PROVIDERS_ROUTER] applySync:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply sync changes",
          cause: error,
        });
      }
    }),
} satisfies TRPCRouterRecord;
