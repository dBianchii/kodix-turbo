"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { Input } from "@kdx/ui/input";
import { ScrollArea } from "@kdx/ui/scroll-area";

import { api } from "~/trpc/react";
import { MessageRendererV3 } from "./message-renderer-v3";

interface ChatV3ReadyProps {
  sessionId?: string | null;
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function ChatV3Ready({
  sessionId,
  onNewSession,
  selectedModelId,
}: ChatV3ReadyProps) {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Usar utils do tRPC para invalidações corretas
  const utils = api.useUtils();

  // Buscar mensagens da sessão atual
  // @ts-ignore - Temporário para contornar problemas de tipos do tRPC
  const { data: messagesData, refetch: refetchMessages } =
    // @ts-ignore - Temporário para contornar problemas de tipos do tRPC
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

  // Criar nova sessão automaticamente com primeira mensagem
  // @ts-ignore - Temporário para contornar problemas de tipos do tRPC
  const createSessionMutation =
    // @ts-ignore - Temporário para contornar problemas de tipos do tRPC
    api.app.chat.autoCreateSessionWithMessage.useMutation({
      onSuccess: (data: any) => {
        console.log("✅ Nova sessão criada:", data);
        if (data?.session?.id) {
          onNewSession?.(data.session.id);
          // Adicionar mensagens do resultado à lista local
          if (data.userMessage && data.aiMessage) {
            setMessages([
              {
                id: data.userMessage.id,
                role: "user",
                content: data.userMessage.content,
                createdAt: new Date(data.userMessage.createdAt),
              },
              {
                id: data.aiMessage.id,
                role: "assistant",
                content: data.aiMessage.content,
                createdAt: new Date(data.aiMessage.createdAt),
              },
            ]);
          }
        }
        setIsLoading(false);
      },
      onError: (error: any) => {
        console.error("❌ Erro ao criar sessão:", error);
        setIsLoading(false);
      },
    });

  // Converter mensagens do backend para formato local
  useEffect(() => {
    if (messagesData?.messages) {
      const convertedMessages: Message[] = messagesData.messages.map(
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

  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    if (!sessionId) {
      // Criar nova sessão com primeira mensagem
      await handleNewSession(content);
    } else {
      // Enviar mensagem para sessão existente
      await handleExistingSession(content);
    }
  };

  const handleNewSession = async (content: string) => {
    createSessionMutation.mutate({
      content,
      aiModelId: selectedModelId,
      title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
    });
  };

  const handleExistingSession = async (content: string) => {
    // Adicionar mensagem do usuário imediatamente
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Adicionar mensagem vazia do assistente para streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Streaming para sessão existente
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatSessionId: sessionId,
          content,
          useAgent: true,
          aiModelId: selectedModelId,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error ?? `Erro ${response.status}`;
        } catch {
          errorMessage = `Erro ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      console.log("🔄 Iniciando streaming de texto simples");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("✅ Stream concluído");
          break;
        }

        // Decodificar chunk como texto simples (não JSON)
        try {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Atualizar mensagem do assistente com streaming
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedText }
                : msg,
            ),
          );
        } catch (decodeError) {
          console.warn("⚠️ Erro ao decodificar chunk, ignorando:", decodeError);
          continue;
        }
      }

      if (!accumulatedText) {
        console.warn("⚠️ Nenhum conteúdo foi recebido no stream");
      }

      // Invalidar cache para sincronizar com servidor
      if (sessionId) {
        console.log("🔄 Invalidando cache para sincronização");
        await refetchMessages();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("🔴 Erro no streaming:", err);

      setMessages((prev) => {
        // Remove a mensagem do assistente vazia
        const withoutEmptyAssistant = prev.filter(
          (msg) => msg.id !== assistantMessageId,
        );

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Erro: ${err.message}. Por favor, tente novamente.`,
          createdAt: new Date(),
        };
        return [...withoutEmptyAssistant, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat Area - Usando ScrollArea como na V1 que funciona */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="px-4 py-4 pb-32">
            {messages.length === 0 ? (
              // Welcome Screen - Exatamente como assistant-ui.com
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="max-w-2xl text-center">
                  <h1 className="text-foreground mb-8 text-3xl font-medium">
                    How can I help you today?
                  </h1>

                  {/* Suggestion Buttons - Como no assistant-ui.com */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      className="border-border bg-background hover:bg-muted h-auto rounded-xl px-4 py-3 text-left text-sm"
                      onClick={() =>
                        setInputValue("What is the weather in Tokyo?")
                      }
                    >
                      What is the weather in Tokyo?
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border bg-background hover:bg-muted h-auto rounded-xl px-4 py-3 text-left text-sm"
                      onClick={() => setInputValue("What is assistant-ui?")}
                    >
                      What is assistant-ui?
                    </Button>
                    {/* Botão de teste para scroll */}
                    <Button
                      variant="outline"
                      className="border-border bg-background hover:bg-muted h-auto rounded-xl px-4 py-3 text-left text-sm"
                      onClick={() => {
                        // Adicionar várias mensagens de teste para forçar scroll
                        const testMessages: Message[] = [];
                        for (let i = 1; i <= 10; i++) {
                          testMessages.push({
                            id: `test-user-${i}`,
                            role: "user",
                            content: `Mensagem de teste ${i} - Esta é uma mensagem longa para testar o scroll do chat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
                            createdAt: new Date(),
                          });
                          testMessages.push({
                            id: `test-assistant-${i}`,
                            role: "assistant",
                            content: `# Resposta ${i}\n\nEsta é uma **resposta longa** para testar o scroll:\n\n- Item 1\n- Item 2\n- Item 3\n\n\`\`\`javascript\nconsole.log("Teste de código ${i}");\n\`\`\`\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
                            createdAt: new Date(),
                          });
                        }
                        setMessages(testMessages);
                      }}
                    >
                      🧪 Teste Scroll (20 msgs)
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border bg-background hover:bg-muted h-auto rounded-xl px-4 py-3 text-left text-sm"
                      onClick={() => {
                        // Limpar mensagens
                        setMessages([]);
                      }}
                    >
                      🗑️ Limpar Chat
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Messages Area
              <div className="mx-auto max-w-3xl">
                {messages.map((message, index) => (
                  <MessageRendererV3
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    isStreaming={
                      message.role === "assistant" &&
                      index === messages.length - 1 &&
                      isLoading
                    }
                  />
                ))}
                <div ref={messagesEndRef} className="h-8" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixo no bottom */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              disabled={isLoading}
              className="border-border bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring min-h-[52px] rounded-xl pr-12 text-base focus:ring-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90 absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
