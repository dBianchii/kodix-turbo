import { TRPCError } from "@trpc/server";

import type { CreateEmptySessionInput } from "@kdx/validators/trpc/app";
import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";
import { ChatService } from "../../../../internal/services/chat.service";

export async function createEmptySessionHandler({
  input,
  ctx,
}: {
  input: CreateEmptySessionInput;
  ctx: TProtectedProcedureContext;
}) {
  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  try {
    console.log(
      "🚀 [CREATE_EMPTY] Iniciando criação de sessão vazia para team:",
      teamId,
    );

    // 1. Buscar primeiro modelo disponível (simplificado)
    let aiModelId: string;

    try {
      const availableModels = await AiStudioService.getAvailableModels({
        teamId,
        requestingApp: chatAppId,
      });

      if (availableModels && availableModels.length > 0) {
        const firstModel = availableModels[0];
        aiModelId = firstModel!.id;
        console.log("✅ [CREATE_EMPTY] Modelo encontrado:", firstModel?.name);
      } else {
        throw new Error("Nenhum modelo disponível");
      }
    } catch (error) {
      console.error("❌ [CREATE_EMPTY] Erro ao buscar modelo:", error);
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
      });
    }

    // 2. Definir título da sessão
    const title = input.title || `Chat ${new Date().toLocaleDateString()}`;

    // 3. Criar sessão VAZIA (sem mensagens)
    const session = await chatRepository.ChatSessionRepository.create({
      title,
      aiModelId,
      teamId,
      userId,
    });

    if (!session?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao criar sessão de chat",
      });
    }

    console.log("✅ [CREATE_EMPTY] Sessão vazia criada:", session.id);

    // 🎯 Criar Team Instructions se configuradas
    try {
      const teamInstructions = await AiStudioService.getTeamInstructions({
        teamId,
        requestingApp: chatAppId,
      });

      if (teamInstructions?.content?.trim()) {
        console.log(
          `🎯 [CREATE_EMPTY] Criando Team Instructions para sessão: ${session.id}`,
        );

        await ChatService.createSystemMessage({
          chatSessionId: session.id,
          content: teamInstructions.content,
          metadata: {
            type: "team_instructions",
            appliesTo: teamInstructions.appliesTo,
            createdAt: new Date().toISOString(),
          },
        });

        console.log(
          `✅ [CREATE_EMPTY] Team Instructions criadas para sessão: ${session.id}`,
        );
      }
    } catch (error) {
      // Log do erro mas não falha a criação da sessão
      console.warn(
        `⚠️ [CREATE_EMPTY] Erro ao criar Team Instructions para sessão ${session.id}:`,
        error,
      );
    }

    console.log(
      "🎉 [CREATE_EMPTY] Sessão vazia criada com sucesso!",
      session.id,
      "- Título:",
      title,
    );

    return {
      session,
      // Sem mensagens iniciais!
      userMessage: null,
      aiMessage: null,
    };
  } catch (error: any) {
    console.error("❌ [CREATE_EMPTY] Erro:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "Erro ao criar sessão vazia",
    });
  }
}
