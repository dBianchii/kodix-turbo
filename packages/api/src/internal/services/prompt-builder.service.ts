import { TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import { CoreEngine } from "@kdx/core-engine";
import { aiStudioAppId } from "@kdx/shared";

/**
 * PromptBuilderService - Responsável por construir o prompt final do sistema
 *
 * Este serviço orquestra a combinação de todas as camadas de instruções
 * seguindo a hierarquia de prioridades:
 *
 * 1. Instruções da Plataforma (Nível 1) - Prioridade: BAIXA
 * 2. Instruções da Equipe (Nível 2) - Prioridade: MÉDIA
 * 3. Instruções do Usuário (Nível 3) - Prioridade: ALTA
 *
 * O serviço combina as instruções de forma estruturada e retorna
 * o prompt final pronto para ser usado pelo sistema de IA.
 */
export class PromptBuilderService {
  /**
   * Valida os parâmetros de entrada
   */
  private static validateParams(userId: string, requestingApp: KodixAppId) {
    if (!userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "userId is required for prompt building",
      });
    }
    if (!requestingApp) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "requestingApp is required for prompt building",
      });
    }
  }

  /**
   * Combina múltiplas instruções em um prompt estruturado
   */
  private static combineInstructions(instructions: (string | null)[]): string {
    const validInstructions = instructions.filter(
      (instruction): instruction is string =>
        typeof instruction === "string" && instruction.trim().length > 0,
    );

    if (validInstructions.length === 0) {
      return "";
    }

    if (validInstructions.length === 1) {
      return validInstructions[0]!;
    }

    // Combinar múltiplas instruções com separadores claros
    return validInstructions
      .map((instruction, index) => {
        const level =
          index === 0 ? "Plataforma" : index === 1 ? "Equipe" : "Usuário";
        return `## Instruções ${level}\n\n${instruction}`;
      })
      .join("\n\n---\n\n");
  }

  /**
   * Constrói o prompt final do sistema combinando todas as camadas
   *
   * @param userId - ID do usuário para personalização
   * @param teamId - ID da equipe para instruções de nível 2
   * @param requestingApp - App que está solicitando o prompt
   * @returns String com o prompt final combinado
   */
  static async buildFinalSystemPrompt({
    userId,
    teamId,
    requestingApp,
  }: {
    userId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }): Promise<string> {
    this.validateParams(userId, requestingApp);

    try {
      console.log(
        `🔧 [PromptBuilderService] Building system prompt for user: ${userId}, team: ${teamId}, app: ${requestingApp}`,
      );

      // Coletar instruções de todas as camadas
      const instructions: (string | null)[] = [];

      // 1. Instruções da Plataforma (Nível 1) - Implementado via CoreEngine
      try {
        const coreConfig = await CoreEngine.config.get({
          appId: aiStudioAppId,
          teamId,
          userId,
        });

        const platformInstructions = coreConfig?.platformInstructions?.enabled
          ? coreConfig.platformInstructions.template
          : null;

        instructions.push(platformInstructions);

        if (platformInstructions) {
          console.log(
            "✅ [PromptBuilderService] Platform instructions loaded via CoreEngine",
          );
        } else {
          console.log(
            "⚠️ [PromptBuilderService] Platform instructions disabled or empty",
          );
        }
      } catch (error) {
        console.error(
          "❌ [PromptBuilderService] Error loading platform instructions via CoreEngine:",
          error,
        );
        instructions.push(null);
      }

      // 2. Instruções da Equipe (Nível 2) - TODO: Implementar futuramente
      // const teamInstructions = await TeamConfigService.getInstructionsForTeam({
      //   teamId,
      //   requestingApp,
      // });
      // instructions.push(teamInstructions);
      console.log(
        "📋 [PromptBuilderService] Team instructions - TODO: implement",
      );
      instructions.push(null);

      // 3. Instruções do Usuário (Nível 3) - TODO: Implementar futuramente
      // const userInstructions = await UserConfigService.getInstructionsForUser({
      //   userId,
      //   teamId,
      //   requestingApp,
      // });
      // instructions.push(userInstructions);
      console.log(
        "📋 [PromptBuilderService] User instructions - TODO: implement",
      );
      instructions.push(null);

      // Combinar todas as instruções
      const finalPrompt = this.combineInstructions(instructions);

      if (finalPrompt.trim().length === 0) {
        console.log(
          "⚠️ [PromptBuilderService] No instructions available, returning empty prompt",
        );
        return "";
      }

      console.log(
        `✅ [PromptBuilderService] System prompt built successfully (${finalPrompt.length} characters)`,
      );

      return finalPrompt;
    } catch (error) {
      console.error(
        "❌ [PromptBuilderService] Error building system prompt:",
        error,
      );

      // Em caso de erro, retornar prompt vazio para não bloquear o fluxo
      return "";
    }
  }

  /**
   * Retorna informações sobre os serviços disponíveis
   */
  static getServiceInfo() {
    return {
      coreEngine: {
        available: true,
        description: "CoreEngine v1 - Configuration Service",
      },
      teamService: {
        available: false, // TODO: Implementar
        config: null,
      },
      userService: {
        available: false, // TODO: Implementar
        config: null,
      },
    };
  }
}
