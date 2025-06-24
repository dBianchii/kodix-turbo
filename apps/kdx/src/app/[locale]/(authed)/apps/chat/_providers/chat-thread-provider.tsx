// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import type { Message } from "@ai-sdk/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

// ===== TIPOS THREAD-FIRST =====

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  metadata: ThreadMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface ThreadMetadata {
  aiModelId?: string;
  teamId: string;
  userId: string;
  lastMessageAt?: Date;
  messageCount: number;
  isGeneratingTitle?: boolean;
  [key: string]: unknown;
}

interface ThreadContextValue {
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

  // ===== DEPENDENCIES =====

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ===== COMPUTED =====

  const activeThread = useMemo(() => {
    return threads.find((thread) => thread.id === activeThreadId);
  }, [threads, activeThreadId]);

  // ===== THREAD OPERATIONS =====

  const createThread = useCallback(
    async (options?: CreateThreadOptions): Promise<Thread> => {
      console.log("🚀 [THREAD_PROVIDER] Criando nova thread:", options);

      try {
        // 1. Criar sessão vazia no backend
        const result = await queryClient.fetchMutation(
          trpc.app.chat.createEmptySession.mutationOptions({
            onError: (error) => {
              console.error(
                "❌ [THREAD_PROVIDER] Erro ao criar sessão:",
                error,
              );
              throw error;
            },
          }),
        );

        const sessionData = await result({
          title: options?.title || `Chat ${new Date().toLocaleDateString()}`,
          generateTitle: options?.generateTitle ?? false,
          metadata: {
            ...options?.metadata,
            firstMessage: options?.firstMessage,
            createdAt: new Date().toISOString(),
          },
        });

        // 2. Criar thread local
        const newThread: Thread = {
          id: sessionData.session.id,
          title:
            sessionData.session.title ||
            options?.title ||
            `Chat ${new Date().toLocaleDateString()}`,
          messages: [], // Thread vazia inicialmente
          metadata: {
            aiModelId: sessionData.session.aiModelId,
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

        // 3. Adicionar à lista local
        setThreads((prev) => [...prev, newThread]);

        // 4. Definir como ativa
        setActiveThreadId(newThread.id);

        // 5. Invalidar queries para sincronização
        queryClient.invalidateQueries({
          queryKey: ["app", "chat", "listarSessions"],
        });

        console.log("✅ [THREAD_PROVIDER] Thread criada:", newThread.id);
        return newThread;
      } catch (error) {
        console.error("❌ [THREAD_PROVIDER] Erro ao criar thread:", error);
        throw error;
      }
    },
    [queryClient, trpc],
  );

  const updateThread = useCallback(
    (threadId: string, updates: Partial<Thread>) => {
      console.log(
        "🔄 [THREAD_PROVIDER] Atualizando thread:",
        threadId,
        updates,
      );

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
      console.log("🗑️ [THREAD_PROVIDER] Deletando thread:", threadId);

      try {
        // 1. Deletar no backend
        await queryClient.fetchMutation(
          trpc.app.chat.deletarSession.mutationOptions(),
        )({ sessionId: threadId });

        // 2. Remover da lista local
        setThreads((prev) => prev.filter((thread) => thread.id !== threadId));

        // 3. Se era a ativa, limpar
        if (activeThreadId === threadId) {
          setActiveThreadId(undefined);
        }

        // 4. Invalidar queries
        queryClient.invalidateQueries({
          queryKey: ["app", "chat", "listarSessions"],
        });

        console.log("✅ [THREAD_PROVIDER] Thread deletada:", threadId);
      } catch (error) {
        console.error("❌ [THREAD_PROVIDER] Erro ao deletar thread:", error);
        throw error;
      }
    },
    [queryClient, trpc, activeThreadId],
  );

  const switchToThread = useCallback((threadId: string) => {
    // Switching to thread - log removed for performance
    setActiveThreadId(threadId);
  }, []);

  // ===== MESSAGE OPERATIONS =====

  const appendMessage = useCallback(
    (threadId: string, message: Message) => {
      console.log(
        "📝 [THREAD_PROVIDER] Adicionando mensagem à thread:",
        threadId,
      );

      updateThread(threadId, {
        messages: [...(getThreadById(threadId)?.messages || []), message],
        metadata: {
          messageCount:
            (getThreadById(threadId)?.metadata.messageCount || 0) + 1,
          lastMessageAt: new Date(),
        },
      });
    },
    [updateThread],
  );

  const updateLastMessage = useCallback(
    (threadId: string, content: string) => {
      const thread = getThreadById(threadId);
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
    [updateThread],
  );

  // ===== TITLE OPERATIONS =====

  const generateThreadTitle = useCallback(
    async (threadId: string, firstMessage: string) => {
      console.log("🤖 [THREAD_PROVIDER] Gerando título para thread:", threadId);

      try {
        // 1. Marcar como gerando título
        updateThread(threadId, {
          metadata: { isGeneratingTitle: true },
        });

        // 2. Chamar endpoint de geração
        const result = await queryClient.fetchMutation(
          trpc.app.chat.generateSessionTitle.mutationOptions(),
        )({
          sessionId: threadId,
          firstMessage,
        });

        // 3. Atualizar título na thread
        updateThread(threadId, {
          title: result.title,
          metadata: { isGeneratingTitle: false },
        });

        console.log("✅ [THREAD_PROVIDER] Título gerado:", result.title);
      } catch (error) {
        console.error("❌ [THREAD_PROVIDER] Erro ao gerar título:", error);

        // Fallback: usar primeiros caracteres da mensagem
        const fallbackTitle =
          firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
        updateThread(threadId, {
          title: fallbackTitle,
          metadata: { isGeneratingTitle: false },
        });
      }
    },
    [queryClient, trpc, updateThread],
  );

  // ===== SYNC OPERATIONS =====

  const syncThreadFromDB = useCallback(
    async (threadId: string) => {
      console.log("🔄 [THREAD_PROVIDER] Sincronizando thread do DB:", threadId);

      try {
        // Buscar dados atualizados do backend
        const sessionData = await queryClient.fetchQuery({
          queryKey: ["app", "chat", "buscarSession", { sessionId: threadId }],
          queryFn: () =>
            trpc.app.chat.buscarSession.query({ sessionId: threadId }),
        });

        const messagesData = await queryClient.fetchQuery({
          queryKey: [
            "app",
            "chat",
            "buscarMensagensTest",
            { chatSessionId: threadId },
          ],
          queryFn: () =>
            trpc.app.chat.buscarMensagensTest.query({
              chatSessionId: threadId,
            }),
        });

        // Converter mensagens para formato useChat
        const formattedMessages: Message[] = (messagesData?.messages || [])
          .filter((msg: any) => msg.senderRole !== "system")
          .map((msg: any) => ({
            id: msg.id,
            role: msg.senderRole === "user" ? "user" : "assistant",
            content: msg.content,
          }));

        // Atualizar thread local
        updateThread(threadId, {
          title:
            sessionData?.title || `Chat ${new Date().toLocaleDateString()}`,
          messages: formattedMessages,
          metadata: {
            messageCount: formattedMessages.length,
            lastMessageAt:
              formattedMessages.length > 0 ? new Date() : undefined,
          },
        });

        console.log("✅ [THREAD_PROVIDER] Thread sincronizada:", threadId);
      } catch (error) {
        console.error(
          "❌ [THREAD_PROVIDER] Erro ao sincronizar thread:",
          error,
        );
      }
    },
    [queryClient, trpc, updateThread],
  );

  const syncAllThreads = useCallback(async () => {
    console.log("🔄 [THREAD_PROVIDER] Sincronizando todas as threads");
    setIsLoadingThreads(true);

    try {
      // Buscar lista de sessões
      const sessionsData = await queryClient.fetchQuery({
        queryKey: ["app", "chat", "listarSessions"],
        queryFn: () => trpc.app.chat.listarSessions.query(),
      });

      // Converter para threads
      const syncedThreads: Thread[] = (sessionsData?.sessions || []).map(
        (session: any) => ({
          id: session.id,
          title: session.title,
          messages: [], // Mensagens carregadas sob demanda
          metadata: {
            aiModelId: session.aiModelId,
            teamId: session.teamId,
            userId: session.userId,
            messageCount: 0,
            lastMessageAt: new Date(session.updatedAt),
          },
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        }),
      );

      setThreads(syncedThreads);
      console.log(
        "✅ [THREAD_PROVIDER] Todas as threads sincronizadas:",
        syncedThreads.length,
      );
    } catch (error) {
      console.error("❌ [THREAD_PROVIDER] Erro ao sincronizar threads:", error);
    } finally {
      setIsLoadingThreads(false);
    }
  }, [queryClient, trpc]);

  // ===== UTILITY =====

  const getThreadById = useCallback(
    (threadId: string): Thread | undefined => {
      return threads.find((thread) => thread.id === threadId);
    },
    [threads],
  );

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
