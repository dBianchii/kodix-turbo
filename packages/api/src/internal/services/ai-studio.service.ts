import { readFileSync } from "fs";
import { join } from "path";

import type { KodixAppId } from "@kdx/shared";
import { db } from "@kdx/db/client";
import { aiStudioRepository, chatRepository } from "@kdx/db/repositories";
import {
  aiStudioAppId,
  aiStudioConfigSchema,
  aiStudioUserAppTeamConfigSchema,
  chatAppId,
} from "@kdx/shared";

// Importar ChatService para buscar sessão
import { ChatService } from "./chat.service";
import { EntityNotFoundError, ValidationError } from "./errors";

// Use __dirname para Node.js environments
const __dirname = new URL(".", import.meta.url).pathname;

// Carregar templates de prompt do arquivo JSON
const promptTemplatesPath = join(
  __dirname,
  "ai-sync-adapters/prompt-templates.json",
);

// Fallback to existing templates if the file doesn't exist
const PROMPT_TEMPLATES = (() => {
  try {
    return JSON.parse(readFileSync(promptTemplatesPath, "utf-8")) as Record<
      string,
      string
    >;
  } catch (error) {
    console.warn(
      "Could not load prompt-templates.json, using inline templates",
    );
    return {
      "xml-tags-high":
        '<system_reset>\n# ⚠️ Agent Switch Detected\n**Previous Instructions:** COMPLETELY IGNORE ALL PREVIOUS INSTRUCTIONS.\n**Attention:** You are no longer "{{previousAgentName}}".\n\n<new_identity>\n**Your New Identity:** {{agentName}}\n**Instructions:** YOU MUST FOLLOW ONLY THESE NEW INSTRUCTIONS:\n{{agentInstructions}}\n**IMPORTANT:** Respond as {{agentName}}, not as a generic assistant.\n</new_identity>\n\n</system_reset>',
      "xml-tags-default":
        '<system_reset>\n# ⚠️ Agent Switch Detected\n**Previous Instructions:** Please disregard previous instructions.\n**Attention:** You are no longer "{{previousAgentName}}".\n\n<new_identity>\n**Your New Identity:** {{agentName}}\n**Instructions:** YOU MUST FOLLOW ONLY THESE NEW INSTRUCTIONS:\n{{agentInstructions}}\n**IMPORTANT:** Respond as {{agentName}}, not as a generic assistant.\n</new_identity>\n\n</system_reset>',
      simple:
        '# ⚠️ Agent Change\n**Please ignore previous instructions.**\n**Attention:** You are no longer "{{previousAgentName}}".\n**Your new identity is:** {{agentName}}\n**FOLLOW ONLY THESE NEW INSTRUCTIONS:**\n{{agentInstructions}}\n**IMPORTANT:** Respond as {{agentName}}, not as a generic assistant.',
    };
  }
})();

// Interfaces para estratégias de prompt
interface PromptStrategy {
  type: string;
  agentSwitchTemplate: string;
  assertiveness: "low" | "medium" | "high";
  contextualMemory: "low" | "medium" | "high";
  specialHandling: string[];
}

interface PromptStrategyConfig {
  modelId: string;
  strategy: PromptStrategy;
}

