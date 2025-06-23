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
// ✅ SUB-ETAPA 2.2 REVISADA: Importar thread context (opcional)
import { useThreadContext } from "../_providers/chat-thread-provider";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";

interface ChatWindowProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

export function ChatWindow({ sessionId, onNewSession }: ChatWindowProps) {
  // ✅ ETAPA 4.2: Hook para prevenir problemas de hidratação
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log(
    "🔍 [DEBUG_CHATWINDOW] ChatWindow renderizado com sessionId:",
    sessionId,
    "isClient:",
    isClient,
  );

  // ✅ ETAPA 4.2: Aguardar hidratação no cliente antes de renderizar
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

  // ✅ THREAD-FIRST: Se não há sessionId, mostrar tela inicial zerada
  if (!sessionId) {
    console.log("✅ [DEBUG_CHATWINDOW] Renderizando EmptyThreadState");
    return <EmptyThreadState onNewSession={onNewSession} />;
  }

  // ✅ THREAD-FIRST: Se há sessionId, usar o componente normal
  console.log("✅ [DEBUG_CHATWINDOW] Renderizando ActiveChatWindow");
  return <ActiveChatWindow sessionId={sessionId} onNewSession={onNewSession} />;
}

/**
 * ✅ THREAD-FIRST: Tela inicial zerada (sem sessão criada)
 * Inspirado no padrão Assistant-UI
 */
function EmptyThreadState({
  onNewSession,
}: {
  onNewSession?: (sessionId: string) => void;
}) {
  console.log("🔍 [DEBUG_EMPTY] EmptyThreadState renderizado");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ✅ SOLUÇÃO ROBUSTA: Usar createEmptySession e passar mensagem via sessionStorage
  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (data: any) => {
        // ✅ CORREÇÃO 1.1: Acessar data.session.id em vez de data.id
        const sessionId = data.session.id;
        console.log("🚀 [FLOW_TRACE_V3] 2. Sessão vazia criada com sucesso:", {
          sessionId,
          title: data.session.title,
        });

        // ✅ CORREÇÃO 1.3: Transferir mensagem pendente para chave específica da sessão
        const pendingMessage = sessionStorage.getItem("pending-message-temp");
        if (pendingMessage && sessionId) {
          sessionStorage.setItem(
            `pending-message-${sessionId}`,
            pendingMessage,
          );
          sessionStorage.removeItem("pending-message-temp");
          console.log(
            "🔄 [FLOW_TRACE_V3] 3. Mensagem transferida para sessão:",
            {
              sessionId,
              messagePreview: pendingMessage.slice(0, 30) + "...",
            },
          );
        }

        // Notificar componente pai para navegar
        if (sessionId) {
          onNewSession?.(sessionId);
        }
      },
      onError: (error) => {
        console.error(
          "❌ [DEBUG] Erro na mutation de criar sessão vazia:",
          error,
        );
      },
    }),
  );

  // ✅ OTIMIZAÇÃO: Memoizar função para enviar primeira mensagem
  const handleFirstMessage = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;

      if (createEmptySessionMutation.isPending) return;

      console.log(
        "🚀 [FLOW_TRACE_V3] 1. Salvando mensagem pendente e criando sessão...",
        { message: trimmedMessage.slice(0, 50) + "..." },
      );

      // ✅ CORREÇÃO 1.3: Usar chave temporária antes de ter sessionId
      sessionStorage.setItem("pending-message-temp", trimmedMessage);

      // ✅ CORREÇÃO 1.2: Passar firstMessage no metadata para geração de título
      createEmptySessionMutation.mutate({
        generateTitle: true,
        metadata: {
          firstMessage: trimmedMessage,
          createdAt: new Date().toISOString(),
        },
      });
    },
    [createEmptySessionMutation],
  );

  // ✅ OTIMIZAÇÃO: Memoizar sugestões para evitar re-criação
  const suggestions = useMemo(
    () => [
      "Como você pode me ajudar?",
      "Explique um conceito",
      "Resuma um texto",
    ],
    [],
  );

  // ✅ RESTAURADO v0916e276: Auto-focus inicial
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
 * ✅ THREAD-FIRST: Chat ativo com sessão existente
 */
