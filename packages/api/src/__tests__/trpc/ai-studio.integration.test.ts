import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { CoreEngine } from "@kdx/core-engine";
import { db } from "@kdx/db/client";
import { chatAppId } from "@kdx/shared";

import { appRouter } from "../../trpc/root";
import { createTRPCContext } from "../../trpc/trpc";

// Mock do banco de dados para controlar os dados do usuário
vi.mock("@kdx/db/client", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock do CoreEngine para controlar a configuração
vi.mock("@kdx/core-engine", () => ({
  CoreEngine: {
    config: {
      get: vi.fn(),
    },
  },
}));

const mockCoreEngineConfig = {
  platformInstructions: {
    enabled: true,
    template:
      "Olá, {{userName}} da equipe {{teamName}}. Seu idioma é {{userLanguage}}.",
  },
};

describe("AI Studio tRPC Integration Test", async () => {
  // Mock do usuário que será usado no contexto de autenticação
  const mockUser = {
    id: "user_test_123",
    name: "Usuário de Teste",
    email: "test@kodix.com.br",
    locale: "pt-BR",
    activeTeamId: "team_test_456",
    ActiveTeam: {
      id: "team_test_456",
      name: "Equipe de Teste",
    },
  };

  // Criar um "caller" autenticado antes de todos os testes
  const ctx = await createTRPCContext({
    auth: {
      user: mockUser,
      session: null, // Não necessário para este teste
    },
    headers: new Headers(),
  } as any); // Usamos 'as any' para simplificar o mock do contexto

  const caller = appRouter.createCaller(ctx);

  beforeEach(() => {
    vi.clearAllMocks();
    // Garantir que a chamada ao banco retorne nosso usuário mockado por padrão
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    // Mockar o CoreEngine para retornar a configuração esperada
    vi.mocked(CoreEngine.config.get).mockResolvedValue(mockCoreEngineConfig);
  });

  describe("getSystemPromptForChat Query", () => {
    it("should return the processed prompt via CoreEngine", async () => {
      // Act: Chamar o endpoint da API através do caller
      const result = await caller.app.aiStudio.getSystemPromptForChat({
        requestingApp: chatAppId,
      });

      // Assert: Verificar se o resultado está correto
      expect(result.hasContent).toBe(true);
      expect(result.prompt).toContain("Plataforma"); // Prompt estruturado pelo PromptBuilderService
      expect(CoreEngine.config.get).toHaveBeenCalledTimes(1);
    });

    it("should handle cases where CoreEngine returns empty config", async () => {
      // Arrange: Simular que o CoreEngine retorna configuração vazia
      vi.mocked(CoreEngine.config.get).mockResolvedValue({
        platformInstructions: { enabled: false, template: "" },
      });

      // Act
      const result = await caller.app.aiStudio.getSystemPromptForChat({
        requestingApp: chatAppId,
      });

      // Assert: O serviço deve retornar prompt vazio
      expect(result.hasContent).toBe(false);
      expect(result.prompt).toBe("");
    });
  });
});
