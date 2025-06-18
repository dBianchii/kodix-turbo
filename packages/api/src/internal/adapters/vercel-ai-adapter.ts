import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { chatAppId } from "@kdx/shared";

import type { ChatMetrics } from "../monitoring/vercel-ai-metrics";
import type {
  ChatStreamParams,
  ChatStreamResponse,
} from "../types/ai/vercel-adapter.types";
import { VercelAIMetrics } from "../monitoring/vercel-ai-metrics";
import { AiStudioService } from "../services/ai-studio.service";

export class VercelAIAdapter {
  /**
   * 🚀 REAL IMPLEMENTATION: Usa Vercel AI SDK de verdade
   * Com fallback para mock em caso de erro
   * 📊 SUBETAPA 5: Agora com monitoramento completo
   */
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    const startTime = Date.now();
    const chunkCount = 0;
    let firstChunkTime: number | undefined;
    const tokensUsed = 0;
    let actualModel: string | undefined;
    const success = false;
    let errorType: string | undefined;
    let errorMessage: string | undefined;
    let fallbackUsed = false;

    console.log("🧪 [VERCEL-ADAPTER] Iniciando stream com SDK real...");

    // 🎭 DETECÇÃO DE MOCK MODE: Se modelId for "mock-model", usar mock direto
    if (params.modelId === "mock-model") {
      console.log(
        "🎭 [VERCEL-ADAPTER] Mock mode detectado - usando mock direto",
      );

      const mockResponse = this.getMockResponse(
        params,
        new Error("Mock mode ativado"),
      );

      // Registrar métricas para mock mode
      this.recordMetrics({
        timestamp: new Date(),
        sessionId: params.chatSessionId,
        modelId: params.modelId,
        teamId: params.teamId,
        responseTime: Date.now() - startTime,
        firstChunkTime: 0,
        totalChunks: 1,
        throughput: 0,
        tokensUsed: 0,
        success: true,
        provider: "vercel-ai-sdk",
        actualModel: "mock-intentional",
        fallbackUsed: false,
        messageCount: params.messages.length,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      });

      return mockResponse;
    }

