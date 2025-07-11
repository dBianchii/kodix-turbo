import { TRPCError } from "@trpc/server";

import type { EnviarMensagemInput } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import { ChatService } from "../../../../internal/services/chat.service";

export async function enviarMensagemHandler({
  input,
  ctx,
}: {
  input: EnviarMensagemInput;
  ctx: TProtectedProcedureContext;
}) {
  try {
    // Verificar se a sessão existe e pertence ao usuário/team
    const session = await chatRepository.ChatSessionRepository.findById(
      input.chatSessionId,
    );
    if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sessão de chat não encontrada",
      });
    }

    // 🎯 NOVO: Verificar e criar instruções do time se necessário
    const hasSystemInstructions = await ChatService.hasSystemInstructions(
      input.chatSessionId,
    );

    if (!hasSystemInstructions) {
      try {
        // Buscar system prompt orquestrado via AI Studio Service
        const systemPrompt = await AiStudioService.getSystemPrompt({
          teamId: session.teamId,
          userId: ctx.auth.user.id,
          sessionId: input.chatSessionId,
        });

        if (systemPrompt?.trim()) {
          console.log(
            `🎯 [SYSTEM_PROMPT] Criando system prompt para sessão: ${input.chatSessionId}`,
          );

          // Criar mensagem system como primeira mensagem da sessão
          await ChatService.createSystemMessage({
            chatSessionId: input.chatSessionId,
            content: systemPrompt,
            metadata: {
              type: "system_prompt",
              source: "platform_and_team_instructions",
              createdAt: new Date().toISOString(),
            },
          });

          console.log(
            `✅ [SYSTEM_PROMPT] System prompt criado com sucesso para sessão: ${input.chatSessionId}`,
          );
        }
      } catch (error) {
        // Log do erro mas não falha o envio da mensagem
        console.warn(
          `⚠️ [SYSTEM_PROMPT] Erro ao criar system prompt para sessão ${input.chatSessionId}:`,
          error,
        );
      }
    }

    // Criar mensagem do usuário
    const userMessage = await chatRepository.ChatMessageRepository.create({
      chatSessionId: input.chatSessionId,
      senderRole: "user",
      content: input.content,
      status: "ok",
    });

    // Se useAgent for true, processar com IA
    if (input.useAgent) {
      try {
        // Buscar histórico de mensagens da sessão para contexto
        const messages =
          await chatRepository.ChatMessageRepository.findBySession({
            chatSessionId: input.chatSessionId,
            limite: 20,
            offset: 0,
            ordem: "asc",
          });

        // Incluir a nova mensagem do usuário no contexto
        const allMessages = [...messages, userMessage];

        // Formatar mensagens para o formato da OpenAI
        const formattedMessages: { role: string; content: string }[] = [];
        for (const msg of allMessages) {
          if (msg?.content) {
            formattedMessages.push({
              role:
                msg.senderRole === "user"
                  ? "user"
                  : msg.senderRole === "system"
                    ? "system"
                    : "assistant",
              content: msg.content,
            });
          }
        }

        // Buscar modelo para obter o provider
        if (!session.aiModelId) {
          throw new Error("Sessão não possui modelo de IA configurado");
        }

        // ✅ USAR SERVICE LAYER: Buscar modelo via AiStudioService
        const model = await AiStudioService.getModelById({
          modelId: session.aiModelId,
          teamId: session.teamId,
          requestingApp: chatAppId,
        });

        if (!model.providerId) {
          throw new Error("Modelo não possui provider configurado");
        }

        // ✅ USAR SERVICE LAYER: Buscar token do provider
        const providerToken = await AiStudioService.getProviderToken({
          providerId: model.providerId,
          teamId: session.teamId,
          requestingApp: chatAppId,
        });

        if (!providerToken.token) {
          throw new Error(
            `Token não configurado para o provider ${model.provider.name || "provider"}`,
          );
        }

        // Configurar API baseada no provider
        const baseUrl = model.provider.baseUrl || "https://api.openai.com/v1";
        const apiUrl = `${baseUrl}/chat/completions`;

        // Usar configurações do modelo
        const modelConfig = (model.config || {}) as {
          modelId?: string;
          version?: string;
          maxTokens?: number;
          temperature?: number;
        };
        const modelName =
          modelConfig.modelId || modelConfig.version || model.displayName;
        const maxTokens = modelConfig.maxTokens || 500;
        const temperature = modelConfig.temperature || 0.7;

        // Log temporário para debug
        console.log("[Backend] Usando modelo para API:", {
          sessionModelId: session.aiModelId,
          databaseModelId: model.id,
          modelName,
          modelConfig,
          providerName: model.provider.name,
        });

        if (!modelName) {
          throw new Error("Nome do modelo não configurado corretamente");
        }

        // Fazer chamada para OpenAI
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: formattedMessages,
            max_tokens: maxTokens,
            temperature: temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro na API do ${model.provider.name || "provider"}: ${response.status} - ${errorText}`,
          );
        }

        const aiResponse = (await response.json()) as any;
        const aiContent =
          aiResponse.choices?.[0]?.message?.content ||
          "Desculpe, não consegui gerar uma resposta.";

        // ✅ Extrair modelo retornado pela API
        const actualModelUsed = aiResponse.model || modelName;

        // ✅ Criar metadata com informações do modelo
        const messageMetadata = {
          requestedModel: modelName,
          actualModelUsed: actualModelUsed,
          providerId: model.providerId,
          providerName: model.provider.name,
          usage: aiResponse.usage || null,
          timestamp: new Date().toISOString(),
        };

        // Salvar resposta da IA com metadata
        const aiMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: input.chatSessionId,
          senderRole: "ai",
          content: aiContent,
          status: "ok",
          metadata: messageMetadata,
        });

        return {
          userMessage,
          aiMessage,
        };
      } catch (aiError) {
        console.error("Erro ao processar com IA:", aiError);

        // Salvar mensagem de erro da IA
        const errorMessage = await chatRepository.ChatMessageRepository.create({
          chatSessionId: input.chatSessionId,
          senderRole: "ai",
          content: `Erro: ${aiError instanceof Error ? aiError.message : "Erro ao processar mensagem"}`,
          status: "error",
        });

        return {
          userMessage,
          aiMessage: errorMessage,
        };
      }
    }

    return { userMessage };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Erro ao enviar mensagem:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao enviar mensagem",
      cause: error,
    });
  }
}
