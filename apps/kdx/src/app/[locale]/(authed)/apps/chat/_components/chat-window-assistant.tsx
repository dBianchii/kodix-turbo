"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { ScrollArea } from "@kdx/ui/scroll-area";

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
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 ASSISTANT-UI: Handler para nova mensagem (Welcome Screen)
  const handleNewMessage = async (message: string) => {
    console.log("🚀 [ASSISTANT-UI] Enviando nova mensagem:", message);

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages([userMessage]);
    setIsLoading(true);

    try {
      // Aqui vamos integrar com o AssistantProvider posteriormente
      // Por agora, simular resposta
      setTimeout(() => {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Esta é uma resposta simulada. Em breve será conectada ao Assistant-UI.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("❌ [ASSISTANT-UI] Erro:", error);
      setIsLoading(false);
    }
  };

  // 🚀 ASSISTANT-UI: Handler para submit do form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleNewMessage(input);
      setInput("");
    }
  };

  // 🚀 ASSISTANT-UI: Welcome Screen preservado
  if (!sessionId && messages.length === 0) {
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
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 🚀 ASSISTANT-UI: Interface de Chat preservada
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role === "user" ? "user" : "assistant"}
              content={message.content}
            />
          ))}
          {isLoading && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Pensando...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
