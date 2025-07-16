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
import { AnthropicAdapter } from "../providers/anthropic/anthropic-adapter.js";
import { GoogleAdapter } from "../providers/google/google-adapter.js";
import { XaiAdapter } from "../providers/xai/xai-adapter.js";
import { OpenAIAdapter } from "../providers/openai/openai-adapter.js";

// Enhanced interfaces for source models output
export interface SourceModelPricing {
  unit: "per_million_tokens";
  input: string;
  output: string;
}

export interface SourceModel {
  modelId: string;
  name: string;
  displayName: string;
  modelFamily?: string;
  provider: string;
  version?: string;
  maxTokens?: number;
  contextWindow?: number;
  status: "active" | "archived" | "deprecated";
  description?: string;
  modalities?: string[];
  trainingDataCutoff?: string;
  releaseDate?: string;
  modelType: "text" | "multimodal" | "reasoning" | "vision" | "embedding";
  inputFormat: string[];
  outputFormat: string[];
  responseFormat: string[];
  toolsSupported: string[];
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
  models: SourceModel[];
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
  base_url: string;
}

interface SupportedProvidersConfig {
  providers: SupportedProvider[];
}

interface SupportedModel {
  modelId: string;
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
    const providersPath = join(__dirname, "..", "supported-providers.json");
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
    const modelsPath = join(__dirname, "..", "supported-models.json");
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
          const providerDir = join(__dirname, "..", "providers", provider.name);
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

  private async fetchModelsForProvider(providerName: string): Promise<SourceModel[]> {
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
    const providerModels = this.supportedModels.filter(model => {
      const modelId = model.modelId.toLowerCase();
      switch (providerName.toLowerCase()) {
        case "openai":
          return modelId.includes("gpt") || modelId.includes("o1") || modelId.includes("o3") || modelId.includes("o4") || modelId.includes("chatgpt");
        case "google":
          return modelId.includes("gemini");
        case "anthropic":
          return modelId.includes("claude");
        case "xai":
          return modelId.includes("grok");
        default:
          return false;
      }
    });
    return providerModels;
  }

  private async fetchOpenAIModels(): Promise<SourceModel[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️  OPENAI_API_KEY not found, skipping OpenAI");
      return [];
    }

