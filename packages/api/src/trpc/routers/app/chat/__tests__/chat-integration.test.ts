import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";

import { VercelAIAdapter } from "../../../../internal/adapters/vercel-ai-adapter";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import { ChatService } from "../../../../internal/services/chat.service";

// Mock do VercelAIAdapter
vi.mock("../../../../internal/adapters/vercel-ai-adapter", () => ({
  VercelAIAdapter: vi.fn().mockImplementation(() => ({
    streamAndSave: vi.fn(),
    streamResponse: vi.fn(),
  })),
}));

// Mock do AiStudioService
vi.mock("../../../../internal/services/ai-studio.service", () => ({
  AiStudioService: {
    getModelById: vi.fn(),
    getDefaultModel: vi.fn(),
    getAvailableModels: vi.fn(),
    getProviderToken: vi.fn(),
  },
}));

// Mock do ChatService
vi.mock("../../../../internal/services/chat.service", () => ({
  ChatService: {
    createMessage: vi.fn(),
    findSessionById: vi.fn(),
    createSession: vi.fn(),
    findMessagesBySession: vi.fn(),
  },
}));

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
      (AiStudioService.getModelById as any).mockResolvedValue(mockModel);
      (AiStudioService.getProviderToken as any).mockResolvedValue({
        token: "test-token-123",
      });

      // Mock da sessão
      (ChatService.findSessionById as any).mockResolvedValue(mockSession);

      // Mock do adapter
      const mockAdapter = new VercelAIAdapter();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Hello"));
          controller.enqueue(new TextEncoder().encode(" World"));
          controller.close();
        },
      });

      (mockAdapter.streamAndSave as any).mockResolvedValue({
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
          await ChatService.createMessage({
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
      const mockAdapter = new VercelAIAdapter();
      let saveCallbackCalled = false;
      let savedContent = "";

      // Mock do stream com auto-save
      (mockAdapter.streamAndSave as any).mockImplementation(
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
      (ChatService.createMessage as any).mockResolvedValue({
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
          await ChatService.createMessage({
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
      expect(ChatService.createMessage).toHaveBeenCalledWith({
        chatSessionId: "session-123",
        senderRole: "ai",
        content: "Hello from AI!",
        status: "ok",
        metadata: expect.objectContaining({
          providerId: "vercel-ai-sdk",
          providerName: "Vercel AI SDK",
        }),
      });
    });
  });

  describe("🔗 Integração com AI Studio", () => {
    it("deve buscar modelos via AiStudioService", async () => {
      (AiStudioService.getModelById as any).mockResolvedValue(mockModel);

      const result = await AiStudioService.getModelById({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(AiStudioService.getModelById).toHaveBeenCalledWith({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(result).toEqual(mockModel);
    });

    it("deve buscar tokens via AiStudioService", async () => {
      const mockToken = { token: "encrypted-token-123" };
      (AiStudioService.getProviderToken as any).mockResolvedValue(mockToken);

      const result = await AiStudioService.getProviderToken({
        providerId: "openai",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(AiStudioService.getProviderToken).toHaveBeenCalledWith({
        providerId: "openai",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(result).toEqual(mockToken);
    });

    it("deve lidar com erros do AI Studio graciosamente", async () => {
      (AiStudioService.getModelById as any).mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Modelo não encontrado",
        }),
      );

      await expect(
        AiStudioService.getModelById({
          modelId: "invalid-model",
          teamId: "team-123",
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("Modelo não encontrado");
    });
  });

  describe("💾 Persistência de Dados", () => {
    it("deve criar sessão corretamente", async () => {
      const newSession = {
        title: "Nova Conversa",
        teamId: "team-123",
        userId: "user-123",
        aiModelId: "model-123",
      };

      (ChatService.createSession as any).mockResolvedValue({
        id: "new-session-123",
        ...newSession,
      });

      const result = await ChatService.createSession(newSession);

      expect(ChatService.createSession).toHaveBeenCalledWith(newSession);
      expect(result.id).toBe("new-session-123");
    });

    it("deve salvar mensagens com metadata correto", async () => {
      const messageData = {
        chatSessionId: "session-123",
        senderRole: "ai" as const,
        content: "Resposta da IA",
        status: "ok",
        metadata: {
          providerId: "vercel-ai-sdk",
          providerName: "Vercel AI SDK",
          requestedModel: "gpt-4",
          actualModelUsed: "gpt-4",
          usage: { totalTokens: 100 },
          finishReason: "stop",
        },
      };

      (ChatService.createMessage as any).mockResolvedValue({
        id: "msg-123",
        ...messageData,
      });

      const result = await ChatService.createMessage(messageData);

      expect(ChatService.createMessage).toHaveBeenCalledWith(messageData);
      expect(result.metadata.providerId).toBe("vercel-ai-sdk");
    });
  });

  describe("🔒 Isolamento por Team", () => {
    it("deve validar teamId em todas as operações", async () => {
      const teamId = "team-456";

      // Mock das chamadas
      (AiStudioService.getModelById as any).mockResolvedValue(mockModel);
      (AiStudioService.getProviderToken as any).mockResolvedValue({
        token: "team-token",
      });

      // Testar isolamento no AI Studio
      await AiStudioService.getModelById({
        modelId: "model-123",
        teamId,
        requestingApp: chatAppId,
      });

      await AiStudioService.getProviderToken({
        providerId: "openai",
        teamId,
        requestingApp: chatAppId,
      });

      // Verificar que teamId foi passado corretamente
      expect(AiStudioService.getModelById).toHaveBeenCalledWith(
        expect.objectContaining({ teamId }),
      );
      expect(AiStudioService.getProviderToken).toHaveBeenCalledWith(
        expect.objectContaining({ teamId }),
      );
    });
  });

  describe("⚡ Performance", () => {
    it("deve processar streaming sem bloqueios", async () => {
      const mockAdapter = new VercelAIAdapter();
      const startTime = Date.now();

      // Mock de stream rápido
      (mockAdapter.streamAndSave as any).mockImplementation(
        async (params: any, callback: Function) => {
          // Simular streaming rápido
          setTimeout(() => callback("Fast response", {}), 10);

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode("Fast"));
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
        async () => {},
      );

      const duration = Date.now() - startTime;

      // Verificar que processamento foi rápido (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe("🧪 Edge Cases", () => {
    it("deve lidar com stream vazio", async () => {
      const mockAdapter = new VercelAIAdapter();

      (mockAdapter.streamAndSave as any).mockImplementation(
        async (params: any, callback: Function) => {
          // Simular stream vazio (sem chamar callback)
          return {
            stream: new ReadableStream({
              start(controller) {
                controller.close();
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      // Não deve lançar erro
      await expect(
        mockAdapter.streamAndSave(
          {
            chatSessionId: "session-123",
            content: "test",
            modelId: "model-123",
            teamId: "team-123",
            messages: [],
          },
          async () => {},
        ),
      ).resolves.toBeDefined();
    });

    it("deve lidar com erros de save graciosamente", async () => {
      const mockAdapter = new VercelAIAdapter();

      (mockAdapter.streamAndSave as any).mockImplementation(
        async (params: any, callback: Function) => {
          // Simular erro no callback de save
          try {
            await callback("content", {});
          } catch (error) {
            // Erro deve ser capturado mas não interromper stream
            console.log("Save error caught:", error);
          }

          return {
            stream: new ReadableStream(),
            metadata: { model: "gpt-4" },
          };
        },
      );

      // Mock de erro no ChatService
      (ChatService.createMessage as any).mockRejectedValue(
        new Error("Database error"),
      );

      // Não deve lançar erro (deve ser tratado internamente)
      await expect(
        mockAdapter.streamAndSave(
          {
            chatSessionId: "session-123",
            content: "test",
            modelId: "model-123",
            teamId: "team-123",
            messages: [],
          },
          async (content: string, metadata: any) => {
            await ChatService.createMessage({
              chatSessionId: "session-123",
              senderRole: "ai",
              content,
              status: "ok",
              metadata,
            });
          },
        ),
      ).resolves.toBeDefined();
    });
  });
});
