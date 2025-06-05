// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { api } from "~/trpc/react";
import { InputBox } from "./input-box";
import { Message } from "./message";

type MessageRole = "assistant" | "user";

interface ChatMessage {
  role: MessageRole;
  content: string;
  id?: string;
}

interface ChatWindowProps {
  sessionId?: string;
}

export function ChatWindow({ sessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const t = useTranslations();

  // ✅ NOVO: Controle de cancelamento de stream
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentSessionIdRef = useRef<string | undefined>(sessionId);

  // ✅ NOVO: Atualizar referência da sessão atual
  useEffect(() => {
    currentSessionIdRef.current = sessionId;
  }, [sessionId]);

  // ✅ NOVO: Cancelar stream ativo ao mudar de sessão
  useEffect(() => {
    return () => {
      // Cancelar qualquer stream ativo quando o componente for desmontado ou sessionId mudar
      if (abortControllerRef.current) {
        console.log("🚫 Cancelando stream ativo ao mudar sessão");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [sessionId]);

  // ✅ NOVO: Limpar estados ao mudar de sessão
  useEffect(() => {
    if (sessionId) {
      // Cancelar stream ativo ao mudar de sessão
      if (abortControllerRef.current) {
        console.log(
          "🔄 Mudança de sessão detectada, cancelando stream anterior",
        );
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Limpar estados de loading e erro
      setIsLoading(false);
      setError(null);

      // ✅ CORREÇÃO: Invalidar cache ao mudar de sessão
      console.log(`🔄 Invalidando cache ao mudar para sessão: ${sessionId}`);
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", sessionId],
      });
    }
  }, [sessionId, queryClient]);

  // ✅ CORRIGIDO: Usar tRPC hooks como no app-sidebar
  const messagesQuery = api.app.chat.buscarMensagensTest.useQuery(
    {
      chatSessionId: sessionId!,
      limite: 100,
      pagina: 1,
      ordem: "asc",
    },
    {
      enabled: !!sessionId,
      refetchOnWindowFocus: false,
      // ✅ NOVO: Configurações para garantir dados frescos
      staleTime: 0, // Sempre considerar dados como stale
      gcTime: 5 * 60 * 1000, // 5 minutos de cache
      refetchOnMount: true, // Sempre refetch ao montar
    },
  );

  // Atualizar mensagens quando os dados chegarem
  useEffect(() => {
    const data = messagesQuery.data;
    if (data?.messages) {
      const formattedMessages = data.messages.map((msg: any) => ({
        role: (msg.senderRole === "user" ? "user" : "assistant") as MessageRole,
        content: msg.content,
        id: msg.id,
      }));
      setMessages(formattedMessages);
    } else if (!sessionId) {
      // Se não há sessão, não mostrar mensagens
      setMessages([]);
    } else if (sessionId && data?.messages?.length === 0) {
      // Se há sessão mas não há mensagens, mostrar mensagem de boas-vindas
      setMessages([
        {
          role: "assistant",
          content: t("apps.chat.messages.greeting"),
        },
      ]);
    }
  }, [messagesQuery.data, sessionId, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Usar utils do tRPC para invalidações corretas
  const utils = api.useUtils();

  async function sendMessage(text: string) {
    if (isLoading || !sessionId) return;

    console.log("📤 Enviando mensagem:", text);
    setIsLoading(true);
    setError(null);

    // ✅ NOVO: Cancelar stream anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // ✅ NOVO: Criar novo AbortController para este stream
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentSessionId = sessionId; // Capturar sessionId atual

    const userMessage: ChatMessage = { role: "user", content: text };

    // Adicionar mensagem do usuário imediatamente
    setMessages((prev) => [...prev, userMessage]);

    // Adicionar mensagem vazia da IA para o streaming
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      console.log("🔄 Fazendo requisição para API de streaming...");
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSessionId: sessionId,
          content: text,
          useAgent: true,
        }),
        // ✅ NOVO: Adicionar signal para cancelamento
        signal: abortController.signal,
      });

      console.log("📥 Resposta recebida, status:", response.status);

      if (!response.ok) {
        let errorMessage = t("apps.chat.messages.error");
        try {
          const errorData = (await response.json()) as { error?: string };
          errorMessage =
            errorData.error ??
            `${t("apps.chat.messages.error")} ${response.status}`;
        } catch {
          errorMessage = `${t("apps.chat.messages.error")} ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error(t("apps.chat.messages.error"));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      console.log("🔄 Iniciando leitura do stream");
      let receivedText = "";

      while (true) {
        // ✅ NOVO: Verificar se foi cancelado ou sessão mudou
        if (abortController.signal.aborted) {
          console.log("🚫 Stream cancelado");
          break;
        }

        // ✅ NOVO: Verificar se ainda estamos na mesma sessão
        if (currentSessionIdRef.current !== currentSessionId) {
          console.log("🔄 Sessão mudou durante o stream, cancelando");
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          console.log("✅ Stream concluído");
          break;
        }

        // 🔧 FIX: Decode seguro com tratamento de Unicode
        try {
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;

          // ✅ NOVO: Verificar novamente antes de atualizar o estado
          if (
            currentSessionIdRef.current === currentSessionId &&
            !abortController.signal.aborted
          ) {
            setMessages((prev) => {
              if (prev.length === 0) {
                return [{ role: "assistant", content: chunk }];
              }

              const others = prev.slice(0, -1);
              const lastMessage = prev[prev.length - 1];
              const updatedAssistantMessage: ChatMessage = {
                role: "assistant",
                content: lastMessage ? lastMessage.content + chunk : chunk,
              };
              return [...others, updatedAssistantMessage];
            });
          }
        } catch (decodeError) {
          console.warn("⚠️ Erro ao decodificar chunk, ignorando:", decodeError);
          // Continuar o streaming mesmo se um chunk específico falhar
          continue;
        }
      }

      if (!receivedText) {
        console.warn("⚠️ Nenhum texto foi recebido no stream");
      }

      // Invalidar cache das mensagens para recarregar do banco
      if (sessionId && currentSessionIdRef.current === currentSessionId) {
        // ✅ Invalidar usando tRPC utils em vez de queryClient manual
        utils.app.chat.buscarMensagensTest.invalidate({
          chatSessionId: sessionId,
        });
      }
    } catch (error) {
      // ✅ NOVO: Ignorar erros de cancelamento
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("🚫 Request cancelado pelo usuário");
        // ✅ CORREÇÃO: Sempre invalidar cache mesmo quando cancelado
        if (sessionId) {
          console.log("🔄 Invalidando cache após cancelamento do stream");
          // ✅ Usar tRPC utils
          utils.app.chat.buscarMensagensTest.invalidate({
            chatSessionId: sessionId,
          });
        }
        return;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      console.error("🔴 Erro ao enviar mensagem:", err);

      // ✅ NOVO: Só mostrar erro se ainda estamos na mesma sessão
      if (currentSessionIdRef.current === currentSessionId) {
        setError(`${t("apps.chat.messages.error")}: ${err.message}`);
        setMessages((prev) => {
          // Remove a mensagem do assistente vazia
          const withoutEmptyAssistant = prev.slice(0, -1);
          const errorMessage: ChatMessage = {
            role: "assistant",
            content: t("apps.chat.messages.errorOccurred", {
              error: err.message,
            }),
          };
          return [...withoutEmptyAssistant, errorMessage];
        });
      }
    } finally {
      console.log("🔄 Finalizando requisição");

      // ✅ CORREÇÃO: Sempre invalidar cache para garantir sincronização
      if (sessionId) {
        console.log(
          "🔄 Invalidando cache no finally para garantir sincronização",
        );
        // ✅ Usar tRPC utils
        utils.app.chat.buscarMensagensTest.invalidate({
          chatSessionId: sessionId,
        });
      }

      // ✅ NOVO: Só atualizar estado se ainda estamos na mesma sessão
      if (currentSessionIdRef.current === currentSessionId) {
        setIsLoading(false);
      }

      // ✅ NOVO: Limpar referência do AbortController
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }

  // Loading state for initial load
  if (sessionId && messagesQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          <p className="text-muted-foreground">
            {t("apps.chat.messages.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionId && messagesQuery.error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-400">{t("apps.chat.messages.error")}</p>
          <button
            onClick={() => messagesQuery.refetch()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t("apps.chat.messages.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {t("apps.chat.messages.selectConversation")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#121212]">
      {/* Container de mensagens com scroll e espaço extra na parte inferior para o input flutuante */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-32">
          {messages.map((msg, idx) => (
            <Message
              key={msg.id || idx}
              role={msg.role}
              content={msg.content}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="text-sm text-gray-400">
                {t("apps.chat.messages.typing")}
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Campo de input flutuante */}
      <div className="absolute right-0 bottom-6 left-0 px-4">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-700 bg-[#1e1e1e] px-4 py-3 shadow-lg">
          <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
