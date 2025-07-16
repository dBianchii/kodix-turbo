"use client";

import type { Message } from "@ai-sdk/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@kdx/api";

import { useTRPC } from "~/trpc/react";

// Tipos exportados para serem usados em outros hooks
export type TSession =
  RouterOutputs["app"]["chat"]["createEmptySession"]["session"];
export type TListSession =
  RouterOutputs["app"]["chat"]["findSessions"]["sessions"][number];
export type TMessages = RouterOutputs["app"]["chat"]["getMessages"]["messages"];

// ===== TIPOS THREAD-FIRST =====

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  metadata: ThreadMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreadMetadata {
  aiModelId?: string;
  teamId: string;
  userId: string;
  lastMessageAt?: Date;
  messageCount: number;
  isGeneratingTitle?: boolean;
  [key: string]: unknown;
}

export interface ThreadContextValue {
  // Thread State
  threads: Thread[];
  activeThreadId: string | undefined;
  activeThread: Thread | undefined;
  isLoadingThreads: boolean;

  // Thread Operations
  createThread: (options?: CreateThreadOptions) => Promise<Thread>;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  deleteThread: (threadId: string) => Promise<void>;
  switchToThread: (threadId: string) => void;

  // Message Operations
  appendMessage: (threadId: string, message: Message) => void;
  updateLastMessage: (threadId: string, content: string) => void;

  // Title Operations
  generateThreadTitle: (
    threadId: string,
    firstMessage: string,
  ) => Promise<void>;

  // Sync Operations
  syncThreadFromDB: (threadId: string) => Promise<void>;
  syncAllThreads: () => Promise<void>;

  // Utility
  getThreadById: (threadId: string) => Thread | undefined;
}

interface CreateThreadOptions {
  title?: string;
  generateTitle?: boolean;
  firstMessage?: string;
  metadata?: Partial<ThreadMetadata>;
}

// ===== CONTEXT =====

const ThreadContext = createContext<ThreadContextValue | null>(null);

export function useThreadContext(): ThreadContextValue {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error(
      "useThreadContext deve ser usado dentro de ChatThreadProvider",
    );
  }
  return context;
}

// ===== PROVIDER =====

interface ChatThreadProviderProps {
  children: React.ReactNode;
  initialThreadId?: string;
}