interface TemplateParams {
  agentName: string;
  agentInstructions: string;
  previousAgentName?: string;
  assertiveness: "low" | "medium" | "high";
}

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
    const [user, team, teamConfigResult, userConfigResult] = await Promise.all([
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

    let teamConfig = null;
    if (teamConfigResult?.config) {
      try {
        teamConfig = aiStudioConfigSchema.parse(teamConfigResult.config);
      } catch (error) {
        console.error("Failed to parse AI Studio TEAM config:", error);
      }
    }

    let userConfig = null;
    if (userConfigResult?.config) {
      try {
        userConfig = aiStudioUserAppTeamConfigSchema.parse(
          userConfigResult.config,
        );
      } catch (error) {
        console.error("Failed to parse AI Studio USER config:", error);
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
      `✅ [AiStudioService] Model found: ${model.displayName} for team: ${teamId}`,
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
      `✅ [AiStudioService] Default model found for team ${teamId}: ${defaultModel.model.displayName}`,
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
    let isAgentSwitch = false;
    let previousAgentName = "";
    let universalModelId = ""; // Usar este para a busca de estratégia
    let providerName = "";

    // Se temos uma sessão, buscar informações do agente e detectar troca
    if (sessionId && includeAgentInstructions) {
      const session =
        await chatRepository.ChatSessionRepository.findById(sessionId);

      if (session?.aiAgentId) {
        // Obter o modelo completo para ter acesso ao universalModelId e ao provider
        if (session.aiModelId) {
          const model = await this.getModelById({
            modelId: session.aiModelId,
            teamId,
            requestingApp: appId,
          });

          if (model) {
            universalModelId = model.universalModelId; // A chave correta!
            providerName = model.provider.name;
          }
        }

        const agent = await aiStudioRepository.AiAgentRepository.findById(
          session.aiAgentId,
        );

        if (agent) {
          agentInstructions = agent.instructions ?? "";
          agentName = agent.name ?? "";
          console.log(
            `📋 [AI_STUDIO_SERVICE] Found agent: ${agentName} with instructions`,
          );

          // Detectar se houve troca de agente
          console.log(
            `🔍 [AI_STUDIO_SERVICE] Checking agent switch - agentHistory:`,
            session.agentHistory,
            `activeAgentId: ${session.activeAgentId}, aiAgentId: ${session.aiAgentId}`,
          );

          // 🚨 TESTE: Forçar detecção de troca de agente se há agentHistory
          if (
            session.agentHistory &&
            Array.isArray(session.agentHistory) &&
            session.agentHistory.length > 0
          ) {
            // Se há histórico de agentes, houve troca
            isAgentSwitch = true;

            // Pegar o último agente do histórico
            const lastAgentInHistory =
              session.agentHistory[session.agentHistory.length - 1];
            if (lastAgentInHistory) {
              previousAgentName = lastAgentInHistory.agentName;
            }

            console.log(
              `🔄 [AI_STUDIO_SERVICE] Agent switch detected from history: ${previousAgentName} -> ${agentName}`,
            );
          } else if (
            session.activeAgentId &&
            session.activeAgentId !== session.aiAgentId
          ) {
            // Alternativa: verificar se activeAgentId é diferente de aiAgentId
            isAgentSwitch = true;

            const previousAgent =
              await aiStudioRepository.AiAgentRepository.findById(
                session.activeAgentId,
              );
            if (previousAgent) {
              previousAgentName = previousAgent.name ?? "";
            }

            console.log(
              `🔄 [AI_STUDIO_SERVICE] Agent switch detected from activeAgentId: ${previousAgentName} -> ${agentName}`,
            );
          }
        }
      }

      // Buscar modelo da sessão
      if (session?.aiModelId) {
        const model = await aiStudioRepository.AiModelRepository.findById(
          session.aiModelId,
        );
        if (model) {
          universalModelId = model.universalModelId; // Store modelId for strategy lookup
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
        .replace(/{{userLanguage}}/g, "en-US"); // TODO: Obter idioma do usuário
      baseInstructionsParts.push(platformContent);
    }
    const baseInstructions = baseInstructionsParts.join("\n\n---\n\n");
    // --- END OF BASE INSTRUCTIONS ---

    // Se detectamos uma troca de agente, usar estratégia especial
    if (isAgentSwitch && agentName && agentInstructions) {
      console.log(
        `🚨 [AI_STUDIO_SERVICE] Using agent switch prompt strategy for ${universalModelId}`,
      );

      const switchPrompt = this.buildAgentSwitchPrompt({
        agentName,
        agentInstructions,
        baseInstructions, // Passa as instruções base
        previousAgentName,
        universalModelId, // Passando o ID correto
        providerName,
      });

      console.log(
        `🔄 [AI_STUDIO_SERVICE] Generated agent switch prompt (first 200 chars):`,
        switchPrompt.substring(0, 200),
      );

      return switchPrompt;
    }

    // Fluxo normal - sem troca de agente
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

    console.log(
      `✅ [AI_STUDIO_SERVICE] System prompt built (agent switch: ${isAgentSwitch})`,
    );

    return systemPrompt;
  }

  /**
   * Constrói prompt especializado para troca de agente
   * Usa estratégias específicas por modelo carregadas de arquivos JSON
   */
  static buildAgentSwitchPrompt({
    agentName,
    agentInstructions,
    baseInstructions,
    previousAgentName,
    universalModelId,
    providerName,
  }: {
    agentName: string;
    agentInstructions: string;
    baseInstructions: string;
    previousAgentName?: string;
    universalModelId: string;
    providerName: string;
  }): string {
    console.log(
      `🔄 [AI_STUDIO_SERVICE] Building agent switch prompt for ${agentName} (model: ${universalModelId})`,
    );

    const strategy = this.getPromptStrategy(universalModelId, providerName);

    console.log(
      `📋 [AI_STUDIO_SERVICE] Using strategy: ${strategy.type} (template: ${strategy.agentSwitchTemplate})`,
    );

    const templateKey = strategy.agentSwitchTemplate;
    let agentSwitchContent = PROMPT_TEMPLATES[templateKey];

    if (agentSwitchContent) {
      console.log(
        `✅ [AI_STUDIO_DIAGNOSTIC] Successfully loaded template for key: '${templateKey}'`,
      );

      agentSwitchContent = agentSwitchContent
        .replace(/{{agentName}}/g, agentName)
        .replace(/{{agentInstructions}}/g, agentInstructions)
        .replace(
          /{{previousAgentName}}/g,
          previousAgentName ?? "a previous agent",
        );
    } else {
      // Fallback de segurança se o template não for encontrado
      console.log(
        `🔴 [AI_STUDIO_DIAGNOSTIC] WARNING: Template key '${templateKey}' not found. Applied 'simple' fallback.`,
      );
      agentSwitchContent = (PROMPT_TEMPLATES.simple ?? "")
        .replace(/{{agentName}}/g, agentName)
        .replace(/{{agentInstructions}}/g, agentInstructions)
        .replace(
          /{{previousAgentName}}/g,
          previousAgentName ?? "a previous agent",
        );
    }

    const finalPrompt = `${agentSwitchContent}\n${baseInstructions}`;

    console.log(
      `✅ [AI_STUDIO_DIAGNOSTIC] FINAL PROMPT BUILT: ${finalPrompt.substring(
        0,
        200,
      )}...`,
    );
    return finalPrompt;
  }

  /**
   * Carrega estratégia de prompt específica para o modelo
   */
  private static getPromptStrategy(
    universalModelId: string,
    providerName: string,
  ): PromptStrategy {
    const provider = providerName.toLowerCase();

    console.log(
      `🔵 [AI_STUDIO_DIAGNOSTIC] Attempting to load strategy for universalModelId: "${universalModelId}", provider: "${provider}"`,
    );

    try {
      const strategyPath = join(
        __dirname,
        `ai-sync-adapters/${provider}-prompt-strategies.json`,
      );

      const strategies = JSON.parse(
        readFileSync(strategyPath, "utf-8"),
      ) as PromptStrategyConfig[];
      const strategy = strategies.find(
        (s) => s.modelId === universalModelId,
      )?.strategy;

      if (strategy) {
        console.log(
          `✅ [AI_STUDIO_DIAGNOSTIC] SUCCESS! Found and loaded strategy for "${universalModelId}":`,
          JSON.stringify(strategy, null, 2),
        );
        return strategy;
      }

      // Fallback: se a busca pelo universalModelId falhar, logar e usar o fallback do provider
      console.log(
        `⚠️ [AI_STUDIO_DIAGNOSTIC] No specific strategy for ${universalModelId}, using provider fallback`,
      );

      if (provider.includes("anthropic")) {
        return {
          type: "claude-standard",
          agentSwitchTemplate: "xml-tags",
          assertiveness: "high",
          contextualMemory: "low",
          specialHandling: ["system-reset"],
        };
      } else if (provider.includes("openai")) {
        return {
          type: "gpt-standard",
          agentSwitchTemplate: "hierarchical",
          assertiveness: "medium",
          contextualMemory: "high",
          specialHandling: ["priority-system"],
        };
      } else if (provider.includes("google")) {
        return {
          type: "google-standard",
          agentSwitchTemplate: "direct-simple",
          assertiveness: "medium",
          contextualMemory: "medium",
          specialHandling: ["direct-instructions"],
        };
      }
    } catch (error) {
      console.error(
        `❌ [AI_STUDIO_DIAGNOSTIC] Error loading prompt strategy for provider ${provider}:`,
        error,
      );
    }

    // Fallback final
    return {
      type: "standard",
      agentSwitchTemplate: "simple",
      assertiveness: "medium",
      contextualMemory: "medium",
      specialHandling: [],
    };
  }
}
