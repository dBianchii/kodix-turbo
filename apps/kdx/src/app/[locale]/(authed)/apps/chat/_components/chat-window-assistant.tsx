"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAssistant } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { ScrollArea } from "@kdx/ui/scroll-area";
import { Separator } from "@kdx/ui/separator";

import { useTRPC } from "~/trpc/react";
import { useSessionWithMessages } from "../_hooks/useSessionWithMessages";
import { useTitleSync } from "../_hooks/useTitleSync";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";

interface ChatWindowAssistantProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

export function ChatWindowAssistant({
  sessionId,
  onNewSession,
}: ChatWindowAssistantProps) {
  console.log("🔍 [ASSISTANT-UI] ChatWindowAssistant render:", {
    sessionId,
    hasOnNewSession: !!onNewSession,
  });

  // ✅ THREAD-FIRST: Se não há sessionId, mostrar tela inicial zerada
  if (!sessionId) {
    console.log("🔍 [ASSISTANT-UI] Renderizando EmptyThreadStateAssistant");
    return <EmptyThreadStateAssistant onNewSession={onNewSession} />;
  }

  console.log("🔍 [ASSISTANT-UI] Renderizando ActiveChatWindowAssistant");
  // ✅ THREAD-FIRST: Se há sessionId, usar o componente normal
  return (
    <ActiveChatWindowAssistant
      sessionId={sessionId}
      onNewSession={onNewSession}
    />
  );
}

/**
 * ✅ ASSISTANT-UI: Tela inicial zerada (sem sessão criada)
 * Usando padrão Assistant-UI completo
 */
function EmptyThreadStateAssistant({
  onNewSession,
}: {
  onNewSession?: (sessionId: string) => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // 🚀 ASSISTANT-UI: Hook principal do Assistant-UI
  const {
    threadId,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useAssistant({
    api: "/api/assistant", // ✅ Endpoint dedicado do Assistant-UI
  });

  // ✅ Efeito para navegar quando thread é criada
  useEffect(() => {
    if (threadId && onNewSession) {
      console.log("🚀 [ASSISTANT-UI] Thread criada:", threadId);

      // Invalidar queries relacionadas
      queryClient.invalidateQueries(trpc.app.chat.listarSessions.pathFilter());
      queryClient.invalidateQueries(
        trpc.app.chat.buscarMensagensTest.pathFilter(),
      );
      queryClient.invalidateQueries(trpc.app.chat.buscarSession.pathFilter());

      // Navegar para a nova sessão
      onNewSession(threadId);
    }
  }, [threadId, onNewSession, queryClient, trpc]);

  // ✅ OTIMIZAÇÃO: Memoizar sugestões para evitar re-criação
  const suggestions = useMemo(
    () => [
      "Como você pode me ajudar?",
      "Explique um conceito",
      "Resuma um texto",
    ],
    [],
  );

  // ✅ RESTAURADO: Auto-focus inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ ASSISTANT-UI: Handler para sugestões
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      // Simular mudança no input e submit
      const syntheticEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;

      handleInputChange(syntheticEvent);

      // Aguardar o estado atualizar e fazer submit
      setTimeout(() => {
        const submitEvent = {
          preventDefault: () => {},
        } as React.FormEvent;
        handleSubmit(submitEvent);
      }, 100);
    },
    [handleInputChange, handleSubmit],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h1 className="text-lg font-semibold">
            {t("apps.chat.newConversation")}
          </h1>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <MessageCircle className="text-primary h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {t("apps.chat.startNewChat")}
            </h2>
            <p className="text-muted-foreground">
              {t("apps.chat.startNewChatDescription")}
            </p>
          </div>

          {/* Sugestões de exemplo */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("apps.chat.suggestions")}:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input de Mensagem */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <MessageInput
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder={t("apps.chat.typeFirstMessage")}
            isLoading={isLoading}
            onSendMessage={() => {}} // Handled by form submit
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || t("apps.chat.errorCreatingSession")}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}

/**
 * ✅ ASSISTANT-UI: Chat ativo com sessão existente
 */
function ActiveChatWindowAssistant({
  sessionId,
  onNewSession,
}: {
  sessionId: string;
  onNewSession?: (sessionId: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const t = useTranslations();
  const trpc = useTRPC();

  // ✅ THREAD-FIRST: Modelo padrão (pode ser passado como prop futuramente)
  const selectedModelId = "claude-3-5-haiku-20241022";

  // ✅ OTIMIZAÇÃO: Memoizar options para useSessionWithMessages
  const sessionOptions = useMemo(
    () => ({
      enabled: true,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
    [],
  );

  // Buscar dados da sessão (continuar usando o hook existente)
  const {
    session,
    initialMessages: dbMessages,
    isLoading: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useSessionWithMessages(sessionId, sessionOptions);

  // 🚀 ASSISTANT-UI: Hook principal do Assistant-UI
  const {
    threadId,
    messages,
    input,
    setInput,
    submitMessage,
    status,
    error: chatError,
  } = useAssistant({
    api: "/api/assistant",
    threadId: sessionId, // ✅ Usar sessionId existente como threadId
  });

  // ✅ CORREÇÃO: Usar status para determinar loading
  const isLoadingChat = status === "in_progress";

  // Hook de sincronização de título (manter existente)
  const { syncNow } = useTitleSync({
    sessionId,
    enabled: true,
  });

  // ✅ ASSISTANT-UI: Handler personalizado para onFinish
  useEffect(() => {
    if (!isLoadingChat && messages.length > 0) {
      // Auto-focus após streaming
      setTimeout(() => {
        inputRef.current?.focus();
        console.log("🎯 [ASSISTANT-UI] Auto-focus aplicado após streaming");
      }, 100);

      // Sincronizar dados após processamento
      setTimeout(async () => {
        console.log("🔄 [ASSISTANT-UI] Fazendo refetch após processamento");

        // Sincronizar título após nova mensagem
        await syncNow();

        // Atualizar dados da sessão
        refetchSession();

        // Invalidar queries do sidebar
        queryClient.invalidateQueries(
          trpc.app.chat.listarSessions.pathFilter(),
        );
      }, 1500);
    }
  }, [
    isLoadingChat,
    messages.length,
    syncNow,
    refetchSession,
    queryClient,
    trpc,
  ]);

  // ✅ SCROLL: Auto-scroll para baixo
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ LOADING: Estados de carregamento
  const isLoading = isLoadingSession || isLoadingChat;
  const error = sessionError || chatError;

  // ✅ ERROR: Tratamento de erros
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md p-6">
          <div className="text-destructive mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">{t("apps.chat.errorTitle")}</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {error.message || t("apps.chat.errorDescription")}
          </p>
          <Button
            onClick={() => refetchSession()}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("apps.chat.retry")}
          </Button>
        </Card>
      </div>
    );
  }

  // ✅ LAYOUT: Interface principal
  return (
    <div className="flex h-full flex-col">
      {/* Header com informações da sessão */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">
              {session?.title || t("apps.chat.conversation")}
            </span>
            {isLoading && (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoadingChat && (
              <span className="text-muted-foreground text-sm">
                {t("apps.chat.generating")}...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <ChatMessages
            messages={messages}
            isLoading={isLoadingChat}
            selectedModelId={selectedModelId}
          />
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input de mensagem */}
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              submitMessage({ role: "user", content: input });
            }
          }}
        >
          <MessageInput
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={t("apps.chat.typeMessage")}
            isLoading={isLoadingChat}
            onSendMessage={() => {
              if (input.trim()) {
                submitMessage({ role: "user", content: input });
              }
            }}
          />
        </form>
      </div>
    </div>
  );
}
