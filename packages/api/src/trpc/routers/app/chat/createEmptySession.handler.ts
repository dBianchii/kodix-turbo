import { TRPCError } from "@trpc/server";

import type { CreateEmptySessionInput } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import { ChatService } from "../../../../internal/services/chat.service";

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
    console.log(
      "🚀 [CREATE_EMPTY] Iniciando criação de sessão vazia para team:",
      teamId,
    );
    console.log("🔍 [CREATE_EMPTY] aiModelId explícito:", input.aiModelId);

    // 1. Determinar modelo a usar (explícito ou primeiro disponível)
    let aiModelId: string;
    let availableModels: any;

    if (input.aiModelId) {
      // ✅ NOVO: Validar modelo explícito primeiro
      try {
        const explicitModel = await AiStudioService.getModelById({
          modelId: input.aiModelId,
          teamId,
          requestingApp: chatAppId,
        });

        if (explicitModel) {
          aiModelId = input.aiModelId;
          console.log(
            "✅ [CREATE_EMPTY] Modelo explícito validado:",
            explicitModel.name,
          );
        } else {
          throw new Error("Modelo explícito inválido");
        }
      } catch (error) {
        console.warn(
          "⚠️ [CREATE_EMPTY] Modelo explícito inválido, usando fallback",
        );
        // Fallback para buscar primeiro modelo disponível
        availableModels = await AiStudioService.getAvailableModels({
          teamId,
          requestingApp: chatAppId,
        });
        const firstModel = availableModels?.[0];
        if (firstModel) {
          aiModelId = firstModel.id;
        } else {
          throw new Error("Nenhum modelo disponível");
        }
      }
    } else {
      // Fallback original: buscar primeiro modelo disponível
      try {
        availableModels = await AiStudioService.getAvailableModels({
          teamId,
          requestingApp: chatAppId,
        });

        if (availableModels && availableModels.length > 0) {
          const firstModel = availableModels[0];
          aiModelId = firstModel!.id;
          console.log("✅ [CREATE_EMPTY] Modelo encontrado:", firstModel?.name);
        } else {
          throw new Error("Nenhum modelo disponível");
        }
      } catch (error) {
        console.error("❌ [CREATE_EMPTY] Erro ao buscar modelo:", error);
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
        });
      }
    }

    // 2. Definir título da sessão
    const title = input.title || `Chat ${new Date().toLocaleDateString()}`;

    // 3. Criar sessão VAZIA (sem mensagens)
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

    console.log("✅ [CREATE_EMPTY] Sessão vazia criada:", session.id);

    // 🎯 Criar Team Instructions se configuradas
    try {
      const teamInstructions = await AiStudioService.getTeamInstructions({
        teamId,
        requestingApp: chatAppId,
      });

      if (teamInstructions?.content?.trim()) {
        console.log(
          `🎯 [CREATE_EMPTY] Criando Team Instructions para sessão: ${session.id}`,
        );

        await ChatService.createSystemMessage({
          chatSessionId: session.id,
          content: teamInstructions.content,
          metadata: {
            type: "team_instructions",
            appliesTo: teamInstructions.appliesTo,
            createdAt: new Date().toISOString(),
          },
        });

        console.log(
          `✅ [CREATE_EMPTY] Team Instructions criadas para sessão: ${session.id}`,
        );
      }
    } catch (error) {
      // Log do erro mas não falha a criação da sessão
      console.warn(
        `⚠️ [CREATE_EMPTY] Erro ao criar Team Instructions para sessão ${session.id}:`,
        error,
      );
    }

    // 🤖 Gerar título automaticamente se solicitado e houver firstMessage
    if (input.generateTitle && input.metadata?.firstMessage) {
      console.log("🤖 [CREATE_EMPTY] Gerando título automático...");

      // Executar em background para não bloquear a resposta
      setImmediate(async () => {
        try {
          const firstModel = availableModels[0];
          if (!firstModel) return;

          // ✅ LOG: Modelo usado para geração de título
          console.log("🤖 [TITLE_GEN] Modelo selecionado:", {
            name: firstModel.name,
            provider: firstModel.provider?.name,
            modelId: firstModel.id,
          });

          // Buscar token do provider
          const providerToken = await AiStudioService.getProviderToken({
            providerId: firstModel.providerId,
            teamId,
            requestingApp: chatAppId,
          });

          if (providerToken.token) {
            // Configurar API baseada no provider
            const baseUrl =
              firstModel.provider?.baseUrl || "https://api.openai.com/v1";
            const apiUrl = `${baseUrl}/chat/completions`;

            const modelConfig = (firstModel.config || {}) as {
              version?: string;
              maxTokens?: number;
              temperature?: number;
            };
            const modelName = modelConfig.version || firstModel.name;

            // ✅ PROMPT MELHORADO: Mais específico e com exemplos
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
                max_tokens: 35, // ✅ AUMENTADO: de 20 para 35 tokens
                temperature: 0.3, // ✅ REDUZIDO: mais consistente, menos criativo
                top_p: 0.9, // ✅ ADICIONADO: melhor qualidade
                frequency_penalty: 0.1, // ✅ ADICIONADO: evita repetições
              }),
            });

            if (response.ok) {
              const aiResponse = (await response.json()) as any;
              const generatedTitle =
                aiResponse.choices?.[0]?.message?.content?.trim();

              // ✅ LOG: Monitorar uso de tokens e qualidade
              const usage = aiResponse.usage;
              console.log("📊 [TITLE_GEN] Estatísticas:", {
                title: generatedTitle,
                titleLength: generatedTitle?.length || 0,
                tokensUsed: usage?.total_tokens || 0,
                promptTokens: usage?.prompt_tokens || 0,
                completionTokens: usage?.completion_tokens || 0,
                model: modelName,
                firstMessage:
                  typeof input.metadata?.firstMessage === "string"
                    ? input.metadata.firstMessage.slice(0, 50) + "..."
                    : "N/A",
              });

              if (generatedTitle && generatedTitle.length <= 50) {
                // Atualizar título da sessão
                await chatRepository.ChatSessionRepository.update(session.id, {
                  title: generatedTitle,
                });
                console.log(
                  "✅ [TITLE_GEN] Título aplicado com sucesso:",
                  generatedTitle,
                );
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

          // Fallback: usar primeiros 50 caracteres da mensagem
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
              console.log(
                "✅ [CREATE_EMPTY] Título fallback usado:",
                fallbackTitle,
              );
            }
          } catch (fallbackError) {
            console.error("❌ [CREATE_EMPTY] Erro no fallback:", fallbackError);
          }
        }
      });
    }

    console.log(
      "🎉 [CREATE_EMPTY] Sessão vazia criada com sucesso!",
      session.id,
      "- Título:",
      title,
    );

    return {
      session,
      // Sem mensagens iniciais!
      userMessage: null,
      aiMessage: null,
    };
  } catch (error: any) {
    console.error("❌ [CREATE_EMPTY] Erro:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "Erro ao criar sessão vazia",
    });
  }
}
