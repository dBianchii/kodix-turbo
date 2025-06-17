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
}
