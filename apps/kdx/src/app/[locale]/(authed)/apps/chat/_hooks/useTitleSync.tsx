"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseTitleSyncOptions {
  sessionId: string | undefined;
  enabled?: boolean;
  pollInterval?: number;
  // 🚀 ASSISTANT-UI: Trigger baseado em eventos
  messageCount?: number;
  isFirstConversation?: boolean;
  onFirstMessageComplete?: boolean;
}

/**
 * Hook para sincronização automática de títulos em tempo real
 * PADRÃO ASSISTANT-UI: Sincronização baseada em eventos + retry robusto
 *
 * ESTRATÉGIAS:
 * 1. Event-driven invalidation (trigger após primeira mensagem)
 * 2. Retry inteligente com backoff exponencial
 * 3. Detecção precisa de primeira conversa
 * 4. Thread-first architecture alignment
 */
export function useTitleSync({
  sessionId,
  enabled = true,
  pollInterval = 8000, // Aumentado para 8s (menos agressivo)
  messageCount = 0,
  isFirstConversation = false,
  onFirstMessageComplete = false,
}: UseTitleSyncOptions) {
  const queryClient = useQueryClient();
  const lastSyncRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isActivelyTryingRef = useRef<boolean>(false);

  // 🔄 INVALIDAÇÃO INTELIGENTE: Baseada em eventos específicos
  const invalidateSessionQueries = useCallback(async () => {
    if (!sessionId) return;

    console.log("🔄 [TITLE_SYNC] Invalidando queries para sessão:", sessionId);

    // Invalidar todas as queries relacionadas ao chat
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["app", "chat", "buscarSession"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["app", "chat", "listarSessions"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["app", "chat", "buscarMensagensTest"],
      }),
    ]);

    lastSyncRef.current = Date.now();
    console.log("✅ [TITLE_SYNC] Queries invalidadas com sucesso");
  }, [sessionId, queryClient]);

  // 🎯 DETECÇÃO INTELIGENTE: Verificar se título precisa ser atualizado
  const checkAndUpdateTitle = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !enabled) return false;

    try {
      // Buscar dados atuais da sessão
      const sessionData = queryClient.getQueryData([
        "app",
        "chat",
        "buscarSession",
        { sessionId },
      ]) as any;

      if (!sessionData) {
        console.log("⚠️ [TITLE_SYNC] Dados da sessão não encontrados no cache");
        // Forçar refetch se não há dados
        await queryClient.refetchQueries({
          queryKey: ["app", "chat", "buscarSession", { sessionId }],
        });
        return false;
      }

      const currentTitle = sessionData.titulo || sessionData.title || "";
      const isDefaultTitle = /Chat \d{2}\/\d{2}\/\d{4}/.test(currentTitle);

      if (isDefaultTitle) {
        console.log(
          "🔍 [TITLE_SYNC] Título padrão detectado, forçando atualização:",
          currentTitle,
        );

        // Forçar refetch da sessão
        await queryClient.refetchQueries({
          queryKey: ["app", "chat", "buscarSession", { sessionId }],
        });

        // Também invalidar lista de sessões para atualizar sidebar
        await queryClient.invalidateQueries({
          queryKey: ["app", "chat", "listarSessions"],
        });

        console.log("🔄 [TITLE_SYNC] Refetch forçado para título padrão");
        return true; // Título foi atualizado
      } else {
        console.log("✅ [TITLE_SYNC] Título já atualizado:", currentTitle);
        retryCountRef.current = 0; // Reset retry count
        isActivelyTryingRef.current = false;
        return false; // Título já está correto
      }
    } catch (error) {
      console.error("❌ [TITLE_SYNC] Erro ao verificar título:", error);
      return false;
    }
  }, [sessionId, enabled, queryClient]);

  // 🚀 RETRY INTELIGENTE: Backoff exponencial para primeira conversa
  const startRetrySequence = useCallback(async () => {
    if (!sessionId || !enabled || isActivelyTryingRef.current) return;

    isActivelyTryingRef.current = true;
    retryCountRef.current = 0;

    console.log("🚀 [TITLE_SYNC] Iniciando sequência de retry inteligente");

    // Delays com backoff exponencial: 2s, 5s, 10s, 15s, 20s
    const delays = [2000, 5000, 10000, 15000, 20000];

    for (const delay of delays) {
      if (!isActivelyTryingRef.current) break; // Parar se não estiver mais tentando

      await new Promise((resolve) => setTimeout(resolve, delay));

      retryCountRef.current++;
      console.log(
        `🔄 [TITLE_SYNC] Tentativa ${retryCountRef.current}/${delays.length}`,
      );

      const wasUpdated = await checkAndUpdateTitle();
      if (wasUpdated) {
        console.log(
          "✅ [TITLE_SYNC] Título atualizado com sucesso na tentativa",
          retryCountRef.current,
        );
        isActivelyTryingRef.current = false;
        return;
      }
    }

    console.log("⚠️ [TITLE_SYNC] Todas as tentativas esgotadas");
    isActivelyTryingRef.current = false;
  }, [sessionId, enabled, checkAndUpdateTitle]);

  // 🚀 ASSISTANT-UI PATTERN: Trigger baseado em primeira conversa
  useEffect(() => {
    if (!sessionId || !enabled || !isFirstConversation) return;

    console.log(
      "🎯 [TITLE_SYNC] Primeira conversa detectada, iniciando sync robusto",
    );

    // Limpar timeout anterior
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Invalidação imediata + retry sequence
    const triggerSync = async () => {
      console.log("🚀 [TITLE_SYNC] Trigger para primeira conversa");
      await invalidateSessionQueries();

      // Iniciar sequência de retry após pequeno delay
      setTimeout(() => {
        void startRetrySequence();
      }, 1000);
    };

    triggerSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      isActivelyTryingRef.current = false;
    };
  }, [
    sessionId,
    enabled,
    isFirstConversation,
    invalidateSessionQueries,
    startRetrySequence,
  ]);

  // 🎯 TRIGGER PÓS-MENSAGEM: Quando IA termina de responder
  useEffect(() => {
    if (!sessionId || !enabled || !onFirstMessageComplete) return;

    console.log(
      "🎯 [TITLE_SYNC] IA terminou primeira resposta, sincronizando título",
    );

    // Delay para dar tempo do backend processar + retry sequence
    const syncTimeout = setTimeout(async () => {
      await invalidateSessionQueries();
      void startRetrySequence();
    }, 3000); // 3 segundos de delay

    return () => clearTimeout(syncTimeout);
  }, [
    sessionId,
    enabled,
    onFirstMessageComplete,
    invalidateSessionQueries,
    startRetrySequence,
  ]);

  // 🚀 EFEITO PRINCIPAL: Invalidação imediata quando sessão muda
  useEffect(() => {
    if (sessionId && enabled) {
      console.log(
        "🚀 [TITLE_SYNC] Iniciando sincronização para sessão:",
        sessionId,
      );

      // Reset state para nova sessão
      retryCountRef.current = 0;
      isActivelyTryingRef.current = false;

      // Invalidação imediata apenas se não é primeira conversa
      if (!isFirstConversation) {
        invalidateSessionQueries();
      }

      // Verificação inicial após pequeno delay
      const initialCheck = setTimeout(() => {
        checkAndUpdateTitle();
      }, 1000);

      return () => clearTimeout(initialCheck);
    }
  }, [
    sessionId,
    enabled,
    isFirstConversation,
    invalidateSessionQueries,
    checkAndUpdateTitle,
  ]);

  // ⏰ POLLING INTELIGENTE: Apenas para títulos pendentes (menos agressivo)
  useEffect(() => {
    if (!sessionId || !enabled || isActivelyTryingRef.current) return;

    // Não fazer polling se acabou de sincronizar (menos de 15s)
    const timeSinceLastSync = Date.now() - lastSyncRef.current;
    if (timeSinceLastSync < 15000) {
      console.log("⏰ [TITLE_SYNC] Pulando polling - sync recente");
      return;
    }

    console.log(
      "⏰ [TITLE_SYNC] Iniciando polling inteligente a cada",
      pollInterval,
      "ms",
    );

    const interval = setInterval(async () => {
      // Só fazer polling se detectar título padrão e não estiver tentando ativamente
      if (isActivelyTryingRef.current) return;

      const sessionData = queryClient.getQueryData([
        "app",
        "chat",
        "buscarSession",
        { sessionId },
      ]) as any;

      if (sessionData) {
        const currentTitle = sessionData.titulo || sessionData.title || "";
        const isDefaultTitle = /Chat \d{2}\/\d{2}\/\d{4}/.test(currentTitle);

        if (isDefaultTitle) {
          console.log(
            "⏰ [TITLE_SYNC] Polling detectou título padrão, atualizando",
          );
          await checkAndUpdateTitle();
        }
      }
    }, pollInterval);

    return () => {
      console.log("🛑 [TITLE_SYNC] Parando polling");
      clearInterval(interval);
    };
  }, [sessionId, enabled, pollInterval, queryClient, checkAndUpdateTitle]);

  // 📡 LISTENER DE EVENTOS: Escutar mudanças no cache (Assistant-UI pattern)
  useEffect(() => {
    if (!sessionId || !enabled) return;

    // Listener para mudanças na query da sessão
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        event.query.queryKey.includes(sessionId) &&
        !isActivelyTryingRef.current
      ) {
        console.log(
          "📡 [TITLE_SYNC] Mudança detectada no cache:",
          event.query.queryKey,
        );

        // Pequeno delay para permitir que a mudança se propague
        setTimeout(() => {
          checkAndUpdateTitle();
        }, 500);
      }
    });

    return unsubscribe;
  }, [sessionId, enabled, queryClient, checkAndUpdateTitle]);

  // 🎯 MÉTODO MANUAL: Permitir sincronização manual
  const syncNow = useCallback(async () => {
    console.log("🎯 [TITLE_SYNC] Sincronização manual solicitada");
    isActivelyTryingRef.current = false; // Reset active trying
    await invalidateSessionQueries();
    await checkAndUpdateTitle();
  }, [invalidateSessionQueries, checkAndUpdateTitle]);

  return {
    syncNow,
    isEnabled: enabled && !!sessionId,
    sessionId,
    isActivelyTrying: isActivelyTryingRef.current,
    retryCount: retryCountRef.current,
  };
}
