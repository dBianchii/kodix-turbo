import { TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import { aiStudioRepository } from "@kdx/db/repositories";

export interface AiStudioServiceParams {
  teamId: string;
  requestingApp: KodixAppId;
}

export class AiStudioService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  private static logAccess(
    action: string,
    params: Pick<AiStudioServiceParams, "teamId" | "requestingApp">,
  ) {
    // Logging opcional para auditoria
    console.log(
      `🔄 [AiStudioService] ${action} by ${params.requestingApp} for team: ${params.teamId}`,
    );
  }

  /**
   * Busca modelo por ID
   * Usado por outros SubApps como Chat
   *
   * IMPORTANTE: Modelos são globais, mas a validação de acesso é via aiTeamModelConfig
   */
  static async getModelById({
    modelId,
    teamId,
    requestingApp,
  }: {
    modelId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getModelById", { teamId, requestingApp });

    const model = await aiStudioRepository.AiModelRepository.findById(modelId);

    if (!model) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Model not found",
      });
    }

    // Verificar se o team tem acesso a este modelo via aiTeamModelConfig
    const teamConfig =
      await aiStudioRepository.AiTeamModelConfigRepository.findByTeamAndModel(
        teamId,
        modelId,
      );

    if (!teamConfig?.enabled) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Model not available for this team",
      });
    }

    console.log(
      `✅ [AiStudioService] Model found: ${model.name} for team: ${teamId}`,
    );

    return model;
  }

  /**
   * Busca modelo padrão do team
   * Usado por outros SubApps como Chat
   */
  static async getDefaultModel({
    teamId,
    requestingApp,
  }: {
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getDefaultModel", { teamId, requestingApp });

    const defaultModel =
      await aiStudioRepository.AiTeamModelConfigRepository.getDefaultModel(
        teamId,
      );

    if (!defaultModel) {
      console.log(
        `⚠️ [AiStudioService] No default model found for team: ${teamId}`,
      );
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No default model configured for this team",
      });
    }

    console.log(
      `✅ [AiStudioService] Default model found for team ${teamId}: ${defaultModel.model.name}`,
    );

    return defaultModel;
  }

  /**
   * Busca modelos disponíveis do team
   * Usado por outros SubApps como Chat
   */
  static async getAvailableModels({
    teamId,
    requestingApp,
  }: {
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getAvailableModels", { teamId, requestingApp });

    const availableModels =
      await aiStudioRepository.AiTeamModelConfigRepository.findAvailableModelsByTeam(
        teamId,
      );

    console.log(
      `✅ [AiStudioService] Found ${availableModels.length} available models for team: ${teamId}`,
    );

    return availableModels;
  }

  /**
   * Busca token do provider
   * Usado por outros SubApps como Chat
   */
  static async getProviderToken({
    providerId,
    teamId,
    requestingApp,
  }: {
    providerId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getProviderToken", { teamId, requestingApp });

    const token =
      await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
        teamId,
        providerId,
      );

    if (!token) {
      console.log(
        `⚠️ [AiStudioService] No token found for provider ${providerId} and team: ${teamId}`,
      );
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No token configured for provider ${providerId}`,
      });
    }

    console.log(
      `✅ [AiStudioService] Token found for provider ${providerId} and team: ${teamId}`,
    );

    return token;
  }
}
