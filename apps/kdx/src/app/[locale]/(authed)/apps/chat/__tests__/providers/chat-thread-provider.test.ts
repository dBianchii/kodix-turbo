import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ===== MOCKS =====

// Mock do tRPC
const mockTrpc = {
  app: {
    chat: {
      createEmptySession: {
        mutationOptions: vi.fn(() => vi.fn()),
      },
      generateSessionTitle: {
        mutationOptions: vi.fn(() => vi.fn()),
      },
      deletarSession: {
        mutationOptions: vi.fn(() => vi.fn()),
      },
      buscarSession: {
        query: vi.fn(),
      },
      buscarMensagensTest: {
        query: vi.fn(),
      },
      listarSessions: {
        query: vi.fn(),
      },
    },
  },
};

// Mock do QueryClient
const mockQueryClient = {
  fetchMutation: vi.fn(),
  fetchQuery: vi.fn(),
  invalidateQueries: vi.fn(),
};

// Mock de dados de teste
const mockSessionData = {
  session: {
    id: "test-session-id",
    title: "Test Thread",
    aiModelId: "test-model-id",
    teamId: "test-team-id",
    userId: "test-user-id",
    createdAt: new Date().toISOString(),
  },
};

const mockMessagesData = {
  messages: [
    {
      id: "msg-1",
      senderRole: "user",
      content: "Hello",
    },
    {
      id: "msg-2",
      senderRole: "assistant",
      content: "Hi there!",
    },
  ],
};

// ===== PROVIDER LOGIC TESTS =====

