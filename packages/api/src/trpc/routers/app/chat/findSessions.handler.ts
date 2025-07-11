import type { z } from "zod";
import { TRPCError } from "@trpc/server";

import type { buscarChatSessionsSchema } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface FindSessionsOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof buscarChatSessionsSchema>;
}

export const findSessionsHandler = async ({
  ctx,
  input,
}: FindSessionsOptions) => {
  try {
    const { limite, pagina, ...filtros } = input;
    const offset = (pagina - 1) * limite;

    const [sessions, total] = await Promise.all([
      chatRepository.ChatSessionRepository.findByTeam({
        teamId: ctx.auth.user.activeTeamId,
        ...filtros,
        limite,
        offset,
      }),
      chatRepository.ChatSessionRepository.countByTeam(
        ctx.auth.user.activeTeamId,
        filtros.userId,
        filtros.chatFolderId,
        filtros.busca,
      ),
    ]);

    return {
      sessions,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  } catch (error) {
    console.error("Erro ao listar sessões de chat:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao listar sessões de chat",
      cause: error,
    });
  }
};
