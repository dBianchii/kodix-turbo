import { chatRepository } from "@kdx/db/repositories";

import { VercelAIAdapter } from "../adapters/vercel-ai-adapter";
import { FEATURE_FLAGS } from "../config/feature-flags";

export class ChatService {
  private static vercelAdapter = new VercelAIAdapter();

  static async findSessionById(sessionId: string) {
    return chatRepository.ChatSessionRepository.findById(sessionId);
  }

  static async findMessagesBySession(params: {
    chatSessionId: string;
    limite: number;
    offset: number;
    ordem: "asc" | "desc";
  }) {
    return chatRepository.ChatMessageRepository.findBySession(params);
  }

  static async createMessage(params: {
    chatSessionId: string;
    senderRole: "user" | "ai" | "system" | "human_operator";
    content: string;
    status: "ok" | "error" | "pending";
    metadata?: any;
  }) {
    return chatRepository.ChatMessageRepository.create(params);
  }

  static async saveAssistantMessage(params: {
    chatSessionId: string;
    content: string;
    metadata?: any;
  }) {
    return this.createMessage({
      ...params,
      senderRole: "ai",
      status: "ok",
    });
  }

  static async createSystemMessage(params: {
    chatSessionId: string;
    content: string;
    metadata?: any;
  }) {
    return this.createMessage({
      ...params,
      senderRole: "system",
      status: "ok",
    });
  }

  static async hasSystemInstructions(sessionId: string): Promise<boolean> {
    const messages = await this.findMessagesBySession({
      chatSessionId: sessionId,
      limite: 1,
      offset: 0,
      ordem: "asc",
    });

    return messages.length > 0 && messages[0]?.senderRole === "system";
  }

  static async updateSession(
    sessionId: string,
    data: Partial<{
      title: string;
      aiModelId: string;
      aiAgentId: string;
    }>,
  ) {
    return chatRepository.ChatSessionRepository.update(sessionId, data);
  }

  static async streamResponseWithAdapter(params: {
    chatSessionId: string;
    content: string;
    modelId?: string;
    teamId: string;
    messages: {
      senderRole: "user" | "ai";
      content: string;
    }[];
    temperature?: number;
    maxTokens?: number;
    tools?: any[];
  }) {
    if (!FEATURE_FLAGS.VERCEL_AI_ADAPTER) {
      throw new Error(
        "🚫 Vercel AI Adapter not enabled. Set ENABLE_VERCEL_AI_ADAPTER=true to use this feature.",
      );
    }

    console.log("🧪 [EXPERIMENTAL] Using Vercel AI Adapter");

    return await this.vercelAdapter.streamResponse({
      chatSessionId: params.chatSessionId,
      content: params.content,
      modelId: params.modelId || "default",
      teamId: params.teamId,
      messages: params.messages,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      tools: params.tools,
    });
  }
}