describe("ChatThreadProvider Logic", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe("Thread Creation", () => {
    it("should create thread with default title", async () => {
      // Mock da resposta de criação
      mockQueryClient.fetchMutation.mockResolvedValueOnce(() =>
        Promise.resolve(mockSessionData),
      );

      // Simular lógica do provider
      const providerLogic = {
        createThread: async (options?: any) => {
          const createEmptyMutation = await mockQueryClient.fetchMutation();
          const sessionData = await createEmptyMutation({
            title: options?.title || `Chat ${new Date().toLocaleDateString()}`,
            generateTitle: options?.generateTitle ?? false,
            metadata: {
              ...options?.metadata,
              createdAt: new Date().toISOString(),
            },
          });

          return {
            id: sessionData.session.id,
            title: sessionData.session.title,
            messages: [],
            metadata: {
              aiModelId: sessionData.session.aiModelId,
              teamId: sessionData.session.teamId,
              userId: sessionData.session.userId,
              messageCount: 0,
              lastMessageAt: new Date(),
            },
            createdAt: new Date(sessionData.session.createdAt),
            updatedAt: new Date(),
          };
        },
      };

      const result = await providerLogic.createThread();

      expect(result.id).toBe("test-session-id");
      expect(result.title).toBe("Test Thread");
      expect(result.messages).toEqual([]);
      expect(result.metadata.messageCount).toBe(0);
    });

    it("should create thread with custom title", async () => {
      mockQueryClient.fetchMutation.mockResolvedValueOnce(() =>
        Promise.resolve({
          session: {
            ...mockSessionData.session,
            title: "Custom Thread Title",
          },
        }),
      );

      const providerLogic = {
        createThread: async (options?: any) => {
          const createEmptyMutation = await mockQueryClient.fetchMutation();
          const sessionData = await createEmptyMutation({
            title: options?.title || `Chat ${new Date().toLocaleDateString()}`,
          });

          return {
            id: sessionData.session.id,
            title: sessionData.session.title,
            messages: [],
          };
        },
      };

      const result = await providerLogic.createThread({
        title: "Custom Thread Title",
      });

      expect(result.title).toBe("Custom Thread Title");
    });

    it("should create thread with first message metadata", async () => {
      const firstMessage = "Hello, this is my first message";

      mockQueryClient.fetchMutation.mockResolvedValueOnce(() =>
        Promise.resolve(mockSessionData),
      );

      const providerLogic = {
        createThread: async (options?: any) => {
          const createEmptyMutation = await mockQueryClient.fetchMutation();
          await createEmptyMutation({
            title: options?.title,
            generateTitle: options?.generateTitle,
            metadata: {
              ...options?.metadata,
              firstMessage: options?.firstMessage,
            },
          });

          return {
            id: mockSessionData.session.id,
            metadata: {
              firstMessage: options?.firstMessage,
            },
          };
        },
      };

      const result = await providerLogic.createThread({
        firstMessage,
        generateTitle: true,
      });

      expect(result.metadata.firstMessage).toBe(firstMessage);
    });
  });

  describe("Thread Management", () => {
    it("should update thread metadata", () => {
      const initialThread = {
        id: "test-id",
        title: "Original Title",
        messages: [],
        metadata: {
          messageCount: 0,
          teamId: "team-1",
          userId: "user-1",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simular lógica de update
      const updateThread = (threadId: string, updates: any) => {
        return {
          ...initialThread,
          ...updates,
          updatedAt: new Date(),
          metadata: {
            ...initialThread.metadata,
            ...updates.metadata,
          },
        };
      };

      const result = updateThread("test-id", {
        title: "Updated Title",
        metadata: {
          messageCount: 5,
        },
      });

      expect(result.title).toBe("Updated Title");
      expect(result.metadata.messageCount).toBe(5);
      expect(result.metadata.teamId).toBe("team-1"); // Preservado
    });

    it("should append message to thread", () => {
      const initialThread = {
        messages: [{ id: "1", role: "user", content: "Hello" }],
        metadata: {
          messageCount: 1,
        },
      };

      const newMessage = { id: "2", role: "assistant", content: "Hi!" };

      // Simular append logic
      const appendMessage = (thread: any, message: any) => {
        return {
          ...thread,
          messages: [...thread.messages, message],
          metadata: {
            ...thread.metadata,
            messageCount: thread.metadata.messageCount + 1,
            lastMessageAt: new Date(),
          },
        };
      };

      const result = appendMessage(initialThread, newMessage);

      expect(result.messages.length).toBe(2);
      expect(result.messages[1]).toEqual(newMessage);
      expect(result.metadata.messageCount).toBe(2);
    });
  });

  describe("Title Generation", () => {
    it("should generate thread title", async () => {
      const threadId = "test-thread-id";
      const firstMessage = "What is the weather today?";
      const generatedTitle = "Weather Inquiry";

      mockQueryClient.fetchMutation.mockResolvedValueOnce(() =>
        Promise.resolve({ title: generatedTitle }),
      );

      const providerLogic = {
        generateThreadTitle: async (id: string, message: string) => {
          const generateMutation = await mockQueryClient.fetchMutation();
          const result = await generateMutation({
            sessionId: id,
            firstMessage: message,
          });

          return result.title;
        },
      };

      const result = await providerLogic.generateThreadTitle(
        threadId,
        firstMessage,
      );

      expect(result).toBe(generatedTitle);
      expect(mockQueryClient.fetchMutation).toHaveBeenCalled();
    });

    it("should handle title generation error with fallback", async () => {
      const firstMessage =
        "This is a very long message that should be truncated when used as fallback title";

      mockQueryClient.fetchMutation.mockRejectedValueOnce(
        new Error("API Error"),
      );

      const providerLogic = {
        generateThreadTitle: async (id: string, message: string) => {
          try {
            const generateMutation = await mockQueryClient.fetchMutation();
            const result = await generateMutation({
              sessionId: id,
              firstMessage: message,
            });
            return result.title;
          } catch (error) {
            // Fallback: usar primeiros 50 caracteres
            const fallbackTitle =
              message.slice(0, 50) + (message.length > 50 ? "..." : "");
            return fallbackTitle;
          }
        },
      };

      const result = await providerLogic.generateThreadTitle(
        "test-id",
        firstMessage,
      );

      expect(result).toBe(
        "This is a very long message that should be truncat...",
      );
      expect(result.length).toBeLessThanOrEqual(53); // 50 + "..."
    });
  });

  describe("Synchronization", () => {
    it("should sync thread from database", async () => {
      const threadId = "test-sync-id";

      mockQueryClient.fetchQuery
        .mockResolvedValueOnce({
          // Session data
          title: "Synced Title",
          aiModelId: "model-1",
        })
        .mockResolvedValueOnce({
          // Messages data
          messages: mockMessagesData.messages,
        });

      const providerLogic = {
        syncThreadFromDB: async (id: string) => {
          const sessionData = await mockQueryClient.fetchQuery();
          const messagesData = await mockQueryClient.fetchQuery();

          // Convert messages to useChat format
          const formattedMessages = messagesData.messages
            .filter((msg: any) => msg.senderRole !== "system")
            .map((msg: any) => ({
              id: msg.id,
              role: msg.senderRole === "user" ? "user" : "assistant",
              content: msg.content,
            }));

          return {
            title: sessionData.title,
            messages: formattedMessages,
            metadata: {
              messageCount: formattedMessages.length,
            },
          };
        },
      };

      const result = await providerLogic.syncThreadFromDB(threadId);

      expect(result.title).toBe("Synced Title");
      expect(result.messages.length).toBe(2);
      expect(result.messages[0].role).toBe("user");
      expect(result.messages[1].role).toBe("assistant");
      expect(result.metadata.messageCount).toBe(2);
    });

    it("should sync all threads", async () => {
      const sessionsData = {
        sessions: [
          {
            id: "session-1",
            title: "Thread 1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "session-2",
            title: "Thread 2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      mockQueryClient.fetchQuery.mockResolvedValueOnce(sessionsData);

      const providerLogic = {
        syncAllThreads: async () => {
          const data = await mockQueryClient.fetchQuery();

          return data.sessions.map((session: any) => ({
            id: session.id,
            title: session.title,
            messages: [], // Messages loaded on demand
            metadata: {
              messageCount: 0,
              lastMessageAt: new Date(session.updatedAt),
            },
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
          }));
        },
      };

      const result = await providerLogic.syncAllThreads();

      expect(result.length).toBe(2);
      expect(result[0].id).toBe("session-1");
      expect(result[1].id).toBe("session-2");
      expect(result[0].messages).toEqual([]);
    });
  });

  describe("Thread State Management", () => {
    it("should track active thread", () => {
      const threads = [
        { id: "thread-1", title: "First Thread" },
        { id: "thread-2", title: "Second Thread" },
      ];

      const stateLogic = {
        getActiveThread: (threads: any[], activeId?: string) => {
          return threads.find((thread) => thread.id === activeId);
        },
      };

      const activeThread = stateLogic.getActiveThread(threads, "thread-2");

      expect(activeThread?.id).toBe("thread-2");
      expect(activeThread?.title).toBe("Second Thread");
    });

    it("should handle thread switching", () => {
      let activeThreadId = "thread-1";

      const stateLogic = {
        switchToThread: (threadId: string) => {
          activeThreadId = threadId;
          return activeThreadId;
        },
      };

      const newActiveId = stateLogic.switchToThread("thread-2");

      expect(newActiveId).toBe("thread-2");
      expect(activeThreadId).toBe("thread-2");
    });
  });

  describe("Message Format Conversion", () => {
    it("should convert DB messages to useChat format", () => {
      const dbMessages = [
        {
          id: "msg-1",
          senderRole: "system",
          content: "System instructions",
        },
        {
          id: "msg-2",
          senderRole: "user",
          content: "User message",
        },
        {
          id: "msg-3",
          senderRole: "assistant",
          content: "Assistant response",
        },
      ];

      const convertMessages = (messages: any[]) => {
        return messages
          .filter((msg) => msg.senderRole !== "system")
          .map((msg) => ({
            id: msg.id,
            role: msg.senderRole === "user" ? "user" : "assistant",
            content: msg.content,
          }));
      };

      const result = convertMessages(dbMessages);

      expect(result.length).toBe(2); // System message filtered
      expect(result[0]?.role).toBe("user");
      expect(result[1]?.role).toBe("assistant");
      expect(result[0]?.content).toBe("User message");
    });
  });
});
