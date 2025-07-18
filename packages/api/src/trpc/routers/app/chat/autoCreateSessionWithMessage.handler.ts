import { TRPCError } from "@trpc/server";

import type { AutoCreateSessionWithMessageInput } from "@kdx/validators/trpc/app";
import { appRepository, chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import { ChatService } from "../../../../internal/services/chat.service";

// Helper para buscar modelo preferido seguindo hierarquia usando Service Layer
async function getPreferredModelHelper(
  teamId: string,
  userId: string,
): Promise<{
  source: "user_config" | "ai_studio_default" | "first_available";
  modelId: string;
  model: any;
  config?: any;
  teamConfig?: any;
}> {
  // ✅ 1ª Prioridade: Verificar preferredModelId nas configurações de USUÁRIO
  try {
    const userConfigs = await appRepository.findUserAppTeamConfigs({
      appId: chatAppId,
      teamIds: [teamId],
      userIds: [userId],
    });

    const userConfig = userConfigs[0]; // Só haverá um config por usuário/app/team
    const preferredModelId = userConfig
      ? (userConfig.config as any)?.personalSettings?.preferredModelId
      : null;

    if (preferredModelId) {
      try {
        const model = await AiStudioService.getModelById({
          modelId: preferredModelId,
          teamId,
          requestingApp: chatAppId,
        });

        if (model) {
          return {
            source: "user_config",
            modelId: model.id,
            model,
            config: userConfig?.config,
          };
        }
      } catch (error) {
        console.log(
          "⚠️ [PREFERRED_MODEL] preferredModelId do User Config inválido, continuando para AI Studio",
        );
      }
    } else {
      console.log(
        "❌ [PREFERRED_MODEL] Nenhum preferredModelId encontrado no User Config",
      );
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar User Config, continuando para AI Studio:",
      error,
    );
  }

  // ✅ 2ª Prioridade: Buscar modelo padrão no AI Studio via Service Layer
  try {
    const defaultModelConfig = await AiStudioService.getDefaultModel({
      teamId,
      requestingApp: chatAppId,
    });

    if (defaultModelConfig.model) {
      console.log(
        "✅ [PREFERRED_MODEL] Modelo padrão do AI Studio encontrado:",
        defaultModelConfig.model.universalModelId,
      );
      return {
        source: "ai_studio_default",
        modelId: defaultModelConfig.model.id,
        model: defaultModelConfig.model,
        teamConfig: defaultModelConfig,
      };
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar modelo padrão do AI Studio:",
      error,
    );
  }

  // ✅ 3ª Prioridade: Buscar primeiro modelo ativo disponível via Service Layer
  try {
    const availableModels = await AiStudioService.getAvailableModels({
      teamId,
      requestingApp: chatAppId,
    });

    const firstActiveModel = (availableModels || []).find(
      (m: any) => m.teamConfig?.enabled,
    );

    if (firstActiveModel) {
      console.log(
        "🔄 [PREFERRED_MODEL] Usando primeiro modelo ativo como fallback:",
        firstActiveModel.universalModelId,
      );
      return {
        source: "first_available",
        modelId: firstActiveModel.id,
        model: firstActiveModel,
        teamConfig: firstActiveModel.teamConfig,
      };
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar modelos disponíveis:",
      error,
    );
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
  });
}

