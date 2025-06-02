"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useTRPC } from "~/trpc/react";
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
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();

  // Buscar mensagens da sessão se sessionId for fornecido
  const messagesQuery = useQuery({
    ...trpc.app.chat.buscarMensagens.queryOptions({
      chatSessionId: sessionId ?? "",
      limite: 100,
      pagina: 1,
    }),
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
  });

  // Atualizar mensagens quando os dados chegarem
  useEffect(() => {
    if (messagesQuery.data?.messages) {
      const formattedMessages = messagesQuery.data.messages.map((msg: any) => ({
        role: (msg.senderRole === "user" ? "user" : "assistant") as MessageRole,
        content: msg.content,
        id: msg.id,
      }));
      setMessages(formattedMessages);
    } else if (!sessionId) {
      // Se não há sessão, não mostrar mensagens
      setMessages([]);
    } else if (sessionId && messagesQuery.data?.messages.length === 0) {
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

  async function sendMessage(text: string) {
    if (isLoading || !sessionId) return;

    console.log("📤 Enviando mensagem:", text);
    setIsLoading(true);
    setError(null);

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
        const { done, value } = await reader.read();
        if (done) {
          console.log("✅ Stream concluído");
          break;
        }

        // 🔧 FIX: Decode seguro com tratamento de Unicode
        try {
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;

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
      if (sessionId) {
        queryClient.invalidateQueries(
          trpc.app.chat.buscarMensagens.pathFilter(),
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("🔴 Erro ao enviar mensagem:", err);
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
    } finally {
      console.log("🔄 Finalizando requisição");
      setIsLoading(false);
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