export function ChatThreadProvider({
  children,
  initialThreadId,
}: ChatThreadProviderProps) {
  // ===== STATE =====

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
    initialThreadId,
  );
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);

  // Hydration debugging removed - issue was in ThemeToggle component

  // ===== DEPENDENCIES =====

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ===== COMPUTED =====

  const activeThread = useMemo(() => {
    return threads.find((thread) => thread.id === activeThreadId);
  }, [threads, activeThreadId]);

  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions(),
  );
  const deleteSessionMutation = useMutation(
    trpc.app.chat.deleteSession.mutationOptions(),
  );
  const generateTitleMutation = useMutation(
    trpc.app.chat.generateSessionTitle.mutationOptions(),
  );

  // ===== THREAD OPERATIONS =====

  const createThread = useCallback(
    async (options?: CreateThreadOptions): Promise<Thread> => {

      try {
        const sessionData = await createEmptySessionMutation.mutateAsync({
          title: options?.title,
          generateTitle: options?.generateTitle ?? false,
          metadata: {
            ...options?.metadata,
            firstMessage: options?.firstMessage,
          },
        });

        const newThread: Thread = {
          id: sessionData.session.id,
          title: sessionData.session.title,
          messages: [],
          metadata: {
            aiModelId: sessionData.session.aiModelId ?? undefined,
            teamId: sessionData.session.teamId,
            userId: sessionData.session.userId,
            messageCount: 0,
            lastMessageAt: new Date(),
            isGeneratingTitle: options?.generateTitle,
            ...options?.metadata,
          },
          createdAt: new Date(sessionData.session.createdAt),
          updatedAt: new Date(),
        };

        setThreads((prev) => [...prev, newThread]);
        setActiveThreadId(newThread.id);

        void queryClient.invalidateQueries({
          queryKey: trpc.app.chat.findSessions.queryKey(),
        });

        return newThread;
      } catch (error) {
        console.error("❌ [THREAD_PROVIDER] Erro ao criar thread:", error);
        throw new Error("Failed to create thread");
      }
    },
    [
      createEmptySessionMutation,
      queryClient,
      trpc.app.chat.findSessions.queryKey,
    ],
  );

  const updateThread = useCallback(
    (threadId: string, updates: Partial<Thread>) => {

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                ...updates,
                updatedAt: new Date(),
                metadata: {
                  ...thread.metadata,
                  ...updates.metadata,
                },
              }
            : thread,
        ),
      );
    },
    [],
  );

  const deleteThread = useCallback(
    async (threadId: string) => {

      try {
        await deleteSessionMutation.mutateAsync({ sessionId: threadId });

        setThreads((prev) => prev.filter((thread) => thread.id !== threadId));

        if (activeThreadId === threadId) {
          setActiveThreadId(undefined);
        }

        void queryClient.invalidateQueries({
          queryKey: trpc.app.chat.findSessions.queryKey(),
        });

      } catch (error) {
        console.error("❌ [THREAD_PROVIDER] Erro ao deletar thread:", error);
        throw new Error("Failed to delete thread");
      }
    },
    [
      deleteSessionMutation,
      queryClient,
      activeThreadId,
      trpc.app.chat.findSessions.queryKey,
    ],
  );

  const switchToThread = useCallback((threadId: string) => {
    // Switching to thread - log removed for performance
    setActiveThreadId(threadId);
  }, []);

  // ===== MESSAGE OPERATIONS =====

  const appendMessage = useCallback(
    (threadId: string, message: Message) => {
      const existingThread = threads.find((t) => t.id === threadId);
      if (!existingThread) return;

      updateThread(threadId, {
        messages: [...existingThread.messages, message],
        metadata: {
          ...existingThread.metadata,
          messageCount: existingThread.metadata.messageCount + 1,
          lastMessageAt: new Date(),
        },
      });
    },
    [threads, updateThread],
  );

  const updateLastMessage = useCallback(
    (threadId: string, content: string) => {
      const thread = threads.find((t) => t.id === threadId);
      if (!thread || thread.messages.length === 0) return;

      const updatedMessages = [...thread.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage) {
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content,
        };

        updateThread(threadId, { messages: updatedMessages });
      }
    },
    [threads, updateThread],
  );

  // ===== TITLE OPERATIONS =====

  const generateThreadTitle = useCallback(
    async (threadId: string, firstMessage: string) => {
      const existingThread = threads.find((t) => t.id === threadId);
      if (!existingThread) return;

      try {
        updateThread(threadId, {
          metadata: { ...existingThread.metadata, isGeneratingTitle: true },
        });

        const result = await generateTitleMutation.mutateAsync({
          sessionId: threadId,
          firstMessage,
        });

        updateThread(threadId, {
          title: result.title,
          metadata: { ...existingThread.metadata, isGeneratingTitle: false },
        });

      } catch (error) {
        console.error("❌ [THREAD_PROVIDER] Erro ao gerar título:", error);
        const fallbackTitle =
          firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
        updateThread(threadId, {
          title: fallbackTitle,
          metadata: { ...existingThread.metadata, isGeneratingTitle: false },
        });
      }
    },
    [generateTitleMutation, updateThread, threads],
  );

  // ===== UTILITY (movido antes de SYNC OPERATIONS) =====

  const getThreadById = useCallback(
    (threadId: string): Thread | undefined => {
      return threads.find((thread) => thread.id === threadId);
    },
    [threads],
  );

  // ===== SYNC OPERATIONS =====

  const syncThreadFromDB = useCallback(
    async (threadId: string) => {

      try {
        // ✅ SOLUÇÃO: Criar funções auxiliares que não dependem do contexto React
        const findSessionQuery = async () => {
          const response = await fetch(
            `/api/trpc/app.chat.findSession?batch=1&input=${encodeURIComponent(
              JSON.stringify({
                0: { sessionId: threadId },
              }),
            )}`,
            {
              method: "GET",
              headers: {
                "content-type": "application/json",
              },
              credentials: "include",
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch session");
          }

          const data = await response.json();
          return data[0]?.result?.data;
        };

        const getMessagesQuery = async () => {
          const response = await fetch(
            `/api/trpc/app.chat.getMessages?batch=1&input=${encodeURIComponent(
              JSON.stringify({
                0: {
                  chatSessionId: threadId,
                  limit: 100,
                  page: 1,
                  order: "asc",
                },
              }),
            )}`,
            {
              method: "GET",
              headers: {
                "content-type": "application/json",
              },
              credentials: "include",
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }

          const data = await response.json();
          return data[0]?.result?.data;
        };

        // Executar queries
        const [sessionData, messagesData] = await Promise.all([
          findSessionQuery(),
          getMessagesQuery(),
        ]);

        const formattedMessages: Message[] = (
          (messagesData?.messages as TMessages) ?? []
        )
          .filter((msg) => msg.senderRole !== "system")
          .map((msg) => ({
            id: msg.id,
            role: msg.senderRole === "user" ? "user" : "assistant",
            content: msg.content,
            createdAt: new Date(msg.createdAt),
          }));

        const existingThread = getThreadById(threadId);

        updateThread(threadId, {
          title: sessionData?.title ?? existingThread?.title ?? "",
          messages: formattedMessages,
          metadata: {
            ...(existingThread?.metadata ?? {
              teamId: sessionData?.teamId ?? "",
              userId: sessionData?.userId ?? "",
              messageCount: 0,
            }),
            aiModelId:
              sessionData?.aiModelId ?? existingThread?.metadata.aiModelId,
            messageCount: formattedMessages.length,
            lastMessageAt:
              formattedMessages.length > 0
                ? formattedMessages[formattedMessages.length - 1]?.createdAt
                : undefined,
          },
          updatedAt: sessionData ? new Date(sessionData.updatedAt) : new Date(),
        });

      } catch (error) {
        console.error(
          "❌ [THREAD_PROVIDER] Erro ao sincronizar thread:",
          error,
        );
      }
    },
    [updateThread, getThreadById],
  );

  const syncAllThreads = useCallback(async () => {
    setIsLoadingThreads(true);

    try {
      // ✅ SOLUÇÃO: Usar fetch direto para evitar problemas de contexto
      const response = await fetch(
        `/api/trpc/app.chat.findSessions?batch=1&input=${encodeURIComponent(
          JSON.stringify({
            0: {},
          }),
        )}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      const sessionsData = data[0]?.result?.data;

      const syncedThreads: Thread[] = (
        (sessionsData?.sessions as TListSession[]) ?? []
      ).map((session) => ({
        id: session.id,
        title: session.title,
        messages: [],
        metadata: {
          aiModelId: session.aiModelId ?? undefined,
          teamId: session.teamId,
          userId: session.userId,
          messageCount: 0,
          lastMessageAt: session.updatedAt
            ? new Date(session.updatedAt)
            : undefined,
        },
        createdAt: new Date(session.createdAt),
        updatedAt: session.updatedAt ? new Date(session.updatedAt) : new Date(),
      }));

      setThreads(syncedThreads);
    } catch (error) {
      console.error("❌ [THREAD_PROVIDER] Erro ao sincronizar threads:", error);
    } finally {
      setIsLoadingThreads(false);
    }
  }, []);

  // ===== CONTEXT VALUE =====

  const contextValue: ThreadContextValue = useMemo(
    () => ({
      // Thread State
      threads,
      activeThreadId,
      activeThread,
      isLoadingThreads,

      // Thread Operations
      createThread,
      updateThread,
      deleteThread,
      switchToThread,

      // Message Operations
      appendMessage,
      updateLastMessage,

      // Title Operations
      generateThreadTitle,

      // Sync Operations
      syncThreadFromDB,
      syncAllThreads,

      // Utility
      getThreadById,
    }),
    [
      threads,
      activeThreadId,
      activeThread,
      isLoadingThreads,
      createThread,
      updateThread,
      deleteThread,
      switchToThread,
      appendMessage,
      updateLastMessage,
      generateThreadTitle,
      syncThreadFromDB,
      syncAllThreads,
      getThreadById,
    ],
  );

  return (
    <ThreadContext.Provider value={contextValue}>
      {children}
    </ThreadContext.Provider>
  );
}
