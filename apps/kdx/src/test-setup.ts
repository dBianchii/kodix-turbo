import "@testing-library/jest-dom";

import { vi } from "vitest";

console.log(
  "🧪 [FRONTEND-SETUP] Configurando ambiente jsdom para testes de frontend",
);

// 🔧 CORREÇÃO: Verificar se window está disponível (ambiente jsdom)
const isJsdomEnvironment = typeof window !== "undefined";

if (!isJsdomEnvironment) {
  console.log(
    "🧪 [FRONTEND-SETUP] Ambiente Node.js detectado - skipping frontend setup",
  );
} else {
  console.log(
    "🧪 [FRONTEND-SETUP] Ambiente jsdom confirmado - configurando mocks do browser",
  );
}

// Configuração global para testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 🔧 CORREÇÃO: Mock do window.matchMedia apenas se window existir
if (isJsdomEnvironment) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  // Mock do IntersectionObserver
  const mockIntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: "",
    thresholds: [],
    takeRecords: vi.fn(() => []),
  }));

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
}

// Mock global do IntersectionObserver (para casos onde global é usado)
const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
  takeRecords: vi.fn(() => []),
}));

Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

// Configurar console para testes
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Filtrar warnings conhecidos do React/Testing Library
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ReactDOM.render is deprecated") ||
      args[0].includes("Warning: An invalid form control"))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
