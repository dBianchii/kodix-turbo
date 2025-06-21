import { AssistantResponse } from "ai";
import { z } from "zod";

import { auth } from "@kdx/auth";
import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Schema para validação
const requestSchema = z.object({
  threadId: z.string().nullable(),
  message: z.string(),
});

export async function POST(req: Request) {
  try {
    // Autenticação
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse do body
    const body = await req.json();
    const input = requestSchema.parse(body);

    // Criar ou buscar thread (sessão)
    let threadId = input.threadId;

    if (!threadId) {
      // Criar nova sessão - simplificado por enquanto
      const newSession = await chatRepository.ChatSessionRepository.create({
        title: `Chat ${new Date().toLocaleDateString()}`,
        aiModelId: "default", // Será melhorado depois
        teamId: session.user.activeTeamId,
        userId: session.user.id,
      });

      if (!newSession) {
        throw new Error("Failed to create session");
      }

      threadId = newSession.id;
    }

    // Adicionar mensagem do usuário
    const userMessage = await chatRepository.ChatMessageRepository.create({
      chatSessionId: threadId,
      content: input.message,
      senderRole: "user",
      status: "ok",
    });

    if (!userMessage) {
      throw new Error("Failed to create message");
    }

    // Retornar resposta do Assistant
    return AssistantResponse(
      { threadId, messageId: userMessage.id },
      async ({ forwardStream }) => {
        // Por enquanto, usar o endpoint de stream existente
        // Isso será melhorado na próxima iteração
        const streamResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/chat/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              chatSessionId: threadId,
              useAgent: true,
            }),
          },
        );

        if (streamResponse.body) {
          // Forward the stream
          await forwardStream(streamResponse.body);
        }
      },
    );
  } catch (error) {
    console.error("❌ [ASSISTANT] Erro:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
