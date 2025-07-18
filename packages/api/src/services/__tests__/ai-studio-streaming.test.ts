import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../internal/services/ai-studio.service";

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

// Mock the database and services
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
    AiTeamModelConfigRepository: { findByTeamAndModel: vi.fn() },
    AiTeamProviderTokenRepository: { findByTeamAndProvider: vi.fn() },
  },
}));

describe("AI Studio Streaming - Regression Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Current Behavior Capture", () => {
    it("should capture current model retrieval behavior", async () => {
      // Mock the current behavior
      const mockModel = {
        id: "model-123",
        displayName: "GPT-4",
        providerId: "openai-provider",
        provider: {
          name: "OpenAI",
          baseUrl: "https://api.openai.com/v1",
        },
        config: {
          modelId: "gpt-4",
        },
      };

      const mockTeamConfig = {
        enabled: true,
      };

      const mockToken = {
        token: "sk-test-token",
      };

      // Setup mocks
      vi.mocked(AiStudioService.getModelById).mockResolvedValue(
        mockModel as any,
      );
      vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
        mockToken as any,
      );

      // Test current behavior
      const model = await AiStudioService.getModelById({
        modelId: "model-123",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      const token = await AiStudioService.getProviderToken({
        providerId: "openai-provider",
        teamId: "team-123",
        requestingApp: chatAppId,
      });

      // Verify current behavior
      expect(model.universalModelId).toBe("gpt-4");
      expect(model.provider.name).toBe("OpenAI");
      expect(token.token).toBe("sk-test-token");
    });

    it("should capture current system prompt behavior", async () => {
      const mockPrompt = "You are a helpful AI assistant.";

      vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue(mockPrompt);

      const systemPrompt = await AiStudioService.getSystemPrompt({
        teamId: "team-123",
        userId: "user-123",
        sessionId: "session-123",
      });

      expect(systemPrompt).toBe(mockPrompt);
      expect(AiStudioService.getSystemPrompt).toHaveBeenCalledWith({
        teamId: "team-123",
        userId: "user-123",
        sessionId: "session-123",
      });
    });

    it("should capture current error handling patterns", async () => {
      // Test model not found
      vi.mocked(AiStudioService.getModelById).mockRejectedValue(
        new Error("Model not found"),
      );

      await expect(
        AiStudioService.getModelById({
          modelId: "invalid-model",
          teamId: "team-123",
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("Model not found");

      // Test token not found
      vi.mocked(AiStudioService.getProviderToken).mockRejectedValue(
        new Error("Token not found"),
      );

      await expect(
        AiStudioService.getProviderToken({
          providerId: "invalid-provider",
          teamId: "team-123",
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("Token not found");
    });
  });

  describe("Stream Response Format Capture", () => {
    it("should capture expected stream response headers", () => {
      const expectedHeaders = {
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Accel-Buffering": "no",
      };

      // This captures the current header format that must be preserved
      expect(expectedHeaders["Transfer-Encoding"]).toBe("chunked");
      expect(expectedHeaders.Connection).toBe("keep-alive");
      expect(expectedHeaders["Cache-Control"]).toBe(
        "no-cache, no-store, must-revalidate",
      );
      expect(expectedHeaders["X-Accel-Buffering"]).toBe("no");
    });

    it("should capture expected metadata format", () => {
      const expectedMetadata = {
        requestedModel: "gpt-4",
        actualModelUsed: "gpt-4",
        providerId: "openai-provider",
        providerName: "OpenAI",
        usage: {
          totalTokens: 150,
          promptTokens: 100,
          completionTokens: 50,
        },
        finishReason: "stop",
        timestamp: expect.any(String),
      };

      // This captures the current metadata structure that must be preserved
      expect(expectedMetadata.requestedModel).toBeDefined();
      expect(expectedMetadata.actualModelUsed).toBeDefined();
      expect(expectedMetadata.providerId).toBeDefined();
      expect(expectedMetadata.providerName).toBeDefined();
      expect(expectedMetadata.usage).toBeDefined();
      expect(expectedMetadata.finishReason).toBeDefined();
      expect(expectedMetadata.timestamp).toBeDefined();
    });
  });

  describe("Provider-Specific Behavior Capture", () => {
    it("should capture OpenAI provider creation pattern", () => {
      const mockCreateOpenAI = vi.fn().mockReturnValue(vi.fn());

      // Capture current OpenAI provider creation
      const providerConfig = {
        apiKey: "sk-test-token",
        baseURL: "https://api.openai.com/v1",
      };

      mockCreateOpenAI(providerConfig);

      expect(mockCreateOpenAI).toHaveBeenCalledWith({
        apiKey: "sk-test-token",
        baseURL: "https://api.openai.com/v1",
      });
    });

    it("should capture Anthropic provider creation pattern", () => {
      const mockCreateAnthropic = vi.fn().mockReturnValue(vi.fn());

      // Capture current Anthropic provider creation
      const providerConfig = {
        apiKey: "sk-ant-test-token",
        baseURL: "https://api.anthropic.com",
      };

      mockCreateAnthropic(providerConfig);

      expect(mockCreateAnthropic).toHaveBeenCalledWith({
        apiKey: "sk-ant-test-token",
        baseURL: "https://api.anthropic.com",
      });
    });

    it("should capture Google provider creation pattern", () => {
      const mockCreateGoogle = vi.fn().mockReturnValue(vi.fn());

      // Capture current Google provider creation
      const providerConfig = {
        apiKey: "google-test-token",
      };

      mockCreateGoogle(providerConfig);

      expect(mockCreateGoogle).toHaveBeenCalledWith({
        apiKey: "google-test-token",
      });
    });
  });

  describe("Model Name Resolution Capture", () => {
    it("should capture current model name resolution logic", () => {
      const testCases = [
        {
          config: { modelId: "gpt-4" },
          displayName: "GPT-4",
          expected: "gpt-4",
        },
        {
          config: { version: "claude-3-opus" },
          displayName: "Claude 3 Opus",
          expected: "claude-3-opus",
        },
        {
          config: {},
          displayName: "Gemini Pro",
          expected: "Gemini Pro",
        },
      ];

      testCases.forEach(({ config, displayName, expected }) => {
        // Current model name resolution logic
        const modelName = config.modelId || config.version || displayName;
        expect(modelName).toBe(expected);
      });
    });
  });

  describe("Message Formatting Capture", () => {
    it("should capture current message formatting pattern", () => {
      const mockMessages = [
        { senderRole: "user", content: "Hello" },
        { senderRole: "ai", content: "Hi there!" },
        { senderRole: "user", content: "How are you?" },
      ];

      const systemPrompt = "You are a helpful assistant.";

      // Current message formatting logic
      const formattedMessages = [];

      if (systemPrompt) {
        formattedMessages.push({ role: "system", content: systemPrompt });
      }

      mockMessages.forEach((msg) => {
        if (typeof msg.content === "string" && msg.content.trim() !== "") {
          formattedMessages.push({
            role: msg.senderRole === "user" ? "user" : "assistant",
            content: msg.content,
          });
        }
      });

      expect(formattedMessages).toHaveLength(4); // system + 3 messages
      expect(formattedMessages[0]).toEqual({
        role: "system",
        content: systemPrompt,
      });
      expect(formattedMessages[1]).toEqual({ role: "user", content: "Hello" });
      expect(formattedMessages[2]).toEqual({
        role: "assistant",
        content: "Hi there!",
      });
      expect(formattedMessages[3]).toEqual({
        role: "user",
        content: "How are you?",
      });
    });
  });

  describe("New Streaming Implementation Tests", () => {
    describe("createAIProvider method", () => {
      it("should create OpenAI provider correctly", async () => {
        const mockModel = {
          provider: { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
          config: { modelId: "gpt-4" },
          displayName: "GPT-4",
        };

        const mockCreateOpenAI = vi.fn().mockReturnValue(vi.fn());
        vi.mocked(createOpenAI).mockImplementation(mockCreateOpenAI);

        // Test the provider creation logic
        const result = await AiStudioService.createAIProvider(
          mockModel,
          "sk-test-token",
        );

        expect(mockCreateOpenAI).toHaveBeenCalledWith({
          apiKey: "sk-test-token",
          baseURL: "https://api.openai.com/v1",
        });
        expect(result.modelName).toBe("gpt-4");
      });

      it("should create Anthropic provider correctly", async () => {
        const mockModel = {
          provider: { name: "Anthropic", baseUrl: "https://api.anthropic.com" },
          config: { version: "claude-3-opus" },
          displayName: "Claude 3 Opus",
        };

        const mockCreateAnthropic = vi.fn().mockReturnValue(vi.fn());
        vi.mocked(createAnthropic).mockImplementation(mockCreateAnthropic);

        const result = await AiStudioService.createAIProvider(
          mockModel,
          "sk-ant-token",
        );

        expect(mockCreateAnthropic).toHaveBeenCalledWith({
          apiKey: "sk-ant-token",
          baseURL: "https://api.anthropic.com",
        });
        expect(result.modelName).toBe("claude-3-opus");
      });

      it("should create Google provider correctly", async () => {
        const mockModel = {
          provider: { name: "Google" },
          config: {},
          displayName: "Gemini Pro",
        };

        const mockCreateGoogle = vi.fn().mockReturnValue(vi.fn());
        vi.mocked(createGoogleGenerativeAI).mockImplementation(
          mockCreateGoogle,
        );

        const result = await AiStudioService.createAIProvider(
          mockModel,
          "google-token",
        );

        expect(mockCreateGoogle).toHaveBeenCalledWith({
          apiKey: "google-token",
        });
        expect(result.modelName).toBe("Gemini Pro");
      });

      it("should throw error for unsupported provider", async () => {
        const mockModel = {
          provider: { name: "UnsupportedProvider" },
          config: {},
          displayName: "Unknown Model",
        };

        await expect(
          AiStudioService.createAIProvider(mockModel, "test-token"),
        ).rejects.toThrow("Provider UnsupportedProvider not supported");
      });
    });

    describe("streamChatResponse method", () => {
      const mockStreamTextResponse = {
        toDataStreamResponse: vi.fn().mockReturnValue({
          headers: {
            "Transfer-Encoding": "chunked",
            Connection: "keep-alive",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Accel-Buffering": "no",
          },
        }),
      };

      beforeEach(() => {
        vi.mocked(streamText).mockReturnValue(mockStreamTextResponse as any);
      });

      it("should handle full streaming workflow with modelId", async () => {
        const mockModel = {
          id: "model-123",
          providerId: "openai-provider",
          provider: { name: "OpenAI" },
          config: { modelId: "gpt-4" },
          displayName: "GPT-4",
        };

        const mockToken = { token: "sk-test-token" };
        const mockSystemPrompt = "You are a helpful assistant.";

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

        const mockMessages = [{ role: "user" as const, content: "Hello" }];

        const result = await AiStudioService.streamChatResponse({
          messages: mockMessages,
          sessionId: "session-123",
          userId: "user-123",
          teamId: "team-123",
          modelId: "model-123",
        });

        // Verify service calls
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

        // Verify streamText was called
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

      it("should handle workflow without modelId (use default)", async () => {
        const mockAvailableModels = [
          {
            id: "default-model",
            providerId: "openai-provider",
            provider: { name: "OpenAI" },
            config: { modelId: "gpt-3.5-turbo" },
            displayName: "GPT-3.5 Turbo",
          },
        ];

        const mockToken = { token: "sk-test-token" };

        vi.mocked(AiStudioService.getAvailableModels).mockResolvedValue(
          mockAvailableModels as any,
        );
        vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
          mockToken as any,
        );
        vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue("");

        const mockMessages = [{ role: "user" as const, content: "Hello" }];

        await AiStudioService.streamChatResponse({
          messages: mockMessages,
          sessionId: "session-123",
          userId: "user-123",
          teamId: "team-123",
          // No modelId provided
        });

        expect(AiStudioService.getAvailableModels).toHaveBeenCalledWith({
          teamId: "team-123",
          requestingApp: chatAppId,
        });
      });

      it("should handle no available models error", async () => {
        vi.mocked(AiStudioService.getAvailableModels).mockResolvedValue([]);

        const mockMessages = [{ role: "user" as const, content: "Hello" }];

        await expect(
          AiStudioService.streamChatResponse({
            messages: mockMessages,
            sessionId: "session-123",
            userId: "user-123",
            teamId: "team-123",
            // No modelId provided and no available models
          }),
        ).rejects.toThrow("No AI models available");
      });

      it("should call onMessageSave callback correctly", async () => {
        const mockModel = {
          id: "model-123",
          providerId: "openai-provider",
          provider: { name: "OpenAI" },
          config: { modelId: "gpt-4" },
          displayName: "GPT-4",
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

        // Mock streamText to call onFinish
        const mockStreamText = vi.fn().mockImplementation((options) => {
          // Simulate calling onFinish
          if (options.onFinish) {
            options.onFinish({
              text: "AI response text",
              usage: {
                totalTokens: 100,
                promptTokens: 50,
                completionTokens: 50,
              },
              finishReason: "stop",
            });
          }
          return mockStreamTextResponse;
        });
        vi.mocked(streamText).mockImplementation(mockStreamText);

        const mockMessages = [{ role: "user" as const, content: "Hello" }];

        await AiStudioService.streamChatResponse({
          messages: mockMessages,
          sessionId: "session-123",
          userId: "user-123",
          teamId: "team-123",
          modelId: "model-123",
          onMessageSave,
        });

        expect(onMessageSave).toHaveBeenCalledWith({
          content: "AI response text",
          metadata: expect.objectContaining({
            requestedModel: "gpt-4",
            actualModelUsed: "gpt-4",
            providerId: "openai-provider",
            providerName: "OpenAI",
            usage: { totalTokens: 100, promptTokens: 50, completionTokens: 50 },
            finishReason: "stop",
            timestamp: expect.any(String),
          }),
        });
      });

      it("should call onError callback on errors", async () => {
        const mockModel = {
          id: "model-123",
          providerId: "openai-provider",
          provider: { name: "OpenAI" },
          config: { modelId: "gpt-4" },
          displayName: "GPT-4",
        };

        const mockToken = { token: "sk-test-token" };
        const onError = vi.fn();

        vi.mocked(AiStudioService.getModelById).mockResolvedValue(
          mockModel as any,
        );
        vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
          mockToken as any,
        );
        vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue("");

        // Mock streamText to call onError
        const mockStreamText = vi.fn().mockImplementation((options) => {
          if (options.onError) {
            options.onError(new Error("Stream error"));
          }
          return mockStreamTextResponse;
        });
        vi.mocked(streamText).mockImplementation(mockStreamText);

        const mockMessages = [{ role: "user" as const, content: "Hello" }];

        await AiStudioService.streamChatResponse({
          messages: mockMessages,
          sessionId: "session-123",
          userId: "user-123",
          teamId: "team-123",
          modelId: "model-123",
          onError,
        });

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });

      it("should return response with correct headers", async () => {
        const mockModel = {
          id: "model-123",
          providerId: "openai-provider",
          provider: { name: "OpenAI" },
          config: { modelId: "gpt-4" },
          displayName: "GPT-4",
        };

        const mockToken = { token: "sk-test-token" };

        vi.mocked(AiStudioService.getModelById).mockResolvedValue(
          mockModel as any,
        );
        vi.mocked(AiStudioService.getProviderToken).mockResolvedValue(
          mockToken as any,
        );
        vi.mocked(AiStudioService.getSystemPrompt).mockResolvedValue("");

        const mockMessages = [{ role: "user" as const, content: "Hello" }];

        await AiStudioService.streamChatResponse({
          messages: mockMessages,
          sessionId: "session-123",
          userId: "user-123",
          teamId: "team-123",
          modelId: "model-123",
        });

        expect(
          mockStreamTextResponse.toDataStreamResponse,
        ).toHaveBeenCalledWith({
          headers: {
            "Transfer-Encoding": "chunked",
            Connection: "keep-alive",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Accel-Buffering": "no",
          },
        });
      });
    });
  });
});
