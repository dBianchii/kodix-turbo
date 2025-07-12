import { TRPCError } from "@trpc/server";

import type { CreateEmptySessionInput } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import { ChatService } from "../../../../internal/services/chat.service";

// Tipos para o modelo
interface ModelToUse {
  id: string;
  displayName: string;
  providerId: string;
  provider?: { baseUrl?: string | null };
  config?: unknown;
}

export async function createEmptySessionHandler({
  input,
  ctx,
}: {
  input: CreateEmptySessionInput;
  ctx: TProtectedProcedureContext;
}) {
  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  try {
    let modelToUse: ModelToUse;

    if (input.aiModelId) {
      try {
        const explicitModel = await AiStudioService.getModelById({
          modelId: input.aiModelId,
          teamId,
          requestingApp: chatAppId,
        });
        modelToUse = explicitModel;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `O modelo selecionado não está disponível ou habilitado. Por favor, escolha outro.`,
        });
      }
    } else {
      const availableModels = await AiStudioService.getAvailableModels({
        teamId,
        requestingApp: chatAppId,
      });
      if (!availableModels?.[0]) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
        });
      }
      modelToUse = availableModels[0];
    }

    const title = input.title || `Chat ${new Date().toLocaleDateString()}`;
    const session = await chatRepository.ChatSessionRepository.create({
      title,
      aiModelId: modelToUse.id,
      aiAgentId: input.aiAgentId || undefined,
      teamId,
      userId,
    });

    if (!session?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao criar sessão de chat",
      });
    }

    if (input.aiAgentId) {
      console.log(
        `🤖 [CREATE_EMPTY] Sessão criada com agente: ${input.aiAgentId} para sessão: ${session.id}`,
      );

      await chatRepository.ChatSessionRepository.update(session.id, {
        activeAgentId: input.aiAgentId,
      });
    }

    try {
      const systemPrompt = await AiStudioService.getSystemPrompt({
        teamId,
        userId,
        sessionId: session.id,
      });

      if (systemPrompt?.trim()) {
        await ChatService.createSystemMessage({
          chatSessionId: session.id,
          content: systemPrompt,
          metadata: {
            type: "system_prompt",
            source: "platform_and_team_instructions",
            createdAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.warn(
        `⚠️ [CREATE_EMPTY] Erro ao criar System Prompt para sessão ${session.id}:`,
        error,
      );
    }

    if (input.generateTitle && input.metadata?.firstMessage) {
      setImmediate(async () => {
        try {
          const firstModel = modelToUse;
          if (!firstModel) return;

          const providerToken = await AiStudioService.getProviderToken({
            providerId: firstModel.providerId,
            teamId,
            requestingApp: chatAppId,
          });

          if (providerToken.token) {
            const baseUrl =
              firstModel.provider?.baseUrl || "https://api.openai.com/v1";
            const apiUrl = `${baseUrl}/chat/completions`;

            const modelConfig = (firstModel.config || {}) as {
              modelId?: string;
              version?: string;
            };
            const modelName =
              modelConfig.modelId ||
              modelConfig.version ||
              firstModel.displayName;

            const titlePrompt = [
              {
                role: "system",
                content: `Você é um especialista em criar títulos concisos e informativos para conversas.

REGRAS:
- Máximo 45 caracteres
- Capture o TEMA PRINCIPAL da mensagem
- Use linguagem natural e clara
- Sem aspas, pontos ou formatação
- Foque no ASSUNTO, não na ação

EXEMPLOS:
- "Como fazer um bolo de chocolate?" → "Receita de Bolo de Chocolate"
- "Explique machine learning" → "Introdução ao Machine Learning"
- "Problemas no código Python" → "Debug de Código Python"
- "Dicas de investimento" → "Estratégias de Investimento"

Responda APENAS com o título.`,
              },
              {
                role: "user",
                content: `Mensagem: "${input.metadata?.firstMessage}"

Título:`,
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
                max_tokens: 35,
                temperature: 0.3,
                top_p: 0.9,
                frequency_penalty: 0.1,
              }),
            });

            if (response.ok) {
              const aiResponse = (await response.json()) as {
                choices?: {
                  message?: {
                    content?: string;
                  };
                }[];
              };
              const generatedTitle =
                aiResponse.choices?.[0]?.message?.content?.trim();

              if (generatedTitle && generatedTitle.length <= 50) {
                await chatRepository.ChatSessionRepository.update(session.id, {
                  title: generatedTitle,
                });
              } else {
                console.warn(
                  "⚠️ [TITLE_GEN] Título inválido (muito longo ou vazio):",
                  {
                    title: generatedTitle,
                    length: generatedTitle?.length,
                  },
                );
              }
            } else {
              console.error("❌ [TITLE_GEN] Erro na API:", {
                status: response.status,
                statusText: response.statusText,
              });
            }
          }
        } catch (error) {
          console.warn("⚠️ [CREATE_EMPTY] Erro ao gerar título:", error);

          try {
            const firstMessage = input.metadata?.firstMessage;
            if (firstMessage && typeof firstMessage === "string") {
              let fallbackTitle = firstMessage.slice(0, 50);
              if (firstMessage.length > 50) {
                fallbackTitle += "...";
              }

              await chatRepository.ChatSessionRepository.update(session.id, {
                title: fallbackTitle,
              });
            }
          } catch (fallbackError) {
            console.error("❌ [CREATE_EMPTY] Erro no fallback:", fallbackError);
          }
        }
      });
    }

    return {
      session,
      userMessage: null,
      aiMessage: null,
    };
  } catch (error: unknown) {
    console.error("❌ [CREATE_EMPTY] Erro:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Erro ao criar sessão vazia";

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
    });
  }
}
