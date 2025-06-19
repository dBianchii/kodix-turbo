import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { chatAppId } from "@kdx/shared";

// 🚀 Importar VercelAIAdapter para sistema único
import { VercelAIAdapter } from "../../../../../../../packages/api/src/internal/adapters/vercel-ai-adapter";
import { AiStudioService } from "../../../../../../../packages/api/src/internal/services/ai-studio.service";
import { ChatService } from "../../../../../../../packages/api/src/internal/services/chat.service";

export async function POST(request: NextRequest) {
  try {
    console.log("🔵 [API] POST streaming recebido");

    const {
      chatSessionId,
      content,
      useAgent = true,
      skipUserMessage = false,
    } = await request.json();
    console.log("🟢 [API] Dados recebidos:", {
      chatSessionId,
      content,
      useAgent,
      skipUserMessage,
    });

    if (!chatSessionId || !content) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 },
      );
    }

    // Verificar se a sessão existe
    const session = await ChatService.findSessionById(chatSessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 },
      );
    }

    console.log("🔍 [DEBUG] Dados da sessão:");
    console.log(`   • ID: ${session.id}`);
    console.log(`   • Título: ${session.title}`);
    console.log(`   • aiModelId: ${session.aiModelId || "❌ NULL/UNDEFINED"}`);
    console.log(`   • aiAgentId: ${session.aiAgentId || "❌ NULL/UNDEFINED"}`);
    console.log(`   • teamId: ${session.teamId}`);

    // ✅ TEMPORÁRIO: Agente será removido do fluxo de streaming por enquanto
    // TODO: Implementar getAgentById no AiStudioService
    const agent = null;
    if (session.aiAgentId) {
      console.log(
        `⚠️ [DEBUG] Agente ${session.aiAgentId} será ignorado no streaming por enquanto`,
      );
    }

    // ✅ CORREÇÃO: Criar mensagem do usuário apenas se não for skipUserMessage
    let userMessage;
    let recentMessages: any[] | null = null;

    if (skipUserMessage) {
      console.log(
        "🔄 [API] Pulando criação de mensagem do usuário (skipUserMessage=true)",
      );
      // Buscar a mensagem mais recente do usuário com o mesmo conteúdo
      recentMessages = await ChatService.findMessagesBySession({
        chatSessionId: session.id,
        limite: 5,
        offset: 0,
        ordem: "desc",
      });

      userMessage = recentMessages.find(
        (msg: any) => msg.senderRole === "user" && msg.content === content,
      );

      if (!userMessage) {
        console.warn(
          "⚠️ [API] Mensagem do usuário não encontrada, criando nova",
        );
        userMessage = await ChatService.createMessage({
          chatSessionId: session.id,
          senderRole: "user",
          content,
          status: "ok",
        });
      } else {
        console.log("✅ [API] Mensagem do usuário encontrada:", userMessage.id);
      }
    } else {
      // Comportamento normal: criar nova mensagem do usuário
      userMessage = await ChatService.createMessage({
        chatSessionId: session.id,
        senderRole: "user",
        content,
        status: "ok",
      });
      console.log("✅ [API] Mensagem do usuário criada");
    }

    if (!useAgent) {
      return NextResponse.json({
        userMessage,
        sessionId: session.id,
      });
    }

    // ✅ CORREÇÃO: Buscar histórico de mensagens ou reutilizar se já carregadas
    let messages;
    if (skipUserMessage && recentMessages) {
      // Se já carregamos mensagens para buscar a do usuário, reutilizar e ordenar
      messages = recentMessages.reverse(); // Inverter para ordem cronológica
    } else {
      // Buscar histórico normalmente
      messages = await ChatService.findMessagesBySession({
        chatSessionId: session.id,
        limite: 20,
        offset: 0,
        ordem: "asc",
      });
    }

    // ✅ CORREÇÃO: Incluir mensagem do usuário apenas se não estiver já incluída
    const userMessageExists = messages.some(
      (msg: any) => msg.id === userMessage?.id,
    );
    const allMessages = userMessageExists
      ? messages
      : [...messages, userMessage];

    // 🚀 SISTEMA VERCEL AI SDK (único sistema)
    console.log("🚀 [VERCEL_AI] Usando Vercel AI SDK");

    try {
      // Detectar idioma do usuário de forma mais robusta
      const detectUserLocale = (request: NextRequest): "pt-BR" | "en" => {
        const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
        if (cookieLocale === "pt-BR" || cookieLocale === "en") {
          return cookieLocale;
        }
        const pathname = request.nextUrl.pathname;
        if (pathname.startsWith("/pt-BR")) return "pt-BR";
        if (pathname.startsWith("/en")) return "en";
        const acceptLanguage = request.headers.get("accept-language") || "";
        if (acceptLanguage.includes("pt")) return "pt-BR";
        if (acceptLanguage.includes("en")) return "en";
        return "pt-BR";
      };

      // Verificar se há Team Instructions na sessão
      const hasTeamInstructions = allMessages.some(
        (msg) =>
          msg?.senderRole === "system" &&
          msg?.metadata?.type === "team_instructions",
      );

      // System prompt baseado no idioma do usuário
      const userLocale = detectUserLocale(request);
      const systemPrompt =
        userLocale === "pt-BR"
          ? "Você é um assistente útil e responde sempre em português brasileiro."
          : "You are a helpful assistant and always respond in English.";

      // Preparar mensagens para o adapter
      const formattedMessages: {
        senderRole: "user" | "ai" | "system";
        content: string;
      }[] = [];

      // Só adicionar system prompt se não há Team Instructions
      if (!hasTeamInstructions) {
        const hasSystemPrompt = allMessages.some(
          (msg) => msg?.senderRole === "system",
        );
        if (!hasSystemPrompt) {
          formattedMessages.push({
            senderRole: "system",
            content: systemPrompt,
          });
          console.log(`🌍 [API] System prompt adicionado em: ${userLocale}`);
        }
      } else {
        console.log(
          `🎯 [API] Team Instructions detectadas, pulando system prompt padrão`,
        );
      }

      // Adicionar todas as mensagens existentes
      allMessages.forEach((msg: any) => {
        formattedMessages.push({
          senderRole: msg.senderRole,
          content: msg.content,
        });
      });

      // Buscar modelo da sessão ou usar padrão
      let model;
      if (session.aiModelId) {
        try {
          model = await AiStudioService.getModelById({
            modelId: session.aiModelId,
            teamId: session.teamId,
            requestingApp: chatAppId,
          });
        } catch (error) {
          console.log(
            `❌ [DEBUG] Modelo com ID ${session.aiModelId} não encontrado:`,
            error,
          );
        }
      }

      // Se não encontrou modelo, usar modelo padrão
      if (!model) {
        console.log(
          "⚠️ [API] Sessão sem modelo configurado, buscando modelo padrão...",
        );
        const availableModels = await AiStudioService.getAvailableModels({
          teamId: session.teamId,
          requestingApp: chatAppId,
        });

        if (availableModels.length === 0) {
          throw new Error(
            "Nenhum modelo de IA disponível. Configure um modelo no AI Studio.",
          );
        }

        model = availableModels[0]!;
        console.log(`⚠️ [DEBUG] Usando modelo padrão: ${model.name}`);

        await ChatService.updateSession(session.id, {
          aiModelId: model.id,
        });
      }

      // Criar adapter e processar streaming com auto-save
      const adapter = new VercelAIAdapter();
      const response = await adapter.streamAndSave(
        {
          chatSessionId: session.id,
          content,
          modelId: model.id,
          teamId: session.teamId,
          messages: formattedMessages,
        },
        async (content: string, metadata: any) => {
          // Callback para salvar mensagem da IA
          await ChatService.createMessage({
            chatSessionId: session.id,
            senderRole: "ai",
            content,
            status: "ok",
            metadata,
          });
        },
      );

      // Interface ultra-limpa: apenas retornar o stream
      const headers: HeadersInit = {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Powered-By": "Vercel-AI-SDK", // Identificar que está usando o Vercel AI SDK
      };

      return new NextResponse(response.stream, { headers });
    } catch (error) {
      console.error("🔴 [VERCEL_AI] Erro no Vercel AI SDK:", error);
      throw error; // Re-throw para ser capturado pelo catch geral
    }
  } catch (error) {
    console.error("🔴 [API] Erro no endpoint de streaming:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
