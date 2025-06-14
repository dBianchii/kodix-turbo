"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";

interface UseAutoCreateSessionOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

interface CreateSessionInput {
  firstMessage: string;
  useAgent?: boolean;
  generateTitle?: boolean;
}

export function useAutoCreateSession(options?: UseAutoCreateSessionOptions) {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ✅ Utils para invalidar queries do sidebar
  const utils = api.useUtils();

  // ✅ Usar apenas autoCreateSessionWithMessage que sabemos que existe
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const autoCreateMutation =
    // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
    api.app.chat.autoCreateSessionWithMessage.useMutation({
      onSuccess: (result: any) => {
        console.log("✅ [CHAT] autoCreateSessionWithMessage sucesso:", result);

        // ✅ Invalidar queries do sidebar para atualizar lista de sessões
        // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
        utils.app.chat.listarSessions.invalidate();
        // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
        utils.app.chat.buscarChatFolders.invalidate();

        // ✅ Backup: invalidar via queryClient para garantir que funcione
        queryClient.invalidateQueries({
          queryKey: [["app", "chat"], { type: "query" }],
        });

        console.log(
          "🔄 [CHAT] Queries do sidebar invalidadas para atualizar lista",
        );

        if (result?.session?.id) {
          const sessionId = result.session.id;
          toast.success("Chat iniciado com sucesso!");
          router.push(`/apps/chat/${sessionId}`);
          options?.onSuccess?.(sessionId);
        }
        setIsCreating(false);
      },
      onError: (error: any) => {
        console.error("❌ [CHAT] autoCreateSessionWithMessage erro:", error);
        toast.error("Erro ao criar sessão: " + error.message);
        setError(error);
        options?.onError?.(error);
        setIsCreating(false);
      },
    });

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

    console.log(
      "🚀 [CHAT] Iniciando criação de sessão:",
      input.firstMessage.slice(0, 30) + "...",
    );

    setIsCreating(true);
    setError(null);

    try {
      await autoCreateMutation.mutateAsync({
        firstMessage: input.firstMessage,
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
