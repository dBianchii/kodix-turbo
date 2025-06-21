"use client";

import type { ChatModelAdapter } from "@assistant-ui/react";
import type { ReactNode } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";

const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    console.log("🚀 [ASSISTANT-UI] Iniciando streaming...");

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          useAgent: true,
        }),
        signal: abortSignal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedText += parsed.content;

                // Yield o texto acumulado
                yield {
                  content: [
                    {
                      type: "text",
                      text: accumulatedText,
                    },
                  ],
                };
              }
            } catch (e) {
              // Ignorar erros de parsing
              console.warn("Parse error:", e);
            }
          }
        }
      }

      console.log("✅ [ASSISTANT-UI] Streaming completo");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("🛑 [ASSISTANT-UI] Streaming cancelado");
        return;
      }

      console.error("❌ [ASSISTANT-UI] Erro no streaming:", error);
      throw error;
    }
  },
};

export function ChatAssistantProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const runtime = useLocalRuntime(MyModelAdapter, {
    // Configurações adicionais
    maxSteps: 5, // Máximo de tool calls sequenciais
    // Adapters podem ser adicionados aqui futuramente
    adapters: {
      // history: historyAdapter,
      // attachments: attachmentAdapter,
      // speech: speechAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
