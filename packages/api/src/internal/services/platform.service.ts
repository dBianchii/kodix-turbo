import { TRPCError } from "@trpc/server";

import { db } from "@kdx/db/client";

import { aiStudioConfig } from "../config/ai-studio.config";

/**
 * PlatformService - Responsável por gerenciar as Instruções da Plataforma (Nível 1)
 *
 * Este serviço processa o template de instruções base da plataforma,
 * substituindo variáveis dinâmicas com dados do usuário.
 *
 * Funcionalidades:
 * - Lê o template das instruções da plataforma
 * - Busca dados do usuário no banco de dados
 * - Substitui variáveis dinâmicas ({{userName}}, {{userLanguage}}, etc.)
 * - Retorna as instruções processadas prontas para uso
 */
export class PlatformService {
  /**
   * Valida se o userId foi fornecido
   */
  private static validateUserId(userId: string) {
    if (!userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "userId is required for platform instructions",
      });
    }
  }

  /**
   * Substitui variáveis dinâmicas no template com dados do usuário
   */
  private static substituteVariables(
    template: string,
    userData: {
      userName: string;
      userLanguage: string;
      teamName: string;
    },
  ): string {
    let result = template;

    // Substituir todas as variáveis dinâmicas
    result = result.replace(/\{\{userName\}\}/g, userData.userName);
    result = result.replace(/\{\{userLanguage\}\}/g, userData.userLanguage);
    result = result.replace(/\{\{teamName\}\}/g, userData.teamName);

    return result;
  }

  /**
   * Constrói as instruções da plataforma para um usuário específico
   *
   * @param userId - ID do usuário para buscar dados personalizados
   * @returns String com as instruções processadas ou null se desabilitado
   */
  static async buildInstructionsForUser(
    userId: string,
  ): Promise<string | null> {
    this.validateUserId(userId);

    // Verificar se as instruções da plataforma estão habilitadas
    if (!aiStudioConfig.platformInstructions.enabled) {
      console.log("📋 [PlatformService] Platform instructions are disabled");
      return null;
    }

    try {
      // Buscar dados do usuário no banco
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        columns: {
          id: true,
          name: true,
          email: true,
        },
        with: {
          ActiveTeam: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user) {
        console.log(`⚠️ [PlatformService] User not found: ${userId}`);
        // Retornar template com variáveis não substituídas
        return aiStudioConfig.platformInstructions.template;
      }

      // Preparar dados para substituição
      const userData = {
        userName: user.name || user.email || "Usuário",
        userLanguage: "pt-BR", // Default para português, pode ser expandido futuramente
        teamName: user.ActiveTeam?.name || "Equipe",
      };

      // Processar template substituindo variáveis
      const processedInstructions = this.substituteVariables(
        aiStudioConfig.platformInstructions.template,
        userData,
      );

      console.log(
        `✅ [PlatformService] Platform instructions built for user: ${user.name || user.email}`,
      );

      return processedInstructions;
    } catch (error) {
      console.error("❌ [PlatformService] Error building instructions:", error);

      // Em caso de erro, retornar template original para não bloquear o fluxo
      return aiStudioConfig.platformInstructions.template;
    }
  }

  /**
   * Retorna informações sobre a configuração da plataforma
   */
  static getConfigInfo() {
    return {
      enabled: aiStudioConfig.platformInstructions.enabled,
      hasTemplate: !!aiStudioConfig.platformInstructions.template,
      templateLength: aiStudioConfig.platformInstructions.template.length,
    };
  }
}
