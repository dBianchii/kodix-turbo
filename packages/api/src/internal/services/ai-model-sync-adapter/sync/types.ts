/**
 * Standardized interface for AI model adapters
 * 
 * This interface defines the complete structure that all adapters must return.
 * All fields are optional except for the core identification fields.
 * If a provider's API doesn't expose certain information, the adapter should 
 * return undefined rather than inferring or guessing values.
 */

export interface NormalizedModelAdapterOut {
  // Core identification (required)
  modelId: string;
  name: string;
  displayName: string;
  provider: "openai" | "google" | "anthropic" | "xai";
  status: "active" | "archived";

  // Basic info (optional)
  description?: string;
  version?: string;
  maxTokens?: number;
  contextWindow?: number;

  // Model characteristics (optional - only if provider API exposes them)
  modelFamily?: string;
  modelType?: "text" | "multimodal" | "reasoning" | "vision" | "embedding";
  modalities?: string[];
  
  // Training/release info (optional - only if provider API exposes them)
  trainingDataCutoff?: string;
  releaseDate?: string;
  
  // Capabilities (optional - only if provider API exposes them)
  inputFormat?: string[];
  outputFormat?: string[];
  responseFormat?: string[];
  toolsSupported?: string[];

  // Pricing (optional - loaded from provider pricing files)
  pricing?: {
    input: string;
    output: string;
    unit: "per_million_tokens";
  };

  // Allow additional fields that providers might expose
  [key: string]: unknown;
}

export interface ProviderAdapter {
  fetchModels(): Promise<NormalizedModelAdapterOut[]>;
}