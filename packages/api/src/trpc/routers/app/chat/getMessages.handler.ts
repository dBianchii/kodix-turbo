import type { z } from "zod";
import { TRPCError } from "@trpc/server";

import type { getMessagesSchema } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetMessagesOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof getMessagesSchema>;
}

export const getMessagesHandler = async ({
  ctx,
  input,
}: GetMessagesOptions) => {
  try {
    // Verificar se a sessão existe e pertence ao usuário/team
    const session = await chatRepository.ChatSessionRepository.findById(
      input.chatSessionId,
    );
    if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chat session not found",
      });
    }

    const { limit, page, order } = input;
    const offset = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      chatRepository.ChatMessageRepository.findBySession({
        chatSessionId: input.chatSessionId,
        limite: limit, // Manter compatibilidade com repository
        offset,
        ordem: order, // Manter compatibilidade com repository
      }),
      chatRepository.ChatMessageRepository.countBySession(input.chatSessionId),
    ]);

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("🔴 [CHAT_API] Error fetching messages:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error fetching messages",
      cause: error,
    });
  }
};
