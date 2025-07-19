#!/usr/bin/env node

/**
 * Development Script: Sync Source Models
 * 
 * This script fetches model data from all supported providers and generates
 * a source-models.json file for development use. It replaces the need for
 * syncing models to a database during development.
 * 
 * Usage:
 *   npm run sync-models
 * 
 * Environment Variables Required:
 *   - OPENAI_API_KEY (optional)
 *   - GOOGLE_API_KEY (optional) 
 *   - ANTHROPIC_API_KEY (optional)
 *   - XAI_API_KEY (optional)
 * 
 * Output:
 *   - source-models.json (in the same directory)
 */

// Load environment variables FIRST, before any other imports
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Get the script directory to calculate repo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, "../../../../../../../");
const envPath = join(repoRoot, ".env");

const result = config({ path: envPath });
if (result.error) {
  console.error("❌ Failed to load .env:", result.error);
  process.exit(1);
}

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { env } from "../../../../env";
import { AnthropicAdapter } from "./providers/anthropic/anthropic-adapter.js";
import { GoogleAdapter } from "./providers/google/google-adapter.js";
import { XaiAdapter } from "./providers/xai/xai-adapter.js";
import { OpenAIAdapter } from "./providers/openai/openai-adapter.js";
import type { NormalizedModelAdapterOut } from "./types.js";

// Enhanced interfaces for source models output
export interface SourceModelPricing {
  unit: "per_million_tokens";
  input: string;
  output: string;
}

export interface SourceModel extends NormalizedModelAdapterOut {
  // SourceModel is now just an alias for NormalizedModelAdapterOut
  // All model data comes pre-processed from adapters
}

export interface SyncedModel extends SourceModel {
  pricing: SourceModelPricing;
}

export interface SyncedModelsOutput {
  generatedAt: string;
  totalModels: number;
  models: SyncedModel[];
}

export interface ProviderModelsOutput {
  generatedAt: string;
  provider: string;
  totalModels: number;
  models: NormalizedModelAdapterOut[];
}

export interface ModelSummary {
  modelId: string;
}

export interface ProviderModelsSummaryOutput {
  generatedAt: string;
  provider: string;
  totalModels: number;
  models: ModelSummary[];
}

interface SupportedProvider {
  name: string;
  baseUrl: string;
}

interface SupportedProvidersConfig {
  providers: SupportedProvider[];
}

interface SupportedModel {
  modelId: string;
  provider: string;
}

class SourceModelsSyncService {
  private readonly supportedProviders: SupportedProvider[];
  private readonly supportedModels: SupportedModel[];

  constructor() {
    // Ensure we're in development mode
    if (process.env.NODE_ENV === "production") {
      console.error("❌ This script is only intended for development use!");
      process.exit(1);
    }

    // Load supported providers
    const providersPath = join(__dirname, "..", "config", "supported-providers.json");
    try {
      const providersConfig = JSON.parse(
        readFileSync(providersPath, "utf-8")
      ) as SupportedProvidersConfig;
      this.supportedProviders = providersConfig.providers;
    } catch (error) {
      console.error("❌ Failed to load supported-providers.json:", error);
      process.exit(1);
    }

    // Load supported models
    const modelsPath = join(__dirname, "..", "config", "supported-models.json");
    try {
      this.supportedModels = JSON.parse(
        readFileSync(modelsPath, "utf-8")
      ) as SupportedModel[];
    } catch (error) {
      console.error("❌ Failed to load supported-models.json:", error);
      process.exit(1);
    }

    console.log(`📁 Output files will be written to: ${__dirname}`);
  }

