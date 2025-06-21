// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import type { Message } from "@ai-sdk/react";
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

  const sessionQuery = useQuery(
    trpc.app.chat.buscarSession.queryOptions(
      { sessionId: sessionId! },
      {
        enabled: !!sessionId && (options?.enabled ?? true),
        staleTime: options?.staleTime ?? 0,
        gcTime: options?.gcTime ?? 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      },
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
      {
        enabled: !!sessionId && (options?.enabled ?? true),
        staleTime: options?.staleTime ?? 0,
        gcTime: options?.gcTime ?? 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      },
    ),
  );

  // Formatar mensagens para o formato do Vercel AI SDK
  const formatMessagesForAI = (messages: any[]): Message[] => {
    if (!messages) return [];

    // Filtrar mensagens system - não devem aparecer no useChat
    const visibleMessages = messages.filter(
      (msg: any) => msg.senderRole !== "system",
    );

    return visibleMessages.map((msg: any) => ({
      id: msg.id,
      role: msg.senderRole === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  };

  const initialMessages = formatMessagesForAI(
    messagesQuery.data?.messages || [],
  );

  return {
    session: sessionQuery.data,
    initialMessages,
    isLoading: sessionQuery.isLoading || messagesQuery.isLoading,
    isError: sessionQuery.isError || messagesQuery.isError,
    error: sessionQuery.error || messagesQuery.error,
    refetch: () => {
      sessionQuery.refetch();
      messagesQuery.refetch();
    },
  };
}
