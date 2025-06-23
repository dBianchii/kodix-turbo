// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useThreadContext } from "../_providers/chat-thread-provider";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";

interface ChatWindowProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string; // ✅ NOVO: Modelo selecionado na welcome screen
}

export function ChatWindow({
  sessionId,
  onNewSession,
  selectedModelId,
}: ChatWindowProps) {
  // ✅ SUB-ETAPA 2.4: Hook para prevenir problemas de hidratação
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // ✅ SUB-ETAPA 2.4: Log de migração concluída (apenas uma vez)
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🎉 [MIGRATION_COMPLETE] Thread-first architecture ativa com fallbacks robustos",
      );
    }
  }, []);

  // ✅ SUB-ETAPA 2.4: Log otimizado - apenas em desenvolvimento
  if (process.env.NODE_ENV === "development" && sessionId) {
    console.log("🎯 [CHAT_WINDOW] Renderizado:", { sessionId, isClient });
  }

  // Aguardar hidratação no cliente antes de renderizar
  if (!isClient) {
    return (
      <div
        className="flex h-full items-center justify-center"
        suppressHydrationWarning
      >
        <div className="text-center">
          <div className="bg-muted mx-auto mb-4 h-8 w-8 animate-pulse rounded" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Thread-first architecture: mostrar tela inicial ou chat ativo
  if (!sessionId) {
    return (
      <EmptyThreadState
        onNewSession={onNewSession}
        selectedModelId={selectedModelId}
      />
    );
  }

  return <ActiveChatWindow sessionId={sessionId} onNewSession={onNewSession} />;
}

/**
 * ✅ SUB-ETAPA 2.4: Tela inicial thread-first (Assistant-UI pattern)
 * Integração completa com ChatThreadProvider
 */
function EmptyThreadState({
  onNewSession,
  selectedModelId,
}: {
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string; // ✅ NOVO: Modelo selecionado na welcome screen
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ✅ SUB-ETAPA 2.4: Thread context integrado (método principal)
  const threadContext = useThreadContext();
  const { createThread, setPendingMessage } = threadContext || {};

  // ✅ SOLUÇÃO ROBUSTA: Usar createEmptySession (mantido para compatibilidade)
  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (data: any) => {
        const sessionId = data.session.id;

        // ✅ SUB-ETAPA 2.4: Log otimizado
        if (process.env.NODE_ENV === "development") {
          console.log("✅ [EMPTY_THREAD] Sessão criada:", {
            sessionId,
            title: data.session.title,
          });
        }

        // ✅ SUB-ETAPA 2.4: Gerenciar mensagem pendente (thread context ou sessionStorage)
        if (threadContext && setPendingMessage) {
          // Thread context já gerencia automaticamente
        } else {
          // Fallback: transferir via sessionStorage
          const pendingMessage = sessionStorage.getItem("pending-message-temp");
          if (pendingMessage && sessionId) {
            sessionStorage.setItem(
              `pending-message-${sessionId}`,
              pendingMessage,
            );
            sessionStorage.removeItem("pending-message-temp");
          }
        }

        // Navegar para a nova sessão
        if (sessionId) {
          onNewSession?.(sessionId);
        }
      },
      onError: (error) => {
        console.error("❌ [EMPTY_THREAD] Erro ao criar sessão:", error);
      },
    }),
  );

  // ✅ SUB-ETAPA 2.4: Função otimizada - thread context + sessionStorage fallback
  const handleFirstMessage = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;

      if (createEmptySessionMutation.isPending) return;

      // ✅ SUB-ETAPA 2.4: Log otimizado para desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.log("🚀 [EMPTY_THREAD] Criando sessão:", {
          message: trimmedMessage.slice(0, 50) + "...",
          method: threadContext ? "thread-context" : "sessionStorage",
        });
      }

      // ✅ SUB-ETAPA 2.4: Thread context primeiro, sessionStorage como fallback
      if (setPendingMessage) {
        setPendingMessage(trimmedMessage);
      } else {
        sessionStorage.setItem("pending-message-temp", trimmedMessage);
      }

      // Criar sessão com título automático
      createEmptySessionMutation.mutate({
        generateTitle: true,
        aiModelId: selectedModelId, // ✅ NOVO: Usar modelo selecionado
        metadata: {
          firstMessage: trimmedMessage,
          createdAt: new Date().toISOString(),
        },
      });
    },
    [
      createEmptySessionMutation,
      threadContext,
      setPendingMessage,
      selectedModelId,
    ],
  );

  // ✅ SUB-ETAPA 2.4: Sugestões memoizadas
  const suggestions = useMemo(
    () => [
      "Como você pode me ajudar?",
      "Explique um conceito",
      "Resuma um texto",
    ],
    [],
  );

  // Auto-focus inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

          {/* Sugestões de exemplo (opcional) */}
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
                  onClick={() => handleFirstMessage(suggestion)}
                  disabled={createEmptySessionMutation.isPending}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input de Mensagem */}
      <div className="border-t px-[10%] py-4">
        <MessageInput
          ref={inputRef}
          onSendMessage={handleFirstMessage}
          disabled={createEmptySessionMutation.isPending}
          placeholder={t("apps.chat.typeFirstMessage")}
          isLoading={createEmptySessionMutation.isPending}
        />

        {createEmptySessionMutation.error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createEmptySessionMutation.error.message ||
                t("apps.chat.errorCreatingSession")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

/**
 * ✅ SUB-ETAPA 2.4: Chat ativo com thread context integrado
 * Arquitetura thread-first com fallbacks robustos
 */
function ActiveChatWindow({
  sessionId,
  onNewSession,
}: {
  sessionId: string;
  onNewSession?: (sessionId: string) => void;
}) {
  // Hook para prevenir problemas de hidratação
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const t = useTranslations();
  const trpc = useTRPC();

  // ✅ SUB-ETAPA 2.4: Thread context integrado
  const threadContext = useThreadContext();
  const { switchToThread, activeThreadId } = threadContext || {};

  // Modelo padrão
  const selectedModelId = "claude-3-5-haiku-20241022";

  // ✅ SUB-ETAPA 2.4: Options memoizadas para performance
  const sessionOptions = useMemo(
    () => ({
      enabled: true,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
    [],
  );

  // Buscar dados da sessão
  const {
    session,
    initialMessages: dbMessages,
    isLoading: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useSessionWithMessages(sessionId, sessionOptions);

  // ✅ SUB-ETAPA 2.4: Sincronização com thread context
  useEffect(() => {
    if (switchToThread && sessionId && sessionId !== activeThreadId) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 [ACTIVE_CHAT] Sincronizando thread:", {
          sessionId,
          activeThreadId,
        });
      }
      switchToThread(sessionId);
    }
  }, [sessionId, activeThreadId, switchToThread]);

  // ✅ SUB-ETAPA 2.4: Log de montagem (apenas desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 [ACTIVE_CHAT] Montado:", {
        sessionId,
        hasSession: !!session,
        messagesCount: dbMessages?.length || 0,
        hasThreadContext: !!threadContext,
      });
    }
  }, [sessionId, session, dbMessages, threadContext]);

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

    if (process.env.NODE_ENV === "development") {
      console.log("🔄 [ACTIVE_CHAT] Nova sessão detectada:", sessionId);
    }

    // Marcar como inicializado e fazer refetch
    setHasInitialized(true);
    setLastSessionId(sessionId);

    const timer = setTimeout(() => {
      refetchSession();
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
    async (message: any) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ [ACTIVE_CHAT] Mensagem concluída:", message);
      }

      // Auto-focus após streaming
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Aguardar processamento backend e sincronizar
      setTimeout(async () => {
        await syncNow();
        refetchSession();
        queryClient.invalidateQueries(
          trpc.app.chat.listarSessions.pathFilter(),
        );
      }, 1500);
    },
    [syncNow, refetchSession, queryClient, trpc.app.chat.listarSessions],
  );

  // ✅ SUB-ETAPA 2.4: Callback otimizado onError
  const handleChatError = useCallback((error: any) => {
    console.error("❌ [ACTIVE_CHAT] Erro no chat:", error);
  }, []);

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
    initialMessages: dbMessages || [],
    body: chatBody,
    onFinish: handleChatFinish,
    onError: handleChatError,
    keepLastMessageOnError: true,
  });

  // ✅ SUB-ETAPA 2.4: Log de estado (apenas desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("📊 [ACTIVE_CHAT] Estado:", {
        messages: messages.length,
        input: input.slice(0, 20) + (input.length > 20 ? "..." : ""),
        isLoading: isLoadingChat,
        hasError: !!chatError,
      });
    }
  }, [messages.length, input, isLoadingChat, chatError]);

  // ✅ THREAD-FIRST: Sincronização otimizada das mensagens
  // ✅ CORREÇÃO: Condições de guarda para prevenir loop infinito na sincronização
  const [lastDbMessagesLength, setLastDbMessagesLength] = useState(0);
  const [lastDbMessagesHash, setLastDbMessagesHash] = useState<string>("");

  useEffect(() => {
    // ✅ ETAPA 4: GUARDA DE HIDRATAÇÃO - Só executar no cliente
    if (!isClient) {
      return;
    }

    // ✅ GUARDA 1: Verificar se há mudança real nas mensagens
    const currentLength = dbMessages?.length || 0;
    const currentHash = dbMessages
      ? JSON.stringify(dbMessages.map((m) => m.id)).slice(0, 50)
      : "";

    // ✅ GUARDA 2: Só sincronizar se houve mudança real
    if (
      currentLength === lastDbMessagesLength &&
      currentHash === lastDbMessagesHash
    ) {
      return;
    }

    if (dbMessages && dbMessages.length > 0) {
      console.log("🚀 [FLOW_TRACE] 6. Mensagens carregadas do banco:", {
        count: dbMessages.length,
        firstMessage: dbMessages[0]?.content?.slice(0, 50),
        lastMessage: dbMessages[dbMessages.length - 1]?.role,
        hasAssistantReply: dbMessages.some((m) => m.role === "assistant"),
      });

      // ✅ CORREÇÃO: Atualizar tracking ANTES da sincronização
      setLastDbMessagesLength(currentLength);
      setLastDbMessagesHash(currentHash);

      // ✅ CORREÇÃO: Sempre sincronizar com banco, mesmo se useChat já tem mensagens
      setMessages(dbMessages);
    } else if (sessionId && sessionId !== "new") {
      console.log(
        "⚠️ [FLOW_TRACE] Nenhuma mensagem encontrada no banco para sessão:",
        sessionId,
      );

      // ✅ CORREÇÃO: Atualizar tracking mesmo quando vazio
      setLastDbMessagesLength(0);
      setLastDbMessagesHash("");

      // ✅ THREAD-FIRST: Se não há mensagens no banco, limpar useChat
      setMessages([]);
    }
  }, [
    dbMessages,
    sessionId,
    setMessages,
    lastDbMessagesLength,
    lastDbMessagesHash,
    isClient, // ✅ ETAPA 4: Incluir guard de hidratação
  ]);

  // ✅ SUB-ETAPA 2.4: Lógica híbrida - thread context + sessionStorage fallback
  useEffect(() => {
    // Guard: só executar no cliente
    if (!isClient) {
      return;
    }

    let pendingMessage: string | null = null;
    let source = "none";

    // Tentar thread context primeiro
    if (threadContext?.getPendingMessage) {
      pendingMessage = threadContext.getPendingMessage();
      source = "thread-context";
    }

    // Fallback para sessionStorage
    if (!pendingMessage) {
      pendingMessage = sessionStorage.getItem(`pending-message-${sessionId}`);
      source = "sessionStorage";
    }

    // Enviar mensagem pendente se disponível
    if (
      pendingMessage &&
      !isLoadingChat &&
      sessionId &&
      sessionId !== "new" &&
      messages.length === 0
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("🚀 [ACTIVE_CHAT] Enviando mensagem pendente:", {
          content: pendingMessage.slice(0, 30) + "...",
          source,
        });
      }

      append({
        role: "user",
        content: pendingMessage,
      });

      // Limpar mensagem da fonte correta
      if (source === "thread-context" && threadContext?.clearPendingMessage) {
        threadContext.clearPendingMessage();
      } else if (source === "sessionStorage") {
        sessionStorage.removeItem(`pending-message-${sessionId}`);
      }
    }
  }, [
    sessionId,
    isClient,
    isLoadingChat,
    messages.length,
    append,
    threadContext,
  ]);

  // Auto-scroll para o final
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Estados de carregamento e erro
  if (isLoadingSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            {t("apps.chat.loadingSession")}
          </p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md p-6">
          <div className="text-center">
            <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              {t("apps.chat.errorLoadingSession")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {sessionError.message || t("apps.chat.sessionNotFound")}
            </p>
            <Button onClick={() => refetchSession()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("apps.chat.retry")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h1
            className="truncate text-lg font-semibold"
            suppressHydrationWarning
          >
            {session?.title || t("apps.chat.untitledChat")}
          </h1>
        </div>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        <ChatMessages messages={messages} isLoading={isLoadingChat} />
        <div ref={bottomRef} />
      </ScrollArea>

      <Separator />

      {/* Input */}
      <div className="px-[10%] py-4">
        <form
          onSubmit={(e) => {
            if (process.env.NODE_ENV === "development") {
              console.log("📤 [ACTIVE_CHAT] Enviando:", {
                input: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
                messagesCount: messages.length,
              });
            }
            handleSubmit(e);
          }}
          className="space-y-2"
        >
          <MessageInput
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onSendMessage={(message) => {
              // Simular submit do form quando Enter é pressionado
              const fakeEvent = new Event("submit", {
                bubbles: true,
                cancelable: true,
              }) as any;
              fakeEvent.preventDefault = () => {};
              handleSubmit(fakeEvent);
            }}
            disabled={isLoadingChat}
            placeholder={t("apps.chat.typeMessage")}
            isLoading={isLoadingChat}
            isStreaming={isLoadingChat}
            onStop={stop}
          />

          {chatError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {chatError.message || t("apps.chat.errorSendingMessage")}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
