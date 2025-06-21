"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { toast } from "@kdx/ui/toast";

import { useAutoCreateSession } from "./useAutoCreateSession";
import { useEmptySession } from "./useEmptySession";
import { useFeatureFlag } from "./useFeatureFlag";

interface CreateSessionInput {
  firstMessage: string;
  useAgent?: boolean;
  generateTitle?: boolean;
}

interface UseSessionCreationOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook de abstração para criação de sessões
 *
 * Gerencia a migração entre autoCreateSessionWithMessage e createEmptySession
 * usando feature flags para rollout gradual e seguro
 */
export function useSessionCreation(options?: UseSessionCreationOptions) {
  const router = useRouter();
  const t = useTranslations();

  // Estado local para gerenciar mensagem pendente
  const [localPendingMessage, setLocalPendingMessage] = useState<string | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref para evitar múltiplas execuções
  const creationInProgressRef = useRef(false);

  // Feature flag para controlar qual fluxo usar
  const featureFlag = useFeatureFlag("use-empty-session-flow");

  // Hooks dos dois fluxos
  const { createSessionWithMessage, isCreating: isCreatingOld } =
    useAutoCreateSession({
      onSuccess: (sessionId) => {
        console.log("✅ [SESSION_CREATION] Fluxo antigo concluído:", sessionId);
        setIsCreating(false);
        creationInProgressRef.current = false;
        options?.onSuccess?.(sessionId);
      },
      onError: (error) => {
        console.error("❌ [SESSION_CREATION] Erro no fluxo antigo:", error);
        setError(error);
        setIsCreating(false);
        creationInProgressRef.current = false;
        options?.onError?.(error);
      },
    });

  const { createEmptySession, isCreating: isCreatingNew } = useEmptySession({
    onSuccess: (sessionId) => {
      console.log("✅ [SESSION_CREATION] Fluxo novo concluído:", sessionId);
      // Nota: navegação já acontece no useEmptySession
      // Mensagem será enviada via auto-processamento no ChatWindow
      setIsCreating(false);
      creationInProgressRef.current = false;
      options?.onSuccess?.(sessionId);
    },
    onError: (error) => {
      console.error("❌ [SESSION_CREATION] Erro no fluxo novo:", error);
      setError(error);
      setIsCreating(false);
      creationInProgressRef.current = false;
      options?.onError?.(error);
    },
  });

  /**
   * Função principal para criar sessão
   * Escolhe automaticamente entre fluxo antigo e novo baseado na feature flag
   */
  const createSession = useCallback(
    async (input: CreateSessionInput) => {
      // Validações iniciais
      if (
        creationInProgressRef.current ||
        isCreating ||
        isCreatingOld ||
        isCreatingNew
      ) {
        console.log(
          "⚠️ [SESSION_CREATION] Criação já em andamento, ignorando...",
        );
        return;
      }

      if (!input.firstMessage.trim()) {
        const errorMsg = "Digite uma mensagem para iniciar o chat.";
        toast.error(errorMsg);
        setError(new Error(errorMsg));
        return;
      }

      // Marcar como em progresso
      creationInProgressRef.current = true;
      setIsCreating(true);
      setError(null);

      try {
        console.log("🚀 [SESSION_CREATION] Iniciando criação de sessão...");
        console.log("📊 [SESSION_CREATION] Feature flag:", {
          enabled: featureFlag.enabled,
          loading: featureFlag.loading,
          config: featureFlag.config,
        });

        if (featureFlag.enabled) {
          // 🚀 NOVO FLUXO: createEmptySession + envio pós-navegação
          console.log(
            "🆕 [SESSION_CREATION] Usando NOVO fluxo (createEmptySession)",
          );
          console.log(
            "📝 [SESSION_CREATION] Mensagem:",
            input.firstMessage.slice(0, 50) + "...",
          );

          // 🔄 FASE 3 - DIA 12: Salvar mensagem para envio pós-navegação
          const tempSessionId = `temp-${Date.now()}`;
          sessionStorage.setItem(
            `pending-message-${tempSessionId}`,
            input.firstMessage,
          );
          console.log(
            "💾 [SESSION_CREATION] Mensagem salva para envio pós-navegação",
          );

          // Criar sessão vazia (createEmptySession não retorna valor, usa callback)
          await createEmptySession({
            title: input.generateTitle
              ? undefined
              : `Chat ${new Date().toLocaleDateString()}`,
            generateTitle: input.generateTitle,
            metadata: {
              firstMessage: input.firstMessage, // Salvar para referência
              useAgent: input.useAgent,
              createdAt: new Date().toISOString(),
              migrationFlow: "new",
            },
          });

          // Nota: A transferência da mensagem pendente será feita no callback onSuccess
          // do useEmptySession, que tem acesso ao sessionId da sessão criada

          // Nota: A mensagem será enviada automaticamente no ChatWindow
          // via detecção de mensagem pendente pós-navegação
        } else {
          // 📛 FLUXO ATUAL: autoCreateSessionWithMessage
          console.log(
            "📛 [SESSION_CREATION] Usando fluxo ATUAL (autoCreateSessionWithMessage)",
          );
          console.log(
            "📝 [SESSION_CREATION] Mensagem:",
            input.firstMessage.slice(0, 50) + "...",
          );

          await createSessionWithMessage({
            firstMessage: input.firstMessage,
            useAgent: input.useAgent ?? true,
            generateTitle: input.generateTitle ?? true,
          });
        }
      } catch (error: any) {
        console.error("❌ [SESSION_CREATION] Erro geral:", error);
        setError(error);
        setIsCreating(false);
        creationInProgressRef.current = false;

        // Fallback toast se não foi tratado pelos hooks individuais
        if (!error.handled) {
          toast.error("Erro ao criar sessão: " + error.message);
        }
      }
    },
    [
      featureFlag.enabled,
      featureFlag.loading,
      createSessionWithMessage,
      createEmptySession,
      isCreating,
      isCreatingOld,
      isCreatingNew,
      options,
    ],
  );

  /**
   * Reset do estado de erro
   */
  const reset = useCallback(() => {
    setError(null);
    setIsCreating(false);
    creationInProgressRef.current = false;
    setLocalPendingMessage(null);
  }, []);

  /**
   * Debug info para desenvolvimento
   */
  const debugInfo = {
    featureFlag: {
      enabled: featureFlag.enabled,
      loading: featureFlag.loading,
      config: featureFlag.config,
    },
    state: {
      isCreating,
      isCreatingOld,
      isCreatingNew,
      localPendingMessage,
      error: error?.message,
    },
    flow: featureFlag.enabled
      ? "NEW (createEmptySession)"
      : "CURRENT (autoCreateSessionWithMessage)",
  };

  return {
    createSession,
    isCreating: isCreating || isCreatingOld || isCreatingNew,
    error,
    reset,

    // Informações úteis para debug
    debugInfo,

    // Estados individuais (para casos específicos)
    isUsingNewFlow: featureFlag.enabled,
    featureFlagLoading: featureFlag.loading,

    // Mensagem pendente (para fluxo novo)
    localPendingMessage,
    setLocalPendingMessage,
  };
}

/**
 * Hook simplificado para casos onde só precisa da função de criação
 */
export function useCreateSession() {
  const { createSession, isCreating, error } = useSessionCreation();

  return {
    createSession,
    isCreating,
    error,
  };
}
