import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ChatService } from "./chat.service";

// Mock do feature flag
vi.mock("../config/feature-flags", () => ({
  FEATURE_FLAGS: {
    VERCEL_AI_ADAPTER: false, // Padrão desabilitado
  },
}));

// Mock do adapter
vi.mock("../adapters/vercel-ai-adapter", () => ({
  VercelAIAdapter: vi.fn().mockImplementation(() => ({
    streamResponse: vi.fn().mockResolvedValue({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Test adapter response"));
          controller.close();
        },
      }),
      metadata: {
        model: "test-model",
        usage: null,
        finishReason: "stop",
      },
    }),
  })),
}));

describe("ChatService - Vercel AI Adapter Integration", () => {
  const testParams = {
    chatSessionId: "test-session-id",
    content: "Test message",
    modelId: "test-model",
    teamId: "test-team",
    messages: [
      { senderRole: "user" as const, content: "Hello" },
      { senderRole: "ai" as const, content: "Hi there!" },
    ],
    temperature: 0.7,
    maxTokens: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restaurar o mock do feature flag
    vi.doMock("../config/feature-flags", () => ({
      FEATURE_FLAGS: {
        VERCEL_AI_ADAPTER: false,
      },
    }));
  });

  test("should throw error when feature flag is disabled", async () => {
    // Feature flag já está desabilitada por padrão no mock

    await expect(
      ChatService.streamResponseWithAdapter(testParams),
    ).rejects.toThrow("Vercel AI Adapter not enabled");
  });

  test("should use adapter when feature flag is enabled", async () => {
    // Habilitar feature flag
    vi.doMock("../config/feature-flags", () => ({
      FEATURE_FLAGS: {
        VERCEL_AI_ADAPTER: true,
      },
    }));

    // Re-importar para aplicar o mock
    const { ChatService: ChatServiceWithFlag } = await import("./chat.service");

    const result =
      await ChatServiceWithFlag.streamResponseWithAdapter(testParams);

    expect(result).toBeDefined();
    expect(result.stream).toBeInstanceOf(ReadableStream);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.model).toBe("test-model");
  });

  test("should handle adapter parameters correctly", async () => {
    // Habilitar feature flag
    vi.doMock("../config/feature-flags", () => ({
      FEATURE_FLAGS: {
        VERCEL_AI_ADAPTER: true,
      },
    }));

    const { ChatService: ChatServiceWithFlag } = await import("./chat.service");
    const { VercelAIAdapter } = await import("../adapters/vercel-ai-adapter");

    await ChatServiceWithFlag.streamResponseWithAdapter(testParams);

    // Verificar se o adapter foi chamado com os parâmetros corretos
    const adapterInstance = vi.mocked(VercelAIAdapter).mock.instances[0];
    expect(adapterInstance).toBeDefined();
    const streamResponseMock = vi.mocked(adapterInstance!.streamResponse);

    expect(streamResponseMock).toHaveBeenCalledWith({
      chatSessionId: testParams.chatSessionId,
      content: testParams.content,
      modelId: testParams.modelId,
      teamId: testParams.teamId,
      messages: testParams.messages,
      temperature: testParams.temperature,
      maxTokens: testParams.maxTokens,
      tools: undefined,
    });
  });

  test("should use default modelId when not provided", async () => {
    // Habilitar feature flag
    vi.doMock("../config/feature-flags", () => ({
      FEATURE_FLAGS: {
        VERCEL_AI_ADAPTER: true,
      },
    }));

    const { ChatService: ChatServiceWithFlag } = await import("./chat.service");
    const { VercelAIAdapter } = await import("../adapters/vercel-ai-adapter");

    const paramsWithoutModel = { ...testParams, modelId: undefined };

    await ChatServiceWithFlag.streamResponseWithAdapter(paramsWithoutModel);

    // Verificar se usou "default" como fallback
    const adapterInstance = vi.mocked(VercelAIAdapter).mock.instances[0];
    expect(adapterInstance).toBeDefined();
    const streamResponseMock = vi.mocked(adapterInstance!.streamResponse);

    expect(streamResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        modelId: "default",
      }),
    );
  });

  test("should preserve all original ChatService methods", () => {
    // Verificar que todos os métodos originais ainda existem
    expect(ChatService.findSessionById).toBeDefined();
    expect(ChatService.findMessagesBySession).toBeDefined();
    expect(ChatService.createMessage).toBeDefined();
    expect(ChatService.saveAssistantMessage).toBeDefined();
    expect(ChatService.createSystemMessage).toBeDefined();
    expect(ChatService.hasSystemInstructions).toBeDefined();
    expect(ChatService.updateSession).toBeDefined();

    // E o novo método experimental
    expect(ChatService.streamResponseWithAdapter).toBeDefined();
  });

  test("should handle stream reading correctly", async () => {
    // Habilitar feature flag
    vi.doMock("../config/feature-flags", () => ({
      FEATURE_FLAGS: {
        VERCEL_AI_ADAPTER: true,
      },
    }));

    const { ChatService: ChatServiceWithFlag } = await import("./chat.service");

    const result =
      await ChatServiceWithFlag.streamResponseWithAdapter(testParams);
    const reader = result.stream.getReader();
    const { value, done } = await reader.read();

    expect(done).toBe(false);
    expect(new TextDecoder().decode(value)).toBe("Test adapter response");

    const { done: secondDone } = await reader.read();
    expect(secondDone).toBe(true);
  });
});
