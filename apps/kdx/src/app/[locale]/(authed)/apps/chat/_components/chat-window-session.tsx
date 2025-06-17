// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { ScrollArea } from "@kdx/ui/scroll-area";
import { Separator } from "@kdx/ui/separator";

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

  // ✅ CORRIGIDO: Usar padrão useTRPC
  const trpc = useTRPC();

  const messagesQuery = useQuery(
    trpc.app.chat.buscarMensagensTest.queryOptions(
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
    ),
  );

  // Atualizar mensagens quando os dados chegarem
  useEffect(() => {
    const data = messagesQuery.data;
    if (data?.messages) {
      // 🎯 FILTRAR mensagens system - não devem aparecer na interface
      const visibleMessages = data.messages.filter(
        (msg: any) => msg.senderRole !== "system",
      );

      const formattedMessages = visibleMessages.map((msg: any) => ({
        role: (msg.senderRole === "user" ? "user" : "assistant") as MessageRole,
        content: msg.content,
        id: msg.id,
      }));
      setMessages(formattedMessages);

      console.log(
        `🔍 [CHAT_SESSION] Total mensagens no banco: ${data.messages.length}`,
      );
      console.log(
        `🎯 [CHAT_SESSION] Mensagens system filtradas: ${data.messages.length - visibleMessages.length}`,
      );
      console.log(
        `✅ [CHAT_SESSION] Mensagens visíveis: ${visibleMessages.length}`,
      );
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

  // ✅ Usar queryClient para invalidações corretas

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
        // ✅ Invalidar usando queryClient (padrão tRPC v11)
        queryClient.invalidateQueries(
          trpc.app.chat.buscarMensagensTest.pathFilter({
            chatSessionId: sessionId,
          }),
        );
      }
    } catch (error) {
      // ✅ NOVO: Ignorar erros de cancelamento
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("🚫 Request cancelado pelo usuário");
        // ✅ CORREÇÃO: Sempre invalidar cache mesmo quando cancelado
        if (sessionId) {
          console.log("🔄 Invalidando cache após cancelamento do stream");
          // ✅ Usar queryClient (padrão tRPC v11)
          queryClient.invalidateQueries(
            trpc.app.chat.buscarMensagensTest.pathFilter({
              chatSessionId: sessionId,
            }),
          );
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
        // ✅ Usar queryClient (padrão tRPC v11)
        queryClient.invalidateQueries(
          trpc.app.chat.buscarMensagensTest.pathFilter({
            chatSessionId: sessionId,
          }),
        );
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
        <Card className="bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-slate-300">{t("apps.chat.messages.loading")}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (sessionId && messagesQuery.error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <Alert variant="destructive" className="border-0">
              <AlertDescription>
                {t("apps.chat.messages.error")}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => messagesQuery.refetch()}
              variant="outline"
              className="border-purple-600 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("apps.chat.messages.tryAgain")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 text-center">
            <MessageCircle className="h-12 w-12 text-slate-500" />
            <p className="text-slate-400">
              {t("apps.chat.messages.selectConversation")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Chat Area */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          {/* Container para margem do chat window */}
          <div className="px-4 py-4 md:px-8 lg:px-40">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={
                  msg.role === "user"
                    ? "flex justify-end px-0" // Usuário: limitado e com padding
                    : "px-0" // Assistente: sem margens laterais - usa 100% da largura
                }
              >
                <Message
                  role={msg.role}
                  content={msg.content}
                  isStreaming={
                    msg.role === "assistant" &&
                    idx === messages.length - 1 &&
                    isLoading
                  }
                />
              </div>
            ))}

            {/* Loading indicator quando não há mensagens */}
            {isLoading && messages.length === 0 && (
              <div className="flex justify-end px-0">
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      {t("apps.chat.messages.typing")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex justify-end px-0">
                <div className="flex justify-center py-8">
                  <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-8" />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-4xl">
          <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
