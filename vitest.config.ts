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
    environment: "node",
    setupFiles: ["./packages/api/src/test-setup.ts"],
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
