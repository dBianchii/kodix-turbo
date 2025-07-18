import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../internal/services/ai-studio.service";
import { ChatService } from "../../internal/services/chat.service";

// Mock the Vercel AI SDK
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
}));

// Mock the ChatService
vi.mock("../../internal/services/chat.service", () => ({
  ChatService: {
    findSessionById: vi.fn(),
    createMessage: vi.fn(),
    findMessagesBySession: vi.fn(),
    updateSession: vi.fn(),
  },
}));

// Mock the database and repositories
vi.mock("@kdx/db/client", () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
      teams: { findFirst: vi.fn() },
      appTeamConfigs: { findFirst: vi.fn() },
      userAppTeamConfigs: { findFirst: vi.fn() },
    },
  },
}));

vi.mock("@kdx/db/repositories", () => ({
  aiStudioRepository: {
    AiModelRepository: { findById: vi.fn() },
    AiTeamModelConfigRepository: {
      findByTeamAndModel: vi.fn(),
      findAvailableModelsByTeam: vi.fn(),
    },
    AiTeamProviderTokenRepository: { findByTeamAndProvider: vi.fn() },
  },
  chatRepository: {
    ChatMessageRepository: { findBySession: vi.fn() },
  },
}));

describe("AI Studio Streaming - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Full Workflow Integration", () => {
    it("should handle complete chat flow with OpenAI provider", async () => {
      // Setup mock data
      const mockModel = {
        id: "model-123",
        providerId: "openai-provider",
        provider: { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
        config: { modelId: "gpt-4" },
        universalModelId: "gpt-4",
      };

      const mockToken = { token: "sk-test-token" };
      const mockSystemPrompt = "You are a helpful assistant.";

      const mockSession = {
        id: "session-123",
        teamId: "team-123",
        aiModelId: "model-123",
      };

      const mockMessages = [
        { id: "msg-1", senderRole: "user", content: "Hello", status: "ok" },
      ];

      const mockStreamResponse = {
        toDataStreamResponse: vi.fn().mockReturnValue({
          headers: {
            "Transfer-Encoding": "chunked",
            Connection: "keep-alive",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Accel-Buffering": "no",
          },
        }),
      };

      // Setup mocks
      vi.mocked(AiStudioService.getModelById).mockResolvedValue(
        mockModel as any,
      );
      vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
        mockToken as any,
      );
      vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue(
        mockSystemPrompt,
      );
      vi.mocked(ChatService.findSessionById).mockResolvedValue(
        mockSession as any,
      );
      vi.mocked(ChatService.findMessagesBySession).mockResolvedValue(
        mockMessages as any,
      );
      vi.mocked(ChatService.createMessage).mockResolvedValue({
        id: "new-msg",
      } as any);

      const mockCreateOpenAI = vi.fn().mockReturnValue(vi.fn());
      vi.mocked(createOpenAI).mockImplementation(mockCreateOpenAI);

      const mockStreamText = vi.fn().mockImplementation((options) => {
        // Simulate calling onFinish
        if (options.onFinish) {
          setTimeout(() => {
            options.onFinish({
              text: "Hello! How can I help you today?",
              usage: {
                totalTokens: 25,
                promptTokens: 15,
                completionTokens: 10,
              },
              finishReason: "stop",
            });
          }, 0);
        }
        return mockStreamResponse;
      });
      vi.mocked(streamText).mockImplementation(mockStreamText);

      // Execute the integration test
      const result = await AiStudioService.streamChatResponse({
        messages: [{ role: "user", content: "Hello" }],
        sessionId: "session-123",
        userId: "user-123",
        teamId: "team-123",
        modelId: "model-123",
        onMessageSave: async (messageData) => {
          await ChatService.createMessage({
            chatSessionId: "session-123",
            senderRole: "ai",
            content: messageData.content,
            status: "ok",
            metadata: messageData.metadata,
          });
        },
      });

      // Verify the complete flow
      expect(AiStudioService.getModelById).toHaveBeenCalledWith({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(AiStudioService.getProviderToken).toHaveBeenCalledWith({
        providerId: "openai-provider",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      expect(AiStudioService.getSystemPrompt).toHaveBeenCalledWith({
        teamId: "team-123",
        userId: "user-123",
        sessionId: "session-123",
      });

      expect(mockCreateOpenAI).toHaveBeenCalledWith({
        apiKey: "sk-test-token",
        baseURL: "https://api.openai.com/v1",
      });

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: "system", content: mockSystemPrompt },
            { role: "user", content: "Hello" },
          ],
          temperature: 0.7,
          maxTokens: 4000,
        }),
      );

      expect(result).toBeDefined();
    });

    it("should handle complete chat flow with Anthropic provider", async () => {
      const mockModel = {
        id: "model-456",
        providerId: "anthropic-provider",
        provider: { name: "Anthropic", baseUrl: "https://api.anthropic.com" },
        config: { version: "claude-3-opus" },
        universalModelId: "claude-3-opus-20240229",
      };

      const mockToken = { token: "sk-ant-token" };
      const mockSystemPrompt = "You are Claude, an AI assistant.";

      vi.mocked(AiStudioService.getModelById).mockResolvedValue(
        mockModel as any,
      );
      vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
        mockToken as any,
      );
      vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue(
        mockSystemPrompt,
      );

      const mockCreateAnthropic = vi.fn().mockReturnValue(vi.fn());
      vi.mocked(createAnthropic).mockImplementation(mockCreateAnthropic);

      const mockStreamResponse = {
        toDataStreamResponse: vi.fn().mockReturnValue({}),
      };
      vi.mocked(streamText).mockReturnValue(mockStreamResponse as any);

      await AiStudioService.streamChatResponse({
        messages: [{ role: "user", content: "Hello Claude" }],
        sessionId: "session-456",
        userId: "user-456",
        teamId: "team-456",
        modelId: "model-456",
      });

      expect(mockCreateAnthropic).toHaveBeenCalledWith({
        apiKey: "sk-ant-token",
        baseURL: "https://api.anthropic.com",
      });

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: "system", content: mockSystemPrompt },
            { role: "user", content: "Hello Claude" },
          ],
        }),
      );
    });

    it("should handle complete chat flow with Google provider", async () => {
      const mockModel = {
        id: "model-789",
        providerId: "google-provider",
        provider: { name: "Google" },
        config: {},
        universalModelId: "gemini-pro",
      };

      const mockToken = { token: "google-api-key" };
      const mockSystemPrompt = "";

      vi.mocked(AiStudioService.getModelById).mockResolvedValue(
        mockModel as any,
      );
      vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
        mockToken as any,
      );
      vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue(
        mockSystemPrompt,
      );

      const mockCreateGoogle = vi.fn().mockReturnValue(vi.fn());
      vi.mocked(createGoogleGenerativeAI).mockImplementation(mockCreateGoogle);

      const mockStreamResponse = {
        toDataStreamResponse: vi.fn().mockReturnValue({}),
      };
      vi.mocked(streamText).mockReturnValue(mockStreamResponse as any);

      await AiStudioService.streamChatResponse({
        messages: [{ role: "user", content: "Hello Gemini" }],
        sessionId: "session-789",
        userId: "user-789",
        teamId: "team-789",
        modelId: "model-789",
      });

      expect(mockCreateGoogle).toHaveBeenCalledWith({
        apiKey: "google-api-key",
      });

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: "user", content: "Hello Gemini" }],
        }),
      );
    });
  });

  describe("Cross-Service Communication Tests", () => {
    it("should properly communicate between AiStudioService and ChatService", async () => {
      const mockModel = {
        id: "model-123",
        providerId: "openai-provider",
        provider: { name: "OpenAI" },
        config: { modelId: "gpt-4" },
        universalModelId: "gpt-4",
      };

      const mockToken = { token: "sk-test-token" };
      const onMessageSave = vi.fn();

      vi.mocked(AiStudioService.getModelById).mockResolvedValue(
        mockModel as any,
      );
      vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
        mockToken as any,
      );
      vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue("");

      const mockCreateOpenAI = vi.fn().mockReturnValue(vi.fn());
      vi.mocked(createOpenAI).mockImplementation(mockCreateOpenAI);

      const mockStreamResponse = {
        toDataStreamResponse: vi.fn().mockReturnValue({}),
      };

      const mockStreamText = vi.fn().mockImplementation((options) => {
        // Simulate the onFinish callback
        if (options.onFinish) {
          setTimeout(() => {
            options.onFinish({
              text: "Test response",
              usage: {
                totalTokens: 50,
                promptTokens: 30,
                completionTokens: 20,
              },
              finishReason: "stop",
            });
          }, 0);
        }
        return mockStreamResponse;
      });
      vi.mocked(streamText).mockImplementation(mockStreamText);

      await AiStudioService.streamChatResponse({
        messages: [{ role: "user", content: "Test message" }],
        sessionId: "session-123",
        userId: "user-123",
        teamId: "team-123",
        modelId: "model-123",
        onMessageSave,
      });

      // Wait for async callback
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onMessageSave).toHaveBeenCalledWith({
        content: "Test response",
        metadata: expect.objectContaining({
          requestedModel: "gpt-4",
          actualModelUsed: "gpt-4",
          providerId: "openai-provider",
          providerName: "OpenAI",
          usage: { totalTokens: 50, promptTokens: 30, completionTokens: 20 },
          finishReason: "stop",
          timestamp: expect.any(String),
        }),
      });
    });

    it("should handle error propagation between services", async () => {
      const onError = vi.fn();

      // Mock AiStudioService.getModelById to throw an error
      vi.mocked(AiStudioService.getModelById).mockRejectedValue(
        new Error("Model not found"),
      );

      await expect(
        AiStudioService.streamChatResponse({
          messages: [{ role: "user", content: "Test" }],
          sessionId: "session-123",
          userId: "user-123",
          teamId: "team-123",
          modelId: "invalid-model",
          onError,
        }),
      ).rejects.toThrow("Model not found");
    });
  });

  describe("Performance and Latency Tests", () => {
    it("should complete streaming workflow within acceptable time", async () => {
      const startTime = Date.now();

      const mockModel = {
        id: "model-123",
        providerId: "openai-provider",
        provider: { name: "OpenAI" },
        config: { modelId: "gpt-4" },
        universalModelId: "gpt-4",
      };

      const mockToken = { token: "sk-test-token" };

      vi.mocked(AiStudioService.getModelById).mockResolvedValue(
        mockModel as any,
      );
      vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
        mockToken as any,
      );
      vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue("");

      const mockCreateOpenAI = vi.fn().mockReturnValue(vi.fn());
      vi.mocked(createOpenAI).mockImplementation(mockCreateOpenAI);

      const mockStreamResponse = {
        toDataStreamResponse: vi.fn().mockReturnValue({}),
      };
      vi.mocked(streamText).mockReturnValue(mockStreamResponse as any);

      await AiStudioService.streamChatResponse({
        messages: [{ role: "user", content: "Performance test" }],
        sessionId: "session-123",
        userId: "user-123",
        teamId: "team-123",
        modelId: "model-123",
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify latency is under 100ms (as specified in acceptance criteria)
      expect(duration).toBeLessThan(100);
    });
  });
});
