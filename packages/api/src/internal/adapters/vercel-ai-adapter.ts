import type {
  ChatStreamParams,
  ChatStreamResponse,
} from "../types/ai/vercel-adapter.types";

export class VercelAIAdapter {
  /**
   * PLACEHOLDER: Adapter que apenas simula funcionamento
   * NÃO USA VERCEL AI SDK AINDA - apenas estrutura
   */
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    // Por enquanto, apenas retorna um stream mock
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Mock adapter working!"));
        controller.close();
      },
    });

    return {
      stream,
      metadata: {
        model: "mock-model",
        usage: null,
        finishReason: "stop",
      },
    };
  }

  // Métodos privados como placeholders
  private adaptInputParams(params: ChatStreamParams) {
    return {
      messages: params.messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
    };
  }

  private async getVercelModel(modelId: string, teamId: string) {
    // PLACEHOLDER - não faz nada ainda
    return null;
  }
}
