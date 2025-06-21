import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { Message } from "@ai-sdk/react";

import { useSessionWithMessages } from "../../_hooks/useSessionWithMessages";
import { createTestWrapper } from "../__mocks__/test-wrapper";

// Mock do hook tRPC
vi.mock("~/trpc/react", () => ({
  useTRPC: () => ({
    app: {
      chat: {
        buscarSession: {
          queryOptions: vi.fn().mockReturnValue({
            queryKey: ["session"],
            queryFn: vi.fn(),
          }),
        },
        buscarMensagensTest: {
          queryOptions: vi.fn().mockReturnValue({
            queryKey: ["messages"],
            queryFn: vi.fn(),
          }),
        },
      },
    },
  }),
}));

// Mock do useQuery
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("useSessionWithMessages Hook", () => {
  const mockUseQuery = vi.mocked(
    await import("@tanstack/react-query"),
  ).useQuery;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Session Loading", () => {
    it("should handle loading state correctly", async () => {
      mockUseQuery
        .mockReturnValueOnce({
          data: undefined,
          isLoading: true,
          isError: false,
          error: null,
          refetch: vi.fn(),
        })
        .mockReturnValueOnce({
          data: undefined,
          isLoading: true,
          isError: false,
          error: null,
          refetch: vi.fn(),
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.session).toBeUndefined();
      expect(result.current.initialMessages).toEqual([]);
    });

    it("should handle session without messages", async () => {
      const mockSession = {
        id: "session-123",
        title: "Test Session",
        aiModelId: "model-123",
        teamId: "team-123",
        userId: "user-123",
      };

      mockUseQuery
        .mockReturnValueOnce({
          data: mockSession,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        })
        .mockReturnValueOnce({
          data: { messages: [] },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.initialMessages).toEqual([]);
    });
  });

  describe("Message Formatting", () => {
    it("should format messages correctly for AI SDK", async () => {
      const mockSession = {
        id: "session-123",
        title: "Test Session",
      };

      const mockMessages = [
        {
          id: "msg-1",
          content: "Hello!",
          senderRole: "user",
          createdAt: new Date(),
        },
        {
          id: "msg-2",
          content: "Hi there!",
          senderRole: "ai",
          createdAt: new Date(),
        },
        {
          id: "msg-3",
          content: "System message",
          senderRole: "system",
          createdAt: new Date(),
        },
      ];

      mockUseQuery
        .mockReturnValueOnce({
          data: mockSession,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        })
        .mockReturnValueOnce({
          data: { messages: mockMessages },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      const expectedMessages: Message[] = [
        {
          id: "msg-1",
          role: "user",
          content: "Hello!",
        },
        {
          id: "msg-2",
          role: "assistant",
          content: "Hi there!",
        },
        // System message should be filtered out
      ];

      expect(result.current.initialMessages).toEqual(expectedMessages);
      expect(result.current.initialMessages).toHaveLength(2); // System message filtered
    });

    it("should filter out system messages", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          content: "System instruction",
          senderRole: "system",
          createdAt: new Date(),
        },
        {
          id: "msg-2",
          content: "User message",
          senderRole: "user",
          createdAt: new Date(),
        },
      ];

      mockUseQuery
        .mockReturnValueOnce({
          data: { id: "session-123" },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        })
        .mockReturnValueOnce({
          data: { messages: mockMessages },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      expect(result.current.initialMessages).toHaveLength(1);
      expect(result.current.initialMessages[0]?.role).toBe("user");
      expect(result.current.initialMessages[0]?.content).toBe("User message");
    });
  });

  describe("Error Handling", () => {
    it("should handle session fetch error", async () => {
      const mockError = new Error("Session not found");

      mockUseQuery
        .mockReturnValueOnce({
          data: undefined,
          isLoading: false,
          isError: true,
          error: mockError,
          refetch: vi.fn(),
        })
        .mockReturnValueOnce({
          data: undefined,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it("should handle messages fetch error", async () => {
      const mockError = new Error("Messages not found");

      mockUseQuery
        .mockReturnValueOnce({
          data: { id: "session-123" },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        })
        .mockReturnValueOnce({
          data: undefined,
          isLoading: false,
          isError: true,
          error: mockError,
          refetch: vi.fn(),
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("Refetch Functionality", () => {
    it("should refetch both session and messages", async () => {
      const mockSessionRefetch = vi.fn();
      const mockMessagesRefetch = vi.fn();

      mockUseQuery
        .mockReturnValueOnce({
          data: { id: "session-123" },
          isLoading: false,
          isError: false,
          error: null,
          refetch: mockSessionRefetch,
        })
        .mockReturnValueOnce({
          data: { messages: [] },
          isLoading: false,
          isError: false,
          error: null,
          refetch: mockMessagesRefetch,
        });

      const { result } = renderHook(
        () => useSessionWithMessages("session-123"),
        {
          wrapper: createTestWrapper(),
        },
      );

      result.current.refetch();

      expect(mockSessionRefetch).toHaveBeenCalledTimes(1);
      expect(mockMessagesRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Hook Options", () => {
    it("should respect enabled option", async () => {
      const { result } = renderHook(
        () =>
          useSessionWithMessages("session-123", {
            enabled: false,
          }),
        {
          wrapper: createTestWrapper(),
        },
      );

      // Should not trigger queries when disabled
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it("should use custom staleTime and gcTime", async () => {
      const customOptions = {
        staleTime: 10000,
        gcTime: 30000,
      };

      renderHook(() => useSessionWithMessages("session-123", customOptions), {
        wrapper: createTestWrapper(),
      });

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 10000,
          gcTime: 30000,
        }),
      );
    });
  });

  describe("SessionId Handling", () => {
    it("should handle undefined sessionId", async () => {
      const { result } = renderHook(() => useSessionWithMessages(undefined), {
        wrapper: createTestWrapper(),
      });

      // Should disable queries when sessionId is undefined
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it("should handle empty sessionId", async () => {
      const { result } = renderHook(() => useSessionWithMessages(""), {
        wrapper: createTestWrapper(),
      });

      // Should disable queries when sessionId is empty
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });
  });
});
