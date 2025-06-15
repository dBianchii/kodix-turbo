"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { api } from "~/trpc/react";

interface AssistantChatWindowProps {
  sessionId?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function AssistantChatWindow({ sessionId }: AssistantChatWindowProps) {
  const t = useTranslations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Buscar mensagens da sessão usando a API correta
  const { data: messagesData, refetch } =
    api.app.chat.buscarMensagensTest.useQuery(
      {
        chatSessionId: sessionId!,
        limite: 100,
        pagina: 1,
        ordem: "asc",
      },
      {
        enabled: !!sessionId,
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    );

  // Converter mensagens para formato local
  useEffect(() => {
    if (messagesData?.messages) {
      const convertedMessages: ChatMessage[] = messagesData.messages.map(
        (msg: any) => ({
          id: msg.id,
          role: msg.senderRole === "user" ? "user" : "assistant",
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }),
      );
      setMessages(convertedMessages);
    }
  }, [messagesData]);

  // Função para enviar mensagem
  const handleSendMessage = async (content: string) => {
    if (!sessionId || isLoading || !content.trim()) return;

    setIsLoading(true);

    try {
      // Adicionar mensagem do usuário localmente
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");

      // Adicionar mensagem vazia do assistente para mostrar carregamento
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Fazer chamada para API de streaming
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSessionId: sessionId,
          content: content.trim(),
          useAgent: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedText += parsed.choices[0].delta.content;

                // Atualizar mensagem do assistente
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: accumulatedText }
                      : msg,
                  ),
                );
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }

      // Atualizar cache do tRPC
      await refetch();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      // Remover mensagem de erro se necessário
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== `assistant-${Date.now()}`),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleSendClick = () => {
    if (!isLoading) {
      handleSendMessage(inputValue);
    }
  };

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
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <h2 className="text-lg font-semibold">
          {t("apps.chat.title")} - Assistant UI
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500">
            <p>{t("apps.chat.messages.greeting")}</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border bg-white text-gray-900 shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.role === "assistant" &&
                !message.content &&
                isLoading && (
                  <div className="flex items-center space-x-1">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder={t("apps.chat.messages.placeholder")}
            disabled={isLoading}
          />
          <button
            onClick={handleSendClick}
            disabled={isLoading || !inputValue.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "..." : t("apps.chat.messages.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
