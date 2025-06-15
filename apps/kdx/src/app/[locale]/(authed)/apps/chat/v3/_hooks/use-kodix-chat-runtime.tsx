"use client";

import type { AssistantRuntime } from "@assistant-ui/react";
import { useCallback, useMemo, useRef } from "react";
import { useLocalRuntime } from "@assistant-ui/react";
import { useTranslations } from "next-intl";

import { api } from "~/trpc/react";

interface KodixMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export function useKodixChatRuntime(
  sessionId?: string,
): AssistantRuntime | null {
  const t = useTranslations();
  const currentSessionIdRef = useRef<string | null>(sessionId || null);

  // Buscar mensagens da sessão atual
  const { data: messagesData, refetch: refetchMessages } =
    api.app.chat.buscarMensagensTest.useQuery(
      {
        chatSessionId: currentSessionIdRef.current!,
        limite: 100,
        pagina: 1,
        ordem: "asc",
      },
      {
        enabled: !!currentSessionIdRef.current,
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    );

  // Converter mensagens do Kodix para formato assistant-ui
  const convertedMessages = useMemo(() => {
    if (!messagesData?.messages) return [];

    return messagesData.messages.map((msg: any) => ({
      id: msg.id,
      role: msg.senderRole === "user" ? "user" : "assistant",
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));
  }, [messagesData]);

  // Função para enviar mensagem usando nossa API de streaming
  const sendMessage = useCallback(async (message: { content: string }) => {
    if (!currentSessionIdRef.current) {
      // Criar nova sessão se necessário
      // TODO: Implementar criação de sessão usando tRPC
      throw new Error("Session ID is required");
    }

    // Fazer chamada para nossa API de streaming
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatSessionId: currentSessionIdRef.current,
        content: message.content,
        useAgent: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    // Retornar ReadableStream para o assistant-ui
    return response.body;
  }, []);

  // Criar runtime local do assistant-ui
  const runtime = useLocalRuntime({
    initialMessages: convertedMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: [{ type: "text", text: msg.content }],
      createdAt: msg.createdAt,
    })),
    onNew: sendMessage,
  });

  // Atualizar mensagens quando houver mudanças
  useMemo(() => {
    if (runtime && convertedMessages.length > 0) {
      // TODO: Implementar sincronização de mensagens
      // runtime.append(newMessages);
    }
  }, [runtime, convertedMessages]);

  return runtime;
}
