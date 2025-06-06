import { TRPCError } from "@trpc/server";

import type { AutoCreateSessionWithMessageInput } from "@kdx/validators/trpc/app";
import { appRepository, chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

// Helper para buscar modelo preferido seguindo hierarquia usando Service Layer
async function getPreferredModelHelper(
  teamId: string,
  requestingApp: typeof chatAppId,
): Promise<{
  source: "chat_config" | "ai_studio_default" | "first_available";
  modelId: string;
  model: any;
  config?: any;
  teamConfig?: any;
}> {
  // 1ª Prioridade: Verificar lastSelectedModelId no Chat Team Config
  try {
    const chatConfigs = await appRepository.findAppTeamConfigs({
      appId: chatAppId,
      teamIds: [teamId],
    });

    const chatConfig = chatConfigs.find(
      (config: any) => config.teamId === teamId,
    );
    const lastSelectedModelId = chatConfig
      ? (chatConfig.config as any)?.lastSelectedModelId
      : null;

    if (lastSelectedModelId) {
      console.log(
        "✅ [PREFERRED_MODEL] Encontrado lastSelectedModelId:",
        lastSelectedModelId,
      );

      try {
        // ✅ NOVO: Usar Service Layer ao invés de HTTP
        const model = await AiStudioService.getModelById({
          modelId: lastSelectedModelId,
          teamId,
          requestingApp,
        });

        if (model) {
          console.log("✅ [PREFERRED_MODEL] Modelo encontrado:", model.name);
          return {
            source: "chat_config",
            modelId: model.id,
            model,
            config: chatConfig?.config,
          };
        }
      } catch (error) {
        console.log(
          "⚠️ [PREFERRED_MODEL] lastSelectedModelId inválido, continuando para próximo fallback",
        );
      }
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar chat config, continuando para AI Studio:",
      error,
    );
  }

  // 2ª Prioridade: Buscar modelo padrão no AI Studio via Service Layer
  try {
    // ✅ NOVO: Usar Service Layer ao invés de HTTP
    const defaultModelConfig = await AiStudioService.getDefaultModel({
      teamId,
      requestingApp,
    });

    if (defaultModelConfig.model) {
      console.log(
        "✅ [PREFERRED_MODEL] Modelo padrão do AI Studio encontrado:",
        defaultModelConfig.model.name,
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

  // 3ª Prioridade: Buscar primeiro modelo ativo disponível via Service Layer
  try {
    // ✅ NOVO: Usar Service Layer ao invés de HTTP
    const availableModels = await AiStudioService.getAvailableModels({
      teamId,
      requestingApp,
    });

    const firstActiveModel = (availableModels || []).find(
      (m: any) => m.teamConfig?.enabled,
    );

    if (firstActiveModel) {
      console.log(
        "🔄 [PREFERRED_MODEL] Usando primeiro modelo ativo como fallback:",
        firstActiveModel.name,
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

    // 1. Buscar modelo preferido
    let preferredModel;
    let aiModelId: string;

    try {
      // Chamar getPreferredModel internamente
      const preferredModelResult = await getPreferredModelHelper(
        teamId,
        chatAppId,
      );

      preferredModel = preferredModelResult.model;
      aiModelId = preferredModelResult.modelId;

      console.log(
        "✅ [AUTO_CREATE] Modelo preferido encontrado:",
        preferredModel.name,
      );
    } catch (error) {
      console.error("❌ [AUTO_CREATE] Erro ao buscar modelo preferido:", error);
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
      });
    }

    // 2. Gerar título automaticamente (se habilitado)
    let title = "Nova Conversa";

    if (input.generateTitle) {
      try {
        console.log("🤖 [AUTO_CREATE] Gerando título automático...");

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
            version?: string;
            maxTokens?: number;
            temperature?: number;
          };
          const modelName = modelConfig.version || preferredModel.name;

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
              console.log("✅ [AUTO_CREATE] Título gerado:", title);
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

    console.log("✅ [AUTO_CREATE] Sessão criada:", session.id);

    // 4. Criar primeira mensagem do usuário
    const userMessage = await chatRepository.ChatMessageRepository.create({
      chatSessionId: session.id,
      senderRole: "user",
      content: input.firstMessage,
      status: "ok",
    });

    console.log("✅ [AUTO_CREATE] Primeira mensagem criada");

    // 5. Se useAgent, processar resposta da IA
    let aiMessage = null;
    if (input.useAgent) {
      try {
        // Buscar token do provider via HTTP
        const providerToken = await AiStudioService.getProviderToken({
          providerId: preferredModel.providerId,
          teamId,
          requestingApp: chatAppId,
        });

        if (!providerToken.token) {
          throw new Error(
            `Token não configurado para o provider ${preferredModel.provider?.name || "provider"}`,
          );
        }

        // Configurar API baseada no provider
        const baseUrl =
          preferredModel.provider?.baseUrl || "https://api.openai.com/v1";
        const apiUrl = `${baseUrl}/chat/completions`;

        // Usar configurações do modelo
        const modelConfig = (preferredModel.config || {}) as {
          version?: string;
          maxTokens?: number;
          temperature?: number;
        };
        const modelName = modelConfig.version || preferredModel.name;
        const maxTokens = modelConfig.maxTokens || 500;
        const temperature = modelConfig.temperature || 0.7;

        // Fazer chamada para IA
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: "user",
                content: input.firstMessage,
              },
            ],
            max_tokens: maxTokens,
            temperature: temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro na API do ${preferredModel.provider?.name || "provider"}: ${response.status} - ${errorText}`,
          );
        }

        const aiResponse = (await response.json()) as any;
        const aiContent =
          aiResponse.choices?.[0]?.message?.content ||
          "Desculpe, não consegui gerar uma resposta.";

        // Salvar resposta da IA
        aiMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: session.id,
          senderRole: "ai",
          content: aiContent,
          status: "ok",
        });

        console.log("✅ [AUTO_CREATE] Resposta da IA processada");
      } catch (aiError) {
        console.error("⚠️ [AUTO_CREATE] Erro ao processar com IA:", aiError);

        // Salvar mensagem de erro da IA
        aiMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: session.id,
          senderRole: "ai",
          content: `Erro: ${aiError instanceof Error ? aiError.message : "Erro ao processar mensagem"}`,
          status: "error",
        });
      }
    }

    console.log(
      "🎉 [AUTO_CREATE] Sessão criada com sucesso!",
      session.id,
      "- Título:",
      title,
    );

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
