import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { streamText } from "ai";

import type { KodixAppId } from "@kdx/shared";
import { db } from "@kdx/db/client";
import { aiStudioRepository, chatRepository } from "@kdx/db/repositories";
import {
  aiStudioAppId,
  aiStudioConfigSchema,
  aiStudioUserAppTeamConfigSchema,
  chatAppId,
} from "@kdx/shared";

// ChatService is imported but used in commented code for future reference
import { EntityNotFoundError, ValidationError } from "./errors";

// Platform Instructions (Level 1) <instructions>
const PLATFORM_BASE_INSTRUCTIONS = {
  template: `
# ASSISTANT PROFILE
You are an AI assistant for the Kodix platform.

## INTERACTION CONTEXT
- User Name: {{userName}}
- Team: {{teamName}}
- User Language: {{userLanguage}}

## GENERAL RULES (MUST BE FOLLOWED)
- Always respond in the user's language: {{userLanguage}}.
- Maintain a professional and helpful tone.
- Remember the conversation history to maintain context.
- If you don't know the answer, honestly admit your limitations.`,
  enabled: true,
} as const;

export interface AiStudioServiceParams {
  teamId: string;
  requestingApp: KodixAppId;
}

export class AiStudioService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new ValidationError("teamId is required for cross-app access");
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
   * Busca configurações de AI do usuário e time
   */
  private static async getAiConfig(teamId: string, userId: string) {
    const results = await Promise.allSettled([
      db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        columns: { name: true },
      }),
      db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.id, teamId),
        columns: { name: true },
      }),
      // Configurações do time
      db.query.appTeamConfigs.findFirst({
        where: (configs, { eq, and }) =>
          and(eq(configs.appId, aiStudioAppId), eq(configs.teamId, teamId)),
        columns: { config: true },
      }),
      // Configurações do usuário para o time
      db.query.userAppTeamConfigs.findFirst({
        where: (configs, { eq, and }) =>
          and(
            eq(configs.appId, aiStudioAppId),
            eq(configs.teamId, teamId),
            eq(configs.userId, userId),
          ),
        columns: { config: true },
      }),
    ]);

    const [userResult, teamResult, teamConfigResult, userConfigResult] =
      results;
    const user = userResult.status === "fulfilled" ? userResult.value : null;
    const team = teamResult.status === "fulfilled" ? teamResult.value : null;
    const teamConfigData =
      teamConfigResult.status === "fulfilled" ? teamConfigResult.value : null;
    const userConfigData =
      userConfigResult.status === "fulfilled" ? userConfigResult.value : null;

    let teamConfig = null;
    if (teamConfigData?.config) {
      try {
        teamConfig = aiStudioConfigSchema.parse(teamConfigData.config);
      } catch (_error) {
        console.error("Failed to parse AI Studio TEAM config:", _error);
      }
    }

    let userConfig = null;
    if (userConfigData?.config) {
      try {
        userConfig = aiStudioUserAppTeamConfigSchema.parse(
          userConfigData.config,
        );
      } catch (_error) {
        console.error("Failed to parse AI Studio USER config:", _error);
      }
    }

    return {
      user: user ?? { name: "" },
      team: team ?? { name: "" },
      teamConfig,
      userConfig,
    };
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
      throw new EntityNotFoundError("Model", modelId);
    }

    // Verificar se o team tem acesso a este modelo via aiTeamModelConfig
    const teamConfig =
      await aiStudioRepository.AiTeamModelConfigRepository.findByTeamAndModel(
        teamId,
        modelId,
      );

    if (!teamConfig?.enabled) {
      throw new EntityNotFoundError(
        "Model",
        `${modelId} (not available for team ${teamId})`,
      );
    }

    console.log(
      `✅ [AiStudioService] Model found: ${model.modelId} for team: ${teamId}`,
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
      throw new EntityNotFoundError("DefaultModel", `team ${teamId}`);
    }

    console.log(
      `✅ [AiStudioService] Default model found for team ${teamId}: ${defaultModel.model.modelId}`,
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
      throw new EntityNotFoundError(
        "ProviderToken",
        `${providerId} for team ${teamId}`,
      );
    }

    console.log(
      `✅ [AiStudioService] Token found for provider ${providerId} and team: ${teamId}`,
    );

    return token;
  }

  /**
   * Busca instruções globais do team
   * PRIVATE - Usado internamente pelo getSystemPrompt
   */
  private static async getTeamInstructions({
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
    if (!teamConfig) {
      console.log(
        `⚠️ [AiStudioService] No team config found for team: ${teamId}`,
      );
      return null;
    }

    // Parse config usando schema
    const parsedConfig = aiStudioConfigSchema.parse(teamConfig.config);

    if (!parsedConfig.teamInstructions.enabled) {
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
   * Orquestrador central do systemPrompt
   * Consolida instruções: Plataforma + Time + Usuário + Agente (se sessionId fornecido)
   */
  static async getSystemPrompt({
    sessionId,
    teamId,
    userId,
    appId = chatAppId,
    includeAgentInstructions = true,
  }: {
    sessionId?: string;
    teamId: string;
    userId: string;
    appId?: KodixAppId;
    includeAgentInstructions?: boolean;
  }): Promise<string> {
    console.log(
      `🔍 [AI_STUDIO_SERVICE] Getting system prompt for sessionId: ${sessionId}, appId: ${appId}`,
    );

    const { user, team, teamConfig, userConfig } = await this.getAiConfig(
      teamId,
      userId,
    );

    let agentInstructions = "";
    let agentName = "";

    // Se temos uma sessão, buscar informações do agente e detectar troca
    if (sessionId && includeAgentInstructions) {
      const session =
        await chatRepository.ChatSessionRepository.findById(sessionId);

      if (session?.aiAgentId) {
        const agent = await aiStudioRepository.AiAgentRepository.findById(
          session.aiAgentId,
        );

        if (agent) {
          agentInstructions = agent.instructions ?? "";
          agentName = agent.name ?? "";
          console.log(
            `📋 [AI_STUDIO_SERVICE] Found agent: ${agentName} with instructions`,
          );
        }
      }
    }

    // --- BASE INSTRUCTIONS CONSTRUCTION ---
    // Monta as instruções base (sem o agente) que são comuns a ambos os fluxos.
    const baseInstructionsParts: string[] = [];

    // Nível 2: Instruções Pessoais do Usuário
    if (
      userConfig?.userInstructions?.enabled &&
      userConfig.userInstructions.content
    ) {
      baseInstructionsParts.push(
        `## PERSONAL USER INSTRUCTIONS (APPLY ONLY TO YOU)\n${userConfig.userInstructions.content}`,
      );
    }

    // Nível 3: Instruções do Time
    if (
      teamConfig?.teamInstructions?.enabled &&
      teamConfig.teamInstructions.content
    ) {
      baseInstructionsParts.push(
        `## TEAM INSTRUCTIONS (APPLY TO THE ENTIRE TEAM)\n${teamConfig.teamInstructions.content}`,
      );
    }

    // Nível 4 (Base): Instruções da Plataforma
    if (PLATFORM_BASE_INSTRUCTIONS.enabled) {
      const platformContent = PLATFORM_BASE_INSTRUCTIONS.template
        .replace("{{userName}}", user.name ?? "User")
        .replace("{{teamName}}", team.name ?? "Team")
        .replace(/{{userLanguage}}/g, "pt-BR"); // TODO: Obter idioma do usuário
      baseInstructionsParts.push(platformContent);
    }
    const baseInstructions = baseInstructionsParts.join("\n\n---\n\n");
    // --- END OF BASE INSTRUCTIONS ---

    // Build normal prompt with agent instructions
    if (agentName && agentInstructions) {
      console.log(
        `📝 [AI_STUDIO_SERVICE] Building normal prompt with agent instructions`,
      );

      // Nível 1 (Prioridade): Instruções do Agente
      const fullInstructions = [
        `## AGENT INSTRUCTIONS - YOU ARE: ${agentName}\n${agentInstructions}`,
        baseInstructions,
      ].join("\n\n---\n\n");

      console.log(
        `📝 [AI_STUDIO_SERVICE] Generated prompt (first 200 chars):`,
        fullInstructions.substring(0, 200),
      );

      return fullInstructions;
    }

    // Normal flow - build system prompt
    const finalParts: string[] = [];

    // Nível 1 (Prioridade Máxima): Instruções do Agente
    if (agentInstructions && includeAgentInstructions) {
      finalParts.push(
        `## AGENT INSTRUCTIONS (YOUR PRIMARY IDENTITY)\n${agentInstructions}`,
      );
    }

    // Adiciona as instruções base
    if (baseInstructions) {
      finalParts.push(baseInstructions);
    }

    if (finalParts.length === 0) {
      console.log(
        `⚠️ [AI_STUDIO_SERVICE] No system prompt instructions found for team ${teamId}`,
      );
      return "";
    }

    // A ordem no array já é da maior para a menor prioridade.
    const systemPrompt = finalParts.join("\n\n---\n\n");

    console.log(`✅ [AI_STUDIO_SERVICE] System prompt built successfully`);

    return systemPrompt;
  }
  public static async createAIProvider(
    model: any,
    token: string,
  ): Promise<{ provider: any; modelName: string }> {
    const providerName = model.provider.name.toLowerCase();
    const modelConfig = model.config;
    const modelName =
      modelConfig?.modelId || modelConfig?.version || model.modelId;

    switch (providerName) {
      case "openai":
        return {
          provider: createOpenAI({
            apiKey: token,
            baseURL: model.provider.baseUrl || undefined,
          })(modelName),
          modelName,
        };

      case "anthropic":
        return {
          provider: createAnthropic({
            apiKey: token,
            baseURL: model.provider.baseUrl || undefined,
          })(modelName),
          modelName,
        };

      case "google":
        return {
          provider: createGoogleGenerativeAI({
            apiKey: token,
          })(modelName),
          modelName,
        };

      case "xai":
        return {
          provider: createXai({
            apiKey: token,
            baseURL: model.provider.baseUrl || undefined,
            headers: {
              Accept: "text/event-stream",
              "Cache-Control": "no-cache",
            },
          })(modelName),
          modelName,
        };

      default:
        throw new Error(`Provider ${model.provider.name} not supported`);
    }
  }

  /**
   * Centralized streaming method for AI chat responses
   * Encapsulates all Vercel AI SDK logic
   */
  static async streamChatResponse({
    messages,
    sessionId,
    userId,
    teamId,
    modelId,
    temperature = 0.7,
    maxTokens = 4000,
    onMessageSave,
    onError,
  }: {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    sessionId: string;
    userId: string;
    teamId: string;
    modelId?: string;
    temperature?: number;
    maxTokens?: number;
    onMessageSave?: (message: any) => Promise<void>;
    onError?: (error: Error) => void;
  }) {
    try {
      // 1. Get or determine model
      let model;
      if (modelId) {
        model = await this.getModelById({
          modelId,
          teamId,
          requestingApp: chatAppId,
        });
      } else {
        const availableModels = await this.getAvailableModels({
          teamId,
          requestingApp: chatAppId,
        });
        if (availableModels.length === 0) {
          throw new Error("No AI models available");
        }
        model = availableModels[0]!;
      }

      // 2. Get provider token
      const providerToken = await this.getProviderToken({
        providerId: model.providerId,
        teamId,
        requestingApp: chatAppId,
      });

      // 3. Create provider instance
      const { provider: vercelModel, modelName } = await this.createAIProvider(
        model,
        providerToken.token,
      );

      // 4. Get system prompt (includes agent instructions if applicable)
      const systemPrompt = await this.getSystemPrompt({
        teamId,
        userId,
        sessionId,
      });

      // 5. Format messages with system prompt
      const formattedMessages = systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }, ...messages]
        : messages;

      // 6. Execute streaming with Vercel AI SDK
      const result = streamText({
        model: vercelModel,
        messages: formattedMessages,
        temperature,
        maxTokens,
        onFinish: async ({ text, usage, finishReason }: any) => {
          // Build metadata
          const metadata = {
            requestedModel: modelName,
            actualModelUsed: modelName,
            providerId: model.providerId,
            providerName: model.provider.name,
            usage: usage || null,
            finishReason: finishReason || "stop",
            timestamp: new Date().toISOString(),
          };

          // Call the save callback if provided
          if (onMessageSave) {
            await onMessageSave({
              content: text,
              metadata,
            });
          }
        },
        onError: (error: any) => {
          console.error("[AiStudioService] Stream error:", error);
          if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)));
          }
        },
      });

      // 7. Return the stream with proper headers
      return result.toDataStreamResponse({
        headers: {
          "Transfer-Encoding": "chunked",
          Connection: "keep-alive",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Accel-Buffering": "no",
          "Content-Encoding": "none",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } catch (error) {
      console.error("[AiStudioService] streamChatResponse error:", error);
      throw error;
    }
  }
}
