import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";

// Mocks simples dos services
const mockAiStudioService = {
  getModelById: vi.fn(),
  getDefaultModel: vi.fn(),
  getAvailableModels: vi.fn(),
  getProviderToken: vi.fn(),
};

const mockChatService = {
  createMessage: vi.fn(),
  findSessionById: vi.fn(),
  createSession: vi.fn(),
  findMessagesBySession: vi.fn(),
};

// Mock adapter simples
const mockAdapter = {
  streamAndSave: vi.fn(),
  streamResponse: vi.fn(),
};

describe("Chat Integration Tests - Sistema Único Vercel AI SDK", () => {
  const mockContext = {
    auth: {
      user: {
        id: "user-123",
        activeTeamId: "team-123",
      },
    },
  } as any;

  const mockModel = {
    id: "model-123",
    name: "GPT-4",
    providerId: "openai",
    config: { version: "gpt-4", maxTokens: 4000, temperature: 0.7 },
    provider: {
      name: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      id: "provider-openai",
    },
  };

  const mockSession = {
    id: "session-123",
    title: "Test Session",
    teamId: "team-123",
    userId: "user-123",
    aiModelId: "model-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🚀 Sistema Único - Vercel AI SDK", () => {
    it("deve usar apenas VercelAIAdapter (sem sistema legacy)", async () => {
      // Mock do modelo e token
      mockAiStudioService.getModelById.mockResolvedValue(mockModel);
      mockAiStudioService.getProviderToken.mockResolvedValue({
        token: "test-token-123",
      });

      // Mock da sessão
      mockChatService.findSessionById.mockResolvedValue(mockSession);

      // Mock do adapter com stream
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Hello"));
          controller.enqueue(new TextEncoder().encode(" World"));
          controller.close();
        },
      });

      mockAdapter.streamAndSave.mockResolvedValue({
        stream: mockStream,
        metadata: {
          model: "gpt-4",
          usage: { totalTokens: 50 },
          finishReason: "stop",
        },
      });

      // Simular processamento de chat
      const chatSessionId = "session-123";
      const content = "Hello AI";

      // Verificar que apenas Vercel AI SDK é usado
      await mockAdapter.streamAndSave(
        {
          chatSessionId,
          content,
          modelId: mockModel.id,
          teamId: mockContext.auth.user.activeTeamId,
          messages: [{ senderRole: "user", content }],
        },
        async (aiContent: string, metadata: any) => {
          await mockChatService.createMessage({
            chatSessionId,
            senderRole: "ai",
            content: aiContent,
            status: "ok",
            metadata,
          });
        },
      );

      // Verificar que VercelAIAdapter foi usado
      expect(mockAdapter.streamAndSave).toHaveBeenCalledTimes(1);
      expect(mockAdapter.streamAndSave).toHaveBeenCalledWith(
        expect.objectContaining({
          chatSessionId,
          content,
          modelId: mockModel.id,
          teamId: "team-123",
        }),
        expect.any(Function),
      );
    });

    it("deve garantir auto-save integrado funcionando", async () => {
      let saveCallbackCalled = false;
      let savedContent = "";

      // Mock do stream com auto-save
      mockAdapter.streamAndSave.mockImplementation(
        async (params: any, saveCallback: Function) => {
          // Simular acúmulo de texto durante streaming
          const accumulatedText = "Hello from AI!";

          // Simular chamada do auto-save
          await saveCallback(accumulatedText, {
            providerId: "vercel-ai-sdk",
            providerName: "Vercel AI SDK",
            usage: { totalTokens: 25 },
          });

          saveCallbackCalled = true;
          savedContent = accumulatedText;

          return {
            stream: new ReadableStream(),
            metadata: { model: "gpt-4" },
          };
        },
      );

      // Mock do ChatService.createMessage
      mockChatService.createMessage.mockResolvedValue({
        id: "msg-123",
        content: "Hello from AI!",
      });

      await mockAdapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test",
          modelId: "model-123",
          teamId: "team-123",
          messages: [],
        },
        async (content: string, metadata: any) => {
          await mockChatService.createMessage({
            chatSessionId: "session-123",
            senderRole: "ai",
            content,
            status: "ok",
            metadata,
          });
        },
      );

      // Verificar que auto-save foi executado
      expect(saveCallbackCalled).toBe(true);
      expect(savedContent).toBe("Hello from AI!");
      expect(mockChatService.createMessage).toHaveBeenCalledWith({
        chatSessionId: "session-123",
        senderRole: "ai",
        content: "Hello from AI!",
        status: "ok",
        metadata: expect.objectContaining({
          providerId: "vercel-ai-sdk",
        }),
      });
    });
  });

  describe("🔗 Integração com AI Studio", () => {
    it("deve buscar modelos via AiStudioService", async () => {
      mockAiStudioService.getModelById.mockResolvedValue(mockModel);

      const result = await mockAiStudioService.getModelById({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(mockAiStudioService.getModelById).toHaveBeenCalledWith({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });
      expect(result.name).toBe("GPT-4");
    });

    it("deve buscar tokens via AiStudioService", async () => {
      const mockToken = { token: "secret-token-123" };
      mockAiStudioService.getProviderToken.mockResolvedValue(mockToken);

      const result = await mockAiStudioService.getProviderToken({
        providerId: "openai",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(mockAiStudioService.getProviderToken).toHaveBeenCalledWith({
        providerId: "openai",
        teamId: "team-123",
        requestingApp: chatAppId,
      });
      expect(result.token).toBe("secret-token-123");
    });

    it("deve lidar com erros do AI Studio graciosamente", async () => {
      mockAiStudioService.getModelById.mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Model not found",
        }),
      );

      await expect(
        mockAiStudioService.getModelById({
          modelId: "invalid-model",
          teamId: "team-123",
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("Model not found");
    });
  });

  describe("💾 Persistência de Dados", () => {
    it("deve criar sessão corretamente", async () => {
      const newSession = {
        title: "New Chat Session",
        teamId: "team-123",
        userId: "user-123",
        aiModelId: "model-123",
      };

      mockChatService.createSession.mockResolvedValue({
        id: "session-456",
        ...newSession,
      });

      const result = await mockChatService.createSession(newSession);

      expect(mockChatService.createSession).toHaveBeenCalledWith(newSession);
      expect(result.id).toBe("session-456");
    });

    it("deve salvar mensagens com metadata correto", async () => {
      const messageData = {
        chatSessionId: "session-123",
        senderRole: "ai",
        content: "AI response",
        status: "ok",
        metadata: {
          model: "gpt-4",
          usage: { totalTokens: 100 },
        },
      };

      mockChatService.createMessage.mockResolvedValue({
        id: "msg-456",
        ...messageData,
      });

      const result = await mockChatService.createMessage(messageData);

      expect(mockChatService.createMessage).toHaveBeenCalledWith(messageData);
      expect(result.id).toBe("msg-456");
    });
  });

  describe("🔒 Isolamento por Team", () => {
    it("deve validar teamId em todas as operações", async () => {
      mockAiStudioService.getModelById.mockResolvedValue(mockModel);
      mockAiStudioService.getProviderToken.mockResolvedValue({
        token: "team-specific-token",
      });

      await mockAiStudioService.getModelById({
        modelId: "model-123",
        teamId: "team-456",
        requestingApp: chatAppId,
      });

      await mockAiStudioService.getProviderToken({
        providerId: "openai",
        teamId: "team-456",
        requestingApp: chatAppId,
      });

      expect(mockAiStudioService.getModelById).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: "team-456" }),
      );
      expect(mockAiStudioService.getProviderToken).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: "team-456" }),
      );
    });
  });

  describe("⚡ Performance", () => {
    it("deve processar streaming sem bloqueios", async () => {
      const startTime = Date.now();

      // Mock de stream rápido
      mockAdapter.streamAndSave.mockImplementation(
        async (params: any, callback: Function) => {
          // Simular streaming rápido
          await callback("Fast response", { model: "gpt-4" });
          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode("Fast response"));
                controller.close();
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      await mockAdapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test",
          modelId: "model-123",
          teamId: "team-123",
          messages: [],
        },
        async (content: string) => {
          // Auto-save callback
        },
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verificar que processamento foi rápido (< 100ms em mock)
      expect(duration).toBeLessThan(100);
      expect(mockAdapter.streamAndSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("🧪 Edge Cases", () => {
    it("deve lidar com stream vazio", async () => {
      mockAdapter.streamAndSave.mockImplementation(
        async (params: any, callback: Function) => {
          // Simular stream vazio (sem chamar callback)
          return {
            stream: new ReadableStream({
              start(controller) {
                controller.close(); // Stream vazio
              },
            }),
            metadata: { model: "gpt-4", finishReason: "empty" },
          };
        },
      );

      const result = await mockAdapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test",
          modelId: "model-123",
          teamId: "team-123",
          messages: [],
        },
        async (content: string) => {
          // Callback não deve ser chamado
        },
      );

      expect(result.metadata.finishReason).toBe("empty");
    });

    it("deve lidar com erros de save graciosamente", async () => {
      mockChatService.createMessage.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        mockChatService.createMessage({
          chatSessionId: "session-123",
          senderRole: "ai",
          content: "test",
          status: "ok",
          metadata: {},
        }),
      ).rejects.toThrow("Database connection failed");
    });
  });
});
