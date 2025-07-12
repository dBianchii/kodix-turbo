import type { NextRequest } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { auth } from "@kdx/auth";
import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../../../../../../packages/api/src/internal/services/ai-studio.service";
import { ChatService } from "../../../../../../../packages/api/src/internal/services/chat.service";

// Helper function to create Vercel AI SDK models
async function getVercelModel(modelId: string, teamId: string) {
  const modelConfig = await AiStudioService.getModelById({
    modelId,
    teamId,
    requestingApp: chatAppId,
  });

  const providerToken = await AiStudioService.getProviderToken({
    providerId: modelConfig.providerId,
    teamId,
    requestingApp: chatAppId,
  });

  const providerName = modelConfig.provider.name.toLowerCase();
  const modelName =
    (modelConfig.config as any)?.modelId ||
    (modelConfig.config as any)?.version ||
    modelConfig.displayName;

  if (providerName === "openai") {
    const openaiProvider = createOpenAI({
      apiKey: providerToken.token,
      baseURL: modelConfig.provider.baseUrl || undefined,
    });
    return { model: openaiProvider(modelName), modelName };
  }

  if (providerName === "anthropic") {
    const anthropicProvider = createAnthropic({
      apiKey: providerToken.token,
      baseURL: modelConfig.provider.baseUrl || undefined,
    });
    return { model: anthropicProvider(modelName), modelName };
  }

  if (providerName === "google") {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: providerToken.token,
    });
    return { model: googleProvider(modelName), modelName };
  }

  throw new Error(`Provider ${modelConfig.provider.name} not supported.`);
}

export async function POST(request: NextRequest) {
  try {
    const authSession = await auth();
    if (!authSession?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, activeTeamId: teamId } = authSession.user;
    const body = await request.json();

    const chatSessionId = body.chatSessionId;
    const lastUserMessage = body.messages
      ?.filter((msg: any) => msg.role === "user")
      .pop();
    const content = lastUserMessage?.content;

    if (!chatSessionId || !content) {
      return Response.json(
        { error: "Invalid parameters: chatSessionId and content are required" },
        { status: 400 },
      );
    }

    const session = await ChatService.findSessionById(chatSessionId);
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    await ChatService.createMessage({
      chatSessionId: session.id,
      senderRole: "user",
      content,
      status: "ok",
    });

    const messages = await ChatService.findMessagesBySession({
      chatSessionId: session.id,
      limite: 20,
      offset: 0,
      ordem: "asc",
    });

    const systemPrompt = await AiStudioService.getSystemPrompt({
      teamId,
      userId,
      sessionId: session.id,
    });

    const formattedMessages: {
      role: "user" | "assistant" | "system";
      content: string;
    }[] = [];

    if (systemPrompt) {
      formattedMessages.push({ role: "system", content: systemPrompt });
    }

    messages.forEach((msg: any) => {
      // Defensively check for valid content before adding to the history.
      // This prevents errors if a message with null/empty content exists in the database.
      if (typeof msg.content === "string" && msg.content.trim() !== "") {
        formattedMessages.push({
          role: msg.senderRole === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    });

    const modelId =
      session.aiModelId ||
      (
        await AiStudioService.getAvailableModels({
          teamId,
          requestingApp: chatAppId,
        })
      )[0]!.id;

    if (!session.aiModelId) {
      await ChatService.updateSession(session.id, { aiModelId: modelId });
    }

    const { model: vercelModel, modelName } = await getVercelModel(
      modelId,
      teamId,
    );

    const result = streamText({
      model: vercelModel,
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 4000,
      onFinish: async ({ text, usage, finishReason }) => {
        await ChatService.createMessage({
          chatSessionId: session.id,
          senderRole: "ai",
          content: text,
          status: "ok",
          metadata: {
            requestedModel: modelName,
            actualModelUsed: modelName,
            providerId: (
              await AiStudioService.getModelById({
                modelId,
                teamId,
                requestingApp: chatAppId,
              })
            ).providerId,
            providerName: (
              await AiStudioService.getModelById({
                modelId,
                teamId,
                requestingApp: chatAppId,
              })
            ).provider.name,
            usage: usage || null,
            finishReason: finishReason || "stop",
            timestamp: new Date().toISOString(),
          },
        });
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    console.error("🔴 [API] Streaming endpoint error:", error);
    return Response.json(
      {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
