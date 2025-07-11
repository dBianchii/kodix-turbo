"use client";

import type { Message } from "@ai-sdk/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { ScrollArea } from "@kdx/ui/scroll-area";

import type { ChatSDKMessageType } from "~/trpc/shared";
import { useTRPC } from "~/trpc/react";
import { useSessionWithMessages } from "../_hooks/useSessionWithMessages";
import { useTitleSync } from "../_hooks/useTitleSync";
import { useThreadContext } from "../_providers/chat-thread-provider";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";

/**
 * ✅ SUB-ETAPA 2.4: Chat ativo com thread context integrado
 * Arquitetura thread-first com fallbacks robustos
 */
export function ActiveChatWindow({
  sessionId,
  onStreamingFinished,
}: {
  sessionId: string;
  onStreamingFinished?: () => void;
}) {
  // Hook para prevenir problemas de hidratação
  const [isClient, setIsClient] = useState(false);
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const t = useTranslations("apps.chat");
  const trpc = useTRPC();

  // ✅ SUB-ETAPA 2.4: Thread context integrado
  const threadContext = useThreadContext();
  const { switchToThread, activeThreadId } = threadContext;

  // Modelo padrão
  const selectedModelId = "claude-3-5-haiku-20241022";

  // ✅ SUB-ETAPA 2.4: Options memoizadas para performance
  const sessionOptions = useMemo(
    () => ({
      enabled: Boolean(sessionId),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
    [sessionId],
  );

  // Buscar dados da sessão
  const {
    session,
    initialMessages,
    isLoading: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useSessionWithMessages(sessionId, sessionOptions);

  // ✅ SUB-ETAPA 2.4: Sincronização com thread context
  useEffect(() => {
    if (switchToThread && sessionId && sessionId !== activeThreadId) {
      switchToThread(sessionId);
    }
  }, [sessionId, activeThreadId, switchToThread]);

  // ✅ SUB-ETAPA 2.4: Log de montagem (apenas desenvolvimento)
  useEffect(() => {
    console.log("🔄 [ACTIVE_CHAT] Component mounted/updated:", {
      sessionId,
      session: session?.id,
      messagesCount: initialMessages?.length,
      threadContext: !!threadContext,
    });
  }, [sessionId, session, initialMessages, threadContext]);

  // ✅ SUB-ETAPA 2.4: Refetch inteligente com guards anti-loop
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Guard 1: Validar sessionId
    if (!sessionId || sessionId === "new") {
      setHasInitialized(false);
      setLastSessionId(null);
      return;
    }

    // Guard 2: Verificar mudança real
    if (sessionId === lastSessionId) {
      return;
    }

    // Guard 3: Prevenir execuções simultâneas
    if (hasInitialized && sessionId === lastSessionId) {
      return;
    }

    // Marcar como inicializado e fazer refetch
    setHasInitialized(true);
    setLastSessionId(sessionId);

    const timer = setTimeout(() => {
      void refetchSession();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [sessionId, refetchSession, hasInitialized, lastSessionId]);

  // Hook de sincronização de título
  const { syncNow } = useTitleSync({
    sessionId,
    enabled: true,
  });

  // ✅ SUB-ETAPA 2.4: Body memoizado para performance
  const chatBody = useMemo(
    () => ({
      chatSessionId: sessionId,
      selectedModelId,
      useAgent: true,
    }),
    [sessionId, selectedModelId],
  );

  // ✅ SUB-ETAPA 2.4: Callback otimizado onFinish
  const handleChatFinish = useCallback(
    (_message: ChatSDKMessageType) => {
      onStreamingFinished?.();

      // Auto-focus após streaming
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Aguardar processamento backend e sincronizar
      setTimeout(() => {
        void Promise.allSettled([
          syncNow(),
          refetchSession(),
          queryClient.invalidateQueries(
            trpc.app.chat.findSessions.pathFilter(),
          ),
        ]);
      }, 1500);
    },
    [
      syncNow,
      refetchSession,
      queryClient,
      trpc.app.chat.findSessions,
      onStreamingFinished,
    ],
  );

  // ✅ SUB-ETAPA 2.4: Callback otimizado onError
  const handleChatError = useCallback(
    (error: Error) => {
      console.error("❌ [ACTIVE_CHAT] Erro no chat:", error);
      try {
        const errorJson = JSON.parse(error.message);
        if (errorJson.error) {
          setFriendlyError(`${t("error.provider_error")}: ${errorJson.error}`);
          return;
        }
      } catch (e) {
        // Not a JSON error, proceed to generic message
      }
      setFriendlyError(t("error.generic"));
    },
    [t],
  );

  // ✅ SUB-ETAPA 2.4: useChat configurado com thread-first architecture
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isLoadingChat,
    error: chatError,
    setMessages,
    stop,
    append,
  } = useChat({
    api: "/api/chat/stream",
    initialMessages: initialMessages ?? [],
    body: chatBody,
    onFinish: handleChatFinish,
    onError: handleChatError,
    keepLastMessageOnError: true,
  });

  // Limpar erro ao mudar de sessão
  useEffect(() => {
    if (sessionId) {
      setFriendlyError(null);
    }
  }, [sessionId]);

  // ✅ Wrapper para compatibilidade com onSendMessage
  const handleSendMessage = useCallback(
    (_message: string) => {
      // O hook useChat não precisa do texto, ele usa o `input` interno
      // Apenas chamamos o evento de submit
      handleSubmit(
        new Event("submit") as unknown as React.FormEvent<HTMLFormElement>,
      );
    },
    [handleSubmit],
  );

  // ✅ THREAD-FIRST: Sincronização otimizada das mensagens
  // ✅ CORREÇÃO: Condições de guarda para prevenir loop infinito na sincronização
  const [lastDbMessagesLength, setLastDbMessagesLength] = useState(0);
  const [lastDbMessagesHash, setLastDbMessagesHash] = useState<string>("");

  // ✅ CORREÇÃO: Remover processamento de mensagens pendentes que estava causando loop infinito
  // O sistema já está funcionando corretamente - a mensagem é enviada via append no useChat

  // ✅ CORREÇÃO: Processamento de mensagens pendentes removido para evitar loop infinito
  // O sistema já funciona corretamente - o useChat processa automaticamente as mensagens

  useEffect(() => {
    // ✅ ETAPA 4: GUARDA DE HIDRATAÇÃO - Só executar no cliente
    if (!isClient) {
      return;
    }

    // ✅ GUARDA 1: Verificar se há mudança real nas mensagens
    const currentLength = initialMessages?.length || 0;
    const currentHash = JSON.stringify(
      initialMessages?.map((m) => m.id) || [],
    ).slice(0, 50);

    // ✅ GUARDA 2: Só sincronizar se houve mudança real
    if (
      currentLength === lastDbMessagesLength &&
      currentHash === lastDbMessagesHash
    ) {
      return;
    }

    if (initialMessages?.length > 0) {
      // ✅ CORREÇÃO: Atualizar tracking ANTES da sincronização
      setLastDbMessagesLength(currentLength);
      setLastDbMessagesHash(currentHash);

      // ✅ CORREÇÃO: Sempre sincronizar com banco, mesmo se useChat já tem mensagens
      setMessages(
        initialMessages.map(
          (msg): Message => ({
            id: msg.id,
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          }),
        ),
      );
    } else if (!isLoadingSession && messages.length > 0) {
      // ✅ THREAD-FIRST: Se não há mensagens no banco, limpar useChat
      setMessages([]);
    }
  }, [
    initialMessages,
    sessionId,
    setMessages,
    lastDbMessagesLength,
    lastDbMessagesHash,
    isClient, // ✅ ETAPA 4: Incluir guard de hidratação
    isLoadingSession,
  ]);

  // ✅ SOLUÇÃO: Processar mensagens pendentes do sessionStorage
  // Como na versão original, o frontend envia a mensagem via streaming
  useEffect(() => {
    // Guard: só executar no cliente
    if (!isClient) {
      return;
    }

    const pendingMessage = sessionStorage.getItem(
      `pending-message-${sessionId}`,
    );

    // Enviar mensagem pendente se disponível e chat não estiver carregando
    if (pendingMessage && !isLoadingSession && !isLoadingChat) {
      void append({
        id: `pending-${Date.now()}`,
        content: pendingMessage,
        role: "user",
      });

      // Limpar mensagem do sessionStorage
      sessionStorage.removeItem(`pending-message-${sessionId}`);
    }
  }, [sessionId, isLoadingSession, isLoadingChat, append, isClient]);

  // Scroll para o final
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoadingChat) {
      inputRef.current?.focus();
    }
  }, [isLoadingChat]);

  // Renderização condicional
  if (isLoadingSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="bg-muted mx-auto mb-4 h-8 w-8 animate-pulse rounded" />
          <p className="text-muted-foreground">{t("messages.loading")}</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {sessionError.message || t("messages.error")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative flex h-full max-h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="relative h-full">
          <div className="container-app pb-4">
            {messages.length > 0 ? (
              <ChatMessages
                messages={messages}
                isLoading={isLoadingChat}
                isError={!!chatError}
                bottomRef={bottomRef}
              />
            ) : (
              !isLoadingSession && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">{t("noMessages")}</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>
      {friendlyError && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{friendlyError}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="border-t">
        <div className="container-app py-4">
          <MessageInput
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onSendMessage={handleSendMessage}
            placeholder={t("continueConversation")}
            isLoading={isLoadingChat}
            isStreaming={isLoadingChat && messages.length > 0}
            onStop={stop}
            disabled={isLoadingSession}
          />
          {chatError && (
            <div className="text-destructive mt-2 flex items-center gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              <p>
                {t("messages.errorOccurred", {
                  error:
                    (chatError as any).message ||
                    (chatError as any).error ||
                    "Unknown",
                })}
              </p>
            </div>
          )}
          {chatError && (chatError as any).stack && (
            <pre className="text-destructive mt-2 rounded-md bg-red-50 p-2 text-xs whitespace-pre-wrap">
              {(chatError as any).stack}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export const MemoizedActiveChatWindow = memo(ActiveChatWindow);
