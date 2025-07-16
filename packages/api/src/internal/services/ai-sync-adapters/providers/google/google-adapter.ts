import type { NormalizedModel } from "../../../ai-model-sync.service";

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

  async fetchModels(): Promise<NormalizedModel[]> {
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
      const normalizedModels: NormalizedModel[] = textGenerationModels.map(
        (model) => {
          const modelId = model.name.replace("models/", "");

          // Determine status based on state field (if available)
          const status = model.state === "DEPRECATED" ? "archived" : "active";

          return {
            modelId,
            name: model.displayName,
            displayName: model.displayName,
            description: model.description,
            version: model.version,
            maxTokens: Math.max(
              model.inputTokenLimit || 0,
              model.outputTokenLimit || 0,
            ),
            status: status,
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
}
