// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

interface UseAutoCreateSessionOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

interface CreateSessionInput {
  firstMessage: string;
  aiModelId?: string; // ✅ NOVO: Aceitar modelo explícito
  useAgent?: boolean;
  generateTitle?: boolean;
}

export function useAutoCreateSession(options?: UseAutoCreateSessionOptions) {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ✅ NAVEGAÇÃO CENTRALIZADA: Usar autoCreateSessionWithMessage sem router.push
  const autoCreateMutation = useMutation(
    trpc.app.chat.autoCreateSessionWithMessage.mutationOptions({
      onSuccess: (result: any) => {
        console.log("✅ [CHAT] autoCreateSessionWithMessage sucesso:", result);

        // ✅ Invalidar queries do sidebar para atualizar lista de sessões
        queryClient.invalidateQueries(trpc.app.chat.findSessions.pathFilter());

        console.log(
          "🔄 [CHAT] Queries do sidebar invalidadas para atualizar lista",
        );

        if (result?.session?.id) {
          const sessionId = result.session.id;
          console.log(
            "🎯 [CHAT] Sessão criada, notificando componente pai:",
            sessionId,
          );
          toast.success("Chat iniciado com sucesso!");

          // ✅ NAVEGAÇÃO CENTRALIZADA: Apenas chamar callback - não navegar aqui
          options?.onSuccess?.(sessionId);
        }
        setIsCreating(false);
      },
      onError: (error: any) => {
        console.error("❌ [CHAT] autoCreateSessionWithMessage erro:", error);
        trpcErrorToastDefault(error);
        setError(error);
        options?.onError?.(error);
        setIsCreating(false);
      },
    }),
  );

  const createSessionWithMessage = async (input: CreateSessionInput) => {
    // Validações iniciais
    if (isCreating) {
      toast.info("Criando chat...");
      return;
    }

    if (!input.firstMessage.trim()) {
      toast.error("Digite uma mensagem para iniciar o chat.");
      return;
    }

    console.log("🚀 [CHAT] Criando sessão com modelo:", input.aiModelId);
    console.log(
      "🚀 [CHAT] Iniciando criação de sessão:",
      input.firstMessage.slice(0, 30) + "...",
    );

    setIsCreating(true);
    setError(null);

    try {
      await autoCreateMutation.mutateAsync({
        firstMessage: input.firstMessage,
        aiModelId: input.aiModelId, // ✅ NOVO: Passar modelo explícito
        useAgent: input.useAgent ?? true,
        generateTitle: input.generateTitle ?? true,
      });
    } catch (error) {
      console.error("🔴 [CHAT] Erro ao criar sessão:", error);
      // O erro já foi tratado pelo onError do mutation
    }
  };

  const reset = () => {
    setError(null);
    setIsCreating(false);
  };

  return {
    createSessionWithMessage,
    isCreating: isCreating || autoCreateMutation.isPending,
    error: error || autoCreateMutation.error,
    reset,

    // Debug info
    debug: {
      autoCreateStatus: autoCreateMutation.status,
    },
  };
}