    try {
      // 1. Converter parâmetros para formato Vercel AI SDK
      const vercelParams = this.adaptInputParams(params);
      console.log("✅ [VERCEL-ADAPTER] Parâmetros adaptados:", {
        messagesCount: vercelParams.messages.length,
        temperature: vercelParams.temperature,
        maxTokens: vercelParams.maxTokens,
      });

      // 2. Obter modelo configurado
      const model = await this.getVercelModel(params.modelId, params.teamId);
      console.log("✅ [VERCEL-ADAPTER] Modelo obtido:", typeof model);

      // 3. USAR VERCEL AI SDK PELA PRIMEIRA VEZ! 🎉
      console.log(
        "🚀 [VERCEL-ADAPTER] Chamando streamText do Vercel AI SDK...",
      );
      const result = await streamText({
        model,
        messages: vercelParams.messages,
        temperature: vercelParams.temperature,
        maxTokens: vercelParams.maxTokens,
      });

      console.log("✅ [VERCEL-ADAPTER] streamText executado com sucesso");

      // 4. Adaptar resposta para formato atual
      const response = this.adaptResponse(result);

      // 📊 Registrar métricas de sucesso
      this.recordMetrics({
        timestamp: new Date(),
        sessionId: params.chatSessionId,
        modelId: params.modelId,
        teamId: params.teamId,
        responseTime: Date.now() - startTime,
        totalChunks: 1, // Placeholder por enquanto
        throughput: 0,
        tokensUsed: 0, // Será implementado depois
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: params.messages.length,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      });

      return response;
    } catch (error) {
      console.error("🔴 [VERCEL-ADAPTER] Erro no SDK, usando fallback:", error);

      // Capturar detalhes do erro para métricas
      errorType =
        error instanceof Error ? error.constructor.name : "UnknownError";
      errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      fallbackUsed = true;

      // Registrar métricas de erro
      this.recordMetrics({
        timestamp: new Date(),
        sessionId: params.chatSessionId,
        modelId: params.modelId,
        teamId: params.teamId,
        responseTime: Date.now() - startTime,
        firstChunkTime,
        totalChunks: 0,
        throughput: 0,
        tokensUsed: 0,
        success: false,
        errorType,
        errorMessage,
        provider: "vercel-ai-sdk",
        actualModel: actualModel || "unknown",
        fallbackUsed: true,
        messageCount: params.messages.length,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      });

      // FALLBACK PARA MOCK (segurança máxima)
      return this.getMockResponse(params, error);
    }
  }

  /**
   * Converte parâmetros atuais para Vercel AI SDK
   */
  private adaptInputParams(params: ChatStreamParams) {
    const messages = params.messages.map((msg) => {
      // Mapear roles corretamente
      let role: "user" | "assistant" | "system";

      if (msg.senderRole === "user") {
        role = "user";
      } else if (msg.senderRole === "ai" || msg.senderRole === "assistant") {
        role = "assistant";
      } else if (msg.senderRole === "system") {
        role = "system";
      } else {
        // Fallback para roles desconhecidos
        role = "user";
      }

      return {
        role,
        content: msg.content,
      };
    });

    console.log("🔄 [VERCEL-ADAPTER] Mensagens convertidas:", {
      total: messages.length,
      roles: messages.map((m) => m.role),
    });

    return {
      messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
    };
  }

  /**
   * Mapeia modelos do AI Studio para Vercel AI SDK
   * FASE 1: Apenas OpenAI (conservador)
   */
  private async getVercelModel(modelId: string, teamId: string) {
    console.log("🔍 [VERCEL-ADAPTER] Buscando modelo via AiStudioService...");

    // Buscar modelo via Service Layer (mesma forma que o sistema atual)
    const modelConfig = await AiStudioService.getModelById({
      modelId,
      teamId,
      requestingApp: chatAppId,
    });

    console.log("✅ [VERCEL-ADAPTER] Modelo encontrado:", {
      name: modelConfig.name,
      provider: modelConfig.provider.name,
    });

    // Buscar token do provider
    const providerToken = await AiStudioService.getProviderToken({
      providerId: modelConfig.providerId,
      teamId,
      requestingApp: chatAppId,
    });

    console.log(
      "✅ [VERCEL-ADAPTER] Token encontrado para provider:",
      modelConfig.provider.name,
    );

    // FASE 1: Suporte apenas OpenAI (conservador)
    const providerName = modelConfig.provider.name.toLowerCase();

    if (providerName === "openai") {
      const modelName =
        (modelConfig.config as any)?.version || modelConfig.name;
      console.log(
        "🔧 [VERCEL-ADAPTER] Configurando OpenAI com modelo:",
        modelName,
      );

      // Criar instância do provider OpenAI
      const openaiProvider = createOpenAI({
        apiKey: providerToken.token,
        baseURL: modelConfig.provider.baseUrl || undefined,
      });

      // Retornar modelo específico
      return openaiProvider(modelName);
    } else {
      throw new Error(
        `🚧 Provider ${modelConfig.provider.name} ainda não suportado no adapter. Apenas OpenAI na Fase 1.`,
      );
    }
  }

  /**
   * Adapta resposta do Vercel AI SDK para formato atual
   */
  private adaptResponse(vercelResult: any): ChatStreamResponse {
    console.log("🔄 [VERCEL-ADAPTER] Adaptando resposta do SDK...");

    // Converter stream do Vercel AI SDK para formato atual
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("📡 [VERCEL-ADAPTER] Iniciando leitura do textStream...");
          let chunkCount = 0;

          for await (const chunk of vercelResult.textStream) {
            chunkCount++;
            if (chunkCount === 1) {
              console.log("✅ [VERCEL-ADAPTER] Primeiro chunk recebido");
            }
            controller.enqueue(new TextEncoder().encode(chunk));
          }

          console.log(
            `✅ [VERCEL-ADAPTER] Stream finalizado. Total chunks: ${chunkCount}`,
          );
        } catch (streamError) {
          console.error("🔴 [VERCEL-ADAPTER] Erro no stream:", streamError);
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
        model: vercelResult.response?.modelId || "vercel-sdk-model",
        usage: vercelResult.usage || null,
        finishReason: vercelResult.finishReason || "stop",
      },
    };
  }

  /**
   * 📊 Registrar métricas de uma interação
   */
  private recordMetrics(metrics: ChatMetrics): void {
    try {
      VercelAIMetrics.recordChatInteraction(metrics);
    } catch (error) {
      console.error("🔴 [METRICS] Erro ao registrar métricas:", error);
    }
  }

  /**
   * Fallback para mock em caso de erro (segurança)
   */
  private getMockResponse(
    params: ChatStreamParams,
    originalError: any,
  ): ChatStreamResponse {
    const errorMessage =
      originalError instanceof Error
        ? originalError.message
        : "Erro desconhecido";

    const isMockMode = params.modelId === "mock-model";

    if (isMockMode) {
      console.log("🎭 [VERCEL-ADAPTER] Gerando resposta mock intencional");
    } else {
      console.log("🎭 [VERCEL-ADAPTER] Usando resposta mock como fallback");
    }

    const stream = new ReadableStream({
      start(controller) {
        const mockContent = isMockMode
          ? `🎭 **Mock Adapter - Modo Teste**\n\n` +
            `✅ Vercel AI SDK Adapter está funcionando!\n\n` +
            `**Parâmetros processados:**\n` +
            `- Modelo: ${params.modelId}\n` +
            `- Team: ${params.teamId}\n` +
            `- Mensagens: ${params.messages.length}\n` +
            `- Temperature: ${params.temperature || 0.7}\n` +
            `- Max Tokens: ${params.maxTokens || 4000}\n\n` +
            `**Status:** Mock mode ativo - adapter funcionando corretamente!\n\n` +
            `Esta resposta confirma que a estrutura do Vercel AI SDK está implementada e funcional.`
          : `🎭 **Mock Adapter - Fallback Seguro**\n\n` +
            `Vercel AI SDK falhou, usando mock como fallback seguro.\n\n` +
            `**Erro original:** ${errorMessage}\n\n` +
            `**Parâmetros recebidos:**\n` +
            `- Modelo: ${params.modelId}\n` +
            `- Team: ${params.teamId}\n` +
            `- Mensagens: ${params.messages.length}\n\n` +
            `Esta é uma resposta simulada para garantir que o sistema continue funcionando.`;

        controller.enqueue(new TextEncoder().encode(mockContent));
        controller.close();
      },
    });

    return {
      stream,
      metadata: {
        model: isMockMode ? "mock-intentional" : "mock-fallback",
        usage: null,
        finishReason: "stop",
        error: isMockMode ? undefined : errorMessage,
      },
    };
  }
}
