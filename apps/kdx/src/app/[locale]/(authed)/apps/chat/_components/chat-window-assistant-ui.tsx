"use client";

import { useEffect } from "react";
import { ThreadPrimitive } from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";

import { useEmptySession } from "../_hooks/useEmptySession";
import { WelcomeHeader } from "./welcome-header";
import { WelcomeSuggestions } from "./welcome-suggestions";

interface ChatWindowAssistantUIProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

/**
 * ChatWindow usando Assistant-UI Thread com sincronização automática de títulos
 * Integra com React Query para invalidação de cache em tempo real
 * Alinhado com arquitetura thread-first do Assistant-UI
 */
export function ChatWindowAssistantUI({
  sessionId,
  onNewSession,
}: ChatWindowAssistantUIProps) {
  const queryClient = useQueryClient();
  const isNewConversation = !sessionId;

  // Hook para criar sessões vazias
  const { createEmptySession, isCreating } = useEmptySession({
    onSuccess: (newSessionId) => {
      console.log("✅ [ASSISTANT_UI] Sessão criada com sucesso:", newSessionId);
      onNewSession?.(newSessionId);
    },
    onError: (error) => {
      console.error("❌ [ASSISTANT_UI] Erro ao criar sessão:", error);
    },
  });

  // 🔄 SINCRONIZAÇÃO AUTOMÁTICA: Invalidar cache quando sessão muda
  useEffect(() => {
    if (sessionId) {
      console.log(
        "🔄 [ASSISTANT_UI] Sessão alterada, invalidando cache:",
        sessionId,
      );

      // Invalidar queries relacionadas à sessão para sincronizar títulos
      queryClient.invalidateQueries({
        queryKey: ["app", "chat", "buscarSession"],
      });

      queryClient.invalidateQueries({
        queryKey: ["app", "chat", "listarSessions"],
      });
    }
  }, [sessionId, queryClient]);

  // 🔄 LISTENER PARA MUDANÇAS: Escutar eventos de atualização de título
  useEffect(() => {
    const handleTitleUpdate = () => {
      console.log("🔄 [ASSISTANT_UI] Título atualizado, invalidando cache");

      queryClient.invalidateQueries({
        queryKey: ["app", "chat"],
      });
    };

    // Simular listener de eventos (pode ser substituído por WebSocket ou SSE no futuro)
    const interval = setInterval(() => {
      if (sessionId) {
        // Verificar se há atualizações de título pendentes
        // Por enquanto, invalidamos o cache periodicamente para garantir sincronização
        queryClient.invalidateQueries({
          queryKey: ["app", "chat", "buscarSession", { sessionId }],
        });
      }
    }, 10000); // A cada 10 segundos

    return () => {
      clearInterval(interval);
    };
  }, [sessionId, queryClient]);

  // Handler para nova mensagem via Welcome Screen
  const handleNewMessage = async (message: string) => {
    console.log("🚨 [ASSISTANT_UI] handleNewMessage chamado com:", message);

    if (isCreating) return;

    console.log("🚀 [ASSISTANT_UI] Iniciando criação de sessão vazia...");
    console.log("📝 [ASSISTANT_UI] Mensagem:", message.slice(0, 50) + "...");

    // Salvar mensagem para envio pós-navegação
    const tempSessionId = `temp-${Date.now()}`;
    sessionStorage.setItem(`pending-message-${tempSessionId}`, message);
    console.log("💾 [ASSISTANT_UI] Mensagem salva para envio pós-navegação");

    try {
      await createEmptySession({
        title: `Chat ${new Date().toLocaleDateString()}`,
        generateTitle: true,
        metadata: {
          firstMessage: message,
          createdAt: new Date().toISOString(),
          assistantUI: true,
        },
      });
    } catch (error) {
      console.error("❌ [ASSISTANT_UI] Erro ao criar nova sessão:", error);
      sessionStorage.removeItem(`pending-message-${tempSessionId}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleNewMessage(suggestion);
  };

  // 🎨 WELCOME SCREEN: Para novas conversações
  if (isNewConversation) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-4xl px-4">
              <WelcomeHeader />
              <WelcomeSuggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        </div>

        <div className="bg-background flex-shrink-0 border-t p-4">
          <div className="mx-auto max-w-4xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    handleNewMessage(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                disabled={isCreating}
              />
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 disabled:opacity-50"
                disabled={isCreating}
                onClick={(e) => {
                  const input =
                    e.currentTarget.parentElement?.querySelector("input")!;
                  if (input?.value.trim()) {
                    handleNewMessage(input.value);
                    input.value = "";
                  }
                }}
              >
                {isCreating ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🤖 ASSISTANT-UI THREAD: Para conversações existentes
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ThreadPrimitive.Root className="h-full">
          <ThreadPrimitive.Viewport>
            <ThreadPrimitive.Messages />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </div>
    </div>
  );
}
