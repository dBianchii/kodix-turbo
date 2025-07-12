import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatWindow } from "../../_components/chat-window";
import { ChatThreadProvider } from "../../_providers/chat-thread-provider";

// Mock dos hooks e contextos necessários
vi.mock("~/trpc/react", () => ({
  useTRPC: () => ({
    app: {
      chat: {
        createEmptySession: {
          mutationOptions: vi.fn().mockReturnValue({
            onSuccess: vi.fn(),
            onError: vi.fn(),
          }),
        },
      },
    },
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("../../_hooks/useSessionWithMessages", () => ({
  useSessionWithMessages: vi.fn().mockReturnValue({
    session: null,
    initialMessages: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../_providers/chat-thread-provider", () => ({
  useThreadContext: vi.fn().mockReturnValue({
    createThread: vi.fn(),
    setPendingMessage: vi.fn(),
    switchToThread: vi.fn(),
  }),
  ChatThreadProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("ChatWindow Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ChatThreadProvider>
          <ChatWindow {...props} />
        </ChatThreadProvider>
      </QueryClientProvider>,
    );
  };

  it("renders empty thread state when no sessionId", () => {
    renderComponent();

    expect(screen.getByText("apps.chat.newConversation")).toBeInTheDocument();
    expect(screen.getByText("apps.chat.startNewChat")).toBeInTheDocument();
  });

  it("renders loading state during session loading", () => {
    vi.spyOn(
      require("../../_hooks/useSessionWithMessages"),
      "useSessionWithMessages",
    ).mockReturnValueOnce({
      session: null,
      initialMessages: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent({ sessionId: "test-session" });

    expect(screen.getByText("apps.chat.loadingSession")).toBeInTheDocument();
  });

  it("handles first message creation", async () => {
    const mockCreateEmptySession = vi.fn();
    vi.spyOn(require("~/trpc/react"), "useTRPC").mockReturnValueOnce({
      app: {
        chat: {
          createEmptySession: {
            mutationOptions: () => ({
              onSuccess: mockCreateEmptySession,
              onError: vi.fn(),
            }),
          },
        },
      },
    });

    renderComponent();

    const input = screen.getByPlaceholderText("apps.chat.typeFirstMessage");
    const submitButton = screen.getByRole("button", {
      name: /Como você pode me ajudar\?/i,
    });

    submitButton.click();

    await waitFor(() => {
      expect(mockCreateEmptySession).toHaveBeenCalled();
    });
  });
});
