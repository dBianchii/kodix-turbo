"use client";

import type { Message } from "@ai-sdk/react";
import type { AppendMessage, ThreadMessageLike } from "@assistant-ui/react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { useSessionWithMessages } from "../_hooks/useSessionWithMessages";

const convertMessage = (message: Message): ThreadMessageLike => {
  return {
    role: message.role as "user" | "assistant" | "system",
    content: [{ type: "text", text: message.content }],
    id: message.id || `msg-${Date.now()}`,
    createdAt: new Date(),
  };
};

interface ExternalStoreRuntimeProviderProps {
  children: ReactNode;
  sessionId: string | undefined;
  onNewSession?: (sessionId: string) => void;
}

interface UseChatExternalStoreOptions {
  sessionId: string | undefined;
}

/**
 * ExternalStoreRuntime Provider que integra Assistant-UI com React Query
 * Resolve automaticamente sincronização de títulos via invalidação de cache
 * Alinhado com arquitetura thread-first do Assistant-UI
 */
export function ExternalStoreRuntimeProvider({
  children,
  sessionId,
  onNewSession,
}: ExternalStoreRuntimeProviderProps) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [isRunning, setIsRunning] = useState(false);

  // Buscar sessão e mensagens via React Query
  const {
    session,
    initialMessages,
    isLoading: isLoadingSession,
    refetch,
  } = useSessionWithMessages(sessionId ?? "", {
    enabled: !!sessionId,
  });

  // Converter mensagens do formato AI SDK para ThreadMessageLike
  const threadMessages = useMemo(() => {
    if (!initialMessages) return [];
    return initialMessages.map(convertMessage);
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

      // Simplificar extração de texto da mensagem
      let input = "";
      const firstContent = message.content[0];

      if (typeof firstContent === "string") {
        input = firstContent;
      } else if (firstContent && "text" in firstContent) {
        input = (firstContent as any).text;
      } else {
        throw new Error("Apenas mensagens de texto são suportadas");
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
              ...threadMessages.map((msg: any) => ({
                role: msg.role,
                content:
                  msg.content[0]?.type === "text" ? msg.content[0].text : "",
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

        // Processar stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Sem body na resposta");
        }

        const decoder = new TextDecoder();
        let assistantResponse = "";

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
                  assistantResponse += parsed.content;
                }
              } catch (e) {
                console.warn("Erro de parsing:", e);
              }
            }
          }
        }

        console.log("✅ [EXTERNAL_STORE] Mensagem processada com sucesso");

        // 🔄 INVALIDAÇÃO AUTOMÁTICA: Forçar re-fetch das queries
        // Isso automaticamente sincroniza títulos atualizados
        await Promise.all([
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
        throw error;
      } finally {
        setIsRunning(false);
      }
    },
    [sessionId, threadMessages, queryClient, refetch],
  );

  // Handler para edição de mensagens
  const onEdit = useCallback(
    async (message: AppendMessage) => {
      console.log("✏️ [EXTERNAL_STORE] Editando mensagem:", message);
      // Implementar lógica de edição se necessário
      await onNew(message);
    },
    [onNew],
  );

  // Handler para recarregar mensagens
  const onReload = useCallback(
    async (parentId: string | null) => {
      console.log("🔄 [EXTERNAL_STORE] Recarregando mensagem:", parentId);
      // Implementar lógica de reload se necessário
      await refetch();
    },
    [refetch],
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
    onEdit,
    onReload,
    onCancel,
    convertMessage: (message: any) => message,
  });

  // Loading state enquanto carrega sessão
  if (isLoadingSession) {
    console.log("⏳ [EXTERNAL_STORE] Carregando sessão...");
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export function useChatExternalStore({
  sessionId,
}: UseChatExternalStoreOptions) {
  // ✅ OTIMIZAÇÃO: Chamar o hook condicionalmente
  const {
    session,
    initialMessages,
    isLoading: isLoadingMessages,
    isError,
    error,
    refetch,
  } = useSessionWithMessages(sessionId, {
    enabled: !!sessionId,
  });

  // Extrair o último ID de modelo usado na sessão (se houver)
  const lastUsedModelId = useMemo(() => {
    // ... existing code ...
  }, [initialMessages]);

  // ... rest of the existing code ...
}

export function useChatLogic(
  sessionId: string | undefined,
  options: {
    onNewSession?: (sessionId: string) => void;
  },
) {
  const {
    session,
    initialMessages,
    isLoading: isLoadingSession,
    refetch,
  } = useSessionWithMessages(sessionId);

  // Converter mensagens do formato AI SDK para ThreadMessageLike
  const threadMessages = useMemo(() => {
    if (!initialMessages) return [];
    return initialMessages.map(convertMessage);
  }, [initialMessages, convertMessage]);

  // ... rest of the existing code ...
}
