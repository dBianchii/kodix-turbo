// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useRef } from "react";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Card } from "@kdx/ui/card";

import { useThreadChat } from "../_hooks/useThreadChat";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";

// ===== TIPOS =====

interface ChatWindowThreadProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

// ===== COMPONENTE PRINCIPAL =====

export function ChatWindowThread({
  sessionId,
  onNewSession,
}: ChatWindowThreadProps) {
  const t = useTranslations();

  // Se não há sessionId, mostrar estado thread-first vazio
  if (!sessionId) {
    return <EmptyThreadState onNewSession={onNewSession} />;
  }

  // Se há sessionId, usar componente thread ativo
  return (
    <ActiveThreadWindow sessionId={sessionId} onNewSession={onNewSession} />
  );
}

// ===== ESTADO THREAD VAZIO =====

function EmptyThreadState({
  onNewSession,
}: {
  onNewSession?: (sessionId: string) => void;
}) {
  const t = useTranslations();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ✅ THREAD-FIRST: Hook para criar nova thread
  const { createNewThread, isLoadingThread } = useThreadChat({
    onTitleGenerated: (title) => {
      console.log("✅ [EMPTY_THREAD] Título gerado:", title);
    },
  });

  // ✅ THREAD-FIRST: Handler para primeira mensagem
  const handleFirstMessage = async (message: string) => {
    if (!message.trim()) return;

    console.log(
      "🚀 [EMPTY_THREAD] Criando thread com primeira mensagem:",
      message,
    );

    try {
      const newThread = await createNewThread(message.trim());

      // Notificar componente pai para navegação
      if (newThread && onNewSession) {
        onNewSession(newThread.id);
      }
    } catch (error) {
      console.error("❌ [EMPTY_THREAD] Erro ao criar thread:", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Área central vazia */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-auto w-full max-w-4xl px-4">
            {/* Welcome Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <MessageCircle className="text-muted-foreground h-16 w-16" />
              </div>
              <h1 className="mb-2 text-3xl font-bold">
                {t("apps.chat.welcome.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("apps.chat.welcome.subtitle")}
              </p>
            </div>

            {/* Welcome Suggestions */}
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              {[
                t("apps.chat.suggestions.help"),
                t("apps.chat.suggestions.creative"),
                t("apps.chat.suggestions.analysis"),
                t("apps.chat.suggestions.code"),
              ].map((suggestion, index) => (
                <Card
                  key={index}
                  className="hover:bg-muted cursor-pointer p-4 transition-colors"
                  onClick={() => handleFirstMessage(suggestion)}
                >
                  <p className="text-sm">{suggestion}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t px-[10%] py-4">
        <MessageInput
          ref={inputRef}
          onSendMessage={handleFirstMessage}
          disabled={isLoadingThread}
          placeholder={t("apps.chat.typeFirstMessage")}
          isLoading={isLoadingThread}
        />

        {/* Loading state */}
        {isLoadingThread && (
          <div className="mt-2 flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">
              {t("apps.chat.creatingThread")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== THREAD ATIVO =====

function ActiveThreadWindow({
  sessionId,
  onNewSession,
}: {
  sessionId: string;
  onNewSession?: (sessionId: string) => void;
}) {
  const t = useTranslations();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ✅ THREAD-FIRST: Hook principal
  const {
    thread,
    threadId,
    isLoadingThread,
    messages,
    input,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    append,
    reload,
    stop,
    setInput,
    createNewThread,
    syncFromDB,
  } = useThreadChat({
    onFinish: (message) => {
      // Auto-focus após streaming
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    onTitleGenerated: (title) => {
      console.log("✅ [ACTIVE_THREAD] Título atualizado:", title);
    },
  });

  // Loading state inicial
  if (isLoadingThread) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">
              {t("apps.chat.messages.loading")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="text-destructive h-8 w-8" />
            <Alert variant="destructive">
              <AlertDescription>
                {error.message || t("apps.chat.messages.error")}
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  // Thread não encontrada
  if (!thread && !isLoadingThread) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <MessageCircle className="text-muted-foreground h-8 w-8" />
            <p className="text-muted-foreground">
              {t("apps.chat.threadNotFound")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Thread Header */}
      <div className="border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="truncate font-semibold">
              {thread?.title || `Thread ${sessionId.slice(0, 8)}`}
            </h2>
            <p className="text-muted-foreground text-xs">
              {messages.length} mensagens
            </p>
          </div>

          {thread?.metadata.isGeneratingTitle && (
            <div className="text-muted-foreground flex items-center text-xs">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Gerando título...
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="min-h-0 flex-1">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onReload={reload}
          onStop={stop}
        />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-4xl">
          <MessageInput
            ref={inputRef}
            value={input}
            onInputChange={handleInputChange}
            onSendMessage={(message) => {
              append({
                role: "user",
                content: message,
              });
            }}
            onSubmit={handleSubmit}
            disabled={isLoading}
            placeholder={t("apps.chat.typeMessage")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
