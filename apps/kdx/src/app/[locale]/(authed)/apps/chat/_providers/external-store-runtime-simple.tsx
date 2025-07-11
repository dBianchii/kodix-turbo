"use client";

import type { AppendMessage, ThreadMessageLike } from "@assistant-ui/react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@kdx/api";

import { useSessionWithMessages } from "../_hooks/useSessionWithMessages";

type TMessage = RouterOutputs["app"]["chat"]["getMessages"]["messages"][number];
interface ExternalStoreRuntimeProviderProps {
  children: ReactNode;
  sessionId: string | undefined;
}

/**
 * ExternalStoreRuntime Provider simplificado que integra Assistant-UI com React Query
 * Resolve automaticamente sincronização de títulos via invalidação de cache
 * Alinhado com arquitetura thread-first do Assistant-UI
 */
export function ExternalStoreRuntimeProvider({
  children,
  sessionId,
}: ExternalStoreRuntimeProviderProps) {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  // Buscar sessão e mensagens via React Query
  const {
    session,
    initialMessages,
    isLoading: isLoadingSession,
    refetch,
  } = useSessionWithMessages(sessionId);

  // Converter mensagens para formato Assistant-UI
  const threadMessages = useMemo((): ThreadMessageLike[] => {
    if (!initialMessages) return [];

    return initialMessages
      .filter((msg) => msg.role !== "data")
      .map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        content: [{ type: "text", text: msg.content }],
        createdAt: msg.createdAt ?? new Date(),
      }));
  }, [initialMessages]);

  // Handler para novas mensagens
  const onNew = useCallback(
    async (message: AppendMessage) => {
      if (!sessionId) {
        console.warn(
          "⚠️ [EXTERNAL_STORE] Tentativa de enviar mensagem sem sessionId",
        );
        return;
      }

      // Extrair texto da mensagem de forma segura
      let input = "";
      const content = message.content[0];

      if (typeof content === "string") {
        input = content;
      } else if (content && typeof content === "object" && "text" in content) {
        input = (content as { text: string }).text;
      } else {
        throw new Error("Formato de mensagem não suportado");
      }

      console.log(
        "💬 [EXTERNAL_STORE] Nova mensagem:",
        input.slice(0, 50) + "...",
      );
      setIsRunning(true);

      try {
        // Usar o endpoint de stream existente
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatSessionId: sessionId,
            useAgent: true,
            messages: [
              ...threadMessages.map((msg) => ({
                role: msg.role,
                content:
                  typeof msg.content[0] === "string"
                    ? msg.content[0]
                    : (msg.content[0] as { text: string }).text,
              })),
              {
                role: "user",
                content: input,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.statusText}`);
        }

        // Processar stream (simplificado)
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // Processar chunk se necessário
            // console.log(
            //   "📡 [EXTERNAL_STORE] Chunk recebido:",
            //   chunk.slice(0, 100),
            // );
          }
        }

        console.log("✅ [EXTERNAL_STORE] Mensagem processada com sucesso");

        // 🔄 INVALIDAÇÃO AUTOMÁTICA: Forçar re-fetch das queries
        // Isso automaticamente sincroniza títulos atualizados
        await Promise.allSettled([
          queryClient.invalidateQueries({
            queryKey: ["app", "chat", "buscarSession"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["app", "chat", "getMessages"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["app", "chat", "listarSessions"],
          }),
        ]);

        console.log(
          "🔄 [EXTERNAL_STORE] Cache invalidado - títulos sincronizados",
        );

        // Refetch local para atualizar estado imediatamente
        await refetch();
      } catch (error) {
        console.error("❌ [EXTERNAL_STORE] Erro ao processar mensagem:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(String(error));
      } finally {
        setIsRunning(false);
      }
    },
    [sessionId, threadMessages, queryClient, refetch],
  );

  // Handler para cancelar geração
  const onCancel = useCallback(async () => {
    console.log("🛑 [EXTERNAL_STORE] Cancelando geração");
    setIsRunning(false);
  }, []);

  // Configurar runtime do Assistant-UI
  const runtime = useExternalStoreRuntime({
    messages: threadMessages,
    isRunning,
    onNew,
    onCancel,
    convertMessage: (message: ThreadMessageLike) => message,
  });

  console.log("🔄 [EXTERNAL_STORE] Runtime state:", {
    sessionId,
    messagesCount: threadMessages.length,
    isLoading: isLoadingSession,
    isRunning,
    sessionTitle: session?.title ?? "Sem título",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
