import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { aiModel, aiProvider } from "@kdx/db/schema";

import { env } from "../../env";
import { AnthropicAdapter } from "./ai-sync-adapters/anthropic-adapter";
import { GoogleAdapter } from "./ai-sync-adapters/google-adapter";
import { OpenAIAdapter } from "./ai-sync-adapters/openai-adapter";

export interface ModelPricing {
  input: string;
  output: string;
  unit: "per_million_tokens";
}

export interface NormalizedModel {
  modelId: string;
  name: string;
  displayName?: string;
  maxTokens?: number;
  pricing?: ModelPricing;
  version?: string;
  description?: string;
  status?: "active" | "archived";
  databaseId?: string; // Optional database ID for existing models
}

export interface ModelSyncDiff {
  providerId: string;
  timestamp: Date;
  newModels: NormalizedModel[];
  updatedModels: {
    existing: NormalizedModel;
    updated: NormalizedModel;
  }[];
  archivedModels: NormalizedModel[];
}

export type SupportedProvider = "openai" | "google" | "anthropic";

export class AiModelSyncService {
  async syncWithProvider(
    providerId: SupportedProvider,
  ): Promise<ModelSyncDiff> {
    try {
      // 1. Find the actual provider ID from the database
      const provider = await db
        .select({ id: aiProvider.id })
        .from(aiProvider)
        .where(eq(aiProvider.name, providerId))
        .limit(1);

      if (!provider.length || !provider[0]) {
        throw new Error(
          `Provider '${providerId}' not found in database. Please create the provider first.`,
        );
      }

      const actualProviderId = provider[0].id;
      console.log(
        `[DEBUG] Found provider '${providerId}' with database ID: ${actualProviderId}`,
      );

      // 2. Invoke the appropriate adapter based on providerId
      const freshModels = await this.fetchFreshModels(providerId);

      // 3. Fetch existing models from the database for this provider
      const existingModels = await db
        .select({
          id: aiModel.id,
          providerId: aiModel.providerId,
          name: aiModel.displayName,
          enabled: aiModel.enabled,
          status: aiModel.status,
          config: aiModel.config,
          createdAt: aiModel.createdAt,
          updatedAt: aiModel.updatedAt,
        })
        .from(aiModel)
        .where(eq(aiModel.providerId, actualProviderId));

      // 4. Compare fresh data with existing data
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
    providerId: SupportedProvider,
  ): Promise<NormalizedModel[]> {
    switch (providerId) {
      case "openai": {
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("OPENAI_API_KEY is not configured");
        }
        const adapter = new OpenAIAdapter(apiKey);
        return adapter.fetchModels();
      }

      case "google": {
        const apiKey = env.GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error("GOOGLE_API_KEY is not configured");
        }
        const adapter = new GoogleAdapter(apiKey);
        return adapter.fetchModels();
      }

      case "anthropic": {
        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error("ANTHROPIC_API_KEY is not configured");
        }
        const adapter = new AnthropicAdapter(apiKey);
        return adapter.fetchModels();
      }

