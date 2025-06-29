import { TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import { db } from "@kdx/db/client";
import { aiStudioRepository } from "@kdx/db/repositories";
import { aiStudioAppId, aiStudioConfigSchema, chatAppId } from "@kdx/shared";

import { PromptBuilderService } from "./prompt-builder.service";

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

  /**
   * Busca instruções globais do team
   * Usado por outros SubApps como Chat
   */
  static async getTeamInstructions({
    teamId,
    requestingApp,
  }: {
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getTeamInstructions", { teamId, requestingApp });

    // Buscar config diretamente do banco usando query
    const teamConfig = await db.query.appTeamConfigs.findFirst({
      where: (appTeamConfig, { eq, and }) =>
        and(
          eq(appTeamConfig.appId, aiStudioAppId),
          eq(appTeamConfig.teamId, teamId),
        ),
      columns: {
        config: true,
      },
    });
    if (!teamConfig?.config) {
      console.log(
        `⚠️ [AiStudioService] No team config found for team: ${teamId}`,
      );
      return null;
    }

    // Parse config usando schema
    const parsedConfig = aiStudioConfigSchema.parse(teamConfig.config);

    if (!parsedConfig.teamInstructions?.enabled) {
      console.log(
        `⚠️ [AiStudioService] No team instructions enabled for team: ${teamId}`,
      );
      return null;
    }

    const { content, appliesTo } = parsedConfig.teamInstructions;

    // Verificar se aplica ao app solicitante
    if (appliesTo === "chat" && requestingApp !== chatAppId) {
      console.log(
        `⚠️ [AiStudioService] Team instructions only apply to chat app, requested by: ${requestingApp}`,
      );
      return null;
    }

    console.log(
      `✅ [AiStudioService] Team instructions found for team: ${teamId}`,
    );

    return {
      content,
      appliesTo,
    };
  }

  /**
   * Constrói o prompt completo do sistema para chat
   * Usado por outros SubApps como Chat para obter instruções finais
   */
  static async getSystemPromptForChat({
    userId,
    teamId,
    requestingApp,
  }: {
    userId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getSystemPromptForChat", { teamId, requestingApp });

    try {
      const systemPrompt = await PromptBuilderService.buildFinalSystemPrompt({
        userId,
        teamId,
        requestingApp,
      });

      console.log(
        `✅ [AiStudioService] System prompt built for chat (${systemPrompt.length} characters) - team: ${teamId}, user: ${userId}`,
      );

      return {
        prompt: systemPrompt,
        length: systemPrompt.length,
        hasContent: systemPrompt.trim().length > 0,
      };
    } catch (error) {
      console.error(
        "❌ [AiStudioService] Error building system prompt:",
        error,
      );

      // Retornar prompt vazio em caso de erro para não bloquear o chat
      return {
        prompt: "",
        length: 0,
        hasContent: false,
        error: "Failed to build system prompt",
      };
    }
  }
}
