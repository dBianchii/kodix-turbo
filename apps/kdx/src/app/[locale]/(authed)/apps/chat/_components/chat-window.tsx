// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { ScrollArea } from "@kdx/ui/scroll-area";
import { Separator } from "@kdx/ui/separator";

import { api } from "~/trpc/react";
import { useAutoCreateSession } from "../_hooks/useAutoCreateSession";
import { InputBox } from "./input-box";
import { Message } from "./message";
import { WelcomeHeader } from "./welcome-header";
import { WelcomeSuggestions } from "./welcome-suggestions";

type MessageRole = "assistant" | "user";

interface ChatMessage {
  role: MessageRole;
  content: string;
  id?: string;
}

interface ChatWindowProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

export function ChatWindow({
  sessionId,
  onNewSession,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const t = useTranslations();

  // ✅ NOVO: Detectar se é nova conversa
  const isNewConversation = !sessionId;

  // ✅ NOVO: Hook para criar nova sessão
  const { createSessionWithMessage, isCreating } = useAutoCreateSession({
    onSuccess: (newSessionId) => {
      console.log("🎉 [CHAT] Nova sessão criada:", newSessionId);
      onNewSession?.(newSessionId);
    },
    onError: (error) => {
      console.error("❌ [CHAT] Erro ao criar sessão:", error);
      setError(`Erro ao criar sessão: ${error.message}`);
    },
  });

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
    if (isNewConversation) {
      // Se é nova conversa, não mostrar mensagens
      setMessages([]);
      return;
    }

    const data = messagesQuery.data;
    if (data?.messages) {
      const formattedMessages = data.messages.map((msg: any) => ({
        role: (msg.senderRole === "user" ? "user" : "assistant") as MessageRole,
        content: msg.content,
        id: msg.id,
      }));
      setMessages(formattedMessages);

      // ✅ CORREÇÃO: Auto-processar primeira resposta da IA se há apenas mensagem do usuário
      // Isso acontece quando uma nova sessão é criada com useAgent: false e depois redirecionada
      if (
        formattedMessages.length === 1 &&
        formattedMessages[0].role === "user" &&
        !isLoading
      ) {
        console.log(
          "🤖 [CHAT] Detectada nova sessão com apenas mensagem do usuário, processando resposta da IA...",
        );
        const userMessage = formattedMessages[0].content;
        // Pequeno delay para garantir que a UI foi atualizada
        setTimeout(() => {
          // ✅ CORREÇÃO: Usar sendMessage com flag especial para evitar duplicação
          sendMessageForNewSession(userMessage);
        }, 500);
      }
    } else if (sessionId && data?.messages?.length === 0) {
      // Se há sessão mas não há mensagens, mostrar mensagem de boas-vindas
      setMessages([
        {
          role: "assistant",
          content: t("apps.chat.messages.greeting"),
        },
      ]);
    }
  }, [messagesQuery.data, sessionId, t, isNewConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Usar utils do tRPC para invalidações corretas
  const utils = api.useUtils();

  // ✅ CORREÇÃO: Função para lidar com nova mensagem (nova conversa)
  const handleNewMessage = async (message: string) => {
    if (isCreating) return;

    console.log("🚀 [CHAT] Criando nova sessão com mensagem:", message);
    setError(null);

    try {
      await createSessionWithMessage({
        firstMessage: message,
        useAgent: false, // ✅ CORREÇÃO: Criar sessão sem IA para fazer streaming visual
        generateTitle: true,
      });
    } catch (error) {
      console.error("❌ [CHAT] Erro ao criar nova sessão:", error);
    }
  };

  // ✅ NOVO: Função para lidar com sugestões
  const handleSuggestionClick = (suggestion: string) => {
    handleNewMessage(suggestion);
  };

  // ✅ CORREÇÃO: Função para processar IA em nova sessão (sem duplicar mensagem do usuário)
  async function sendMessageForNewSession(text: string) {
    if (isLoading || !sessionId) return;

    console.log(
      "🤖 [NEW_SESSION] Processando IA para nova sessão:",
      text.slice(0, 50) + "...",
    );
    setIsLoading(true);
    setError(null);

    // ✅ Cancelar stream anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // ✅ Criar novo AbortController para este stream
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentSessionId = sessionId; // Capturar sessionId atual

    // ✅ CORREÇÃO: NÃO adicionar mensagem do usuário (ela já existe no banco)
    // Adicionar apenas mensagem vazia da IA para o streaming
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      console.log(
        "🔄 [NEW_SESSION] Fazendo requisição para API de streaming...",
      );
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSessionId: sessionId,
          content: text,
          useAgent: true,
          skipUserMessage: true, // ✅ NOVO: Flag para não criar mensagem do usuário
        }),
        signal: abortController.signal,
      });

      console.log(
        "📥 [NEW_SESSION] Resposta recebida, status:",
        response.status,
      );

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

      console.log("🔄 [NEW_SESSION] Iniciando leitura do stream");
      let receivedText = "";

      while (true) {
        if (abortController.signal.aborted) {
          console.log("🚫 [NEW_SESSION] Stream cancelado");
          break;
        }

        if (currentSessionIdRef.current !== currentSessionId) {
          console.log(
            "🔄 [NEW_SESSION] Sessão mudou durante o stream, cancelando",
          );
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          console.log("✅ [NEW_SESSION] Stream concluído");
          break;
        }

        try {
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;

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
          console.warn(
            "⚠️ [NEW_SESSION] Erro ao decodificar chunk, ignorando:",
            decodeError,
          );
          continue;
        }
      }

      if (!receivedText) {
        console.warn("⚠️ [NEW_SESSION] Nenhum texto foi recebido no stream");
      }

      // Invalidar cache das mensagens para recarregar do banco
      if (sessionId && currentSessionIdRef.current === currentSessionId) {
        utils.app.chat.buscarMensagensTest.invalidate({
          chatSessionId: sessionId,
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("🚫 [NEW_SESSION] Request cancelado pelo usuário");
        if (sessionId) {
          console.log(
            "🔄 [NEW_SESSION] Invalidando cache após cancelamento do stream",
          );
          utils.app.chat.buscarMensagensTest.invalidate({
            chatSessionId: sessionId,
          });
        }
        return;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      console.error("🔴 [NEW_SESSION] Erro ao processar resposta da IA:", err);

      if (currentSessionIdRef.current === currentSessionId) {
        setError(`${t("apps.chat.messages.error")}: ${err.message}`);
        setMessages((prev) => {
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
      console.log("🔄 [NEW_SESSION] Finalizando processamento da IA");

      if (sessionId) {
        console.log(
          "🔄 [NEW_SESSION] Invalidando cache no finally para garantir sincronização",
        );
        utils.app.chat.buscarMensagensTest.invalidate({
          chatSessionId: sessionId,
        });
      }

      if (currentSessionIdRef.current === currentSessionId) {
        setIsLoading(false);
      }

      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }

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

    // ✅ NOVO: Só adicionar mensagem do usuário se ela não existir já
    const userMessageExists = messages.some(
      (msg) => msg.role === "user" && msg.content === text,
    );
    if (!userMessageExists) {
      // Adicionar mensagem do usuário imediatamente
      setMessages((prev) => [...prev, userMessage]);
    }

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

  // ✅ NOVO: Renderização condicional baseada no modo
  if (isNewConversation) {
    return (
      <div className="flex h-full flex-col">
        {/* Header com boas-vindas */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-4xl px-4">
              <WelcomeHeader />
              <WelcomeSuggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        </div>

        {/* Input fixo no bottom */}
        <div className="bg-background border-t p-4">
          <div className="mx-auto max-w-4xl">
            <InputBox
              onSend={handleNewMessage}
              disabled={isCreating}
              placeholder="Digite sua mensagem para começar uma nova conversa..."
            />
          </div>
        </div>

        {/* Mostrar erro se houver */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    );
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
  if (messagesQuery.error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="text-destructive h-12 w-12" />
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.chat.messages.errorTitle")}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {messagesQuery.error.message}
              </p>
              <Button
                onClick={() => messagesQuery.refetch()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("apps.chat.messages.retry")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ MODO CONVERSA NORMAL
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Chat Area - Usando ScrollArea como no ChatWindow original */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          {/* Container para margem do chat window */}
          <div className="px-4 py-4 md:px-8 lg:px-16">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user" ? "flex justify-end px-0" : "px-0"
                }
              >
                <Message
                  role={message.role}
                  content={message.content}
                  isStreaming={
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
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

      {/* Input Area - Fixo no bottom como no ChatWindow original */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-4xl">
          <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
