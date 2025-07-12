import { aiStudioRepository, chatRepository } from "@kdx/db/repositories";

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

  // Agent Switching Methods
  static async switchAgent(params: {
    sessionId: string;
    agentId: string;
    reason: "user_switch" | "auto_suggestion" | "system_default";
    teamId: string;
  }) {
    const { sessionId, agentId, reason, teamId } = params;

    // Validar sessão
    const session = await this.findSessionById(sessionId);
    if (!session || session.teamId !== teamId) {
      throw new Error("Session not found or access denied");
    }

    // Buscar informações do agente
    const agent = await aiStudioRepository.AiAgentRepository.findById(agentId);
    if (!agent || agent.teamId !== teamId) {
      throw new Error("Agent not found or access denied");
    }

    // Preparar entrada do histórico
    const historyEntry = {
      agentId: agentId,
      agentName: agent.name,
      switchedAt: new Date().toISOString(),
      messageCount: 0, // Será calculado depois se necessário
      reason: reason,
    };

    // Buscar histórico atual
    const currentHistory = (session.agentHistory as any[]) || [];
    const updatedHistory = [...currentHistory, historyEntry];

    // Atualizar sessão - CORRIGIDO: atualizar ambos aiAgentId e activeAgentId
    await chatRepository.ChatSessionRepository.update(sessionId, {
      aiAgentId: agentId, // ✅ Campo principal usado pelo sistema de prompts
      activeAgentId: agentId, // ✅ Campo de tracking para UI
      agentHistory: updatedHistory,
    });

    return {
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        instructions: agent.instructions,
      },
    };
  }

  static async getAvailableAgents(sessionId: string, teamId: string) {
    // Validar sessão
    const session = await this.findSessionById(sessionId);
    if (!session || session.teamId !== teamId) {
      throw new Error("Session not found or access denied");
    }

    // Buscar agentes do time
    const agents = await aiStudioRepository.AiAgentRepository.findByTeam({
      teamId: teamId,
      limite: 50,
      offset: 0,
    });

    return agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      isActive: agent.id === session.activeAgentId,
      hasInstructions: !!agent.instructions,
    }));
  }

  static async getAgentHistory(sessionId: string, teamId: string) {
    const session = await this.findSessionById(sessionId);
    if (!session || session.teamId !== teamId) {
      throw new Error("Session not found or access denied");
    }

    return {
      activeAgentId: session.activeAgentId,
      history: (session.agentHistory as any[]) || [],
    };
  }
}
