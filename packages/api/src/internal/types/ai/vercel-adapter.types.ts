export interface ChatStreamParams {
  chatSessionId: string;
  content: string;
  modelId: string;
  teamId: string;
  messages: {
    senderRole: "user" | "ai" | "system";
    content: string;
  }[];
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
}

export interface ChatStreamResponse {
  stream: ReadableStream;
  metadata: {
    model?: string;
    usage?: any;
    finishReason?: string;
    error?: string; // Para casos de fallback
  };
}
