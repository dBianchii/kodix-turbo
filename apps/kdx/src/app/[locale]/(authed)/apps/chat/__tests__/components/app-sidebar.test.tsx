import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppSidebar } from "../../_components/app-sidebar";

// Mock do useTRPC
vi.mock("~/trpc/react", () => ({
  useTRPC: () => ({
    app: {
      chat: {
        findChatFolders: {
          queryOptions: vi.fn(() => ({ queryKey: ["findChatFolders"] })),
        },
        findSessions: {
          queryOptions: vi.fn(() => ({ queryKey: ["findSessions"] })),
        },
        createChatFolder: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["createChatFolder"] })),
        },
        updateChatFolder: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["updateChatFolder"] })),
        },
        deleteChatFolder: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["deleteChatFolder"] })),
        },
        createSession: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["createSession"] })),
        },
        updateSession: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["updateSession"] })),
        },
        deleteSession: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["deleteSession"] })),
        },
        moveSession: {
          mutationOptions: vi.fn(() => ({ mutationKey: ["moveSession"] })),
        },
      },
      aiStudio: {
        findAiAgents: {
          queryOptions: vi.fn(() => ({ queryKey: ["findAiAgents"] })),
        },
        findAvailableModels: {
          queryOptions: vi.fn(() => ({ queryKey: ["findAvailableModels"] })),
        },
      },
    },
  }),
}));

// Mock das queries
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: { folders: [], sessions: [], agents: [] },
      isLoading: false,
      error: null,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

// Mock do useChatUserConfig
vi.mock("../../_hooks/useChatUserConfig", () => ({
  useChatUserConfig: () => ({
    savePreferredModel: vi.fn(),
  }),
}));

// Mock do useTranslations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock do useSidebar
vi.mock("@kdx/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
  SidebarContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuButton: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  useSidebar: () => ({ isMobile: false }),
}));

// Mock de outros componentes UI
vi.mock("@kdx/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@kdx/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@kdx/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogAction: ({ children }: { children: ReactNode }) => (
    <button>{children}</button>
  ),
  AlertDialogCancel: ({ children }: { children: ReactNode }) => (
    <button>{children}</button>
  ),
}));

vi.mock("~/app/[locale]/_components/app/kodix-icon", () => ({
  IconKodixApp: () => <div data-testid="kodix-icon" />,
}));

// Wrapper para testes
function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("AppSidebar", () => {
  it("should render without errors after type safety corrections", () => {
    expect(() => {
      render(
        <TestWrapper>
          <AppSidebar
            selectedSessionId="test-session"
            onSessionSelect={vi.fn()}
          />
        </TestWrapper>,
      );
    }).not.toThrow();
  });

  it("should display the chat app name", () => {
    render(
      <TestWrapper>
        <AppSidebar
          selectedSessionId="test-session"
          onSessionSelect={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("apps.chat.appName")).toBeInTheDocument();
  });

  it("should render sidebar component", () => {
    render(
      <TestWrapper>
        <AppSidebar
          selectedSessionId="test-session"
          onSessionSelect={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("should handle undefined selectedSessionId", () => {
    expect(() => {
      render(
        <TestWrapper>
          <AppSidebar selectedSessionId={undefined} onSessionSelect={vi.fn()} />
        </TestWrapper>,
      );
    }).not.toThrow();
  });

  it("should handle missing onSessionSelect callback", () => {
    expect(() => {
      render(
        <TestWrapper>
          <AppSidebar selectedSessionId="test-session" />
        </TestWrapper>,
      );
    }).not.toThrow();
  });
});
