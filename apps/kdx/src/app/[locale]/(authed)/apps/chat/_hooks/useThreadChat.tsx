"use client";

import type { Message } from "@ai-sdk/react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";

import type {
  Thread,
  ThreadContextValue,
} from "../_providers/chat-thread-provider";
import { useTRPC } from "~/trpc/react";
import { useThreadContext } from "../_providers/chat-thread-provider";

// ===== TIPOS =====

interface UseThreadChatOptions {
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
  onTitleGenerated?: (title: string) => void;
}

interface UseThreadChatReturn {
  // Thread State
  thread: Thread | undefined;
  threadId: string | undefined;
  isLoadingThread: boolean;

  // Chat State (from useChat)
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: Error | undefined;

  // Chat Actions
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  append: (message: Message) => Promise<string | null | undefined>;
  reload: () => void;
  stop: () => void;
  setInput: (input: string) => void;
  setMessages: (messages: Message[]) => void;

  // Thread Actions
  createNewThread: (firstMessage?: string) => Promise<Thread | undefined>;
  switchThread: (threadId: string) => void;
  generateTitle: (firstMessage: string) => Promise<void>;
  syncFromDB: () => Promise<void>;
}

// ===== HOOK =====

export function useThreadChat(
  options?: UseThreadChatOptions,
): UseThreadChatReturn {
  const { activeThread } = useThreadContext();

  // ===== CONTEXT =====

  const {
    activeThreadId,
    isLoadingThreads,
    createThread,
    updateThread,
    switchToThread,
    generateThreadTitle,
    syncThreadFromDB,
  } = useThreadContext();

  // ===== DEPENDENCIES =====

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ===== REFS =====

  const previousThreadIdRef = useRef<string | undefined>(undefined);
  const hasSyncedRef = useRef(false);

  // ===== CHAT BODY =====

  const chatBody = useMemo(
    () => ({
      chatSessionId: activeThreadId,
      useAgent: true,
      // Incluir metadata da thread para contexto
      threadMetadata: activeThread?.metadata,
    }),
    [activeThreadId, activeThread?.metadata],
  );

  // ===== CHAT CALLBACKS =====

  const handleChatFinish = useCallback(
    async (message: Message) => {
      if (!activeThreadId || !activeThread) return;

      try {
        // 1. Atualizar thread local com nova mensagem
        updateThread(activeThreadId, {
          messages: [...activeThread.messages, message],
          metadata: {
            ...activeThread.metadata,
            messageCount: (activeThread.metadata.messageCount ?? 0) + 1,
            lastMessageAt: new Date(),
          },
        });

        // 2. Gerar título se for primeira mensagem do usuário e título ainda for padrão
        const userMessages = activeThread.messages.filter(
          (msg) => msg.role === "user",
        );

        if (userMessages.length === 0) {
          // Only the first user message triggers title generation
          const firstUserMessage =
            message.role === "user"
              ? message
              : activeThread.messages.find((msg) => msg.role === "user");
          
          if (firstUserMessage) {
            await generateThreadTitle(activeThreadId, firstUserMessage.content);
            options?.onTitleGenerated?.(activeThread.title ?? "");
          }
        }

        // 3. Sincronizar com backend após pequeno delay
        setTimeout(() => {
          void (async () => {
            try {
              await syncThreadFromDB(activeThreadId);
              void queryClient.invalidateQueries({
                queryKey: trpc.app.chat.findSessions.queryKey(),
              });
            } catch (error) {
              console.error("Erro na sincronização:", error);
            }
          })();
        }, 1000);

        // 4. Callback personalizado
        options?.onFinish?.(message);
      } catch (error) {
        console.error("Erro no onFinish:", error);
      }
    },
    [
      activeThreadId,
      activeThread,
      updateThread,
      generateThreadTitle,
      syncThreadFromDB,
      queryClient,
      options,
      trpc.app.chat.findSessions,
    ],
  );

  const handleChatError = useCallback(
    (error: Error) => {
      console.error("Erro no chat:", error);
      options?.onError?.(error);
    },
    [options],
  );

  // ===== USE CHAT =====

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    append,
    reload,
    stop,
    setInput,
    setMessages,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat/stream",
    id: activeThreadId, // Thread ID como chat ID
    initialMessages: activeThread?.messages ?? [],
    body: chatBody,
    onFinish: handleChatFinish,
    onError: handleChatError,
    // Configurações para melhor sincronização
    keepLastMessageOnError: true,
  });

  // ===== SYNC LOGIC =====

  // Sincronizar thread quando mudar
  useEffect(() => {
    const currentThreadId = activeThreadId;
    const previousThreadId = previousThreadIdRef.current;

    // Reset sync flag quando thread mudar
    if (currentThreadId !== previousThreadId) {
      hasSyncedRef.current = false;
      previousThreadIdRef.current = currentThreadId;
    }

    // Sincronizar mensagens da thread local com useChat
    if (
      currentThreadId &&
      activeThread &&
      !hasSyncedRef.current &&
      !isLoading
    ) {
      const threadMessages = activeThread.messages ?? [];
      const chatMessages = messages || [];

      // Só sincronizar se as mensagens forem diferentes
      if (JSON.stringify(threadMessages) !== JSON.stringify(chatMessages)) {
        setMessages(threadMessages);
        hasSyncedRef.current = true;
      }
    }
  }, [activeThreadId, activeThread, messages, setMessages, isLoading]);

  // ===== THREAD ACTIONS =====

  const createNewThread = useCallback(
    async (firstMessage?: string) => {
      try {
        const newThread = await createThread({
          generateTitle: !!firstMessage,
          firstMessage,
        });

        // Se há primeira mensagem, armazenar no sessionStorage para envio pós-navegação
        if (firstMessage) {
          sessionStorage.setItem(
            `pending-message-${newThread.id}`,
            firstMessage,
          );
        }

        return newThread;
      } catch (error) {
        console.error("Erro ao criar thread:", error);
        throw error;
      }
    },
    [createThread],
  );

  const syncFromDB = useCallback(async () => {
    if (activeThreadId) {
      await syncThreadFromDB(activeThreadId);
    }
  }, [activeThreadId, syncThreadFromDB]);

  // Sobrescrever handleSubmit para criar nova thread se não houver nenhuma ativa
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!activeThreadId) {
        void (async () => {
          const newThread = await createNewThread(input);
          if (newThread) {
            // A mensagem já está no sessionStorage, useChat irá pegá-la
            setInput("");
          }
        })();
      } else {
        originalHandleSubmit(e);
      }
    },
    [activeThreadId, input, createNewThread, originalHandleSubmit, setInput],
  );

  // ===== ENVIO PÓS-NAVEGAÇÃO =====

  // Detectar mensagem pendente e enviar
  useEffect(() => {
    if (!activeThreadId) return;

    const pendingMessage = sessionStorage.getItem(
      `pending-message-${activeThreadId}`,
    );

    if (
      pendingMessage &&
      messages.length === 0 &&
      !isLoading &&
      !hasSyncedRef.current
    ) {
      sessionStorage.removeItem(`pending-message-${activeThreadId}`);
      append({ role: "user", content: pendingMessage });
    }
  }, [activeThreadId, messages.length, isLoading, append]);

  // ===== RETURN =====

  return {
    thread: activeThread,
    threadId: activeThreadId,
    isLoadingThread: isLoadingThreads,
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
    setMessages,
    createNewThread: createNewThread,
    switchThread: switchToThread,
    generateTitle: (message: string) => {
      if (activeThreadId) {
        return generateThreadTitle(activeThreadId, message);
      }
      return Promise.resolve();
    },
    syncFromDB,
  };
}
