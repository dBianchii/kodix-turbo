"use client";

import React, { useEffect } from "react";
import { useAssistant } from "@ai-sdk/react";
import { Loader2 } from "lucide-react";

import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { ScrollArea } from "@kdx/ui/scroll-area";
import { toast } from "@kdx/ui/toast";

import { useRouter } from "~/i18n/routing";
import { Message } from "./message";
import { WelcomeHeader } from "./welcome-header";
import { WelcomeSuggestions } from "./welcome-suggestions";

interface ChatWindowAssistantProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

export function ChatWindowAssistant({
  sessionId,
  onNewSession,
}: ChatWindowAssistantProps) {
  const router = useRouter();

  // Hook do Assistant-UI (usando @ai-sdk/react)
  const {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    error,
    threadId,
  } = useAssistant({
    api: "/api/assistant",
    threadId: sessionId || undefined,
  });

  // Redirecionar quando uma nova thread for criada
  useEffect(() => {
    if (threadId && !sessionId) {
      console.log("🚀 [ASSISTANT-UI] Nova thread criada:", threadId);
      router.push(`/apps/chat/${threadId}`);
      onNewSession?.(threadId);
    }
  }, [threadId, sessionId, router, onNewSession]);

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      console.error("❌ [ASSISTANT-UI] Erro:", error);
      toast.error(error.message || "Erro ao processar mensagem");
    }
  }, [error]);

  // Handler para nova mensagem (Welcome Screen)
  const handleNewMessage = async (message: string) => {
    if (status !== "awaiting_message") return;

    console.log("🚀 [ASSISTANT-UI] Enviando nova mensagem...");

    // Definir o input e submeter
    handleInputChange({ target: { value: message } } as any);

    // Pequeno delay para garantir que o input foi atualizado
    setTimeout(() => {
      submitMessage();
    }, 10);
  };

  // Welcome Screen
  if (!sessionId && !threadId) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-4xl px-4">
              <WelcomeHeader />
              <WelcomeSuggestions onSuggestionClick={handleNewMessage} />
            </div>
          </div>
        </div>
        <div className="border-t px-4 py-4">
          <form onSubmit={submitMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              disabled={status !== "awaiting_message"}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={status !== "awaiting_message" || !input.trim()}
            >
              Enviar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role === "user" ? "user" : "assistant"}
              content={
                message.role !== "data" ? message.content : "Dados do sistema"
              }
            />
          ))}
          {status === "in_progress" && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Pensando...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t px-4 py-4">
        <form onSubmit={submitMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={status !== "awaiting_message"}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={status !== "awaiting_message" || !input.trim()}
          >
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
