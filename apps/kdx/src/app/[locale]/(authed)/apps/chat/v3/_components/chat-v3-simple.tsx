"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Loader2, MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { Input } from "@kdx/ui/input";
import { ScrollArea } from "@kdx/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatV3SimpleProps {
  sessionId?: string;
}

export function ChatV3Simple({ sessionId }: ChatV3SimpleProps) {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isLoading || !content.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        // Adicionar mensagem do usuário
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content: content.trim(),
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");

        // Adicionar mensagem vazia do assistente para mostrar carregamento
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Fazer chamada para nossa API de streaming
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
          accumulatedText += chunk;

          // Atualizar mensagem do assistente com streaming
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: accumulatedText }
                : msg,
            ),
          );
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        setError(
          error instanceof Error ? error.message : "Erro ao enviar mensagem",
        );

        // Remover mensagem de erro se necessário
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== `assistant-${Date.now()}`),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading],
  );

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
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <MessageCircle className="text-muted-foreground h-12 w-12" />
            <p className="text-muted-foreground">
              {t("apps.chat.messages.selectConversation")}
            </p>
            <p className="text-muted-foreground text-sm">
              🚀 Powered by Assistant UI + Kodix Backend
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Chat V3 - Assistant UI + Kodix
          </h2>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Session:</span>
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              {sessionId.slice(-8)}
            </code>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-muted-foreground text-center">
              <p className="mb-2">{t("apps.chat.messages.greeting")}</p>
              <p className="text-sm">Comece uma conversa digitando abaixo!</p>
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
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === "assistant" &&
                  !message.content &&
                  isLoading && (
                    <div className="flex items-center space-x-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Digitando...</span>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-background border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("apps.chat.messages.placeholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendClick}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          V3: Assistant UI integrado com backend Kodix (tRPC + AI Studio)
        </p>
      </div>
    </div>
  );
}
