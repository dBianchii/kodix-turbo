"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

interface UseEmptySessionOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

interface CreateEmptySessionInput {
  title?: string;
  generateTitle?: boolean;
  metadata?: Record<string, any>;
}

export function useEmptySession(options?: UseEmptySessionOptions) {
  const router = useRouter();
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 🚀 FASE 2: Mutation para criar sessão vazia (sem primeira mensagem)
  const createEmptyMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (result: any) => {
        console.log("✅ [EMPTY_SESSION] Sessão vazia criada:", result);

        // ✅ Invalidar queries do sidebar para atualizar lista de sessões
        queryClient.invalidateQueries(
          trpc.app.chat.listarSessions.pathFilter(),
        );

        console.log(
          "🔄 [EMPTY_SESSION] Queries do sidebar invalidadas para atualizar lista",
        );

        if (result?.session?.id) {
          const sessionId = result.session.id;
          console.log(
            "🎯 [EMPTY_SESSION] Navegando para nova sessão:",
            sessionId,
          );
          toast.success("Nova conversa criada!");
          router.push(`/apps/chat/${sessionId}`);
          options?.onSuccess?.(sessionId);
        }
        setIsCreating(false);
      },
      onError: (error: any) => {
        console.error("❌ [EMPTY_SESSION] Erro ao criar sessão vazia:", error);
        trpcErrorToastDefault(error);
        setError(error);
        options?.onError?.(error);
        setIsCreating(false);
      },
    }),
  );

  const createEmptySession = async (input?: CreateEmptySessionInput) => {
    // Validações iniciais
    if (isCreating) {
      toast.info("Criando nova conversa...");
      return;
    }

    console.log("🚀 [EMPTY_SESSION] Iniciando criação de sessão vazia");

    setIsCreating(true);
    setError(null);

    try {
      await createEmptyMutation.mutateAsync({
        title: input?.title || `Chat ${new Date().toLocaleDateString()}`,
        generateTitle: input?.generateTitle ?? false, // Não gerar título sem mensagem
        metadata: input?.metadata || { createdAt: new Date().toISOString() },
      });
    } catch (error) {
      console.error("🔴 [EMPTY_SESSION] Erro ao criar sessão vazia:", error);
      // O erro já foi tratado pelo onError do mutation
    }
  };

  const reset = () => {
    setError(null);
    setIsCreating(false);
  };

  return {
    createEmptySession,
    isCreating: isCreating || createEmptyMutation.isPending,
    error: error || createEmptyMutation.error,
    reset,

    // Debug info
    debug: {
      createEmptyStatus: createEmptyMutation.status,
    },
  };
}
