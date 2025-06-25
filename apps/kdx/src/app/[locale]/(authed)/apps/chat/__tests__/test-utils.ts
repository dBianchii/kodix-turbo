import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import {
  mockChatSession,
  mockSession,
  mockTeam,
  mockUser,
} from "./__mocks__/data";

// Test helpers para Chat SubApp
export const setupChatTests = () => {
  const user = mockUser;
  const team = mockTeam;
  const session = mockChatSession;
  const authSession = mockSession;

  return { user, team, session, authSession };
};

// Mock context factory
export const createMockTRPCContext = (overrides?: any) => ({
  auth: {
    user: mockUser,
    session: mockSession,
  },
  headers: new Headers(),
  ...overrides,
});

// Query client factory para testes
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper para React Query
export const createQueryWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Mock para tRPC utils
export const createMockTRPCUtils = () => ({
  app: {
    chat: {
      listarSessions: {
        useQuery: vi.fn(),
        useMutation: vi.fn(),
      },
      buscarSession: {
        useQuery: vi.fn(),
      },
      getMessages: {
        useQuery: vi.fn(),
      },
      enviarMensagem: {
        useMutation: vi.fn(),
      },
      autoCreateSessionWithMessage: {
        useMutation: vi.fn(),
      },
      getPreferredModel: {
        useQuery: vi.fn(),
      },
      setPreferredModel: {
        useMutation: vi.fn(),
      },
    },
    aiStudio: {
      findAvailableModels: {
        useQuery: vi.fn(),
      },
      findModelById: {
        useQuery: vi.fn(),
      },
    },
  },
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
});

// Utility para simular streaming
export const createMockStream = (chunks: string[]) => {
  let chunkIndex = 0;

  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        yield {
          choices: [
            {
              delta: {
                content: chunk,
              },
              finish_reason: chunkIndex === chunks.length - 1 ? "stop" : null,
            },
          ],
        };
        chunkIndex++;
      }
    },
  };
};

// Utility para testar performance
export const measureTestPerformance = async (
  fn: () => Promise<any>,
  maxDuration = 1000,
) => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (duration > maxDuration) {
    console.warn(`Test took ${duration}ms, expected < ${maxDuration}ms`);
  }

  return { result, duration };
};

// Mock para localStorage
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Mock para sessionStorage
export const createMockSessionStorage = () => createMockLocalStorage();

// Utility para aguardar atualizações assíncronas
export const waitForAsync = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock para WebSocket (se usado em streaming)
export const createMockWebSocket = () => {
  const mockWs = {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  };

  return mockWs;
};

// Utility para simular eventos de teclado
export const createKeyboardEvent = (
  key: string,
  options?: KeyboardEventInit,
) => {
  return new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

// Utility para simular eventos de mouse
export const createMouseEvent = (type: string, options?: MouseEventInit) => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

// Mock para IntersectionObserver (para testes de scroll infinito)
export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  return mockIntersectionObserver;
};

// Mock para ResizeObserver
export const createMockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });

  return mockResizeObserver;
};

// Utility para setup global de mocks de DOM APIs
export const setupDOMAPIMocks = () => {
  createMockIntersectionObserver();
  createMockResizeObserver();

  // Mock para clipboard API
  Object.defineProperty(navigator, "clipboard", {
    writable: true,
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    },
  });

  // Mock para localStorage e sessionStorage
  Object.defineProperty(window, "localStorage", {
    writable: true,
    configurable: true,
    value: createMockLocalStorage(),
  });

  Object.defineProperty(window, "sessionStorage", {
    writable: true,
    configurable: true,
    value: createMockSessionStorage(),
  });
};

// Cleanup function para testes
export const cleanupAfterTest = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();

  // Reset DOM mocks if needed
  if (window.localStorage && vi.isMockFunction(window.localStorage.clear)) {
    window.localStorage.clear();
  }

  if (window.sessionStorage && vi.isMockFunction(window.sessionStorage.clear)) {
    window.sessionStorage.clear();
  }
};

// Utility para debug de testes
export const debugTest = (label: string, data?: any) => {
  if (process.env.NODE_ENV === "test" && process.env.DEBUG_TESTS) {
    console.log(`[TEST DEBUG] ${label}:`, data);
  }
};
