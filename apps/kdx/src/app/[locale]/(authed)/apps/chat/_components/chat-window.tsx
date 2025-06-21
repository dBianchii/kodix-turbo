// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useRef } from "react";
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
import { useEmptySession } from "../_hooks/useEmptySession";
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
  const utils = useTRPC();

  // 🚨 FASE 1 - DIA 2: REMOVENDO AUTO-ENVIO - Flag comentada
  // const autoSentRef = useRef<Set<string>>(new Set());

  // ✅ NOVO: Detectar se é nova conversa
  const isNewConversation = !sessionId;

  // 🚀 FASE 3 - FINAL: Hook direto para criar sessão vazia
  const { createEmptySession, isCreating } = useEmptySession({
    onSuccess: (newSessionId) => {
      console.log(
        "✅ [EMPTY_SESSION] Sessão criada com sucesso:",
        newSessionId,
      );
      onNewSession?.(newSessionId);
    },
    onError: (error) => {
      console.error("❌ [EMPTY_SESSION] Erro ao criar sessão:", error);
    },
  });

  // 🤖 Hook para gerar título da sessão
  const generateTitleMutation = useMutation(
    utils.app.chat.generateSessionTitle.mutationOptions({
      onSuccess: (data) => {
        console.log("✅ [GENERATE_TITLE] Título gerado:", data.title);
        // Invalidar queries para atualizar a lista de sessões
        queryClient.invalidateQueries(
          utils.app.chat.listarSessions.pathFilter(),
        );
      },
      onError: (error) => {
        console.error("❌ [GENERATE_TITLE] Erro ao gerar título:", error);
      },
    }),
  );

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

  // 🚀 FASE 3 - FINAL: ENVIO PÓS-NAVEGAÇÃO (sempre ativo)
  useEffect(() => {
    // Verificar se há mensagem pendente
    const pendingMessage = sessionStorage.getItem(
      `pending-message-${sessionId}`,
    );

    if (sessionId && pendingMessage && messages.length === 0 && !isLoading) {
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

      // 🤖 Gerar título após enviar primeira mensagem
      if (session?.title?.startsWith("Chat ")) {
        console.log("🤖 [GENERATE_TITLE] Gerando título para nova sessão...");
        generateTitleMutation.mutate({
          sessionId: sessionId,
          firstMessage: pendingMessage,
        });
      }
    }
  }, [sessionId, messages.length, isLoading, append, session?.title]);

  // ✅ REMOVIDO: Auto-processamento não é mais necessário
  // O novo fluxo usa envio pós-navegação que é mais limpo e confiável

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

  // 🚀 FASE 3 - FINAL: Função simplificada para novo fluxo
  const handleNewMessage = async (message: string) => {
    if (isCreating) return;

    console.log("🚀 [EMPTY_SESSION] Iniciando criação de sessão vazia...");
    console.log("📝 [EMPTY_SESSION] Mensagem:", message.slice(0, 50) + "...");

    // Salvar mensagem para envio pós-navegação
    const tempSessionId = `temp-${Date.now()}`;
    sessionStorage.setItem(`pending-message-${tempSessionId}`, message);
    console.log("💾 [EMPTY_SESSION] Mensagem salva para envio pós-navegação");

    try {
      await createEmptySession({
        title: `Chat ${new Date().toLocaleDateString()}`,
        generateTitle: true, // Flag para indicar que queremos gerar título
        metadata: {
          firstMessage: message, // Salvar para referência
          createdAt: new Date().toISOString(),
          migrationFlow: "final",
        },
      });
    } catch (error) {
      console.error("❌ [EMPTY_SESSION] Erro ao criar nova sessão:", error);
      // Limpar mensagem pendente em caso de erro
      sessionStorage.removeItem(`pending-message-${tempSessionId}`);
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
