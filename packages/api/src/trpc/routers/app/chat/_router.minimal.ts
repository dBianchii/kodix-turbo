import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../../procedures";

export const chatRouter: TRPCRouterRecord = {
  // ===============================
  // TESTE BÁSICO
  // ===============================
  testQuery: protectedProcedure
    .input(z.object({ test: z.string() }))
    .query(async ({ input }) => {
      return { message: `Test funcionando: ${input.test}` };
    }),

  // ===============================
  // ENDPOINT PARA NOVO CHAT
  // ===============================
  autoCreateSessionWithMessage: protectedProcedure
    .input(
      z.object({
        firstMessage: z.string(),
        useAgent: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Implementação temporária básica
      return {
        success: true,
        sessionId: "temp-session-id",
        message: `Nova sessão criada com: ${input.firstMessage}`,
        useAgent: input.useAgent,
      };
    }),
};
