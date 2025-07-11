"use client";

import type { Message } from "@ai-sdk/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { AppRouter, RouterOutputs } from "@kdx/api";

import { env } from "~/env";
import { useTRPC } from "~/trpc/react";

type TSession = RouterOutputs["app"]["chat"]["findSession"];
type TMessages = RouterOutputs["app"]["chat"]["getMessages"]["messages"];

interface UseSessionReturn {
  session: TSession | undefined;
  initialMessages: Message[]; // Tipo do Vercel AI SDK
  isLoading: boolean;
  isError: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
  refetch: () => void;
}

interface UseSessionWithMessagesOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useSessionWithMessages(
  sessionId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  },
): UseSessionReturn {
  const trpc = useTRPC();

  const sessionQuery = useQuery(
    trpc.app.chat.findSession.queryOptions(
      { sessionId: sessionId! },
      {
        enabled: !!sessionId && (options?.enabled ?? true),
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
        gcTime: options?.gcTime ?? 10 * 60 * 1000,
      },
    ),
  );

  const messagesQueryOptions = useMemo(
    () => ({
      enabled: !!sessionId && (options?.enabled ?? true),
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutos
      gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutos
      refetchOnMount: false, // ✅ OTIMIZAÇÃO: Não refetch desnecessário
      refetchOnWindowFocus: false,
    }),
    [sessionId, options?.enabled, options?.staleTime, options?.gcTime],
  );

  const messagesQuery = useQuery(
    trpc.app.chat.getMessages.queryOptions(
      {
        chatSessionId: sessionId!,
        limit: 100,
        page: 1,
        order: "asc",
      },
      messagesQueryOptions,
    ),
  );

  const initialMessages = useMemo(() => {
    const messages = messagesQuery.data?.messages;
    if (!messages?.length) return [];

    const visibleMessages = messages.filter(
      (msg) => msg.senderRole !== "system",
    );

    return visibleMessages.map(
      (msg): Message => ({
        id: msg.id,
        role: msg.senderRole === "user" ? "user" : "assistant",
        content: msg.content,
      }),
    );
  }, [messagesQuery.data?.messages]);

  const [isRefetching, setIsRefetching] = useState(false);

  const refetch = useCallback(() => {
    if (isRefetching || !sessionId) return;

    setIsRefetching(true);

    void Promise.allSettled([
      sessionQuery.refetch(),
      messagesQuery.refetch(),
    ]).finally(() => {
      setIsRefetching(false);
    });
  }, [sessionQuery, messagesQuery, sessionId, isRefetching]);

  const isLoading = sessionQuery.isLoading || messagesQuery.isLoading;
  const isError = sessionQuery.isError || messagesQuery.isError;
  const error = sessionQuery.error ?? messagesQuery.error;

  useMemo(() => {
    if (env.NODE_ENV === "development") {
      // Logs de debug removidos para o código de produção
    }
  }, [
    isLoading,
    sessionQuery.data,
    messagesQuery.data,
    sessionId,
    initialMessages.length,
  ]);

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
