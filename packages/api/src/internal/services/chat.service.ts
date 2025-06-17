import { chatRepository } from "@kdx/db/repositories";

export class ChatService {
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
    senderRole: "user" | "assistant" | "system";
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
      senderRole: "assistant",
      status: "ok",
    });
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
}
