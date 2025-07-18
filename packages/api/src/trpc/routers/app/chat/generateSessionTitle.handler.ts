import { TRPCError } from "@trpc/server";

import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

export async function generateSessionTitleHandler({
  input,
  ctx,
}: {
  input: { sessionId: string; firstMessage: string };
  ctx: TProtectedProcedureContext;
}) {
  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  try {
    // 1. Verificar se a sessão existe e pertence ao usuário
    const session = await chatRepository.ChatSessionRepository.findById(
      input.sessionId,
    );

    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sessão não encontrada",
      });
    }

    if (session.userId !== userId || session.teamId !== teamId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Sem permissão para acessar esta sessão",
      });
    }

    // 2. Se já tem um título personalizado (não é o padrão), não gerar novo
    if (!session.title.startsWith("Chat ")) {
      return { title: session.title };
    }

    // 3. Buscar modelo preferido do usuário
    const availableModels = await AiStudioService.getAvailableModels({
      teamId,
      requestingApp: chatAppId,
    });

    if (!availableModels || availableModels.length === 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Nenhum modelo de IA disponível",
      });
    }

    const preferredModel = availableModels[0];
    if (!preferredModel) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Nenhum modelo de IA disponível",
      });
    }

    // 4. Gerar título usando IA
    try {
      // Buscar token do provider
      const providerToken = await AiStudioService.getProviderToken({
        providerId: preferredModel.providerId,
        teamId,
        requestingApp: chatAppId,
      });

      if (!providerToken.token) {
        throw new Error("Token do provider não disponível");
      }

      // Configurar API
      const baseUrl =
        preferredModel.provider?.baseUrl || "https://api.openai.com/v1";
      const apiUrl = `${baseUrl}/chat/completions`;

      const modelConfig = (preferredModel.config || {}) as {
        modelId?: string;
        version?: string;
      };
      const modelName =
        modelConfig.modelId ||
        modelConfig.version ||
        preferredModel.modelId;

      // Prompt para gerar título
      const titlePrompt = [
        {
          role: "system",
          content:
            "Você é um assistente especializado em criar títulos concisos. Crie um título curto (máximo 50 caracteres) que capture a essência da mensagem do usuário. Responda apenas com o título, sem aspas ou formatação adicional.",
        },
        {
          role: "user",
          content: `Crie um título para esta conversa: "${input.firstMessage}"`,
        },
      ];

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: titlePrompt,
          max_tokens: 20,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const aiResponse = (await response.json()) as any;
        const generatedTitle =
          aiResponse.choices?.[0]?.message?.content?.trim();

        if (generatedTitle && generatedTitle.length <= 50) {
          // 5. Atualizar título da sessão
          await chatRepository.ChatSessionRepository.update(input.sessionId, {
            title: generatedTitle,
          });

          return { title: generatedTitle };
        }
      }
    } catch (error) {
      console.error("⚠️ [GENERATE_TITLE] Erro ao gerar título com IA:", error);
    }

    // 6. Fallback: usar primeiros caracteres da mensagem
    let fallbackTitle = input.firstMessage.slice(0, 50);
    if (input.firstMessage.length > 50) {
      fallbackTitle += "...";
    }

    await chatRepository.ChatSessionRepository.update(input.sessionId, {
      title: fallbackTitle,
    });

    return { title: fallbackTitle };
  } catch (error: any) {
    console.error("❌ [GENERATE_TITLE] Erro:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "Erro ao gerar título da sessão",
    });
  }
}
