import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@kdx/db/client";
import { chatAppId } from "@kdx/shared";

import { aiStudioConfig } from "../../internal/config/ai-studio.config";
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

// Mock do config para ter certeza que o template é o que esperamos
vi.mock("../../internal/config/ai-studio.config", () => ({
  aiStudioConfig: {
    platformInstructions: {
      enabled: true,
      template:
        "Olá, {{userName}} da equipe {{teamName}}. Seu idioma é {{userLanguage}}.",
    },
  },
}));

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
  });

  describe("getSystemPromptForChat Query", () => {
    it("should return the processed prompt with user variables substituted", async () => {
      // Act: Chamar o endpoint da API através do caller
      const result = await caller.app.aiStudio.getSystemPromptForChat({
        requestingApp: chatAppId,
      });

      // Assert: Verificar se o resultado está correto
      expect(result.hasContent).toBe(true);
      expect(result.prompt).toBe(
        "Olá, Usuário de Teste da equipe Equipe de Teste. Seu idioma é pt-BR.",
      );
      expect(db.query.users.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should handle cases where the user is not found in the db", async () => {
      // Arrange: Simular que o banco não encontrou o usuário
      vi.mocked(db.query.users.findFirst).mockResolvedValue(
        Promise.resolve(null) as any,
      );

      // Act
      const result = await caller.app.aiStudio.getSystemPromptForChat({
        requestingApp: chatAppId,
      });

      // Assert: O serviço deve retornar o template sem substituição
      expect(result.prompt).toBe(aiStudioConfig.platformInstructions.template);
    });
  });
});
