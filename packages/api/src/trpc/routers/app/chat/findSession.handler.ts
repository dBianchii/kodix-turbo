import type { z } from "zod";
import { TRPCError } from "@trpc/server";

import type { sessionIdSchema } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface FindSessionOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof sessionIdSchema>;
}

export const findSessionHandler = async ({
  ctx,
  input,
}: FindSessionOptions) => {
  try {
    const session = await chatRepository.ChatSessionRepository.findById(
      input.sessionId,
    );

    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sessão de chat não encontrada",
      });
    }

    // Verificar se o usuário tem acesso (mesmo team)
    if (session.teamId !== ctx.auth.user.activeTeamId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Acesso negado",
      });
    }

    return session;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Erro ao buscar sessão de chat:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao buscar sessão de chat",
      cause: error,
    });
  }
};