function ActiveChatWindow({
  sessionId,
  onNewSession,
}: {
  sessionId: string;
  onNewSession?: (sessionId: string) => void;
}) {
  // ✅ ETAPA 4: Hook para prevenir problemas de hidratação
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const t = useTranslations();
  const trpc = useTRPC();

  // ✅ SUB-ETAPA 2.2 REVISADA: Thread context opcional (não quebra hidratação)
  const threadContext = useThreadContext();
  const { switchToThread, activeThreadId } = threadContext || {};

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

  // Buscar dados da sessão
  const {
    session,
    initialMessages: dbMessages,
    isLoading: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useSessionWithMessages(sessionId, sessionOptions);

  // ✅ SUB-ETAPA 2.2 REVISADA: Sincronização opcional com thread context
  useEffect(() => {
    if (switchToThread && sessionId && sessionId !== activeThreadId) {
      console.log("🔄 [SUB_ETAPA_2.2_REV] Sincronizando thread opcional:", {
        sessionId,
        activeThreadId,
      });
      switchToThread(sessionId);
    }
  }, [sessionId, activeThreadId, switchToThread]);

  // ✅ DEBUG: Log quando ActiveChatWindow monta
  useEffect(() => {
    console.log("🚀 [FLOW_TRACE] 4. ActiveChatWindow montado:", {
      sessionId,
      activeThreadId,
      isLoadingSession,
      hasSession: !!session,
      dbMessagesLength: dbMessages?.length || 0,
      hasThreadContext: !!threadContext,
    });
  }, [
    sessionId,
    activeThreadId,
    isLoadingSession,
    session,
    dbMessages,
    threadContext,
  ]);

  // ✅ THREAD-FIRST: Refetch quando sessionId mudar para nova sessão
  // ✅ CORREÇÃO: Condições de guarda rigorosas para prevenir loop infinito
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  useEffect(() => {
    // ✅ GUARDA 1: Só executar se sessionId for válido e diferente
    if (!sessionId || sessionId === "new") {
      setHasInitialized(false);
      setLastSessionId(null);
      return;
    }

    // ✅ GUARDA 2: Só executar se sessionId realmente mudou
    if (sessionId === lastSessionId) {
      return;
    }

    // ✅ GUARDA 3: Prevenir múltiplas execuções simultâneas
    if (hasInitialized && sessionId === lastSessionId) {
      return;
    }

    console.log(
      "🚀 [FLOW_TRACE] 5. Detectada nova sessão, fazendo refetch:",
      sessionId,
    );

    // ✅ CORREÇÃO: Marcar como inicializado ANTES do refetch
    setHasInitialized(true);
    setLastSessionId(sessionId);

    // ✅ CORREÇÃO: Usar timeout para evitar execução síncrona
    const timer = setTimeout(() => {
      refetchSession();
    }, 100); // Timeout menor para melhor UX

    return () => {
      clearTimeout(timer);
    };
  }, [sessionId, refetchSession, hasInitialized, lastSessionId]);

  // Hook de sincronização de título (simplificado)
  const { syncNow } = useTitleSync({
    sessionId,
    enabled: true,
  });

  // ✅ OTIMIZAÇÃO: Memoizar body do useChat para evitar re-criação
  const chatBody = useMemo(
    () => ({
      chatSessionId: sessionId,
      selectedModelId,
      useAgent: true,
    }),
    [sessionId, selectedModelId],
  );

  // ✅ OTIMIZAÇÃO: Memoizar função onFinish para evitar re-criação
  const handleChatFinish = useCallback(
    async (message: any) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ [CHAT_WINDOW] Mensagem concluída:", message);
      }

      // ✅ RESTAURADO v0916e276: Auto-focus após streaming
      setTimeout(() => {
        inputRef.current?.focus();
        if (process.env.NODE_ENV === "development") {
          console.log("🎯 [CHAT_WINDOW] Auto-focus aplicado após streaming");
        }
      }, 100);

      // ✅ CORREÇÃO: Aguardar backend processar antes de refetch
      setTimeout(async () => {
        if (process.env.NODE_ENV === "development") {
          console.log("🔄 [CHAT_WINDOW] Fazendo refetch após processamento");
        }

        // Sincronizar título após nova mensagem
        await syncNow();

        // Atualizar dados da sessão
        refetchSession();

        // Invalidar queries do sidebar
        queryClient.invalidateQueries(
          trpc.app.chat.listarSessions.pathFilter(),
        );
      }, 1500); // Tempo maior para garantir processamento
    },
    [syncNow, refetchSession, queryClient, trpc.app.chat.listarSessions],
  );

  // ✅ OTIMIZAÇÃO: Memoizar função onError para evitar re-criação
  const handleChatError = useCallback((error: any) => {
    console.error("❌ [CHAT_WINDOW] Erro no chat:", error);
  }, []);

  // ✅ THREAD-FIRST: Chat hook do Vercel AI com endpoint correto
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
    api: "/api/chat/stream", // ✅ CORREÇÃO: Usar endpoint que aceita formato padrão
    initialMessages: dbMessages || [],
    body: chatBody,
    onFinish: handleChatFinish,
    onError: handleChatError,
    // ✅ THREAD-FIRST: Configurações para melhor sincronização
    keepLastMessageOnError: true,
  });

  // ✅ DEBUG: Log do useChat para investigar problema
  useEffect(() => {
    console.log("🔍 [DEBUG_USECHAT] Estado do useChat:", {
      messagesLength: messages.length,
      inputValue: input,
      isLoading: isLoadingChat,
      hasError: !!chatError,
      sessionId,
      dbMessagesLength: dbMessages?.length || 0,
      hasInitialMessages: !!(dbMessages && dbMessages.length > 0),
    });
  }, [messages, input, isLoadingChat, chatError, sessionId, dbMessages]);

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

  // ✅ SOLUÇÃO ROBUSTA: Ler mensagem pendente do sessionStorage específico da sessão
  useEffect(() => {
    // ✅ ETAPA 4: GUARDA DE HIDRATAÇÃO - Só executar no cliente
    if (!isClient) {
      return;
    }

    // ✅ CORREÇÃO 1.3: Usar chave específica da sessão
    const pendingMessage = sessionStorage.getItem(
      `pending-message-${sessionId}`,
    );

    // Condições para enviar:
    // 1. Há uma mensagem pendente.
    // 2. O chat não está carregando/enviando.
    // 3. A sessão atual está carregada e não é 'new'.
    // 4. NÃO há mensagens na UI do useChat (garante que só executa uma vez).
    if (
      pendingMessage &&
      !isLoadingChat &&
      sessionId &&
      sessionId !== "new" &&
      messages.length === 0
    ) {
      console.log(
        "🚀 [FLOW_TRACE_V3] 4. Mensagem pendente encontrada, enviando via append()...",
        {
          content: pendingMessage.slice(0, 30) + "...",
          sessionId,
        },
      );

      append({
        role: "user",
        content: pendingMessage,
      });

      // ✅ CORREÇÃO 1.3: Limpar chave específica da sessão
      sessionStorage.removeItem(`pending-message-${sessionId}`);
    }
  }, [sessionId, isClient, isLoadingChat, messages.length, append]);

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
            console.log(
              "🚀 [FLOW_TRACE] 7. Form submit manual - input:",
              input,
              "messages:",
              messages.length,
            );
            handleSubmit(e);
          }}
          className="space-y-2"
        >
          <MessageInput
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onSendMessage={(message) => {
              console.log(
                "🚀 [DEBUG_SUBMIT] onSendMessage chamado com:",
                message,
              );
              // ✅ CORREÇÃO: Simular submit do form quando Enter é pressionado
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
