import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import type { NormalizedModelAdapterOut } from "../types";

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

  async fetchModels(): Promise<NormalizedModelAdapterOut[]> {
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

      // 2. Filter to LLM models only (exclude image, audio, embeddings, etc.)
      const llmModels = data.data.filter((model) => this.isLLMModel(model.id));

      const normalizedModels: NormalizedModelAdapterOut[] = llmModels.map((model) => {
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
          provider: "openai",
          maxTokens: this.getMaxTokensForModel(model.id),
          contextWindow: this.getMaxTokensForModel(model.id),
          status: status,
          description: "",
          version: "",
          modelFamily: this.inferModelFamily(model.id),
          modelType: this.inferModelType(model.id),
          modalities: this.inferModalities(model.id),
          trainingDataCutoff: this.inferTrainingCutoff(model.id),
          releaseDate: this.inferReleaseDate(model.id),
          inputFormat: this.inferInputFormat(model.id),
          outputFormat: this.inferOutputFormat(model.id),
          responseFormat: this.inferResponseFormat(model.id),
          toolsSupported: this.inferToolsSupported(model.id),
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

  private inferModelFamily(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("o1")) return "o1";
    if (id.includes("gpt-4o")) return "gpt-4o";
    if (id.includes("gpt-4")) return "gpt-4";
    if (id.includes("gpt-3.5")) return "gpt-3.5";
    
    return undefined;
  }

  private inferModelType(modelId: string): "text" | "multimodal" | "reasoning" | "vision" | "embedding" | undefined {
    const id = modelId.toLowerCase();
    
    // Check for reasoning models first
    if (id.includes("o1") || id.includes("o3") || id.includes("o4")) {
      return "reasoning";
    }
    
    // Check for multimodal capabilities
    if (id.includes("gpt-4o") || id.includes("gpt-4-turbo")) {
      return "multimodal";
    }
    
    // Check for embedding models
    if (id.includes("embedding") || id.includes("embed")) {
      return "embedding";
    }
    
    // Default to text
    return "text";
  }

  private inferModalities(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const modalities: string[] = ["text"];
    
    if (id.includes("gpt-4o") || id.includes("gpt-4-turbo")) {
      modalities.push("vision");
    }
    if (id.includes("o1")) {
      modalities.push("reasoning");
    }
    
    return modalities;
  }

  private inferTrainingCutoff(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("2024-08")) return "2024-04";
    if (id.includes("2024-05")) return "2023-12";
    if (id.includes("gpt-4o")) return "2023-10";
    if (id.includes("gpt-4")) return "2023-04";
    if (id.includes("gpt-3.5")) return "2021-09";
    
    return undefined;
  }

  private inferReleaseDate(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
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
    
    return undefined;
  }

  private inferInputFormat(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const formats = ["text"];
    
    // Add vision capabilities
    if (id.includes("gpt-4o") || id.includes("gpt-4-turbo")) {
      formats.push("image", "vision");
    }
    
    // Add code capabilities for reasoning models
    if (id.includes("o1") || id.includes("o3") || id.includes("o4")) {
      formats.push("code", "math");
    }
    
    return formats;
  }

  private inferOutputFormat(modelId: string): string[] | undefined {
    const formats = ["text"];
    
    // All models support structured output
    formats.push("json", "structured");
    
    // Add streaming for modern models
    formats.push("streaming");
    
    return formats;
  }

  private inferResponseFormat(modelId: string): string[] | undefined {
    const formats = ["text", "json"];
    
    formats.push("json_object", "structured_output");
    
    return formats;
  }

  private inferToolsSupported(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const tools: string[] = [];
    
    // Function calling support
    if (!id.includes("gpt-3.5-turbo-instruct")) {
      tools.push("function_calling", "tools");
    }
    
    // Code interpretation
    if (id.includes("gpt-4") || id.includes("o1") || id.includes("o3") || id.includes("o4")) {
      tools.push("code_interpreter");
    }
    
    // Vision capabilities
    if (id.includes("gpt-4o") || id.includes("gpt-4-turbo")) {
      tools.push("vision", "image_analysis");
    }
    
    return tools;
  }

  private createDefaultPricingData(): PricingData[] {
    // Load supported models to create pricing for all OpenAI models
    const supportedModelsPath = join(__dirname, "..", "supported-models.json");
    let supportedModels: { modelId: string; releaseDate: string }[] = [];

    try {
      supportedModels = JSON.parse(readFileSync(supportedModelsPath, "utf-8"));
    } catch (error) {
      console.warn(
        "⚠️  Could not load supported-models.json, using basic pricing",
      );
    }

    // Filter for OpenAI models
    const openaiModels = supportedModels.filter((model) => {
      const id = model.modelId.toLowerCase();
      return (
        id.includes("gpt") ||
        id.includes("o1") ||
        id.includes("o3") ||
        id.includes("o4") ||
        id.includes("chatgpt")
      );
    });

    // Create pricing for all supported OpenAI models
    return openaiModels.map((model) => {
      const id = model.modelId.toLowerCase();

      // Default pricing based on model type
      let input = "2.50";
      let output = "10.00";

      if (id.includes("gpt-4o") && !id.includes("mini")) {
        input = "2.50";
        output = "10.00";
      } else if (
        id.includes("gpt-4o-mini") ||
        id.includes("gpt-4.1-mini") ||
        id.includes("gpt-4.1-nano")
      ) {
        input = "0.15";
        output = "0.60";
      } else if (id.includes("gpt-4-turbo") || id.includes("gpt-4.1")) {
        input = "10.00";
        output = "30.00";
      } else if (id.includes("gpt-4")) {
        input = "30.00";
        output = "60.00";
      } else if (id.includes("gpt-3.5")) {
        input = "0.50";
        output = "1.50";
      } else if (
        id.includes("o1-pro") ||
        (id.includes("o1") && !id.includes("mini"))
      ) {
        input = "15.00";
        output = "60.00";
      } else if (
        id.includes("o1-mini") ||
        id.includes("o3-mini") ||
        id.includes("o4-mini")
      ) {
        input = "3.00";
        output = "12.00";
      } else if (id.includes("chatgpt")) {
        input = "2.50";
        output = "10.00";
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
