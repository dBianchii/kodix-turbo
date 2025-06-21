// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

interface UseEmptySessionOptions {
  onSuccess?: (sessionId: string) => void;
}

/**
 * Hook para criação de sessão Thread-First (Assistant-UI Pattern)
 *
 * NOVO PADRÃO: Não cria sessão vazia, apenas prepara para criação
 * quando houver primeira mensagem. Isso elimina títulos temporários.
 */
export function useEmptySession(options?: UseEmptySessionOptions) {
  const router = useRouter();
  const trpc = useTRPC();

  // ✅ THREAD-FIRST: Não criar sessão vazia, apenas preparar estado
  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (data) => {
        const sessionId = data.session.id;
        console.log(
          "✅ [EMPTY_SESSION] Thread-First: Sessão criada com primeira mensagem:",
          sessionId,
        );

        // Navegar para a nova sessão
        router.push(`/apps/chat/${sessionId}`);

        // Chamar callback se fornecido
        options?.onSuccess?.(sessionId);
      },
      onError: (error) => {
        console.error("❌ [EMPTY_SESSION] Erro ao criar sessão:", error);
      },
    }),
  );

  // ✅ THREAD-FIRST: Função para iniciar nova conversa (será chamada pelo ChatWindow)
  const startNewConversation = () => {
    console.log(
      "🚀 [EMPTY_SESSION] Thread-First: Preparando para nova conversa...",
    );
    // Não cria sessão aqui - deixa para o envio da primeira mensagem
    router.push("/apps/chat");
  };

  return {
    // ✅ THREAD-FIRST: Função para navegar para estado inicial
    startNewConversation,

    // ✅ LEGACY: Manter compatibilidade temporária (será removido)
    createEmptySession: createEmptySessionMutation.mutate,
    isCreating: createEmptySessionMutation.isPending,
    error: createEmptySessionMutation.error,
  };
}