  async run(): Promise<void> {
    console.log("🚀 Starting source models sync...");
    console.log(`📊 Found ${this.supportedProviders.length} supported providers`);
    
    let totalModelsProcessed = 0;
    const successfulProviders: string[] = [];

    for (const provider of this.supportedProviders) {
      console.log(`\n🔄 Processing provider: ${provider.name}`);
      
      try {
        const models = await this.fetchModelsForProvider(provider.name);
        
        if (models.length > 0) {
          const timestamp = new Date().toISOString();
          
          // Generate provider-specific full output
          const output: ProviderModelsOutput = {
            generatedAt: timestamp,
            provider: provider.name,
            totalModels: models.length,
            models: models,
          };

          // Generate provider-specific summary output
          const summaryModels: ModelSummary[] = models.map(model => ({
            modelId: model.modelId,
          }));

          const summaryOutput: ProviderModelsSummaryOutput = {
            generatedAt: timestamp,
            provider: provider.name,
            totalModels: models.length,
            models: summaryModels,
          };

          // Create provider subfolder
          const providerDir = join(__dirname, "providers", provider.name);
          try {
            mkdirSync(providerDir, { recursive: true });
          } catch (error) {
            console.error(`❌ Failed to create directory ${providerDir}:`, error);
            continue;
          }
          
          // Write full models file
          const outputPath = join(providerDir, `${provider.name}-models.json`);
          // Write summary models file (compact, single-line JSON)
          const summaryPath = join(providerDir, `${provider.name}-models-summary.json`);
          
          try {
            // Write full file with pretty formatting
            writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
            
            // Write summary file with one line per model
            const formatSummaryJson = (data: any) => {
              const { models, ...meta } = data;
              const metaStr = JSON.stringify(meta).slice(0, -1); // Remove closing brace
              const modelsStr = models.map((model: any) => '  ' + JSON.stringify(model)).join(',\n');
              return `${metaStr},"models":[\n${modelsStr}\n]}`;
            };
            const formattedSummary = formatSummaryJson(summaryOutput);
            writeFileSync(summaryPath, formattedSummary, "utf-8");
            
            console.log(`✅ Successfully wrote ${models.length} models to ${provider.name}/${provider.name}-models.json`);
            console.log(`✅ Successfully wrote ${models.length} model summaries to ${provider.name}/${provider.name}-models-summary.json`);
            successfulProviders.push(provider.name);
            totalModelsProcessed += models.length;
          } catch (error) {
            console.error(`❌ Failed to write ${provider.name} model files:`, error);
          }
        } else {
          console.log(`⚠️  No models returned from ${provider.name}`);
        }
      } catch (error) {
        console.warn(`⚠️  Skipped ${provider.name} due to error:`, error instanceof Error ? error.message : error);
        continue;
      }
    }

    // Generate synced-models.json with pricing for supported models only
    await this.generateSyncedModelsFile();

    console.log(`\n✅ Successfully processed ${totalModelsProcessed} total models`);
    console.log(`📈 Providers processed: ${successfulProviders.join(", ")}`);
  }

  private async fetchModelsForProvider(providerName: string): Promise<NormalizedModelAdapterOut[]> {
    switch (providerName.toLowerCase()) {
      case "openai":
        return this.fetchOpenAIModels();
      case "google":
        return this.fetchGoogleModels();
      case "anthropic":
        return this.fetchAnthropicModels();
      case "xai":
        return this.fetchXaiModels();
      default:
        console.warn(`⚠️  Unknown provider: ${providerName}`);
        return [];
    }
  }

  private getSupportedModelsForProvider(providerName: string): SupportedModel[] {
    return this.supportedModels.filter(model => 
      model.provider.toLowerCase() === providerName.toLowerCase()
    );
  }

  private async fetchOpenAIModels(): Promise<NormalizedModelAdapterOut[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️  OPENAI_API_KEY not found, skipping OpenAI");
      return [];
    }

