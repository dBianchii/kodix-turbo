import type { NormalizedModel } from "../../../ai-model-sync.service";

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

  async fetchModels(): Promise<NormalizedModel[]> {
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
      const normalizedModels: NormalizedModel[] = llmModels.map((model) => {
        const displayName = this.getDisplayName(model.id);
        const status = model.active === false ? "archived" : "active";

        return {
          modelId: model.id,
          name: displayName,
          displayName,
          maxTokens: this.getMaxTokensForModel(model.id, model.context_length),
          status: status,
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

}