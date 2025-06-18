import type { NextRequest } from "next/server";

import { ChatService } from "../../../../../../../packages/api/src/internal/services/chat.service";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST-ADAPTER] Endpoint experimental chamado");

    const {
      chatSessionId,
      content,
      modelId,
      teamId,
      messages = [],
      temperature,
      maxTokens,
      tools,
      mockMode = false, // 🆕 Novo parâmetro para modo mock
    } = await request.json();

    console.log("🧪 [TEST-ADAPTER] Parâmetros recebidos:", {
      chatSessionId,
      content,
      modelId,
      teamId,
      messagesCount: messages.length,
      temperature,
      maxTokens,
      hasTools: !!tools,
      mockMode, // 🆕 Log do modo mock
    });

    // Validação básica
    if (!chatSessionId || !content || !teamId) {
      return new Response(
        JSON.stringify({
          error: "Parâmetros obrigatórios: chatSessionId, content, teamId",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 🆕 Modo Mock - pula verificação de sessão
    let session = null;
    if (mockMode) {
      console.log(
        "🎭 [TEST-ADAPTER] Modo MOCK ativado - pulando verificação de sessão",
      );
    } else {
      // Verificar se a sessão existe (usando método atual)
      session = await ChatService.findSessionById(chatSessionId);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Sessão não encontrada" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      console.log("✅ [TEST-ADAPTER] Sessão encontrada:", session.id);
    }

    // Tentar usar o adapter experimental
    console.log(
      "🔧 [TEST-ADAPTER] Prestes a chamar streamResponseWithAdapter...",
    );

    let result;
    try {
      result = await ChatService.streamResponseWithAdapter({
        chatSessionId,
        content,
        modelId: modelId || session?.aiModelId || "mock-model",
        teamId,
        messages,
        temperature,
        maxTokens,
        tools,
      });
      console.log(
        "🔧 [TEST-ADAPTER] streamResponseWithAdapter retornou:",
        typeof result,
      );
    } catch (adapterError) {
      console.error(
        "🔴 [TEST-ADAPTER] Erro específico do adapter:",
        adapterError,
      );
      throw adapterError; // Re-throw para ser capturado pelo catch principal
    }

    console.log("✅ [TEST-ADAPTER] Adapter retornou stream com sucesso");

    // Em vez de retornar o stream, vamos retornar JSON para debug
    return new Response(
      JSON.stringify({
        success: true,
        message: "Adapter executado com sucesso!",
        hasStream: !!result.stream,
        metadata: result.metadata,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("🔴 [TEST-ADAPTER] Erro:", error);

    // Tentar diferentes formas de extrair a mensagem
    let errorMessage = "Erro desconhecido";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }

    console.log("🔧 [DEBUG] Mensagem final:", `"${errorMessage}"`);

    // Se for erro de feature flag desabilitada, retornar status específico
    if (
      errorMessage.includes("not enabled") ||
      errorMessage.includes("Adapter not enabled")
    ) {
      return new Response(
        JSON.stringify({
          error: "Feature flag ENABLE_VERCEL_AI_ADAPTER não está habilitada",
          hint: "Defina ENABLE_VERCEL_AI_ADAPTER=true para testar o adapter",
        }),
        {
          status: 503, // Service Unavailable
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: `Teste do adapter falhou: ${errorMessage}`,
        endpoint: "experimental",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
