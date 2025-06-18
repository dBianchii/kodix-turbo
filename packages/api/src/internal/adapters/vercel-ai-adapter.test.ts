import { describe, expect, test } from "vitest";

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