    try {
      const adapter = new OpenAIAdapter(process.env.OPENAI_API_KEY);
      return await adapter.fetchModels();
    } catch (error) {
      console.error("❌ OpenAI fetch error:", error);
      throw error;
    }
  }

  private async fetchGoogleModels(): Promise<NormalizedModelAdapterOut[]> {
    if (!process.env.GOOGLE_API_KEY) {
      console.warn("⚠️  GOOGLE_API_KEY not found, skipping Google");
      return [];
    }

    try {
      const adapter = new GoogleAdapter(process.env.GOOGLE_API_KEY);
      return await adapter.fetchModels();
    } catch (error) {
      console.error("❌ Google fetch error:", error);
      throw error;
    }
  }

  private async fetchAnthropicModels(): Promise<NormalizedModelAdapterOut[]> {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️  ANTHROPIC_API_KEY not found, skipping Anthropic");
      return [];
    }

    try {
      const adapter = new AnthropicAdapter(process.env.ANTHROPIC_API_KEY);
      return await adapter.fetchModels();
    } catch (error) {
      console.error("❌ Anthropic fetch error:", error);
      throw error;
    }
  }


  private async fetchXaiModels(): Promise<NormalizedModelAdapterOut[]> {
    if (!process.env.XAI_API_KEY) {
      console.warn("⚠️  XAI_API_KEY not found, skipping xAI");
      return [];
    }

    try {
      const adapter = new XaiAdapter(process.env.XAI_API_KEY);
      return await adapter.fetchModels();
    } catch (error) {
      console.error("❌ xAI fetch error:", error);
      throw error;
    }
  }

  private async generateSyncedModelsFile(): Promise<void> {
    console.log("\n🔄 Generating synced-models.json with pricing for supported models...");
    
    const syncedModels: SyncedModel[] = [];
    
    // Collect all models from all providers
    const allProviderModels: NormalizedModelAdapterOut[] = [];
    
    for (const provider of this.supportedProviders) {
      try {
        const models = await this.fetchModelsForProvider(provider.name);
        allProviderModels.push(...models);
      } catch (error) {
        console.warn(`⚠️  Failed to fetch models from ${provider.name} for synced file:`, error instanceof Error ? error.message : error);
      }
    }
    
    // Filter to only supported models and add pricing
    for (const supportedModel of this.supportedModels) {
      const foundModel = allProviderModels.find(m => m.modelId === supportedModel.modelId);
      
      if (foundModel) {
        // Get pricing based on provider
        const pricing = this.getPricingForModel(foundModel.modelId, foundModel.provider);
        
        const syncedModel: SyncedModel = {
          ...foundModel,
          pricing
        };
        
        syncedModels.push(syncedModel);
      } else {
        console.warn(`⚠️  Supported model not found in provider responses: ${supportedModel.modelId}`);
      }
    }
    
    // Create synced-models.json
    const syncedOutput: SyncedModelsOutput = {
      generatedAt: new Date().toISOString(),
      totalModels: syncedModels.length,
      models: syncedModels
    };
    
    const syncedPath = join(__dirname, "..", "synced-models.json");
    try {
      writeFileSync(syncedPath, JSON.stringify(syncedOutput, null, 2), "utf-8");
      console.log(`✅ Successfully created synced-models.json with ${syncedModels.length} models`);
    } catch (error) {
      console.error("❌ Failed to write synced-models.json:", error);
    }
  }
  
  private getPricingForModel(modelId: string, provider: string): SourceModelPricing {
    try {
      // Load pricing data from provider's JSON file
      const pricingPath = join(__dirname, "providers", provider, `${provider}-pricing.json`);
      
      if (!existsSync(pricingPath)) {
        console.warn(`⚠️  Pricing file not found for ${provider}: ${pricingPath}`);
        return this.getDefaultPricing();
      }
      
      const pricingData = JSON.parse(readFileSync(pricingPath, "utf-8")) as {
        modelId: string;
        pricing: {
          input: string;
          output: string;
          unit: "per_million_tokens";
        };
      }[];
      
      // Find exact model match only
      const modelPricing = pricingData.find(p => p.modelId === modelId);
      
      if (modelPricing) {
        return {
          unit: "per_million_tokens",
          input: modelPricing.pricing.input,
          output: modelPricing.pricing.output
        };
      } else {
        console.warn(`⚠️  No pricing found for model ${modelId} in ${provider}. Using default pricing.`);
        console.warn(`💡 Please add exact pricing for "${modelId}" in ${provider}/${provider}-pricing.json`);
        return this.getDefaultPricing();
      }
    } catch (error) {
      console.error(`❌ Error loading pricing for ${provider}/${modelId}:`, error);
      return this.getDefaultPricing();
    }
  }
  
  private getDefaultPricing(): SourceModelPricing {
    console.warn("⚠️  Using fallback pricing - model should have explicit pricing configured");
    return {
      unit: "per_million_tokens",
      input: "1.00",
      output: "3.00"
    };
  }
}

// Run the script
async function main() {
  const service = new SourceModelsSyncService();
  
  try {
    await service.run();
    console.log("\n🎉 Source models sync completed successfully!");
  } catch (error) {
    console.error("\n❌ Source models sync failed:", error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || 
    process.argv[1]?.endsWith('sync-source-models.dev.js')) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { SourceModelsSyncService };