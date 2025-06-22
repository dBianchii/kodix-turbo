// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface UseEmptySessionOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: any) => void;
}

/**
 * Hook para criação de sessão Thread-First (Assistant-UI Pattern)
 *
 * ✅ NAVEGAÇÃO CENTRALIZADA: Não faz router.push aqui - deixa para o componente pai
 * ✅ COMPATÍVEL: Vercel AI SDK + Assistant-UI + TRPC + AiStudioService
 */
export function useEmptySession(options?: UseEmptySessionOptions) {
  const trpc = useTRPC();

  // ✅ THREAD-FIRST: Criar sessão vazia para receber primeira mensagem
  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (data) => {
        const sessionId = data.session.id;
        console.log(
          "✅ [EMPTY_SESSION] Sessão vazia criada (Thread-First):",
          sessionId,
        );

        // ✅ NAVEGAÇÃO CENTRALIZADA: Apenas chamar callback - não navegar aqui
        options?.onSuccess?.(sessionId);
      },
      onError: (error) => {
        console.error("❌ [EMPTY_SESSION] Erro ao criar sessão:", error);
        options?.onError?.(error);
      },
    }),
  );

  // ✅ THREAD-FIRST: Função para criar sessão vazia
  const createEmptySession = async (input?: {
    title?: string;
    generateTitle?: boolean;
    metadata?: Record<string, any>;
  }) => {
    await createEmptySessionMutation.mutateAsync({
      title: input?.title || `Chat ${new Date().toLocaleDateString()}`,
      generateTitle: input?.generateTitle ?? false,
      metadata: input?.metadata || { createdAt: new Date().toISOString() },
    });
  };

  return {
    createEmptySession,
    isCreating: createEmptySessionMutation.isPending,
    error: createEmptySessionMutation.error,
    reset: createEmptySessionMutation.reset,
  };
}
