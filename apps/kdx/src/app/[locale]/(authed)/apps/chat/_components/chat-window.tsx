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
import { useSessionCreation } from "../_hooks/useSessionCreation";
import { useSessionWithMessages } from "../_hooks/useSessionWithMessages";
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

  // 🚨 FASE 1 - DIA 2: REMOVENDO AUTO-ENVIO - Flag comentada
  // const autoSentRef = useRef<Set<string>>(new Set());

  // ✅ NOVO: Detectar se é nova conversa
  const isNewConversation = !sessionId;

  // 🔄 FASE 3 - DIA 11: Hook de abstração para criar nova sessão
  const { createSession, isCreating, isUsingNewFlow, debugInfo } =
    useSessionCreation({
      onSuccess: (newSessionId) => {
        console.log(
          "✅ [SESSION_CREATION] Sessão criada com sucesso:",
          newSessionId,
        );
        console.log("🔧 [SESSION_CREATION] Fluxo usado:", debugInfo.flow);
        onNewSession?.(newSessionId);
      },
      onError: (error) => {
        console.error("❌ [SESSION_CREATION] Erro ao criar sessão:", error);
        console.log("🔧 [SESSION_CREATION] Debug info:", debugInfo);
      },
    });

  // 🚀 FASE 2 - DIA 6-7: Hook para buscar sessão com mensagens formatadas
  const {
    session,
    initialMessages,
    isLoading: isLoadingSession,
  } = useSessionWithMessages(sessionId);

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
    // 🚀 FASE 2 - DIA 6-7: Carregar histórico apenas uma vez
    initialMessages: initialMessages || [],
    // ✅ STREAMING: Configuração limpa para máxima performance
    onFinish: (message) => {
      console.log("✅ [VERCEL_AI_NATIVE] Chat finished:", message);

      // Auto-focus no input após terminar
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    onError: (error) => {
      console.error("🔴 [VERCEL_AI_NATIVE] Chat error:", error);
    },
  });

  // 🚀 FASE 2 - DIA 6-7: REMOVIDA toda sincronização manual
  // O initialMessages do useChat já carrega o histórico automaticamente!

  // 🔄 FASE 3 - DIA 12: ENVIO PÓS-NAVEGAÇÃO para novo fluxo
  useEffect(() => {
    // Verificar se há mensagem pendente do novo fluxo
    const pendingMessage = sessionStorage.getItem(
      `pending-message-${sessionId}`,
    );

    if (
      sessionId &&
      pendingMessage &&
      isUsingNewFlow &&
      messages.length === 0 &&
      !isLoading
    ) {
      console.log(
        "📤 [POST_NAVIGATION] Enviando mensagem pendente:",
        pendingMessage.slice(0, 50) + "...",
      );

      // Enviar mensagem pendente via append
      append({
        role: "user",
        content: pendingMessage,
      });

      // Limpar mensagem pendente
      sessionStorage.removeItem(`pending-message-${sessionId}`);
    }
  }, [sessionId, isUsingNewFlow, messages.length, isLoading, append]);

  // 🎯 AUTO-PROCESSAMENTO INTELIGENTE: Reprocessar última mensagem (Assistant-UI pattern)
  // APENAS para fluxo atual (antigo)
  useEffect(() => {
    // Condições para auto-processamento inteligente:
    // 1. Tem sessionId (não é nova conversa)
    // 2. initialMessages tem exatamente 1 mensagem do usuário
    // 3. useChat também tem exatamente 1 mensagem (sincronizado)
    // 4. Não está fazendo streaming
    // 5. NÃO está usando novo fluxo (para evitar conflito)
    if (
      sessionId &&
      !isUsingNewFlow &&
      initialMessages.length === 1 &&
      initialMessages[0]?.role === "user" &&
      messages.length === 1 &&
      messages[0]?.role === "user" &&
      !isLoading
    ) {
      console.log(
        "🎯 [AUTO_PROCESS_SMART] Nova sessão detectada (fluxo atual), reprocessando última mensagem...",
      );
      console.log(
        "📝 [AUTO_PROCESS_SMART] Mensagem:",
        initialMessages[0].content.slice(0, 50) + "...",
      );

      // ✅ SOLUÇÃO ASSISTANT-UI: Usar reload() ao invés de append()
      // reload() reprocessa a última mensagem sem duplicar
      // Baseado em: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat#reload
      reload();
    }
  }, [sessionId, isUsingNewFlow, initialMessages, messages, isLoading, reload]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ NOVO: Focar no input ao selecionar uma sessão
  useEffect(() => {
    if (!isNewConversation && !isLoadingSession) {
      inputRef.current?.focus();
    }
  }, [sessionId, isNewConversation, isLoadingSession]);

  // 🚨 FASE 1 - DIA 2: REMOVENDO AUTO-ENVIO - useEffect comentado
  /*
  useEffect(() => {
    // Limpar flags antigas quando trocar de sessão
    autoSentRef.current.clear();
    console.log(`🔄 [CHAT_WINDOW] Mudança de sessão detectada: ${sessionId}`);
  }, [sessionId]);
  */

  // 🔄 FASE 3 - DIA 11: Função adaptada para usar abstração
  const handleNewMessage = async (message: string) => {
    if (isCreating) return;

    console.log("🚀 [SESSION_CREATION] Iniciando criação de sessão...");
    console.log("🎛️ [SESSION_CREATION] Usando novo fluxo:", isUsingNewFlow);

    try {
      await createSession({
        firstMessage: message,
        useAgent: true, // Habilitar agente para processamento automático
        generateTitle: true,
      });
    } catch (error) {
      console.error("❌ [SESSION_CREATION] Erro ao criar nova sessão:", error);
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
            {/* 🔧 FASE 3: Indicador de fluxo (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-2 text-center">
                <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                  🎛️ {isUsingNewFlow ? "NOVO FLUXO" : "FLUXO ATUAL"} | Feature
                  Flag: {debugInfo?.featureFlag?.enabled ? "ON" : "OFF"}
                </span>
              </div>
            )}

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
  if (sessionId && isLoadingSession) {
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
  if (session === null) {
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
                {t("apps.chat.messages.error")}
              </p>
              <Button
                onClick={() => window.location.reload()}
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

  // ✅ MODO CONVERSA NORMAL - Layout flexbox para altura fixa
  return (
    <div className="flex h-full flex-col p-4">
      {/* Chat Area - área que cresce */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Container para margem do chat window */}
        <div className="px-0 py-4 md:px-4 lg:px-8">
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
