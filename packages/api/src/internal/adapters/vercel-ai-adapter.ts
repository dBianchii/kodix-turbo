import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { chatAppId } from "@kdx/shared";

import type {
  ChatStreamParams,
  ChatStreamResponse,
} from "../types/ai/vercel-adapter.types";
import { AiStudioService } from "../services/ai-studio.service";

export class VercelAIAdapter {
  /**
   * 🚀 IMPLEMENTAÇÃO DIRETA: Usa Vercel AI SDK
   * Versão simplificada sem complexidade desnecessária
   */
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    console.log("🚀 [CHAT] Iniciando stream com Vercel AI SDK");

    try {
      // 1. Formatar mensagens para Vercel AI SDK
      const messages = this.formatMessages(params.messages);

      // 2. Obter modelo configurado
      const model = await this.getVercelModel(params.modelId, params.teamId);

      // 3. Executar streamText do Vercel AI SDK
      const result = await streamText({
        model,
        messages,
        temperature: params.temperature || 0.7,
        maxTokens: params.maxTokens || 4000,
      });

      // 4. Retornar stream no formato esperado
      return this.formatResponse(result);
    } catch (error) {
      console.error("🔴 [CHAT] Erro no Vercel AI SDK:", error);
      throw error; // Re-throw para que o erro seja tratado no nível superior
    }
  }

  /**
   * 🎯 INTERFACE ULTRA-LIMPA: Stream + Auto-Save
   * Método completo que faz streaming E salva automaticamente no banco
   * Toda complexidade encapsulada no backend
   */
  async streamAndSave(
    params: ChatStreamParams,
    saveMessageCallback: (content: string, metadata: any) => Promise<void>,
  ): Promise<ChatStreamResponse> {
    console.log("🚀 [CHAT] Iniciando stream com auto-save");

    try {
      // 1. Formatar mensagens para Vercel AI SDK
      const messages = this.formatMessages(params.messages);

      // 2. Obter modelo configurado
      const model = await this.getVercelModel(params.modelId, params.teamId);

      // 3. Executar streamText do Vercel AI SDK
      const result = await streamText({
        model,
        messages,
        temperature: params.temperature || 0.7,
        maxTokens: params.maxTokens || 4000,
      });

      // 4. Retornar stream com auto-save integrado
      return this.formatResponseWithSave(
        result,
        params.modelId,
        saveMessageCallback,
      );
    } catch (error) {
      console.error("🔴 [CHAT] Erro no Vercel AI SDK com auto-save:", error);
      throw error;
    }
  }

  /**
   * Formata mensagens para o Vercel AI SDK
   */
  private formatMessages(messages: ChatStreamParams["messages"]) {
    return messages.map((msg) => {
      const role =
        msg.senderRole === "user"
          ? ("user" as const)
          : msg.senderRole === "ai"
            ? ("assistant" as const)
            : msg.senderRole === "system"
              ? ("system" as const)
              : ("user" as const);

      return {
        role,
        content: msg.content,
      };
    });
  }

  /**
   * Mapeia modelos do AI Studio para Vercel AI SDK
   * FASE 1: Apenas OpenAI (conservador)
   */
  private async getVercelModel(modelId: string, teamId: string) {
    // Buscar configuração do modelo
    const modelConfig = await AiStudioService.getModelById({
      modelId,
      teamId,
      requestingApp: chatAppId,
    });

    // Buscar token do provider
    const providerToken = await AiStudioService.getProviderToken({
      providerId: modelConfig.providerId,
      teamId,
      requestingApp: chatAppId,
    });

    // Criar provider baseado no tipo
    const providerName = modelConfig.provider.name.toLowerCase();
    const modelName = (modelConfig.config as any)?.version || modelConfig.name;

    if (providerName === "openai") {
      const openaiProvider = createOpenAI({
        apiKey: providerToken.token,
        baseURL: modelConfig.provider.baseUrl || undefined,
      });
      return openaiProvider(modelName);
    }

    if (providerName === "anthropic") {
      const anthropicProvider = createAnthropic({
        apiKey: providerToken.token,
        baseURL: modelConfig.provider.baseUrl || undefined,
      });
      return anthropicProvider(modelName);
    }

    throw new Error(
      `Provider ${modelConfig.provider.name} não suportado. Suportados: OpenAI, Anthropic.`,
    );
  }

  /**
   * Formata resposta do Vercel AI SDK para formato atual
   */
  private formatResponse(vercelResult: any): ChatStreamResponse {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of vercelResult.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (streamError) {
          console.error("🔴 [CHAT] Erro no stream:", streamError);
          controller.enqueue(
            new TextEncoder().encode(
              `\n\n[Erro no stream: ${streamError instanceof Error ? streamError.message : "Erro desconhecido"}]`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return {
      stream,
      metadata: {
        model: vercelResult.response?.modelId || "vercel-ai-sdk",
        usage: vercelResult.usage || null,
        finishReason: vercelResult.finishReason || "stop",
      },
    };
  }

  /**
   * 🎯 NOVA FUNÇÃO: Formata resposta COM auto-save integrado
   * Toda complexidade de streaming + persistência encapsulada
   */
  private formatResponseWithSave(
    vercelResult: any,
    modelId: string,
    saveMessageCallback: (content: string, metadata: any) => Promise<void>,
  ): ChatStreamResponse {
    let accumulatedText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of vercelResult.textStream) {
            // Acumular texto para salvamento posterior
            accumulatedText += chunk;

            // Enviar chunk para o cliente
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (streamError) {
          console.error("🔴 [CHAT] Erro no stream:", streamError);
          const errorMessage = `\n\n[Erro no stream: ${streamError instanceof Error ? streamError.message : "Erro desconhecido"}]`;
          accumulatedText += errorMessage;
          controller.enqueue(new TextEncoder().encode(errorMessage));
        } finally {
          // 💾 AUTO-SAVE: Salvar mensagem completa no banco via callback
          if (accumulatedText.trim()) {
            try {
              const messageMetadata = {
                requestedModel: modelId,
                actualModelUsed: vercelResult.response?.modelId || modelId,
                providerId: "vercel-ai-sdk",
                providerName: "Vercel AI SDK",
                usage: vercelResult.usage || null,
                finishReason: vercelResult.finishReason || "stop",
                timestamp: new Date().toISOString(),
              };

              await saveMessageCallback(accumulatedText, messageMetadata);

              console.log(
                "✅ [CHAT] Mensagem da IA salva automaticamente no banco",
              );
            } catch (saveError) {
              console.error("🔴 [CHAT] Erro ao salvar mensagem:", saveError);
              // Não interromper o stream por erro de salvamento
            }
          }

          controller.close();
        }
      },
    });

    return {
      stream,
      metadata: {
        model: vercelResult.response?.modelId || "vercel-ai-sdk",
        usage: vercelResult.usage || null,
        finishReason: vercelResult.finishReason || "stop",
      },
    };
  }
}
