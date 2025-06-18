import { describe, expect, test } from "vitest";

import { VercelAIAdapter } from "./vercel-ai-adapter";

describe("Vercel AI SDK Setup", () => {
  test("should import ai package without errors", async () => {
    const ai = await import("ai");
    expect(ai.streamText).toBeDefined();
    expect(ai.generateObject).toBeDefined();
  });

  test("should import openai provider without errors", async () => {
    const openaiProvider = await import("@ai-sdk/openai");
    expect(openaiProvider.openai).toBeDefined();
  });

  test("should import anthropic provider without errors", async () => {
    const anthropicProvider = await import("@ai-sdk/anthropic");
    expect(anthropicProvider.anthropic).toBeDefined();
  });
});

describe("VercelAIAdapter", () => {
  test("should create adapter instance", () => {
    const adapter = new VercelAIAdapter();
    expect(adapter).toBeInstanceOf(VercelAIAdapter);
  });

  test("should return mock stream response", async () => {
    const adapter = new VercelAIAdapter();
    const params = {
      chatSessionId: "test-session",
      content: "test message",
      modelId: "test-model",
      teamId: "test-team",
      messages: [{ senderRole: "user" as const, content: "test" }],
    };

    const result = await adapter.streamResponse(params);

    expect(result.stream).toBeInstanceOf(ReadableStream);
    expect(result.metadata.model).toBe("mock-model");
    expect(result.metadata.finishReason).toBe("stop");
  });

  test("should handle stream content correctly", async () => {
    const adapter = new VercelAIAdapter();
    const params = {
      chatSessionId: "test-session",
      content: "test message",
      modelId: "test-model",
      teamId: "test-team",
      messages: [{ senderRole: "user" as const, content: "test" }],
    };

    const result = await adapter.streamResponse(params);
    const reader = result.stream.getReader();
    const { value, done } = await reader.read();

    expect(done).toBe(false);
    expect(new TextDecoder().decode(value)).toBe("Mock adapter working!");

    const { done: secondDone } = await reader.read();
    expect(secondDone).toBe(true);
  });
});
