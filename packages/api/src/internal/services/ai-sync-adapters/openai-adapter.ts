import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import type { NormalizedModel } from "../ai-model-sync.service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  active?: boolean; // Some models may have an active flag
}

export interface OpenAIModelsResponse {
  object: string;
  data: OpenAIModel[];
}

interface PricingData {
  modelId: string;
  pricing: {
    input: string;
    output: string;
    unit: "per_million_tokens";
  };
}

export class OpenAIAdapter {
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.openai.com/v1/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchModels(): Promise<NormalizedModel[]> {
    try {
      // 1. Call GET /v1/models endpoint
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as OpenAIModelsResponse;

      // 2. Load pricing data from openai-pricing.json
      const pricingPath = join(__dirname, "openai-pricing.json");
      const pricingData = JSON.parse(
        readFileSync(pricingPath, "utf-8"),
      ) as PricingData[];

      // Create a map for quick pricing lookup
      const pricingMap = new Map(
        pricingData.map((p) => [p.modelId, p.pricing]),
      );

      // 3. Filter to LLM models only (exclude image, audio, embeddings, etc.)
      const llmModels = data.data.filter((model) => this.isLLMModel(model.id));

      // 4. Normalize filtered LLM models (with pricing when available)
      const normalizedModels: NormalizedModel[] = llmModels.map((model) => {
        const pricing = pricingMap.get(model.id); // undefined if no pricing

        // Extract display name from model ID
        const displayName = model.id
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Check for explicit deprecation (OpenAI may set active: false)
        const status = model.active === false ? "archived" : "active";

        return {
          modelId: model.id,
          name: displayName,
          displayName,
          pricing, // This will be undefined for models without pricing
          maxTokens: this.getMaxTokensForModel(model.id),
          status: status,
        };
      });

      return normalizedModels;
    } catch (error) {
      console.error("[OpenAIAdapter] Error fetching models:", error);
      throw error;
    }
  }

  private isLLMModel(modelId: string): boolean {
    const id = modelId.toLowerCase();

    // EXCLUDE: Non-LLM models
    if (id.includes("dall-e")) return false;
    if (id.includes("tts")) return false;
    if (id.includes("whisper")) return false;
    if (id.includes("embedding")) return false;
    if (id.includes("moderation")) return false;
    if (id.includes("davinci-002")) return false; // Legacy completion model
    if (id.includes("babbage-002")) return false; // Legacy completion model
    if (id.includes("codex")) return false; // Deprecated
    if (id.includes("gpt-image")) return false; // Image model

    // EXCLUDE: Old/deprecated LLM versions
    if (id === "gpt-4-0613") return false; // Old GPT-4
    if (id === "gpt-3.5-turbo-instruct-0914") return false; // Old instruct
    if (id === "gpt-3.5-turbo-1106") return false; // Old 3.5
    if (id === "gpt-3.5-turbo-16k") return false; // Legacy 16k
    if (id === "gpt-4-1106-preview") return false; // Old preview
    if (id === "gpt-4-0125-preview") return false; // Old preview
    if (id === "gpt-4-turbo-preview") return false; // Old preview
    if (id === "gpt-4-turbo-2024-04-09") return false; // Specific old date
    if (id === "gpt-4o-2024-05-13") return false; // Old 4o version
    if (id === "o1-preview-2024-09-12") return false; // Old o1 preview
    if (id === "o1-mini-2024-09-12") return false; // Old o1 mini

    // EXCLUDE: Experimental/preview models that aren't stable
    if (id.includes("realtime")) return false; // Audio/realtime
    if (id.includes("audio")) return false; // Audio models
    if (id.includes("transcribe")) return false; // Transcription
    if (id.includes("search-preview")) return false; // Search preview (experimental)

    return true; // Keep everything else (LLM models)
  }

  private getMaxTokensForModel(modelId: string): number | undefined {
    // Known token limits for OpenAI models
    const tokenLimits: Record<string, number> = {
      "gpt-4o": 128000,
      "gpt-4o-mini": 128000,
      "gpt-4.1-turbo": 1050000,
      "gpt-4-turbo": 128000,
      "gpt-4": 8192,
      "gpt-3.5-turbo": 16385,
    };

    return tokenLimits[modelId];
  }
}
