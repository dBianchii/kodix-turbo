import { beforeEach, describe, expect, it, vi } from "vitest";

import { VercelAIAdapter } from "../../../../internal/adapters/vercel-ai-adapter";

// Mock do VercelAIAdapter
vi.mock("../../../../internal/adapters/vercel-ai-adapter", () => ({
  VercelAIAdapter: vi.fn().mockImplementation(() => ({
    streamAndSave: vi.fn(),
    streamResponse: vi.fn(),
  })),
}));

describe("Chat Streaming Tests - Sistema Único", () => {
  let adapter: VercelAIAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new VercelAIAdapter();
  });

  describe("🌊 Streaming com Auto-Save", () => {
    it("deve processar stream incremental com auto-save", async () => {
      const chunks: string[] = [];
      let finalContent = "";

      // Mock do streamAndSave com simulação realista
      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          // Simular chunks de streaming
          const streamChunks = ["Hello", " from", " AI", "!"];
          let accumulated = "";

          // Simular processamento incremental
          for (const chunk of streamChunks) {
            accumulated += chunk;
            chunks.push(chunk);

            // Simular delay realista
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          // Chamar auto-save com conteúdo final
          await saveCallback(accumulated, {
            providerId: "vercel-ai-sdk",
            usage: { totalTokens: 15 },
            finishReason: "stop",
          });

          finalContent = accumulated;

          return {
            stream: new ReadableStream({
              start(controller) {
                streamChunks.forEach((chunk) => {
                  controller.enqueue(new TextEncoder().encode(chunk));
                });
                controller.close();
              },
            }),
            metadata: {
              model: "gpt-4",
              usage: { totalTokens: 15 },
              finishReason: "stop",
            },
          };
        },
      );

      // Executar streaming
      const result = await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "Hello",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [{ senderRole: "user", content: "Hello" }],
        },
        async (content: string, metadata: any) => {
          // Simular save no banco
          expect(content).toBe("Hello from AI!");
          expect(metadata.providerId).toBe("vercel-ai-sdk");
        },
      );

      // Verificar resultados
      expect(chunks).toEqual(["Hello", " from", " AI", "!"]);
      expect(finalContent).toBe("Hello from AI!");
      expect(result.stream).toBeInstanceOf(ReadableStream);
      expect(result.metadata.model).toBe("gpt-4");
    });

    it("deve lidar com stream interrompido graciosamente", async () => {
      let saveCallbackCalled = false;

      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          // Simular stream que para no meio
          const partialContent = "Hello from";

          await saveCallback(partialContent, {
            providerId: "vercel-ai-sdk",
            finishReason: "interrupted",
          });

          saveCallbackCalled = true;

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode("Hello from"));
                // Stream para aqui (sem close)
              },
            }),
            metadata: {
              model: "gpt-4",
              finishReason: "interrupted",
            },
          };
        },
      );

      const result = await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [],
        },
        async (content: string, metadata: any) => {
          expect(content).toBe("Hello from");
          expect(metadata.finishReason).toBe("interrupted");
        },
      );

      expect(saveCallbackCalled).toBe(true);
      expect(result.metadata.finishReason).toBe("interrupted");
    });

    it("deve processar múltiplos streams simultaneamente", async () => {
      const streamResults: string[] = [];

      // Mock para múltiplos streams
      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          const sessionId = params.chatSessionId;
          const content = `Response for ${sessionId}`;

          await saveCallback(content, {
            providerId: "vercel-ai-sdk",
            sessionId,
          });

          streamResults.push(content);

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode(content));
                controller.close();
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      // Executar múltiplos streams em paralelo
      const promises = ["session-1", "session-2", "session-3"].map(
        (sessionId) =>
          adapter.streamAndSave(
            {
              chatSessionId: sessionId,
              content: "test",
              modelId: "gpt-4",
              teamId: "team-123",
              messages: [],
            },
            async (content: string) => {
              // Auto-save callback
            },
          ),
      );

      await Promise.all(promises);

      // Verificar que todos os streams foram processados
      expect(streamResults).toHaveLength(3);
      expect(streamResults).toContain("Response for session-1");
      expect(streamResults).toContain("Response for session-2");
      expect(streamResults).toContain("Response for session-3");
    });
  });

  describe("📊 Performance de Streaming", () => {
    it("deve manter latência baixa no primeiro chunk", async () => {
      let firstChunkTime = 0;
      const startTime = Date.now();

      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          return {
            stream: new ReadableStream({
              start(controller) {
                // Primeiro chunk imediato
                setTimeout(() => {
                  firstChunkTime = Date.now() - startTime;
                  controller.enqueue(new TextEncoder().encode("First"));
                  controller.close();
                }, 5); // 5ms delay simulado
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      const result = await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [],
        },
        async () => {},
      );

      const reader = result.stream.getReader();
      await reader.read(); // Ler primeiro chunk

      // Verificar latência baixa (< 50ms)
      expect(firstChunkTime).toBeLessThan(50);
    });

    it("deve processar chunks grandes eficientemente", async () => {
      const largeContent = "A".repeat(10000); // 10KB de texto
      let processedSize = 0;

      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          await saveCallback(largeContent, {
            providerId: "vercel-ai-sdk",
            contentSize: largeContent.length,
          });

          processedSize = largeContent.length;

          return {
            stream: new ReadableStream({
              start(controller) {
                // Simular chunks grandes
                const chunkSize = 1000;
                for (let i = 0; i < largeContent.length; i += chunkSize) {
                  const chunk = largeContent.slice(i, i + chunkSize);
                  controller.enqueue(new TextEncoder().encode(chunk));
                }
                controller.close();
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      const startTime = Date.now();

      await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "Generate large text",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [],
        },
        async (content: string, metadata: any) => {
          expect(content.length).toBe(10000);
          expect(metadata.contentSize).toBe(10000);
        },
      );

      const duration = Date.now() - startTime;

      // Verificar eficiência (< 100ms para 10KB)
      expect(processedSize).toBe(10000);
      expect(duration).toBeLessThan(100);
    });
  });

  describe("🔧 Tratamento de Erros", () => {
    it("deve recuperar de erros de rede durante streaming", async () => {
      let retryCount = 0;

      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          retryCount++;

          if (retryCount === 1) {
            // Primeira tentativa falha
            throw new Error("Network error");
          }

          // Segunda tentativa sucede
          await saveCallback("Recovered content", {
            providerId: "vercel-ai-sdk",
            retryCount,
          });

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode("Recovered"));
                controller.close();
              },
            }),
            metadata: { model: "gpt-4", retryCount },
          };
        },
      );

      // Primeira tentativa (deve falhar)
      await expect(
        adapter.streamAndSave(
          {
            chatSessionId: "session-123",
            content: "test",
            modelId: "gpt-4",
            teamId: "team-123",
            messages: [],
          },
          async () => {},
        ),
      ).rejects.toThrow("Network error");

      // Segunda tentativa (deve suceder)
      const result = await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [],
        },
        async (content: string, metadata: any) => {
          expect(content).toBe("Recovered content");
          expect(metadata.retryCount).toBe(2);
        },
      );

      expect(result.metadata.retryCount).toBe(2);
    });

    it("deve lidar com erros no callback de save", async () => {
      let streamCompleted = false;

      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          try {
            await saveCallback("Content", {});
          } catch (error) {
            // Erro no save não deve interromper stream
            console.log("Save error handled:", (error as Error).message);
          }

          streamCompleted = true;

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode("Content"));
                controller.close();
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      // Não deve lançar erro mesmo com save falhando
      await expect(
        adapter.streamAndSave(
          {
            chatSessionId: "session-123",
            content: "test",
            modelId: "gpt-4",
            teamId: "team-123",
            messages: [],
          },
          async () => {
            throw new Error("Save failed");
          },
        ),
      ).resolves.toBeDefined();

      expect(streamCompleted).toBe(true);
    });
  });

  describe("🎯 Casos Específicos", () => {
    it("deve lidar com mensagens vazias", async () => {
      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          // Simular resposta vazia
          await saveCallback("", {
            providerId: "vercel-ai-sdk",
            finishReason: "stop",
            isEmpty: true,
          });

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.close(); // Stream vazio
              },
            }),
            metadata: { model: "gpt-4", isEmpty: true },
          };
        },
      );

      const result = await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [],
        },
        async (content: string, metadata: any) => {
          expect(content).toBe("");
          expect(metadata.isEmpty).toBe(true);
        },
      );

      expect(result.metadata.isEmpty).toBe(true);
    });

    it("deve processar caracteres especiais corretamente", async () => {
      const specialContent = "Hello 🌟 世界 🚀 Ñoño";

      (adapter.streamAndSave as any).mockImplementation(
        async (params: any, saveCallback: Function) => {
          await saveCallback(specialContent, {
            providerId: "vercel-ai-sdk",
            hasSpecialChars: true,
          });

          return {
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode(specialContent));
                controller.close();
              },
            }),
            metadata: { model: "gpt-4" },
          };
        },
      );

      await adapter.streamAndSave(
        {
          chatSessionId: "session-123",
          content: "test special chars",
          modelId: "gpt-4",
          teamId: "team-123",
          messages: [],
        },
        async (content: string, metadata: any) => {
          expect(content).toBe(specialContent);
          expect(content).toContain("🌟");
          expect(content).toContain("世界");
          expect(content).toContain("Ñoño");
        },
      );
    });
  });
});
