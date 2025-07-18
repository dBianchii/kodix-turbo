import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { and, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { aiModel, aiProvider } from "@kdx/db/schema";


export interface NormalizedModel {
  modelId: string;
  name: string;
  maxTokens?: number;
  pricing?: {
    input: string;
    output: string;
    unit: "per_million_tokens";
  };
  version?: string;
  description?: string;
  status?: "active" | "archived";
  databaseId?: string;
  originalData?: any; // Preserve the complete JSON from synced-models.json
}

export interface ModelSyncDiff {
  providerId: string;
  timestamp: Date;
  newModels: any[]; // Direct originalData objects
  updatedModels: {
    existing: NormalizedModel;
    updated: any; // Direct originalData object
  }[];
  archivedModels: NormalizedModel[];
}

interface SupportedProviderConfig {
  name: string; // Database name (e.g., "OpenAI")
  base_url: string; // API URL
  sync_name: string; // Lowercase name used in synced-models.json (e.g., "openai")
}

interface SupportedProvidersData {
  providers: SupportedProviderConfig[];
}

export class AiModelSyncService {
  private getSupportedProviders(): SupportedProvidersData {
    const currentFileDir = dirname(fileURLToPath(import.meta.url));
    const supportedProvidersPath = join(
      currentFileDir,
      "ai-model-sync-adapter",
      "config",
      "supported-providers.json",
    );

    if (!existsSync(supportedProvidersPath)) {
      throw new Error(
        `supported-providers.json not found at ${supportedProvidersPath}. This file is required for provider validation.`,
      );
    }

    return JSON.parse(readFileSync(supportedProvidersPath, "utf-8"));
  }

  private findProviderBySync(syncName: string): SupportedProviderConfig | null {
    const supportedProviders = this.getSupportedProviders();
    return (
      supportedProviders.providers.find((p) => p.sync_name === syncName) || null
    );
  }

  async syncWithProvider(providerId: string): Promise<ModelSyncDiff> {
    try {
      // 1. Validate provider against supported-providers.json
      const providerConfig = this.findProviderBySync(providerId);
      if (!providerConfig) {
        const supportedProviders = this.getSupportedProviders();
        const supportedSyncNames = supportedProviders.providers.map(
          (p) => p.sync_name,
        );
        throw new Error(
          `Unsupported provider: ${providerId}. Supported providers: ${supportedSyncNames.join(", ")}`,
        );
      }

      // 2. Find the actual provider ID from the database
      const dbProviderName = providerConfig.name;

      const provider = await db
        .select({ id: aiProvider.id })
        .from(aiProvider)
        .where(eq(aiProvider.name, dbProviderName))
        .limit(1);

      if (!provider.length || !provider[0]) {
        throw new Error(
          `Provider '${providerId}' not found in database. Please create the provider first.`,
        );
      }

      const actualProviderId = provider[0].id;

      // 3. Load models from synced-models.json (pre-approved Kodix data)
      const freshModels = await this.fetchFreshModels(providerId);

      // 4. Fetch existing models from the database for this provider
      const existingModels = await db
        .select({
          modelId: aiModel.modelId,
          providerId: aiModel.providerId,
          name: aiModel.modelId,
          enabled: aiModel.enabled,
          status: aiModel.status,
          config: aiModel.config,
          createdAt: aiModel.createdAt,
          updatedAt: aiModel.updatedAt,
        })
        .from(aiModel)
        .where(eq(aiModel.providerId, actualProviderId));

      // 5. Compare fresh data with existing data
      const diff = this.generateDiff(
        actualProviderId,
        freshModels,
        existingModels,
      );

      return diff;
    } catch (error) {
      console.error(
        `[AiModelSyncService] Error syncing provider ${providerId}:`,
        error,
      );
      throw error;
    }
  }

  private async fetchFreshModels(
    providerId: string,
  ): Promise<NormalizedModel[]> {
    try {
      // Read from synced-models.json - the single source of truth for Kodix
      // Use import.meta.url to get the correct path relative to this file
      const currentFileDir = dirname(fileURLToPath(import.meta.url));
      const syncedModelsPath = join(
        currentFileDir,
        "ai-model-sync-adapter",
        "synced-models.json",
      );

      if (!existsSync(syncedModelsPath)) {
        throw new Error(
          `synced-models.json not found at ${syncedModelsPath}. This file is required for model synchronization.`,
        );
      }

      const syncedModelsData = JSON.parse(
        readFileSync(syncedModelsPath, "utf-8"),
      );

      if (!syncedModelsData.models || !Array.isArray(syncedModelsData.models)) {
        throw new Error(
          `Invalid synced-models.json format. Expected 'models' array.`,
        );
      }

      // Filter models by provider
      const providerModels = syncedModelsData.models.filter(
        (model: any) => model.provider === providerId,
      );

      // Convert to NormalizedModel format with originalData
      const normalizedModels: NormalizedModel[] = providerModels.map(
        (model: any) => ({
          modelId: model.modelId,
          name: model.name,
          maxTokens: model.maxTokens,
          pricing: model.pricing
            ? {
                input: String(model.pricing.input),
                output: String(model.pricing.output),
                unit: "per_million_tokens" as const,
              }
            : undefined,
          version: model.version,
          description: model.description,
          status: model.status || "active",
          originalData: model, // Preserve the complete JSON from synced-models.json
        }),
      );

      console.log(
        `[AiModelSyncService] Loaded ${normalizedModels.length} models for ${providerId} from synced-models.json (pre-approved Kodix data)`,
      );
      return normalizedModels;
    } catch (error) {
      console.error(
        `[AiModelSyncService] Error reading synced-models.json for ${providerId}:`,
        error,
      );
      throw new Error(
        `Failed to load models for ${providerId} from synced-models.json. This is the only approved source for model data in Kodix. ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }


  private generateDiff(
    providerId: string,
    freshModels: NormalizedModel[],
    existingModels: {
      modelId: string;
      providerId: string;
      name: string;
      enabled: boolean;
      status: "active" | "archived";
      config: unknown;
      createdAt: Date;
      updatedAt: Date | null;
    }[],
  ): ModelSyncDiff {
    const freshModelMap = new Map(freshModels.map((m) => [m.modelId, m]));

    // Create a map using the modelId as the key (the actual unique identifier)
    const existingModelMap = new Map<string, (typeof existingModels)[0]>();

    // Use modelId for mapping
    for (const model of existingModels) {
      existingModelMap.set(model.modelId, model);
    }

    const newModels: NormalizedModel[] = [];
    const updatedModels: {
      existing: NormalizedModel;
      updated: NormalizedModel;
    }[] = [];
    const archivedModels: NormalizedModel[] = [];

    // ---------- Kodix rule: keep only latest version active ----------
    // Group models by a base key (providerId + simplified name) and mark
    // all but the newest as archived so that the diff logic will move them
    // to "archivedModels" during applySync.
    const clusters = new Map<string, NormalizedModel[]>();

    const baseKey = (m: NormalizedModel) => {
      // Remove any parentheses suffix such as "(Old)" or "(New)" and lowercase
      return `${providerId}:${m.name.replace(/\s*\(.*?\)/, "").toLowerCase()}`;
    };

    freshModels.forEach((m) => {
      const key = baseKey(m);
      const list = clusters.get(key) ?? [];
      list.push(m);
      clusters.set(key, list);
    });

    // Helper to extract a sortable version token (date at end of modelId or numeric version)
    const getVersionScore = (m: NormalizedModel) => {
      // Try YYYYMMDD at the end of modelId
      const dateMatch = /(\d{8})$/.exec(m.modelId);
      if (dateMatch?.[1]) return Number(dateMatch[1]);
      // Fallback: numeric version field if present
      if (m.version && !isNaN(Number(m.version))) return Number(m.version);
      // As last resort, use 0 so item will be treated as older
      return 0;
    };

    clusters.forEach((models) => {
      if (models.length <= 1) return;

      // Sort descending by version score – newest first
      models.sort((a, b) => getVersionScore(b) - getVersionScore(a));

      // Keep first (newest) status as-is; mark others archived
      for (let i = 1; i < models.length; i++) {
        models[i]!.status = "archived";
      }
    });
    // ---------- End Kodix rule --------------------------------------

    // Find new and updated models
    for (const [modelId, freshModel] of freshModelMap) {
      const existingModel = existingModelMap.get(modelId);

      if (!existingModel) {
        // This is a new model - use originalData to preserve exact JSON key order
        newModels.push(freshModel.originalData);
      } else {
        // Check if the model has been updated - simple comparison using originalData
        const needsUpdate = JSON.stringify(existingModel.config) !== JSON.stringify(freshModel.originalData);

        if (needsUpdate) {
          updatedModels.push({
            existing: {
              modelId: existingModel.modelId,
              name: existingModel.name,
              status: existingModel.status,
              databaseId: existingModel.modelId,
            },
            updated: freshModel.originalData,
          });
        }
      }
    }

    // Find archived models (exist in DB but not in fresh data - implicit deprecation)
    for (const [modelId, existingModel] of existingModelMap) {
      if (!freshModelMap.has(modelId) && existingModel.status === "active") {
        archivedModels.push({
          modelId: existingModel.modelId,
          name: existingModel.name,
          status: "archived",
        });
      }
    }

    console.log(`[AiModelSyncService] Sync results for ${providerId}:`);
    console.log(`[AiModelSyncService] - New models: ${newModels.length}`);
    console.log(
      `[AiModelSyncService] - Updated models: ${updatedModels.length}`,
    );
    console.log(
      `[AiModelSyncService] - Archived models: ${archivedModels.length}`,
    );

    return {
      providerId,
      timestamp: new Date(),
      newModels,
      updatedModels,
      archivedModels,
    };
  }

  async archiveModelsFromUnsupportedProviders(): Promise<{
    archivedCount: number;
    supportedProviders: string[];
  }> {
    try {
      const supportedProviders = this.getSupportedProviders();
      const supportedProviderNames = supportedProviders.providers.map(
        (p) => p.name,
      );

      console.log(
        `[AiModelSyncService] Supported providers: ${supportedProviderNames.join(", ")}`,
      );

      // Find all providers in database
      const allProviders = await db
        .select({ id: aiProvider.id, name: aiProvider.name })
        .from(aiProvider);

      // Find providers that are not in the supported list
      const unsupportedProviders = allProviders.filter(
        (provider) => !supportedProviderNames.includes(provider.name),
      );

      if (unsupportedProviders.length === 0) {
        console.log(
          `[AiModelSyncService] All providers in database are supported`,
        );
        return {
          archivedCount: 0,
          supportedProviders: supportedProviderNames,
        };
      }

      console.log(
        `[AiModelSyncService] Found ${unsupportedProviders.length} unsupported providers:`,
        unsupportedProviders.map((p) => p.name),
      );

      let totalArchivedCount = 0;

      // Archive models from unsupported providers
      for (const provider of unsupportedProviders) {
        const modelsToArchive = await db
          .select({ modelId: aiModel.modelId })
          .from(aiModel)
          .where(
            and(
              eq(aiModel.providerId, provider.id),
              eq(aiModel.status, "active"),
            ),
          );

        if (modelsToArchive.length > 0) {
          await db
            .update(aiModel)
            .set({ status: "archived", updatedAt: new Date() })
            .where(
              and(
                eq(aiModel.providerId, provider.id),
                eq(aiModel.status, "active"),
              ),
            );

          console.log(
            `[AiModelSyncService] Archived ${modelsToArchive.length} models from unsupported provider: ${provider.name}`,
          );
          totalArchivedCount += modelsToArchive.length;
        }
      }

      return {
        archivedCount: totalArchivedCount,
        supportedProviders: supportedProviderNames,
      };
    } catch (error) {
      console.error(
        `[AiModelSyncService] Error archiving models from unsupported providers:`,
        error,
      );
      throw error;
    }
  }

  async applySync(diff: ModelSyncDiff): Promise<{
    modelsProcessed: number;
    modelsCreated: number;
    modelsUpdated: number;
    modelsArchived: number;
    errors: string[];
  }> {
    const { providerId, newModels, updatedModels, archivedModels } = diff;

    console.log(
      `[AiModelSyncService] Applying sync for provider: ${providerId}`,
    );
    console.log(
      `[AiModelSyncService] - New models to create: ${newModels.length}`,
    );
    console.log(
      `[AiModelSyncService] - Models to update: ${updatedModels.length}`,
    );
    console.log(
      `[AiModelSyncService] - Models to archive: ${archivedModels.length}`,
    );

    const result = {
      modelsProcessed: 0,
      modelsCreated: 0,
      modelsUpdated: 0,
      modelsArchived: 0,
      errors: [] as string[],
    };

    // Apply new models
    for (const model of newModels) {
      try {
        await db.insert(aiModel).values({
          modelId: model.modelId, // Use the modelId as the primary key
          providerId,
          status: model.status || "active",
          enabled: model.status !== "archived",
          config: JSON.stringify(model), // Store as JSON string to preserve key order
          originalConfig: JSON.stringify(model),
        });
        result.modelsCreated++;
        result.modelsProcessed++;
      } catch (error) {
        result.errors.push(`Failed to create model ${model.modelId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Apply updates to existing models
    for (const { existing, updated } of updatedModels) {
      try {
        await db
          .update(aiModel)
          .set({
            status: updated.status || "active",
            enabled: updated.status !== "archived",
            config: JSON.stringify(updated), // Store as JSON string to preserve key order
            originalConfig: JSON.stringify(updated),
            updatedAt: new Date(),
          })
          .where(eq(aiModel.modelId, existing.databaseId!));
        result.modelsUpdated++;
        result.modelsProcessed++;
      } catch (error) {
        result.errors.push(`Failed to update model ${updated.modelId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Archive models that are no longer in the provider's list
    for (const model of archivedModels) {
      try {
        await db
          .update(aiModel)
          .set({
            status: "archived",
            enabled: false,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(aiModel.modelId, model.modelId),
              eq(aiModel.providerId, providerId),
            ),
          );
        result.modelsArchived++;
        result.modelsProcessed++;
      } catch (error) {
        result.errors.push(`Failed to archive model ${model.modelId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return result;
  }
}