      default:
        throw new Error(`Unsupported provider: ${String(providerId)}`);
    }
  }

  private generateDiff(
    providerId: string,
    freshModels: NormalizedModel[],
    existingModels: {
      id: string;
      providerId: string;
      name: string;
      enabled: boolean;
      status: "active" | "archived";
      config: unknown;
      createdAt: Date;
      updatedAt: Date | null;
    }[],
  ): ModelSyncDiff {
    console.log(`[DEBUG] Starting sync diff for provider: ${providerId}`);
    console.log(`[DEBUG] Fresh models from API: ${freshModels.length}`);
    freshModels.forEach((model) => {
      console.log(`[DEBUG] Fresh model: ${model.modelId} (${model.name})`);
    });

    const freshModelMap = new Map(freshModels.map((m) => [m.modelId, m]));

    // Create a map using the model name as the key since there's no modelId field
    const existingModelMap = new Map<string, (typeof existingModels)[0]>();

    console.log(`[DEBUG] Existing models in DB: ${existingModels.length}`);
    // Parse the config to extract modelId
    for (const model of existingModels) {
      const config = model.config as {
        modelId?: string;
        version?: string;
      } | null;
      // Use modelId from config first (the actual unique identifier), then fallback to version, then name
      const modelId = config?.modelId ?? config?.version ?? model.name;
      console.log(
        `[DEBUG] Existing model: ${model.name} -> modelId: ${modelId}`,
      );
      existingModelMap.set(modelId, model);
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
        // This is a new model
        newModels.push(freshModel);
      } else {
        // Check if the model needs updating and merge new fields
        const existingConfig = existingModel.config as {
          modelId?: string;
          pricing?: ModelPricing;
          maxTokens?: number;
          version?: string;
          description?: string;
          displayName?: string;
          temperature?: number;
          [key: string]: any; // Allow other fields
        };

        // Check for explicit deprecation (adapter sets status to "archived")
        const hasStatusChange =
          freshModel.status === "archived" && existingModel.status === "active";

        // Create merged config with new fields from fresh model
        const mergedConfig = {
          ...existingConfig,
          modelId: existingConfig.modelId ?? freshModel.modelId, // Preserve existing modelId
          pricing: freshModel.pricing ?? existingConfig.pricing,
          maxTokens: freshModel.maxTokens ?? existingConfig.maxTokens,
          version: freshModel.version ?? existingConfig.version,
          description: freshModel.description ?? existingConfig.description,
          displayName: freshModel.displayName ?? existingConfig.displayName,
        };

        // Add any new fields from fresh model that don't exist in existing config
        Object.keys(freshModel).forEach((key) => {
          if (
            key !== "modelId" &&
            key !== "name" &&
            key !== "status" &&
            key !== "databaseId"
          ) {
            const freshValue = (freshModel as any)[key];
            if (freshValue !== undefined && !(key in existingConfig)) {
              (mergedConfig as any)[key] = freshValue;
            }
          }
        });

        // Check if there are actual changes to apply
        const needsUpdate =
          freshModel.name !== existingModel.name ||
          JSON.stringify(mergedConfig.pricing) !==
            JSON.stringify(existingConfig.pricing) ||
          mergedConfig.maxTokens !== existingConfig.maxTokens ||
          mergedConfig.version !== existingConfig.version ||
          mergedConfig.description !== existingConfig.description ||
          mergedConfig.displayName !== existingConfig.displayName ||
          hasStatusChange ||
          JSON.stringify(mergedConfig) !== JSON.stringify(existingConfig);

        if (needsUpdate) {
          console.log(`[DEBUG] Merging model ${freshModel.modelId}:`);
          console.log(`[DEBUG] - Existing config:`, existingConfig);
          console.log(`[DEBUG] - Fresh model:`, freshModel);
          console.log(`[DEBUG] - Merged config:`, mergedConfig);

          updatedModels.push({
            existing: {
              modelId: existingConfig.modelId ?? existingModel.name,
              name: existingModel.name,
              displayName: existingConfig.displayName ?? existingModel.name,
              pricing: existingConfig.pricing
                ? {
                    input: String(existingConfig.pricing.input),
                    output: String(existingConfig.pricing.output),
                    unit: "per_million_tokens" as const,
                  }
                : undefined,
              maxTokens: existingConfig.maxTokens,
              version: existingConfig.version,
              description: existingConfig.description,
              status: existingModel.status,
              databaseId: existingModel.id, // Add database ID for updates
            },
            updated: {
              ...freshModel,
              // Use merged config values for the update
              pricing: mergedConfig.pricing,
              maxTokens: mergedConfig.maxTokens,
              version: mergedConfig.version,
              description: mergedConfig.description,
              displayName: mergedConfig.displayName,
            },
          });
        } else {
          console.log(
            `[DEBUG] No changes needed for model ${freshModel.modelId}`,
          );
        }
      }
    }

    // Find archived models (exist in DB but not in fresh data - implicit deprecation)
    for (const [modelId, existingModel] of existingModelMap) {
      if (!freshModelMap.has(modelId) && existingModel.status === "active") {
        const existingConfig = existingModel.config as {
          modelId?: string;
          pricing?: ModelPricing;
          maxTokens?: number;
          version?: string;
          description?: string;
          displayName?: string;
        };

        archivedModels.push({
          modelId: existingConfig.modelId ?? existingModel.name,
          name: existingModel.name,
          displayName: existingConfig.displayName ?? existingModel.name,
          pricing: existingConfig.pricing
            ? {
                input: String(existingConfig.pricing.input),
                output: String(existingConfig.pricing.output),
                unit: "per_million_tokens" as const,
              }
            : undefined,
          maxTokens: existingConfig.maxTokens,
          version: existingConfig.version,
          description: existingConfig.description,
          status: "archived",
        });
      }
    }

    console.log(`[DEBUG] Sync results for ${providerId}:`);
    console.log(`[DEBUG] - New models: ${newModels.length}`);
    console.log(`[DEBUG] - Updated models: ${updatedModels.length}`);
    console.log(`[DEBUG] - Archived models: ${archivedModels.length}`);

    if (archivedModels.length > 0) {
      console.log(`[DEBUG] Models to be archived:`);
      archivedModels.forEach((model) => {
        console.log(`[DEBUG] - ${model.name} (${model.modelId})`);
      });
    }

    return {
      providerId,
      timestamp: new Date(),
      newModels,
      updatedModels,
      archivedModels,
    };
  }
}
