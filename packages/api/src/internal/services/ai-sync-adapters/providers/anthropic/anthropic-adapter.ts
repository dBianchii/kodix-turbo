import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import type { NormalizedModel } from "../../../ai-model-sync.service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AnthropicModel {
  id: string;
  display_name: string;
  created_at: string;
  type: "model";
  status?: string; // Anthropic models may have a status field
}

export interface AnthropicModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

interface PricingData {
  modelId: string;
  pricing: {
    input: string;
    output: string;
    unit: "per_million_tokens";
  };
}

export class AnthropicAdapter {
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.anthropic.com/v1/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchModels(): Promise<NormalizedModel[]> {
    try {
      // 1. Call GET /v1/models endpoint
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Anthropic API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as AnthropicModelsResponse;

      // 2. Load pricing data from anthropic-pricing.json
      const pricingPath = join(__dirname, "anthropic-pricing.json");
      let pricingData: PricingData[] = [];

      if (!existsSync(pricingPath)) {
        console.warn(
          "⚠️  Anthropic pricing file not found, creating default pricing file",
        );
        pricingData = this.createDefaultPricingData();
        // Ensure directory exists
        mkdirSync(__dirname, { recursive: true });
        writeFileSync(
          pricingPath,
          JSON.stringify(pricingData, null, 2),
          "utf-8",
        );
        console.log("✅ Created default anthropic-pricing.json");
      } else {
        pricingData = JSON.parse(
          readFileSync(pricingPath, "utf-8"),
        ) as PricingData[];
      }

      // Create a map for quick pricing lookup
      const pricingMap = new Map(
        pricingData.map((p) => [p.modelId, p.pricing]),
      );

      // 3. Normalize ALL models (with pricing when available)
      const normalizedModels: NormalizedModel[] = data.data.map((model) => {
        const pricing = pricingMap.get(model.id); // undefined if no pricing

        // Extract version from model ID if present
        const versionMatch = /(\d+(?:\.\d+)?)/.exec(model.id);
        const version = versionMatch ? versionMatch[0] : undefined;

        // Check for explicit deprecation (Anthropic may set status to indicate deprecation)
        const status =
          model.status === "deprecated" || model.status === "inactive"
            ? "archived"
            : "active";

        return {
          modelId: model.id,
          name: model.display_name,
          displayName: model.display_name,
          pricing, // This will be undefined for models without pricing
          version,
          // Anthropic models generally support 200k tokens
          maxTokens: this.getMaxTokensForModel(model.id),
          status: status,
        };
      });

      return normalizedModels;
    } catch (error) {
      console.error("[AnthropicAdapter] Error fetching models:", error);
      throw error;
    }
  }

  private getMaxTokensForModel(modelId: string): number {
    // Most Claude models support 200k tokens
    // This can be updated as new models are released
    if (modelId.includes("claude-3")) {
      return 200000;
    }
    // Default for newer models
    return 200000;
  }

  private createDefaultPricingData(): PricingData[] {
    // Load supported models to create pricing for all Anthropic models
    const supportedModelsPath = join(__dirname, "..", "supported-models.json");
    let supportedModels: { modelId: string; releaseDate: string }[] = [];

    try {
      supportedModels = JSON.parse(readFileSync(supportedModelsPath, "utf-8"));
    } catch (error) {
      console.warn(
        "⚠️  Could not load supported-models.json, using basic pricing",
      );
    }

    // Filter for Anthropic models
    const anthropicModels = supportedModels.filter((model) => {
      const id = model.modelId.toLowerCase();
      return id.includes("claude");
    });

    // Create pricing for all supported Anthropic models
    return anthropicModels.map((model) => {
      const id = model.modelId.toLowerCase();

      // Default pricing based on model type
      let input = "3.00";
      let output = "15.00";

      if (id.includes("claude-opus-4") || id.includes("claude-3-opus")) {
        input = "15.00";
        output = "75.00";
      } else if (
        id.includes("claude-sonnet-4") ||
        id.includes("claude-3-5-sonnet") ||
        id.includes("claude-3-sonnet")
      ) {
        input = "3.00";
        output = "15.00";
      } else if (
        id.includes("claude-3-5-haiku") ||
        id.includes("claude-3-haiku")
      ) {
        input = "0.25";
        output = "1.25";
      }

      return {
        modelId: model.modelId,
        pricing: {
          input,
          output,
          unit: "per_million_tokens" as const,
        },
      };
    });
  }
}
