import type { NormalizedModelAdapterOut } from "../types";

export interface XaiModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
  active?: boolean;
  context_length?: number;
}

export interface XaiModelsResponse {
  object: string;
  data: XaiModel[];
}


export class XaiAdapter {
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.x.ai/v1/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchModels(): Promise<NormalizedModelAdapterOut[]> {
    try {
      // 1. Call xAI models API
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `xAI API error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.includes("doesn't have any credits")) {
            errorMessage = `xAI API error: No credits available. Purchase credits at https://console.x.ai/`;
          } else if (errorData.error) {
            errorMessage = `xAI API error: ${errorData.error}`;
          }
        } catch {
          // If can't parse JSON, use the original error text
          if (errorText.includes("doesn't have any credits")) {
            errorMessage = `xAI API error: No credits available. Purchase credits at https://console.x.ai/`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as XaiModelsResponse;

      // 2. Filter to LLM models only
      const llmModels = data.data.filter((model) => this.isLLMModel(model.id));

      // 3. Normalize models (no pricing - handled by sync script)
      const normalizedModels: NormalizedModelAdapterOut[] = llmModels.map((model) => {
        const displayName = this.getDisplayName(model.id);
        const status = model.active === false ? "archived" : "active";

        return {
          modelId: model.id,
          name: displayName,
          displayName,
          provider: "xai",
          maxTokens: this.getMaxTokensForModel(model.id, model.context_length),
          contextWindow: this.getMaxTokensForModel(model.id, model.context_length),
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
      console.error("[XaiAdapter] Error fetching models:", error);
      throw error;
    }
  }

  private isLLMModel(modelId: string): boolean {
    const id = modelId.toLowerCase();

    // EXCLUDE: Non-LLM models
    if (id.includes("embedding")) return false;
    if (id.includes("whisper")) return false;
    if (id.includes("tts")) return false;
    if (id.includes("vision")) return false; // Vision-only models
    if (id.includes("image")) return false; // Image generation models
    
    // INCLUDE: Grok LLM models (xAI models)
    if (id.includes("grok")) return true;
    
    return false; // Only include Grok models
  }

  private getDisplayName(modelId: string): string {
    // Handle Grok model naming patterns (xAI models)
    const id = modelId.toLowerCase();
    
    if (id.includes("grok")) {
      return modelId.replace(/grok-?(\w+)/gi, "Grok $1")
                   .replace(/(-|\.|_)/g, " ")
                   .replace(/\b\w/g, l => l.toUpperCase())
                   .replace(/Beta/g, "Beta")
                   .replace(/Heavy/g, "Heavy");
    }

    // Default formatting
    return modelId
      .split(/[-_.]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private getMaxTokensForModel(modelId: string, contextLength?: number): number | undefined {
    // Use context_length from API if available
    if (contextLength) return contextLength;
    
    // Known token limits for Grok models (xAI)
    const tokenLimits: Record<string, number> = {
      "grok-beta": 128000,
      "grok-4-0709": 128000,
      "grok-4": 128000,
      "grok-3": 128000,
      "grok-2": 128000,
    };

    return tokenLimits[modelId];
  }

  private inferModelFamily(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("grok-4")) return "grok-4";
    if (id.includes("grok-3")) return "grok-3";
    if (id.includes("grok-2")) return "grok-2";
    if (id.includes("grok-beta")) return "grok-beta";
    if (id.includes("grok")) return "grok";
    
    return undefined;
  }

  private inferModelType(modelId: string): "text" | "multimodal" | "reasoning" | "vision" | "embedding" | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("grok-4") || id.includes("grok-3")) {
      return "multimodal";
    }
    
    return "text";
  }

  private inferModalities(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const modalities: string[] = ["text"];
    
    // Grok models can have vision capabilities
    if (id.includes("grok-4") || id.includes("grok-3")) {
      modalities.push("vision");
    }
    
    return modalities;
  }

  private inferTrainingCutoff(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    // Grok models have recent training data
    if (id.includes("grok-4")) return "2024-10";
    if (id.includes("grok-3")) return "2024-08";
    if (id.includes("grok-2")) return "2024-06";
    if (id.includes("grok-beta")) return "2024-12";
    
    return undefined;
  }

  private inferReleaseDate(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("grok-4-0709")) return "2024-07-09";
    if (id.includes("grok-4")) return "2024-12-01";
    if (id.includes("grok-beta")) return "2024-12-15";
    if (id.includes("grok-3")) return "2024-11-01";
    if (id.includes("grok-2")) return "2024-08-15";
    
    return undefined;
  }

  private inferInputFormat(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const formats = ["text"];
    
    if (id.includes("grok-4") || id.includes("grok-3")) {
      formats.push("image", "vision");
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
    
    tools.push("function_calling", "tools", "web_search", "real_time_data");
    
    // Code interpretation
    if (id.includes("grok-4") || id.includes("grok-3")) {
      tools.push("code_interpreter");
    }
    
    tools.push("x_integration", "live_search");
    
    // Vision capabilities
    if (id.includes("grok-4") || id.includes("grok-3")) {
      tools.push("vision", "image_analysis");
    }
    
    return tools;
  }
}