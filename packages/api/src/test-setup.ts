/**
 * Setup global para testes de BACKEND
 * Configura mocks básicos para evitar conexões reais com banco de dados
 * 🔧 CORREÇÃO: Específico para ambiente Node.js (sem window object)
 */

import { vi } from "vitest";

console.log(
  "🧪 [BACKEND-SETUP] Configurando ambiente Node.js para testes de backend",
);

// Mock básico do console para evitar spam nos testes
const originalConsole = console;
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
console.info = vi.fn();

// Configurar environment variables de teste
process.env.NODE_ENV = "test";
process.env.VITEST = "true";
process.env.CI = "true";
process.env.SKIP_ENV_VALIDATION = "true";

// Variáveis para PostHog (evitar erros de inicialização)
process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-posthog-key";
process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://test-posthog.com";

// Variáveis para outros serviços
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.ENCRYPTION_KEY = "test-encryption-key-32-characters-long";
process.env.RESEND_API_KEY = "re_test-key";
process.env.UPSTASH_REDIS_REST_URL = "https://test-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
process.env.QSTASH_TOKEN = "test-qstash-token";

// Mock global do fetch para evitar chamadas HTTP reais
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
  text: async () => "mock response",
  status: 200,
  statusText: "OK",
});

// Mock do PostHog para evitar inicialização real
vi.mock("posthog-node", () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: vi.fn(),
    identify: vi.fn(),
    shutdown: vi.fn(),
  })),
}));

// Mock do Resend para evitar inicialização real
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "test-email-id" }),
    },
  })),
}));

// Mock do Upstash Redis
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  })),
}));

// Restaurar console original se necessário para debugging
if (process.env.DEBUG_TESTS === "true") {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
}

console.log("🧪 [TEST-SETUP] Configuração básica de testes carregada");
