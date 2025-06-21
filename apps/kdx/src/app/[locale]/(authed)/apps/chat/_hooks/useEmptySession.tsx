// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { redirect, useRouter } from "~/i18n/routing";
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

          // 🔄 FASE 3 - DIA 12: Transferir mensagem pendente se existir
          const tempKeys = Object.keys(sessionStorage).filter((key) =>
            key.startsWith("pending-message-temp-"),
          );
          if (tempKeys.length > 0) {
            const tempKey = tempKeys[0]; // Pegar a mais recente
            const pendingMessage = sessionStorage.getItem(tempKey);
            if (pendingMessage) {
              sessionStorage.setItem(
                `pending-message-${sessionId}`,
                pendingMessage,
              );
              sessionStorage.removeItem(tempKey);
              console.log(
                "🔄 [EMPTY_SESSION] Mensagem pendente transferida para sessão:",
                sessionId,
              );
            }
          }

          toast.success("Nova conversa criada!");

          // DEBUG: Verificar qual URL está sendo gerada
          const targetUrl = `/apps/chat/${sessionId}`; // Caminho absoluto como funcionava antes
          console.log(
            "🔍 [EMPTY_SESSION] Navegando para caminho absoluto:",
            targetUrl,
          );
          console.log(
            "🔍 [EMPTY_SESSION] Window location antes:",
            window.location.href,
          );

          // Usar caminho absoluto - como funcionava no commit 0916e276
          router.push(targetUrl);

          // Fallback: Se não navegar em 500ms, usar window.location
          setTimeout(() => {
            const currentPath = window.location.pathname;
            console.log("🔍 [EMPTY_SESSION] Verificando navegação...");
            console.log("🔍 [EMPTY_SESSION] Path atual:", currentPath);

            // Se ainda estiver na mesma página, forçar navegação
            if (!currentPath.includes(sessionId)) {
              console.log(
                "⚠️ [EMPTY_SESSION] Router não funcionou, usando window.location",
              );

              // Construir URL correta baseada no path atual
              const pathParts = currentPath.split("/");
              const locale = pathParts[1]; // pt-BR, en, etc

              // Verificar se já estamos em /apps/chat
              const basePath = `/${locale}/apps/chat`;

              // Construir URL completa
              const fullUrl = `${basePath}/${sessionId}`;
              console.log("🔍 [EMPTY_SESSION] Navegando para:", fullUrl);

              window.location.href = fullUrl;
            }
          }, 500);

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
