import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import type { NormalizedModel } from "../ai-model-sync.service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface GoogleModel {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  state?: string; // Google models may have a state field (e.g., "ACTIVE", "DEPRECATED")
}

export interface GoogleModelsResponse {
  models: GoogleModel[];
}

interface PricingData {
  modelId: string;
  pricing: {
    input: string;
    output: string;
    unit: "per_million_tokens";
  };
}

export class GoogleAdapter {
  private readonly apiKey: string;
  private readonly apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchModels(): Promise<NormalizedModel[]> {
    try {
      // 1. Call GET /v1beta/models endpoint
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Google API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as GoogleModelsResponse;

      // 2. Load pricing data from google-pricing.json
      const pricingPath = join(__dirname, "google-pricing.json");
      const pricingData = JSON.parse(
        readFileSync(pricingPath, "utf-8"),
      ) as PricingData[];

      // Create a map for quick pricing lookup
      const pricingMap = new Map(
        pricingData.map((p) => [p.modelId, p.pricing]),
      );

      // 3. Filter to LLM models only (exclude embeddings and legacy versions)
      const llmModels = data.models.filter((model) => {
        const modelId = model.name.replace("models/", "");
        return this.isLLMModel(modelId);
      });

      // 4. Normalize filtered LLM models (with pricing when available)
      const normalizedModels: NormalizedModel[] = llmModels.map((model) => {
        const modelId = model.name.replace("models/", "");
        const pricing = pricingMap.get(modelId); // undefined if no pricing

        // Check for explicit deprecation (Google may set state to "DEPRECATED")
        const status = model.state === "DEPRECATED" ? "archived" : "active";

        return {
          modelId,
          name: model.displayName,
          displayName: model.displayName,
          description: model.description,
          pricing, // This will be undefined for models without pricing
          version: model.version,
          // Google provides token limits in the API response
          maxTokens: Math.max(
            model.inputTokenLimit || 0,
            model.outputTokenLimit || 0,
          ),
          status: status,
        };
      });

      return normalizedModels;
    } catch (error) {
      console.error("[GoogleAdapter] Error fetching models:", error);
      throw error;
    }
  }

  private isLLMModel(modelId: string): boolean {
    const id = modelId.toLowerCase();

    // EXCLUDE: Embedding models
    if (id.includes("embedding")) return false;
    if (id.includes("gecko")) return false;

    // EXCLUDE: Vision/Image models (multimodal)
    if (id.includes("vision")) return false;
    if (id.includes("image-generation")) return false;

    // EXCLUDE: TTS/Audio models
    if (id.includes("tts")) return false;

    // EXCLUDE: Legacy/old versions (keep only latest and current)
    if (id.includes("-001") && !id.includes("latest")) return false;
    if (id.includes("-002") && !id.includes("latest")) return false;

    // EXCLUDE: Experimental models that are too unstable or specialized
    if (id === "learnlm-2.0-flash-experimental") return false;
    if (id.includes("thinking")) return false; // Thinking models are experimental

    // EXCLUDE: Gemma models (these are smaller/different model family, not main Gemini LLMs)
    if (id.includes("gemma")) return false;

    // EXCLUDE: Specialized models
    if (id === "aqa") return false; // Attributed Question Answering is specialized

    return true; // Keep only core Gemini text LLMs
  }
}
