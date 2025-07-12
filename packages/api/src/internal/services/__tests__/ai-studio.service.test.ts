import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../ai-studio.service";

// Mock das dependências de banco de dados
const mockUsersFindFirst = vi.fn();
const mockTeamsFindFirst = vi.fn();
const mockAppTeamConfigsFindFirst = vi.fn();
const mockUserAppTeamConfigsFindFirst = vi.fn();

vi.mock("@kdx/db/client", () => ({
  db: {
    query: {
      users: {
        findFirst: mockUsersFindFirst,
      },
      teams: {
        findFirst: mockTeamsFindFirst,
      },
      appTeamConfigs: {
        findFirst: mockAppTeamConfigsFindFirst,
      },
      userAppTeamConfigs: {
        findFirst: mockUserAppTeamConfigsFindFirst,
      },
    },
  },
}));

describe("AiStudioService.getSystemPrompt", () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Limpa todos os mocks antes de cada teste
  });

  it("should build prompt with platform, team, and user instructions", async () => {
    // Arrange: Configura os mocks para retornar dados completos
    mockUsersFindFirst.mockResolvedValue({
      name: "João Silva",
      email: "joao@teste.com",
    });
    mockTeamsFindFirst.mockResolvedValue({ name: "Equipe Teste" });
    mockAppTeamConfigsFindFirst.mockResolvedValue({
      config: {
        teamInstructions: {
          content: "Fale com um sotaque de pirata.",
          enabled: true,
        },
      },
    });
    mockUserAppTeamConfigsFindFirst.mockResolvedValue({
      config: {
        userInstructions: {
          content: "Sempre inclua uma piada no final.",
          enabled: true,
        },
      },
    });

    // Act: Chama o método a ser testado
    const result = await AiStudioService.getSystemPrompt({
      teamId: "test-team",
      userId: "test-user",
    });

    // Assert: Verifica se o prompt final contém todas as partes esperadas
    expect(result).toContain("# PERFIL DO ASSISTENTE");
    expect(result).toContain("João Silva");
    expect(result).toContain("Equipe Teste");
    expect(result).toContain("## INSTRUÇÕES DO TIME");
    expect(result).toContain("Fale com um sotaque de pirata.");
    expect(result).toContain("## INSTRUÇÕES DO USUÁRIO");
    expect(result).toContain("Sempre inclua uma piada no final.");
    expect(result).toContain("LEMBRETE:");
  });

  it("should gracefully handle missing user and team data", async () => {
    // Arrange: Simula que os dados do usuário e time não foram encontrados
    mockUsersFindFirst.mockResolvedValue(undefined);
    mockTeamsFindFirst.mockResolvedValue(undefined);
    mockAppTeamConfigsFindFirst.mockResolvedValue(null);
    mockUserAppTeamConfigsFindFirst.mockResolvedValue(null);

    // Act
    const result = await AiStudioService.getSystemPrompt({
      teamId: "test-team",
      userId: "test-user",
    });

    // Assert: Verifica se os fallbacks foram usados
    expect(result).toContain("Usuário"); // Fallback para nome de usuário
    expect(result).toContain("Equipe"); // Fallback para nome do time
    expect(result).not.toContain("## INSTRUÇÕES DO TIME");
    expect(result).not.toContain("## INSTRUÇÕES DO USUÁRIO");
  });

  it("should not include instructions if they are disabled", async () => {
    // Arrange: Simula que as instruções estão desabilitadas
    mockUsersFindFirst.mockResolvedValue({ name: "Usuário Teste" });
    mockTeamsFindFirst.mockResolvedValue({ name: "Time Teste" });
    mockAppTeamConfigsFindFirst.mockResolvedValue({
      config: { teamInstructions: { content: "pirata", enabled: false } },
    });
    mockUserAppTeamConfigsFindFirst.mockResolvedValue({
      config: { userInstructions: { content: "piada", enabled: false } },
    });

    // Act
    const result = await AiStudioService.getSystemPrompt({
      teamId: "test-team",
      userId: "test-user",
    });

    // Assert
    expect(result).not.toContain("## INSTRUÇÕES DO TIME");
    expect(result).not.toContain("## INSTRUÇÕES DO USUÁRIO");
  });

  it("should throw a ValidationError if teamId is not provided", async () => {
    // Assert
    await expect(
      AiStudioService.getSystemPrompt({
        teamId: "",
        userId: "test-user",
      }),
    ).rejects.toThrow("teamId is required for cross-app access");
  });
});
