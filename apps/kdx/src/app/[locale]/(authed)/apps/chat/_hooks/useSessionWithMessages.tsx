// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import type { Message } from "@ai-sdk/react";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface UseSessionWithMessagesOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useSessionWithMessages(
  sessionId: string | undefined,
  options?: UseSessionWithMessagesOptions,
) {
  const trpc = useTRPC();

  // ✅ OTIMIZAÇÃO: Memoizar query options para evitar re-criação
  const sessionQueryOptions = useMemo(
    () => ({
      enabled: !!sessionId && (options?.enabled ?? true),
      staleTime: options?.staleTime ?? 30 * 1000, // ✅ OTIMIZAÇÃO: 30s para reduzir requests
      gcTime: options?.gcTime ?? 5 * 60 * 1000,
      refetchOnMount: false, // ✅ OTIMIZAÇÃO: Não refetch desnecessário
      refetchOnWindowFocus: false,
    }),
    [sessionId, options?.enabled, options?.staleTime, options?.gcTime],
  );

  const messagesQueryOptions = useMemo(
    () => ({
      enabled: !!sessionId && (options?.enabled ?? true),
      staleTime: options?.staleTime ?? 30 * 1000, // ✅ OTIMIZAÇÃO: 30s para reduzir requests
      gcTime: options?.gcTime ?? 5 * 60 * 1000,
      refetchOnMount: false, // ✅ OTIMIZAÇÃO: Não refetch desnecessário
      refetchOnWindowFocus: false,
    }),
    [sessionId, options?.enabled, options?.staleTime, options?.gcTime],
  );

  const sessionQuery = useQuery(
    trpc.app.chat.buscarSession.queryOptions(
      { sessionId: sessionId! },
      sessionQueryOptions,
    ),
  );

  const messagesQuery = useQuery(
    trpc.app.chat.buscarMensagensTest.queryOptions(
      {
        chatSessionId: sessionId!,
        limite: 100,
        pagina: 1,
        ordem: "asc",
      },
      messagesQueryOptions,
    ),
  );

  // ✅ OTIMIZAÇÃO: Memoizar formatação para evitar re-execuções desnecessárias
  const initialMessages = useMemo(() => {
    const messages = messagesQuery.data?.messages || [];

    if (!messages.length) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ [FORMAT_MESSAGES] Nenhuma mensagem para formatar");
      }
      return [];
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 [CHAT_FORMAT_MESSAGES] Formatando ${messages.length} mensagens para sessionId: ${sessionId}`,
      );
    }

    // Filtrar mensagens system - não devem aparecer no useChat
    const visibleMessages = messages.filter(
      (msg: any) => msg.senderRole !== "system",
    );

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🎯 [CHAT_FORMAT_MESSAGES] Mensagens visíveis após filtrar system: ${visibleMessages.length}`,
      );
    }

    const formatted = visibleMessages.map((msg: any) => ({
      id: msg.id,
      role: msg.senderRole === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ [CHAT_FORMAT_MESSAGES] Mensagens formatadas:`, formatted);
    }
    return formatted;
  }, [messagesQuery.data?.messages, sessionId]);

  // ✅ OTIMIZAÇÃO: Memoizar função refetch para evitar re-criação
  // ✅ CORREÇÃO: Condições de guarda para prevenir refetch desnecessário
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastRefetchTime, setLastRefetchTime] = useState(0);

  const refetch = useCallback(() => {
    // ✅ GUARDA 1: Prevenir múltiplos refetch simultâneos
    if (isRefetching) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⚠️ [CHAT_SESSION_HOOK] Refetch já em andamento, ignorando",
        );
      }
      return;
    }

    // ✅ GUARDA 2: Debounce para prevenir refetch muito frequente
    const now = Date.now();
    if (now - lastRefetchTime < 1000) {
      // Mínimo 1s entre refetch
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⚠️ [CHAT_SESSION_HOOK] Refetch muito frequente, ignorando",
        );
      }
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔄 [CHAT_SESSION_HOOK] Refetch solicitado para sessionId:",
        sessionId,
      );
    }

    setIsRefetching(true);
    setLastRefetchTime(now);

    Promise.all([sessionQuery.refetch(), messagesQuery.refetch()]).finally(
      () => {
        setIsRefetching(false);
      },
    );
  }, [sessionQuery, messagesQuery, sessionId, isRefetching, lastRefetchTime]);

  // ✅ OTIMIZAÇÃO: Memoizar estados derivados
  const isLoading = sessionQuery.isLoading || messagesQuery.isLoading;
  const isError = sessionQuery.isError || messagesQuery.isError;
  const error = sessionQuery.error || messagesQuery.error;

  // ✅ THREAD-FIRST: Logs consolidados apenas em desenvolvimento
  useMemo(() => {
    if (process.env.NODE_ENV === "development") {
      if (isLoading) {
        console.log(
          `🔄 [CHAT_SESSION_HOOK] Carregando dados para sessionId: ${sessionId}`,
        );
      } else if (sessionQuery.data && messagesQuery.data) {
        console.log(
          `✅ [CHAT_SESSION_HOOK] Dados carregados - SessionId: ${sessionId}, Messages: ${initialMessages.length}`,
        );
      }
    }
  }, [
    isLoading,
    sessionQuery.data,
    messagesQuery.data,
    sessionId,
    initialMessages.length,
  ]);

  // ✅ OTIMIZAÇÃO: Memoizar objeto de retorno para evitar re-renders
  return useMemo(
    () => ({
      session: sessionQuery.data,
      initialMessages,
      isLoading,
      isError,
      error,
      refetch,
    }),
    [sessionQuery.data, initialMessages, isLoading, isError, error, refetch],
  );
}
