import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../../../../internal/services/ai-studio.service";
import { autoCreateSessionWithMessageHandler } from "../autoCreateSessionWithMessage.handler";
import { enviarMensagemHandler } from "../enviarMensagem.handler";
import { getPreferredModelHelper } from "../getPreferredModel.handler";

// Mock do AiStudioService
vi.mock("../../../../../internal/services/ai-studio.service", () => ({
  AiStudioService: {
    getModelById: vi.fn(),
    getDefaultModel: vi.fn(),
    getAvailableModels: vi.fn(),
    getProviderToken: vi.fn(),
  },
}));

// Mock dos repositórios
vi.mock("@kdx/db/repositories", () => ({
  appRepository: {
    findAppTeamConfigs: vi.fn(),
  },
  chatRepository: {
    ChatSessionRepository: {
      create: vi.fn(),
      findById: vi.fn(),
    },
    ChatMessageRepository: {
      create: vi.fn(),
      findBySession: vi.fn(),
    },
  },
}));

describe("Chat Service Layer Integration", () => {
  const mockContext = {
    auth: {
      user: {
        id: "user-123",
        activeTeamId: "team-123",
      },
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPreferredModelHelper", () => {
    it("should use AiStudioService.getModelById correctly", async () => {
      // Mock do modelo
      const mockModel = {
        id: "model-123",
        name: "Test Model",
        providerId: "openai",
        config: { version: "gpt-4", maxTokens: 1000, temperature: 0.7 },
        provider: { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
      };

      // Mock do AiStudioService
      (AiStudioService.getDefaultModel as any).mockResolvedValue({
        model: mockModel,
      });

      // Mock do appRepository (sem config de chat)
      const { appRepository } = await import("@kdx/db/repositories");
      (appRepository.findAppTeamConfigs as any).mockResolvedValue([]);

      const result = await getPreferredModelHelper("team-123", chatAppId);

      // Verificar que AiStudioService foi chamado corretamente
      expect(AiStudioService.getDefaultModel).toHaveBeenCalledWith({
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      // Verificar resultado
      expect(result.source).toBe("ai_studio_default");
      expect(result.model.id).toBe("model-123");
    });

    it("should handle Service Layer errors correctly", async () => {
      // Mock de erro no service
      (AiStudioService.getDefaultModel as any).mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "No default model configured",
        }),
      );
      (AiStudioService.getAvailableModels as any).mockResolvedValue([]);

      // Mock do appRepository (sem config de chat)
      const { appRepository } = await import("@kdx/db/repositories");
      (appRepository.findAppTeamConfigs as any).mockResolvedValue([]);

      // Deve lançar erro quando nenhum modelo é encontrado
      await expect(
        getPreferredModelHelper("team-123", chatAppId),
      ).rejects.toThrow("Nenhum modelo de IA disponível");
    });

    it("should validate teamId is passed to all service calls", async () => {
      // Mock para capturar as chamadas
      (AiStudioService.getDefaultModel as any).mockRejectedValue(
        new Error("Test error"),
      );
      (AiStudioService.getAvailableModels as any).mockResolvedValue([]);

      const { appRepository } = await import("@kdx/db/repositories");
      (appRepository.findAppTeamConfigs as any).mockResolvedValue([]);

      try {
        await getPreferredModelHelper("team-456", chatAppId);
      } catch (error) {
        // Erro esperado
      }

      // Verificar que teamId foi passado corretamente
      expect(AiStudioService.getDefaultModel).toHaveBeenCalledWith({
        teamId: "team-456",
        requestingApp: chatAppId,
      });
      expect(AiStudioService.getAvailableModels).toHaveBeenCalledWith({
        teamId: "team-456",
        requestingApp: chatAppId,
      });
    });
  });

  describe("autoCreateSessionWithMessageHandler", () => {
    it("should use Service Layer for model and provider token access", async () => {
      const mockModel = {
        id: "model-123",
        name: "Test Model",
        providerId: "provider-123",
        provider: { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
        config: { version: "gpt-4", maxTokens: 500, temperature: 0.7 },
      };

      const mockProviderToken = {
        token: "test-token-123",
      };

      // Mock dos services
      (AiStudioService.getDefaultModel as any).mockResolvedValue({
        model: mockModel,
      });
      (AiStudioService.getProviderToken as any).mockResolvedValue(
        mockProviderToken,
      );

      // Mock fetch global
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Test AI response" } }],
        }),
      });

      // Mock dos repositórios
      const { chatRepository } = await import("@kdx/db/repositories");
      (chatRepository.ChatSessionRepository.create as any).mockResolvedValue({
        id: "session-123",
      });
      (chatRepository.ChatMessageRepository.create as any)
        .mockResolvedValueOnce({ id: "user-msg-123" })
        .mockResolvedValueOnce({ id: "ai-msg-123" });

      const input = {
        firstMessage: "Hello AI",
        useAgent: true,
        generateTitle: false,
      };

      await autoCreateSessionWithMessageHandler({ input, ctx: mockContext });

      // Verificar que services foram chamados com contexto correto
      expect(AiStudioService.getDefaultModel).toHaveBeenCalledWith({
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(AiStudioService.getProviderToken).toHaveBeenCalledWith({
        providerId: "provider-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });
    });

    it("should propagate Service Layer errors correctly", async () => {
      // Mock de erro no service
      (AiStudioService.getDefaultModel as any).mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "No models available for this team",
        }),
      );

      const input = {
        firstMessage: "Hello AI",
        useAgent: true,
        generateTitle: false,
      };

      // Deve propagar o erro do Service Layer
      await expect(
        autoCreateSessionWithMessageHandler({ input, ctx: mockContext }),
      ).rejects.toThrow("Nenhum modelo de IA disponível");
    });
  });

  describe("enviarMensagemHandler", () => {
    it("should use Service Layer for model and provider communication", async () => {
      const mockSession = {
        id: "session-123",
        teamId: "team-123",
        aiModelId: "model-123",
      };

      const mockModel = {
        id: "model-123",
        name: "Test Model",
        providerId: "provider-123",
        provider: { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
        config: { version: "gpt-4", maxTokens: 500, temperature: 0.7 },
      };

      const mockProviderToken = {
        token: "test-token-456",
      };

      // Mock dos repositórios
      const { chatRepository } = await import("@kdx/db/repositories");
      (chatRepository.ChatSessionRepository.findById as any).mockResolvedValue(
        mockSession,
      );
      (chatRepository.ChatMessageRepository.create as any)
        .mockResolvedValueOnce({ id: "user-msg-123" })
        .mockResolvedValueOnce({ id: "ai-msg-123" });
      (
        chatRepository.ChatMessageRepository.findBySession as any
      ).mockResolvedValue([]);

      // Mock dos services
      (AiStudioService.getModelById as any).mockResolvedValue(mockModel);
      (AiStudioService.getProviderToken as any).mockResolvedValue(
        mockProviderToken,
      );

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "AI response" } }],
        }),
      });

      const input = {
        chatSessionId: "session-123",
        content: "Hello",
        useAgent: true,
      };

      await enviarMensagemHandler({ input, ctx: mockContext });

      // Verificar chamadas corretas dos services
      expect(AiStudioService.getModelById).toHaveBeenCalledWith({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(AiStudioService.getProviderToken).toHaveBeenCalledWith({
        providerId: "provider-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });
    });
  });

  describe("Team Isolation Validation", () => {
    it("should ensure all service calls include teamId from context", async () => {
      const testTeamId = "test-team-789";

      // Mock service calls
      (AiStudioService.getDefaultModel as any).mockResolvedValue({
        model: { id: "model-123", name: "Test Model" },
      });

      const { appRepository } = await import("@kdx/db/repositories");
      (appRepository.findAppTeamConfigs as any).mockResolvedValue([]);

      await getPreferredModelHelper(testTeamId, chatAppId);

      // Verificar que teamId correto foi usado
      expect(AiStudioService.getDefaultModel).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: testTeamId,
          requestingApp: chatAppId,
        }),
      );
    });
  });
});
