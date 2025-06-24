import type { NextRequest } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../../../../../../packages/api/src/internal/services/ai-studio.service";
import { ChatService } from "../../../../../../../packages/api/src/internal/services/chat.service";

// Helper function to create Vercel AI SDK models
async function getVercelModel(modelId: string, teamId: string) {
  // Get model configuration
  const modelConfig = await AiStudioService.getModelById({
    modelId,
    teamId,
    requestingApp: chatAppId,
  });

  // Get provider token
  const providerToken = await AiStudioService.getProviderToken({
    providerId: modelConfig.providerId,
    teamId,
    requestingApp: chatAppId,
  });

  // Create provider based on type
  const providerName = modelConfig.provider.name.toLowerCase();
  const modelName = (modelConfig.config as any)?.version || modelConfig.name;

  if (providerName === "openai") {
    const openaiProvider = createOpenAI({
      apiKey: providerToken.token,
      baseURL: modelConfig.provider.baseUrl || undefined,
    });
    return {
      model: openaiProvider(modelName),
      modelName: modelName,
    };
  }

  if (providerName === "anthropic") {
    const anthropicProvider = createAnthropic({
      apiKey: providerToken.token,
      baseURL: modelConfig.provider.baseUrl || undefined,
    });
    return {
      model: anthropicProvider(modelName),
      modelName: modelName,
    };
  }

  throw new Error(
    `Provider ${modelConfig.provider.name} not supported. Supported: OpenAI, Anthropic.`,
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ FIXO: Aceitar tanto formato useChat quanto formato customizado
    let chatSessionId;
    let content;
    let useAgent;
    let skipUserMessage;

    if (body.messages && Array.isArray(body.messages)) {
      // Formato useChat do Vercel AI SDK
      chatSessionId = body.chatSessionId;
      useAgent = body.useAgent ?? true;
      skipUserMessage = body.skipUserMessage ?? false;

      // Extrair última mensagem do usuário
      const lastUserMessage = body.messages
        .filter((msg: any) => msg.role === "user")
        .pop();

      content = lastUserMessage?.content;

      if (!content) {
        return Response.json(
          { error: "No user message found in messages array" },
          { status: 400 },
        );
      }
    } else {
      // Formato customizado original
      chatSessionId = body.chatSessionId;
      content = body.content;
      useAgent = body.useAgent ?? true;
      skipUserMessage = body.skipUserMessage ?? false;
    }

    if (!chatSessionId || !content) {
      return Response.json(
        { error: "Invalid parameters: chatSessionId and content are required" },
        { status: 400 },
      );
    }

    // Check if session exists
    const session = await ChatService.findSessionById(chatSessionId);
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ TEMPORARY: Agent will be removed from streaming flow for now
    // TODO: Implement getAgentById in AiStudioService
    const agent = null;
    if (session.aiAgentId) {
      console.log(
        `⚠️ [DEBUG] Agent ${session.aiAgentId} will be ignored in streaming for now`,
      );
    }

    // ✅ CORRECTION: Create user message only if not skipUserMessage
    let userMessage;
    let recentMessages: any[] | null = null;

    if (skipUserMessage) {
      console.log(
        "🔄 [API] Skipping user message creation (skipUserMessage=true)",
      );
      // Search for the most recent user message with the same content
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
        console.warn("⚠️ [API] User message not found, creating new one");
        userMessage = await ChatService.createMessage({
          chatSessionId: session.id,
          senderRole: "user",
          content,
          status: "ok",
        });
      }
    } else {
      // Normal behavior: create new user message
      userMessage = await ChatService.createMessage({
        chatSessionId: session.id,
        senderRole: "user",
        content,
        status: "ok",
      });
    }

    if (!useAgent) {
      return Response.json({
        userMessage,
        sessionId: session.id,
      });
    }

    // ✅ CORRECTION: Get message history or reuse if already loaded
    let messages;
    if (skipUserMessage && recentMessages) {
      // If we already loaded messages to search for user message, reuse and sort
      messages = recentMessages.reverse(); // Reverse to chronological order
    } else {
      // Get history normally
      messages = await ChatService.findMessagesBySession({
        chatSessionId: session.id,
        limite: 20,
        offset: 0,
        ordem: "asc",
      });
    }

    // ✅ CORRECTION: Include user message only if not already included
    const userMessageExists = messages.some(
      (msg: any) => msg.id === userMessage?.id,
    );
    const allMessages = userMessageExists
      ? messages
      : [...messages, userMessage];

    // 🚀 NATIVE VERCEL AI SDK IMPLEMENTATION
    try {
      // Detect user language more robustly
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

      // Check if there are Team Instructions in the session
      const hasTeamInstructions = allMessages.some(
        (msg) =>
          msg?.senderRole === "system" &&
          msg?.metadata?.type === "team_instructions",
      );

      // System prompt based on user language - FORMATO MARKDOWN
      const userLocale = detectUserLocale(request);
      const systemPrompt =
        userLocale === "pt-BR"
          ? "Você é um assistente útil e responde sempre em português brasileiro. Use formatação Markdown para suas respostas (não HTML). Use **negrito**, *itálico*, # títulos, listas com - ou 1., blocos de código com ```."
          : "You are a helpful assistant and always respond in English. Use Markdown formatting for your responses (not HTML). Use **bold**, *italic*, # headings, lists with - or 1., code blocks with ```.";

      // Format messages for Vercel AI SDK
      const formattedMessages: {
        role: "user" | "assistant" | "system";
        content: string;
      }[] = [];

      // Only add system prompt if there are no Team Instructions
      if (!hasTeamInstructions) {
        const hasSystemPrompt = allMessages.some(
          (msg) => msg?.senderRole === "system",
        );
        if (!hasSystemPrompt) {
          formattedMessages.push({
            role: "system",
            content: systemPrompt,
          });
        }
      }

      // Add all existing messages
      allMessages.forEach((msg: any) => {
        const role =
          msg.senderRole === "user"
            ? ("user" as const)
            : msg.senderRole === "ai"
              ? ("assistant" as const)
              : msg.senderRole === "system"
                ? ("system" as const)
                : ("user" as const);

        formattedMessages.push({
          role,
          content: msg.content,
        });
      });

      // Get model from session or use default
      let model;
      if (session.aiModelId) {
        try {
          model = await AiStudioService.getModelById({
            modelId: session.aiModelId,
            teamId: session.teamId,
            requestingApp: chatAppId,
          });
        } catch (error) {
          // Model not found, continue to default selection
        }
      }

      // If no model found, use default model
      if (!model) {
        const availableModels = await AiStudioService.getAvailableModels({
          teamId: session.teamId,
          requestingApp: chatAppId,
        });

        if (availableModels.length === 0) {
          throw new Error(
            "No AI models available. Configure a model in AI Studio.",
          );
        }

        model = availableModels[0]!;
        console.log(`⚠️ [DEBUG] Using default model: ${model.name}`);

        await ChatService.updateSession(session.id, {
          aiModelId: model.id,
        });
      }

      // Get Vercel AI SDK native model
      const { model: vercelModel, modelName } = await getVercelModel(
        model.id,
        session.teamId,
      );

      // 🎯 NATIVE VERCEL AI SDK STREAMING WITH LIFECYCLE CALLBACKS
      const result = streamText({
        model: vercelModel,
        messages: formattedMessages,
        temperature: 0.7,
        maxTokens: 4000,
        // ✅ NATIVE onFinish callback for auto-save
        onFinish: async ({ text, usage, finishReason }) => {
          console.log("✅ [VERCEL_AI_NATIVE] Stream finished:", {
            tokens: usage.totalTokens,
            reason: finishReason,
            textLength: text.length,
          });

          try {
            // Auto-save AI message with native metadata
            await ChatService.createMessage({
              chatSessionId: session.id,
              senderRole: "ai",
              content: text,
              status: "ok",
              metadata: {
                requestedModel: modelName,
                actualModelUsed: modelName,
                providerId: "vercel-ai-sdk-native",
                providerName: "Vercel AI SDK Native",
                usage: usage || null,
                finishReason: finishReason || "stop",
                timestamp: new Date().toISOString(),
                migrationStatus: "native-implementation",
              },
            });
            console.log(
              "💾 [VERCEL_AI_NATIVE] Message auto-saved successfully",
            );
          } catch (saveError) {
            console.error("🔴 [VERCEL_AI_NATIVE] Auto-save error:", saveError);
            // Don't throw error to avoid interrupting stream
          }
        },
        // ✅ NATIVE onError callback for robust error handling
        onError: (error) => {
          console.error("🔴 [VERCEL_AI_NATIVE] Stream error:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            sessionId: session.id,
            modelId: model.id,
          });
          // Error will be handled by the outer try/catch
        },
      });

      // 🚀 CORREÇÃO FINAL: Usar toDataStreamResponse oficial do Vercel AI SDK
      console.log(
        "🎯 [VERCEL_AI_NATIVE] Returning toDataStreamResponse for useChat compatibility",
      );

      // 🚀 SOLUÇÃO OFICIAL: Headers específicos para resolver problemas de streaming
      return result.toDataStreamResponse({
        headers: {
          "X-Powered-By": "Vercel-AI-SDK-Native",
          "X-Migration-Status": "Complete-Native-Implementation",
          "X-Stream-Protocol": "data-stream-native",
          // ✅ SOLUÇÃO DOCUMENTADA: Headers para resolver streaming buffering
          "Transfer-Encoding": "chunked",
          Connection: "keep-alive",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Accel-Buffering": "no", // Nginx: desabilita buffering
        },
      });
    } catch (error) {
      console.error(
        "🔴 [VERCEL_AI_NATIVE] Native implementation error:",
        error,
      );
      throw error; // Re-throw to be caught by general catch
    }
  } catch (error) {
    console.error("🔴 [API] Streaming endpoint error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
