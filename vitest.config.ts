import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      // Variáveis de ambiente para testes
      MYSQL_URL: "mysql://test:test@localhost:3306/test_db",
      ENCRYPTION_KEY: "test-encryption-key-32-characters-long",
      NODE_ENV: "test",
      NEXTAUTH_SECRET: "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      SKIP_ENV_VALIDATION: "true",
      // Forçar modo de teste para evitar conexões reais
      VITEST: "true",
      CI: "true",
    },
    globals: true,
    // 🔧 CORREÇÃO: Ambiente padrão para Node.js (backend)
    environment: "node",

    // 🔧 CORREÇÃO: Configuração específica por ambiente
    environmentMatchGlobs: [
      // Backend tests usam ambiente node (SEM window object)
      ["packages/api/**/*.test.ts", "node"],
      ["packages/db/**/*.test.ts", "node"],
      ["packages/auth/**/*.test.ts", "node"],
      ["packages/shared/**/*.test.ts", "node"],
      ["packages/validators/**/*.test.ts", "node"],
      ["packages/permissions/**/*.test.ts", "node"],
      ["packages/locales/**/*.test.ts", "node"],

      // Frontend tests usam jsdom (COM window object)
      ["apps/kdx/**/*.test.ts", "jsdom"],
      ["apps/kdx/**/*.test.tsx", "jsdom"],
      ["apps/care-expo/**/*.test.ts", "jsdom"],
      ["apps/care-expo/**/*.test.tsx", "jsdom"],
      ["packages/ui/**/*.test.ts", "jsdom"],
      ["packages/ui/**/*.test.tsx", "jsdom"],
    ],

    // 🔧 CORREÇÃO: Setup files específicos
    setupFiles: [
      path.resolve(__dirname, "./packages/api/src/test-setup.ts"), // Backend (Node.js)
      path.resolve(__dirname, "./apps/kdx/src/test-setup.ts"), // Frontend (jsdom)
    ],

    // Timeout maior para testes que fazem mocking pesado
    testTimeout: 10000,
    // Isolar cada teste
    isolate: true,
    // Configurações para mocking
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./packages"),
      "~": path.resolve(__dirname, "./apps"),
    },
  },
});
