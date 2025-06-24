// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import type { Message } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  append: (message: Message) => void;
  reload: () => void;
  stop: () => void;
  setInput: (input: string) => void;
  setMessages: (messages: Message[]) => void;

  // Thread Actions
  createNewThread: (firstMessage?: string) => Promise<void>;
  switchThread: (threadId: string) => void;
  generateTitle: (firstMessage: string) => Promise<void>;
  syncFromDB: () => Promise<void>;
}

// ===== HOOK =====

export function useThreadChat(
  options?: UseThreadChatOptions,
): UseThreadChatReturn {
  // ===== CONTEXT =====

  const {
    activeThread,
    activeThreadId,
    isLoadingThreads,
    createThread,
    updateThread,
    switchToThread,
    generateThreadTitle,
    syncThreadFromDB,
    getThreadById,
  } = useThreadContext();

  // ===== DEPENDENCIES =====

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ===== REFS =====

  const previousThreadIdRef = useRef<string | undefined>();
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
      if (!activeThreadId) return;

      try {
        // 1. Atualizar thread local com nova mensagem
        updateThread(activeThreadId, {
          messages: [...(activeThread?.messages || []), message],
          metadata: {
            messageCount: (activeThread?.metadata.messageCount || 0) + 1,
            lastMessageAt: new Date(),
          },
        });

        // 2. Gerar título se for primeira mensagem do usuário
        const threadMessages = activeThread?.messages || [];
        const userMessages = threadMessages.filter(
          (msg) => msg.role === "user",
        );

        if (userMessages.length === 1) {
          const firstUserMessage = userMessages[0];
          if (firstUserMessage) {
            await generateThreadTitle(activeThreadId, firstUserMessage.content);
            options?.onTitleGenerated?.(activeThread?.title || "");
          }
        }

        // 3. Sincronizar com backend após pequeno delay
        setTimeout(async () => {
          try {
            await syncThreadFromDB(activeThreadId);

            // Invalidar queries relacionadas
            queryClient.invalidateQueries({
              queryKey: ["app", "chat", "listarSessions"],
            });
          } catch (error) {
            console.error("❌ [THREAD_CHAT] Erro na sincronização:", error);
          }
        }, 1000);

        // 4. Callback personalizado
        options?.onFinish?.(message);
      } catch (error) {
        console.error("❌ [THREAD_CHAT] Erro no onFinish:", error);
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
    ],
  );

  const handleChatError = useCallback(
    (error: Error) => {
      console.error("❌ [THREAD_CHAT] Erro no chat:", error);
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
    initialMessages: activeThread?.messages || [],
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
      const threadMessages = activeThread.messages || [];
      const chatMessages = messages || [];

      // Só sincronizar se as mensagens forem diferentes
      if (threadMessages.length !== chatMessages.length) {
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
          generateTitle: true,
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
        console.error("❌ [THREAD_CHAT] Erro ao criar thread:", error);
        throw error;
      }
    },
    [createThread],
  );

  const switchThread = useCallback(
    (threadId: string) => {
      // Reset sync state
      hasSyncedRef.current = false;

      // Switch via context
      switchToThread(threadId);
    },
    [switchToThread],
  );

  const generateTitle = useCallback(
    async (firstMessage: string) => {
      if (!activeThreadId) return;

      await generateThreadTitle(activeThreadId, firstMessage);
    },
    [activeThreadId, generateThreadTitle],
  );

  const syncFromDB = useCallback(async () => {
    if (!activeThreadId) return;

    await syncThreadFromDB(activeThreadId);
    hasSyncedRef.current = false; // Forçar re-sync
  }, [activeThreadId, syncThreadFromDB]);

  // ===== ENHANCED SUBMIT =====

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Se não há thread ativa, criar uma nova
      if (!activeThreadId) {
        createNewThread(input.trim()).then(() => {
          // Mensagem será enviada automaticamente via sessionStorage
        });
        return;
      }

      // Submit normal
      originalHandleSubmit(e);
    },
    [activeThreadId, input, createNewThread, originalHandleSubmit],
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
      // Enviar mensagem pendente
      append({
        role: "user",
        content: pendingMessage,
      });

      // Limpar storage
      sessionStorage.removeItem(`pending-message-${activeThreadId}`);
    }
  }, [activeThreadId, messages.length, isLoading, append]);

  // ===== RETURN =====

  return {
    // Thread State
    thread: activeThread,
    threadId: activeThreadId,
    isLoadingThread: isLoadingThreads,

    // Chat State
    messages,
    input,
    isLoading,
    error,

    // Chat Actions
    handleInputChange,
    handleSubmit,
    append,
    reload,
    stop,
    setInput,
    setMessages,

    // Thread Actions
    createNewThread,
    switchThread,
    generateTitle,
    syncFromDB,
  };
}
