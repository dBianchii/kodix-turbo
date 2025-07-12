import type { NextRequest } from "next/server";

import { auth } from "@kdx/auth";
import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../../../../../../packages/api/src/internal/services/ai-studio.service";
import { ChatService } from "../../../../../../../packages/api/src/internal/services/chat.service";

interface RequestBody {
  chatSessionId: string;
  messages?: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
}

interface Message {
  senderRole: "user" | "ai";
  content: string;
}

interface MessageData {
  content: string;
  metadata: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const authSession = await auth();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!authSession?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, activeTeamId: teamId } = authSession.user;

    const body = (await request.json()) as RequestBody;

    const chatSessionId = body.chatSessionId;
    const lastUserMessage = body.messages
      ?.filter((msg) => msg.role === "user")
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

    (messages as Message[]).forEach((msg) => {
      // Defensively check for valid content before adding to the history.
      // This prevents errors if a message with null/empty content exists in the database.
      if (typeof msg.content === "string" && msg.content.trim() !== "") {
        formattedMessages.push({
          role: msg.senderRole === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    });

    const availableModels = await AiStudioService.getAvailableModels({
      teamId,
      requestingApp: chatAppId,
    });

    const modelId = session.aiModelId || availableModels[0]?.id;

    if (!modelId) {
      return Response.json({ error: "No models available" }, { status: 500 });
    }

    if (!session.aiModelId) {
      await ChatService.updateSession(session.id, { aiModelId: modelId });
    }

    // Use centralized AiStudioService
    return AiStudioService.streamChatResponse({
      messages: formattedMessages,
      sessionId: session.id,
      userId,
      teamId,
      modelId: session.aiModelId || modelId,
      onMessageSave: async (messageData: MessageData) => {
        await ChatService.createMessage({
          chatSessionId: session.id,
          senderRole: "ai",
          content: messageData.content,
          status: "ok",
          metadata: messageData.metadata,
        });
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