export async function autoCreateSessionWithMessageHandler({
  input,
  ctx,
}: {
  input: AutoCreateSessionWithMessageInput;
  ctx: TProtectedProcedureContext;
}) {
  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  try {
    console.log(
      "🚀 [AUTO_CREATE] Iniciando auto-criação de sessão para team:",
      teamId,
    );

    // 1. Determinar modelo a usar (explícito ou preferido)
    let preferredModel;
    let aiModelId: string;

    if (input.aiModelId) {
      // ✅ NOVO: Validar modelo explícito primeiro
      try {
        const explicitModel = await AiStudioService.getModelById({
          modelId: input.aiModelId,
          teamId,
          requestingApp: chatAppId,
        });

        if (explicitModel) {
          preferredModel = explicitModel;
          aiModelId = input.aiModelId;
          console.log(
            "✅ [AUTO_CREATE] Modelo explícito validado:",
            preferredModel.universalModelId,
          );
        } else {
          throw new Error("Modelo explícito inválido");
        }
      } catch (error) {
        console.warn(
          "⚠️ [AUTO_CREATE] Modelo explícito inválido, usando fallback",
        );
        // Fallback para getPreferredModelHelper
        const fallback = await getPreferredModelHelper(teamId, userId);
        preferredModel = fallback.model;
        aiModelId = fallback.modelId;
      }
    } else {
      // Fallback original: buscar modelo preferido
      try {
        const preferredModelResult = await getPreferredModelHelper(
          teamId,
          userId,
        );

        preferredModel = preferredModelResult.model;
        aiModelId = preferredModelResult.modelId;
      } catch (error) {
        console.error(
          "❌ [AUTO_CREATE] Erro ao buscar modelo preferido:",
          error,
        );
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
        });
      }
    }

    // 2. Gerar título automaticamente (se habilitado)
    let title = "Nova Conversa";

    if (input.generateTitle) {
      try {
        // Buscar token do provider via HTTP
        const providerToken = await AiStudioService.getProviderToken({
          providerId: preferredModel.providerId,
          teamId,
          requestingApp: chatAppId,
        });

        if (providerToken.token) {
          // Configurar API baseada no provider
          const baseUrl =
            preferredModel.provider?.baseUrl || "https://api.openai.com/v1";
          const apiUrl = `${baseUrl}/chat/completions`;

          // Usar configurações do modelo
          const modelConfig = (preferredModel.config || {}) as {
            modelId?: string;
            version?: string;
            maxTokens?: number;
            temperature?: number;
          };
          const modelName =
            modelConfig.modelId || modelConfig.version || preferredModel.name;

          // Prompt para gerar título
          const titlePrompt = [
            {
              role: "system",
              content:
                "Você é um assistente especializado em criar títulos concisos. Crie um título curto (máximo 50 caracteres) que capture a essência da mensagem do usuário. Responda apenas com o título, sem aspas ou formatação adicional.",
            },
            {
              role: "user",
              content: `Crie um título para esta conversa: "${input.firstMessage}"`,
            },
          ];

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${providerToken.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelName,
              messages: titlePrompt,
              max_tokens: 20,
              temperature: 0.7,
            }),
          });

          if (response.ok) {
            const aiResponse = (await response.json()) as any;
            const generatedTitle =
              aiResponse.choices?.[0]?.message?.content?.trim();

            if (generatedTitle && generatedTitle.length <= 50) {
              title = generatedTitle;
            }
          }
        }
      } catch (error) {
        console.log(
          "⚠️ [AUTO_CREATE] Erro ao gerar título, usando padrão:",
          error,
        );
        // Fallback: usar primeiros 50 caracteres da mensagem
        title = input.firstMessage.slice(0, 50);
        if (input.firstMessage.length > 50) {
          title += "...";
        }
      }
    }

    // 3. Criar sessão
    const session = await chatRepository.ChatSessionRepository.create({
      title,
      aiModelId,
      teamId,
      userId,
    });

    if (!session?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao criar sessão de chat",
      });
    }

    // 🎯 NOVO: Criar System Prompt orquestrado (Plataforma + Time)
    try {
      const systemPrompt = await AiStudioService.getSystemPrompt({
        teamId,
        userId,
      });

      if (systemPrompt?.trim()) {
        console.log(
          `🎯 [AUTO_CREATE] Criando System Prompt para sessão: ${session.id}`,
        );

        await ChatService.createSystemMessage({
          chatSessionId: session.id,
          content: systemPrompt,
          metadata: {
            type: "system_prompt",
            source: "platform_and_team_instructions",
            createdAt: new Date().toISOString(),
          },
        });

        console.log(
          `✅ [AUTO_CREATE] System Prompt criado para sessão: ${session.id}`,
        );
      }
    } catch (error) {
      // Log do erro mas não falha a criação da sessão
      console.warn(
        `⚠️ [AUTO_CREATE] Erro ao criar System Prompt para sessão ${session.id}:`,
        error,
      );
    }

    // 4. Criar primeira mensagem do usuário
    const userMessage = await chatRepository.ChatMessageRepository.create({
      chatSessionId: session.id,
      senderRole: "user",
      content: input.firstMessage,
      status: "ok",
    });

    // 5. ✅ CORREÇÃO: Não processar IA aqui para navegação rápida
    // A IA será processada via streaming no frontend
    const aiMessage = null;

    return {
      session,
      userMessage,
      aiMessage,
    };
  } catch (error: any) {
    console.error("❌ [AUTO_CREATE] Erro:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "Erro ao criar sessão automática",
    });
  }
}
