// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { ScrollArea } from "@kdx/ui/scroll-area";
import { Separator } from "@kdx/ui/separator";

import { useTRPC } from "~/trpc/react";
import { useAutoCreateSession } from "../_hooks/useAutoCreateSession";
import { InputBox } from "./input-box";
import { Message } from "./message";
import { WelcomeHeader } from "./welcome-header";
import { WelcomeSuggestions } from "./welcome-suggestions";

interface ChatWindowProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

export function ChatWindow({ sessionId, onNewSession }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const t = useTranslations();
  const trpc = useTRPC();

  // 🚨 CORREÇÃO: Flag para evitar loop infinito no auto-envio
  const autoSentRef = useRef<Set<string>>(new Set());

  // ✅ NOVO: Detectar se é nova conversa
  const isNewConversation = !sessionId;

  // ✅ NOVO: Hook para criar nova sessão
  const { createSessionWithMessage, isCreating } = useAutoCreateSession({
    onSuccess: (newSessionId) => {
      onNewSession?.(newSessionId);
    },
    onError: (error) => {
      console.error("❌ [UNIFIED_CHAT] Erro ao criar sessão:", error);
    },
  });

  // 🚀 MIGRAÇÃO: useChat hook oficial do Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat/stream",
    body: {
      chatSessionId: sessionId,
      useAgent: true,
    },
    // 🚀 CONFIGURAÇÃO SIMPLIFICADA: Remover configurações que podem interferir
    // Deixar o Vercel AI SDK usar configurações padrão para máxima compatibilidade
    // ✅ STREAMING: Configuração limpa para máxima performance
    onFinish: (message) => {
      console.log("✅ [VERCEL_AI_NATIVE] Chat finished:", message);

      // ✅ CORREÇÃO: Não invalidar queries para evitar piscada
      // O auto-save já salvou a mensagem no backend
      // Aguardar um pouco antes de permitir nova sincronização para garantir estabilidade

      // Auto-focus no input após terminar
      setTimeout(() => {
        inputRef.current?.focus();

        // ✅ OPCIONAL: Re-sincronizar após delay para garantir consistência
        // Apenas se necessário - o auto-save já deveria ter salvado
        setTimeout(() => {
          console.log(
            "🔄 [CHAT_WINDOW] Permitindo re-sincronização pós-streaming",
          );
          // A próxima execução do useEffect de sincronização será permitida
        }, 1000);
      }, 100);
    },
    onError: (error) => {
      console.error("🔴 [VERCEL_AI_NATIVE] Chat error:", error);
    },
  });

  // ✅ CORRIGIDO: Usar tRPC hooks para buscar mensagens existentes
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
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: true,
      },
    ),
  );

  // ✅ SINCRONIZAÇÃO ULTRA-CONSERVADORA: Apenas para carregamento inicial
  useEffect(() => {
    if (!sessionId || messagesQuery.isLoading) {
      return; // Não sincronizar se não há sessão ou ainda carregando
    }

    // ✅ PROTEÇÃO CRÍTICA: NUNCA sincronizar durante streaming
    if (isLoading) {
      console.log("⚡ [CHAT_WINDOW] Pulando sincronização - streaming ativo");
      return;
    }

    // ✅ PROTEÇÃO CRÍTICA: NUNCA sincronizar se já há mensagens do useChat
    if (messages.length > 0) {
      console.log(
        "⚡ [CHAT_WINDOW] Pulando sincronização - useChat já tem mensagens",
      );
      return;
    }

    const data = messagesQuery.data;
    if (data?.messages) {
      // 🎯 FILTRAR mensagens system - não devem aparecer na interface
      const visibleMessages = data.messages.filter(
        (msg: any) => msg.senderRole !== "system",
      );

      const formattedMessages = visibleMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.senderRole === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // ✅ SINCRONIZAÇÃO APENAS NO CARREGAMENTO INICIAL
      if (formattedMessages.length > 0) {
        console.log(
          `🔄 [CHAT_WINDOW] Carregamento inicial - sincronizando ${formattedMessages.length} mensagens`,
        );
        setMessages(formattedMessages);
      }

      console.log(
        `🔍 [CHAT_WINDOW] Total mensagens no banco: ${data.messages.length}`,
      );
      console.log(
        `🎯 [CHAT_WINDOW] Mensagens system filtradas: ${data.messages.length - visibleMessages.length}`,
      );
      console.log(`✅ [CHAT_WINDOW] Mensagens no useChat: ${messages.length}`);

      // 🚀 CORREÇÃO: Auto-enviar primeira mensagem se houver apenas mensagem do usuário
      const hasOnlyUserMessage =
        formattedMessages.length === 1 && formattedMessages[0]?.role === "user";

      const userMessage = formattedMessages[0];
      const messageKey = `${sessionId}-${userMessage?.id}`;

      if (
        hasOnlyUserMessage &&
        userMessage &&
        !autoSentRef.current.has(messageKey)
      ) {
        console.log(
          "🎯 [AUTO_SEND] Detectada nova sessão com apenas mensagem do usuário, enviando para IA...",
        );

        // Marcar como enviado ANTES de enviar para evitar loop
        autoSentRef.current.add(messageKey);

        // Pequeno delay para garantir que o useChat foi sincronizado
        setTimeout(() => {
          console.log(
            "📤 [AUTO_SEND] Enviando mensagem automaticamente:",
            userMessage.content,
          );

          // Usar append do useChat para adicionar a mensagem e processar IA
          append({
            role: "user",
            content: userMessage.content,
          });
        }, 100);
      }
    }
  }, [
    messagesQuery.data,
    sessionId,
    setMessages,
    append,
    isLoading,
    messages.length,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ NOVO: Focar no input ao selecionar uma sessão
  useEffect(() => {
    if (!isNewConversation && !messagesQuery.isLoading) {
      inputRef.current?.focus();
    }
  }, [sessionId, isNewConversation, messagesQuery.isLoading]);

  // 🚨 CORREÇÃO: Limpar flag quando sessão muda (mas não as mensagens)
  useEffect(() => {
    // Limpar flags antigas quando trocar de sessão
    autoSentRef.current.clear();
    console.log(`🔄 [CHAT_WINDOW] Mudança de sessão detectada: ${sessionId}`);
  }, [sessionId]);

  // ✅ NOVO: Função para lidar com nova mensagem (nova conversa)
  const handleNewMessage = async (message: string) => {
    if (isCreating) return;

    try {
      await createSessionWithMessage({
        firstMessage: message,
        useAgent: false,
        generateTitle: true,
      });
    } catch (error) {
      console.error("❌ [UNIFIED_CHAT] Erro ao criar nova sessão:", error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleNewMessage(suggestion);
  };

  // 🚀 MIGRAÇÃO: Handler usando useChat para sessões existentes
  const handleExistingSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log("📤 [VERCEL_AI_NATIVE] Enviando mensagem:", input);
    handleSubmit(e);
  };

  // ✅ NOVO: Renderização condicional baseada no modo
  if (isNewConversation) {
    return (
      <div className="flex h-full flex-col">
        {/* Header com boas-vindas - área expansível */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-4xl px-4">
              <WelcomeHeader />
              <WelcomeSuggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        </div>

        {/* Input fixo no bottom */}
        <div className="bg-background flex-shrink-0 border-t p-4">
          <div className="mx-auto max-w-4xl">
            <InputBox
              ref={inputRef}
              onSend={handleNewMessage}
              disabled={isCreating}
              placeholder={t("apps.chat.placeholders.newConversation")}
              isStreaming={isCreating}
            />
          </div>
        </div>

        {/* Mostrar erro se houver */}
        {error && (
          <div className="flex-shrink-0 p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
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
                {t("apps.chat.actions.retry")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ MODO CONVERSA NORMAL - Layout com absolute positioning para altura fixa
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Chat Area - área que cresce */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Container para margem do chat window */}
        <div className="px-4 py-4 md:px-8 lg:px-16">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.chat.messages.emptyTitle")}
              </h3>
              <p className="text-muted-foreground">
                {t("apps.chat.messages.emptyDescription")}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={message.id || index}>
                  <div
                    className={
                      message.role === "user" ? "flex justify-end px-0" : "px-0"
                    }
                  >
                    <Message
                      role={message.role}
                      content={message.content}
                      isStreaming={false} // Não mais necessário
                    />
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <Separator />

      {/* Input area - altura fixa no bottom */}
      <div className="bg-background flex-shrink-0 p-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleExistingSessionSubmit}>
            <InputBox
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onSend={(message) => {
                if (!message.trim() || isLoading) return;
                const syntheticEvent = {
                  preventDefault: () => {},
                } as React.FormEvent;
                append({ role: "user", content: message });
              }}
              disabled={isLoading}
              placeholder={t("apps.chat.placeholders.typeMessage")}
              isStreaming={isLoading}
              onStop={stop}
            />
          </form>
        </div>
      </div>

      {/* Mostrar erro se houver */}
      {error && (
        <div className="flex-shrink-0 p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