    try {
      const adapter = new OpenAIAdapter(process.env.OPENAI_API_KEY);
      const normalizedModels = await adapter.fetchModels();

      return normalizedModels.map((model) => ({
        modelId: model.modelId,
        name: model.name,
        displayName: model.displayName || model.name,
        modelFamily: this.inferModelFamily(model.modelId, "openai"),
        provider: "openai",
        version: model.version || "",
        maxTokens: model.maxTokens,
        contextWindow: model.maxTokens,
        status: model.status || "active",
        description: model.description || "",
        modalities: this.inferModalitiesFromModel(model.modelId, "openai"),
        trainingDataCutoff: this.inferTrainingCutoff(model.modelId, "openai"),
        releaseDate: this.inferReleaseDate(model.modelId, "openai"),
        modelType: this.inferModelType(model.modelId, "openai"),
        inputFormat: this.inferInputFormat(model.modelId, "openai"),
        outputFormat: this.inferOutputFormat(model.modelId, "openai"),
        responseFormat: this.inferResponseFormat(model.modelId, "openai"),
        toolsSupported: this.inferToolsSupported(model.modelId, "openai"),
      }));
    } catch (error) {
      console.error("❌ OpenAI fetch error:", error);
      throw error;
    }
  }

  private async fetchGoogleModels(): Promise<SourceModel[]> {
    if (!process.env.GOOGLE_API_KEY) {
      console.warn("⚠️  GOOGLE_API_KEY not found, skipping Google");
      return [];
    }

    try {
      const adapter = new GoogleAdapter(process.env.GOOGLE_API_KEY);
      const normalizedModels = await adapter.fetchModels();

      return normalizedModels.map((model) => ({
        modelId: model.modelId,
        name: model.name,
        displayName: model.displayName || model.name,
        modelFamily: this.inferModelFamily(model.modelId, "google"),
        provider: "google",
        version: model.version || "",
        maxTokens: model.maxTokens,
        contextWindow: model.maxTokens,
        status: model.status || "active",
        description: model.description || "",
        modalities: this.inferModalitiesFromModel(model.modelId, "google"),
        trainingDataCutoff: this.inferTrainingCutoff(model.modelId, "google"),
        releaseDate: this.inferReleaseDate(model.modelId, "google"),
        modelType: this.inferModelType(model.modelId, "google"),
        inputFormat: this.inferInputFormat(model.modelId, "google"),
        outputFormat: this.inferOutputFormat(model.modelId, "google"),
        responseFormat: this.inferResponseFormat(model.modelId, "google"),
        toolsSupported: this.inferToolsSupported(model.modelId, "google"),
      }));
    } catch (error) {
      console.error("❌ Google fetch error:", error);
      throw error;
    }
  }

  private async fetchAnthropicModels(): Promise<SourceModel[]> {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️  ANTHROPIC_API_KEY not found, skipping Anthropic");
      return [];
    }

    try {
      const adapter = new AnthropicAdapter(process.env.ANTHROPIC_API_KEY);
      const normalizedModels = await adapter.fetchModels();

      return normalizedModels.map((model) => ({
        modelId: model.modelId,
        name: model.name,
        displayName: model.displayName || model.name,
        modelFamily: this.inferModelFamily(model.modelId, "anthropic"),
        provider: "anthropic",
        version: model.version || "",
        maxTokens: model.maxTokens,
        contextWindow: model.maxTokens,
        status: model.status || "active",
        description: model.description || "",
        modalities: this.inferModalitiesFromModel(model.modelId, "anthropic"),
        trainingDataCutoff: this.inferTrainingCutoff(model.modelId, "anthropic"),
        releaseDate: this.inferReleaseDate(model.modelId, "anthropic"),
        modelType: this.inferModelType(model.modelId, "anthropic"),
        inputFormat: this.inferInputFormat(model.modelId, "anthropic"),
        outputFormat: this.inferOutputFormat(model.modelId, "anthropic"),
        responseFormat: this.inferResponseFormat(model.modelId, "anthropic"),
        toolsSupported: this.inferToolsSupported(model.modelId, "anthropic"),
      }));
    } catch (error) {
      console.error("❌ Anthropic fetch error:", error);
      throw error;
    }
  }


  private async fetchXaiModels(): Promise<SourceModel[]> {
    if (!process.env.XAI_API_KEY) {
      console.warn("⚠️  XAI_API_KEY not found, skipping xAI");
      return [];
    }

    try {
      const adapter = new XaiAdapter(process.env.XAI_API_KEY);
      const normalizedModels = await adapter.fetchModels();

      return normalizedModels.map((model) => ({
        modelId: model.modelId,
        name: model.name,
        displayName: model.displayName || model.name,
        modelFamily: this.inferModelFamily(model.modelId, "xai"),
        provider: "xai",
        version: model.version || "",
        maxTokens: model.maxTokens,
        contextWindow: model.maxTokens,
        status: model.status || "active",
        description: model.description || "",
        modalities: this.inferModalitiesFromModel(model.modelId, "xai"),
        trainingDataCutoff: this.inferTrainingCutoff(model.modelId, "xai"),
        releaseDate: this.inferReleaseDate(model.modelId, "xai"),
        modelType: this.inferModelType(model.modelId, "xai"),
        inputFormat: this.inferInputFormat(model.modelId, "xai"),
        outputFormat: this.inferOutputFormat(model.modelId, "xai"),
        responseFormat: this.inferResponseFormat(model.modelId, "xai"),
        toolsSupported: this.inferToolsSupported(model.modelId, "xai"),
      }));
    } catch (error) {
      console.error("❌ xAI fetch error:", error);
      throw error;
    }
  }

  private inferModalitiesFromModel(modelId: string, provider: string): string[] {
    const id = modelId.toLowerCase();
    const modalities: string[] = ["text"];

    // Provider-specific modality inference
    if (provider === "openai") {
      if (id.includes("gpt-4o") || id.includes("gpt-4-turbo")) {
        modalities.push("vision");
      }
      if (id.includes("o1")) {
        modalities.push("reasoning");
      }
    } else if (provider === "google") {
      if (id.includes("gemini")) {
        modalities.push("vision");
        if (id.includes("pro")) {
          modalities.push("multimodal");
        }
      }
    } else if (provider === "anthropic") {
      if (id.includes("claude-3")) {
        modalities.push("vision");
      }
    } else if (provider === "xai") {
      // Grok models can have vision capabilities
      if (id.includes("grok-4") || id.includes("grok-3")) {
        modalities.push("vision");
      }
    }

    return modalities;
  }

  private inferTrainingCutoff(modelId: string, provider: string): string {
    const id = modelId.toLowerCase();

    // Provider-specific training cutoff inference
    if (provider === "openai") {
      if (id.includes("2024-08")) return "2024-04";
      if (id.includes("2024-05")) return "2023-12";
      if (id.includes("gpt-4o")) return "2023-10";
      if (id.includes("gpt-4")) return "2023-04";
      if (id.includes("gpt-3.5")) return "2021-09";
    } else if (provider === "google") {
      if (id.includes("gemini-2.0")) return "2024-08";
      if (id.includes("gemini-1.5")) return "2024-04";
      if (id.includes("gemini-1.0")) return "2023-12";
    } else if (provider === "anthropic") {
      if (id.includes("claude-3-5")) return "2024-04";
      if (id.includes("claude-3")) return "2023-08";
      if (id.includes("claude-2")) return "2023-01";
    } else if (provider === "xai") {
      // Grok models have recent training data
      if (id.includes("grok-4")) return "2024-10";
      if (id.includes("grok-3")) return "2024-08";
      if (id.includes("grok-2")) return "2024-06";
      if (id.includes("grok-beta")) return "2024-12";
    }

    return "";
  }

  private inferModelFamily(modelId: string, provider: string): string {
    const id = modelId.toLowerCase();

    // Provider-specific model family inference
    if (provider === "openai") {
      if (id.includes("o1")) return "o1";
      if (id.includes("gpt-4o")) return "gpt-4o";
      if (id.includes("gpt-4")) return "gpt-4";
      if (id.includes("gpt-3.5")) return "gpt-3.5";
    } else if (provider === "google") {
      if (id.includes("gemini-2.0")) return "gemini-2.0";
      if (id.includes("gemini-1.5")) return "gemini-1.5";
      if (id.includes("gemini-1.0")) return "gemini-1.0";
      if (id.includes("gemini")) return "gemini";
    } else if (provider === "anthropic") {
      if (id.includes("claude-3-5")) return "claude-3.5";
      if (id.includes("claude-3")) return "claude-3";
      if (id.includes("claude-2")) return "claude-2";
      if (id.includes("claude")) return "claude";
    } else if (provider === "xai") {
      if (id.includes("grok-4")) return "grok-4";
      if (id.includes("grok-3")) return "grok-3";
      if (id.includes("grok-2")) return "grok-2";
      if (id.includes("grok-beta")) return "grok-beta";
      if (id.includes("grok")) return "grok";
    }

    return "";
  }

  private inferReleaseDate(modelId: string, provider: string): string {
    const id = modelId.toLowerCase();

    // Provider-specific release date inference
    if (provider === "openai") {
      if (id.includes("2025-04-16")) return "2025-04-16";
      if (id.includes("2025-04-14")) return "2025-04-14";
      if (id.includes("2025-03-19")) return "2025-03-19";
      if (id.includes("2025-02-27")) return "2025-02-27";
      if (id.includes("2025-01-31")) return "2025-01-31";
      if (id.includes("2024-12-17")) return "2024-12-17";
      if (id.includes("2024-11-20")) return "2024-11-20";
      if (id.includes("2024-08-06")) return "2024-08-06";
      if (id.includes("2024-07-18")) return "2024-07-18";
      if (id.includes("0125")) return "2024-01-25";
      if (id.includes("gpt-4o") && !id.includes("mini")) return "2024-05-13";
      if (id.includes("gpt-4o-mini")) return "2024-07-18";
      if (id.includes("gpt-4.1-mini")) return "2025-01-31";
      if (id.includes("gpt-4.1-nano")) return "2025-01-31";
      if (id.includes("gpt-4.1")) return "2025-01-31";
      if (id.includes("gpt-4-turbo")) return "2024-04-09";
      if (id.includes("o1-preview")) return "2024-09-12";
      if (id.includes("o1-mini")) return "2024-09-12";
    } else if (provider === "google") {
      if (id.includes("gemini-2.0")) return "2024-12-11";
      if (id.includes("gemini-1.5")) return "2024-02-15";
      if (id.includes("gemini-1.0")) return "2023-12-06";
    } else if (provider === "anthropic") {
      if (id.includes("20250514")) return "2025-05-14";
      if (id.includes("20250219")) return "2025-02-19";
      if (id.includes("20241022")) return "2024-10-22";
      if (id.includes("20240620")) return "2024-06-20";
      if (id.includes("20240307")) return "2024-03-07";
      if (id.includes("20240229")) return "2024-02-29";
    } else if (provider === "xai") {
      if (id.includes("grok-4-0709")) return "2024-07-09";
      if (id.includes("grok-4")) return "2024-12-01";
      if (id.includes("grok-beta")) return "2024-12-15";
      if (id.includes("grok-3")) return "2024-11-01";
      if (id.includes("grok-2")) return "2024-08-15";
    }

    return "";
  }

  private inferModelType(modelId: string, provider: string): "text" | "multimodal" | "reasoning" | "vision" | "embedding" {
    const id = modelId.toLowerCase();

    // Check for reasoning models first
    if (provider === "openai" && (id.includes("o1") || id.includes("o3") || id.includes("o4"))) {
      return "reasoning";
    }

    // Check for multimodal capabilities
    if (provider === "openai" && (id.includes("gpt-4o") || id.includes("gpt-4-turbo"))) {
      return "multimodal";
    }
    if (provider === "google" && id.includes("gemini")) {
      return "multimodal";
    }
    if (provider === "anthropic" && id.includes("claude-3")) {
      return "multimodal";
    }
    if (provider === "xai" && (id.includes("grok-4") || id.includes("grok-3"))) {
      return "multimodal";
    }

    // Check for embedding models
    if (id.includes("embedding") || id.includes("embed")) {
      return "embedding";
    }

    // Default to text
    return "text";
  }

  private inferInputFormat(modelId: string, provider: string): string[] {
    const id = modelId.toLowerCase();
    const formats = ["text"];

    // Add vision capabilities
    if (provider === "openai" && (id.includes("gpt-4o") || id.includes("gpt-4-turbo"))) {
      formats.push("image", "vision");
    }
    if (provider === "google" && id.includes("gemini")) {
      formats.push("image", "video", "audio");
    }
    if (provider === "anthropic" && id.includes("claude-3")) {
      formats.push("image", "vision");
    }
    if (provider === "xai" && (id.includes("grok-4") || id.includes("grok-3"))) {
      formats.push("image", "vision");
    }

    // Add code capabilities for reasoning models
    if (provider === "openai" && (id.includes("o1") || id.includes("o3") || id.includes("o4"))) {
      formats.push("code", "math");
    }

    return formats;
  }

  private inferOutputFormat(modelId: string, provider: string): string[] {
    const formats = ["text"];

    // All models support structured output
    formats.push("json", "structured");

    // Add streaming for modern models
    if (provider === "openai" || provider === "anthropic" || provider === "google" || provider === "xai") {
      formats.push("streaming");
    }

    return formats;
  }

  private inferResponseFormat(modelId: string, provider: string): string[] {
    const formats = ["text", "json"];

    // Provider-specific response formats
    if (provider === "openai") {
      formats.push("json_object", "structured_output");
    }
    if (provider === "anthropic") {
      formats.push("json_object");
    }
    if (provider === "google") {
      formats.push("json_object", "structured");
    }
    if (provider === "xai") {
      formats.push("json_object", "structured_output");
    }

    return formats;
  }

  private inferToolsSupported(modelId: string, provider: string): string[] {
    const id = modelId.toLowerCase();
    const tools: string[] = [];

    // Function calling support
    if (provider === "openai") {
      if (!id.includes("gpt-3.5-turbo-instruct")) {
        tools.push("function_calling", "tools");
      }
    }
    if (provider === "anthropic") {
      tools.push("function_calling", "tools");
    }
    if (provider === "google" && id.includes("gemini")) {
      tools.push("function_calling", "tools");
    }
    if (provider === "xai") {
      tools.push("function_calling", "tools", "web_search", "real_time_data");
    }

    // Code interpretation
    if (provider === "openai" && (id.includes("gpt-4") || id.includes("o1") || id.includes("o3") || id.includes("o4"))) {
      tools.push("code_interpreter");
    }
    if (provider === "xai" && (id.includes("grok-4") || id.includes("grok-3"))) {
      tools.push("code_interpreter");
    }

    // Web search / retrieval
    if (provider === "google" && id.includes("gemini")) {
      tools.push("web_search", "grounding");
    }
    if (provider === "xai") {
      tools.push("x_integration", "live_search");
    }

    // Vision capabilities
    if (provider === "openai" && (id.includes("gpt-4o") || id.includes("gpt-4-turbo"))) {
      tools.push("vision", "image_analysis");
    }
    if (provider === "anthropic" && id.includes("claude-3")) {
      tools.push("vision", "image_analysis");
    }
    if (provider === "google" && id.includes("gemini")) {
      tools.push("vision", "image_analysis", "video_analysis");
    }

    return tools;
  }

  private async generateSyncedModelsFile(): Promise<void> {
    console.log("\n🔄 Generating synced-models.json with pricing for supported models...");
    
    const syncedModels: SyncedModel[] = [];
    
    // Collect all models from all providers
    const allProviderModels: SourceModel[] = [];
    
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
      const pricingPath = join(__dirname, "..", "providers", provider, `${provider}-pricing.json`);
      
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
      
      // Find exact model match first
      let modelPricing = pricingData.find(p => p.modelId === modelId);
      
      // If no exact match, try pattern matching for the provider
      if (!modelPricing) {
        modelPricing = this.findModelByPattern(modelId, provider, pricingData);
      }
      
      if (modelPricing) {
        return {
          unit: "per_million_tokens",
          input: modelPricing.pricing.input,
          output: modelPricing.pricing.output
        };
      } else {
        console.warn(`⚠️  No pricing found for model ${modelId} in ${provider}`);
        return this.getDefaultPricing();
      }
    } catch (error) {
      console.error(`❌ Error loading pricing for ${provider}/${modelId}:`, error);
      return this.getDefaultPricing();
    }
  }
  
  private findModelByPattern(
    modelId: string, 
    provider: string, 
    pricingData: { modelId: string; pricing: { input: string; output: string; unit: "per_million_tokens"; }; }[]
  ): { modelId: string; pricing: { input: string; output: string; unit: "per_million_tokens"; }; } | undefined {
    const id = modelId.toLowerCase();
    
    // Provider-specific pattern matching logic
    if (provider === "openai") {
      // Try to match by model family patterns
      if (id.includes("gpt-4o") && !id.includes("mini")) {
        return pricingData.find(p => p.modelId === "gpt-4o");
      } else if (id.includes("gpt-4o-mini") || id.includes("gpt-4.1-mini") || id.includes("gpt-4.1-nano")) {
        return pricingData.find(p => p.modelId === "gpt-4.1-mini");
      } else if (id.includes("gpt-4-turbo") || id.includes("gpt-4.1")) {
        return pricingData.find(p => p.modelId === "gpt-4.1");
      } else if (id.includes("gpt-4")) {
        return pricingData.find(p => p.modelId === "gpt-4");
      } else if (id.includes("gpt-3.5")) {
        return pricingData.find(p => p.modelId === "gpt-3.5-turbo");
      } else if (id.includes("o1-pro") || (id.includes("o1") && !id.includes("mini"))) {
        return pricingData.find(p => p.modelId === "o1");
      } else if (id.includes("o1-mini") || id.includes("o3-mini") || id.includes("o4-mini")) {
        return pricingData.find(p => p.modelId === "o1-mini");
      } else if (id.includes("chatgpt")) {
        return pricingData.find(p => p.modelId === "chatgpt-4o-latest");
      }
    } else if (provider === "google") {
      // Google model pattern matching
      if (id.includes("gemini-2.5-pro")) {
        return pricingData.find(p => p.modelId === "gemini-2.5-pro");
      } else if (id.includes("gemini-2.5-flash")) {
        return pricingData.find(p => p.modelId === "gemini-2.5-flash");
      } else if (id.includes("gemini-2.0-pro")) {
        return pricingData.find(p => p.modelId === "gemini-2.0-pro-exp");
      } else if (id.includes("gemini-2.0-flash")) {
        return pricingData.find(p => p.modelId === "gemini-2.0-flash");
      } else if (id.includes("gemini-1.5-pro")) {
        return pricingData.find(p => p.modelId === "gemini-1.5-pro-latest");
      } else if (id.includes("gemini-1.5-flash")) {
        return pricingData.find(p => p.modelId === "gemini-1.5-flash-latest");
      }
    } else if (provider === "anthropic") {
      // Anthropic model pattern matching
      if (id.includes("claude-opus-4") || id.includes("claude-3-opus")) {
        return pricingData.find(p => p.modelId === "claude-opus-4-20250514");
      } else if (id.includes("claude-sonnet-4") || id.includes("claude-3-5-sonnet") || id.includes("claude-3-sonnet")) {
        return pricingData.find(p => p.modelId === "claude-sonnet-4-20250514");
      } else if (id.includes("claude-3-5-haiku") || id.includes("claude-3-haiku")) {
        return pricingData.find(p => p.modelId === "claude-3-5-haiku-20241022");
      }
    } else if (provider === "xai") {
      // xAI model pattern matching
      if (id.includes("grok-4-0709")) {
        return pricingData.find(p => p.modelId === "grok-4-0709");
      } else if (id.includes("grok-4") && !id.includes("beta")) {
        return pricingData.find(p => p.modelId === "grok-4");
      } else if (id.includes("grok-beta")) {
        return pricingData.find(p => p.modelId === "grok-beta");
      } else if (id.includes("grok-3")) {
        return pricingData.find(p => p.modelId === "grok-3");
      } else if (id.includes("grok-2")) {
        return pricingData.find(p => p.modelId === "grok-2");
      }
    }
    
    return undefined;
  }
  
  private getDefaultPricing(): SourceModelPricing {
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