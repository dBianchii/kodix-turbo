import type { NormalizedModelAdapterOut } from "../types";

export interface GoogleModel {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  state?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTemperature?: number;
}

export interface GoogleModelsResponse {
  models: GoogleModel[];
}

export class GoogleAdapter {
  private readonly apiKey: string;
  private readonly apiUrl =
    "https://generativelanguage.googleapis.com/v1/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchModels(): Promise<NormalizedModelAdapterOut[]> {
    try {

      // Use the v1 endpoint with correct authentication
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[GoogleAdapter] API Error: ${response.status} ${response.statusText}`,
          errorText,
        );
        throw new Error(
          `Google API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data = (await response.json()) as GoogleModelsResponse;

      if (!data.models || data.models.length === 0) {
        return [];
      }

      // Filter to text generation models only (exclude embeddings, etc.)
      const textGenerationModels = data.models.filter((model) => {
        const modelId = model.name.replace("models/", "");
        return this.isTextGenerationModel(
          modelId,
          model.supportedGenerationMethods,
        );
      });


      // Normalize the models
      const normalizedModels: NormalizedModelAdapterOut[] = textGenerationModels.map(
        (model) => {
          const modelId = model.name.replace("models/", "");

          // Determine status based on state field (if available)
          const status = model.state === "DEPRECATED" ? "archived" : "active";

          return {
            modelId,
            name: model.displayName,
            displayName: model.displayName,
            provider: "google",
            description: model.description,
            version: model.version,
            maxTokens: Math.max(
              model.inputTokenLimit || 0,
              model.outputTokenLimit || 0,
            ),
            contextWindow: Math.max(
              model.inputTokenLimit || 0,
              model.outputTokenLimit || 0,
            ),
            status: status,
            modelFamily: this.inferModelFamily(modelId),
            modelType: this.inferModelType(modelId),
            modalities: this.inferModalities(modelId),
            trainingDataCutoff: this.inferTrainingCutoff(modelId),
            releaseDate: this.inferReleaseDate(modelId),
            inputFormat: this.inferInputFormat(modelId),
            outputFormat: this.inferOutputFormat(modelId),
            responseFormat: this.inferResponseFormat(modelId),
            toolsSupported: this.inferToolsSupported(modelId),
          };
        },
      );


      return normalizedModels;
    } catch (error) {
      throw error;
    }
  }

  private isTextGenerationModel(
    modelId: string,
    supportedMethods: string[],
  ): boolean {
    const id = modelId.toLowerCase();

    // EXCLUDE: Embedding models
    if (id.includes("embedding")) return false;
    if (id.includes("gecko")) return false;

    // EXCLUDE: Image generation models
    if (id.includes("image-generation")) return false;

    // EXCLUDE: TTS/Audio models
    if (id.includes("tts")) return false;

    // EXCLUDE: Vision-only models and specific vision Gemini models
    if (id.includes("vision")) return false;

    // EXCLUDE: Specific Gemini models
    const excludedModels = [
      "gemini-1.5-pro-002",
      "gemini-1.5-pro", 
      "gemini-1.5-flash",
      "gemini-1.5-flash-002",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash-8b-001"
    ];
    if (excludedModels.includes(id)) return false;

    // EXCLUDE: Specialized models
    if (id === "aqa") return false; // Attributed Question Answering

    // INCLUDE: Only models that support text generation
    if (!supportedMethods.includes("generateContent")) return false;

    // INCLUDE: All Gemini models (including latest, preview, experimental)
    if (id.includes("gemini")) return true;

    // EXCLUDE: Everything else
    return false;
  }

  private inferModelFamily(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("gemini-2.0")) return "gemini-2.0";
    if (id.includes("gemini-1.5")) return "gemini-1.5";
    if (id.includes("gemini-1.0")) return "gemini-1.0";
    if (id.includes("gemini")) return "gemini";
    
    return undefined;
  }

  private inferModelType(modelId: string): "text" | "multimodal" | "reasoning" | "vision" | "embedding" | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("gemini")) {
      return "multimodal";
    }
    
    return "text";
  }

  private inferModalities(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const modalities: string[] = ["text"];
    
    if (id.includes("gemini")) {
      modalities.push("vision");
      if (id.includes("pro")) {
        modalities.push("multimodal");
      }
    }
    
    return modalities;
  }

  private inferTrainingCutoff(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("gemini-2.0")) return "2024-08";
    if (id.includes("gemini-1.5")) return "2024-04";
    if (id.includes("gemini-1.0")) return "2023-12";
    
    return undefined;
  }

  private inferReleaseDate(modelId: string): string | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes("gemini-2.0")) return "2024-12-11";
    if (id.includes("gemini-1.5")) return "2024-02-15";
    if (id.includes("gemini-1.0")) return "2023-12-06";
    
    return undefined;
  }

  private inferInputFormat(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const formats = ["text"];
    
    if (id.includes("gemini")) {
      formats.push("image", "video", "audio");
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
    
    formats.push("json_object", "structured");
    
    return formats;
  }

  private inferToolsSupported(modelId: string): string[] | undefined {
    const id = modelId.toLowerCase();
    const tools: string[] = [];
    
    if (id.includes("gemini")) {
      tools.push("function_calling", "tools");
      tools.push("web_search", "grounding");
      tools.push("vision", "image_analysis", "video_analysis");
    }
    
    return tools;
  }
}
