import { TRPCError } from "@trpc/server";

import { appRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

// Helper para buscar modelo preferido seguindo hierarquia usando Service Layer
export async function getPreferredModelHelper(
  teamId: string,
  userId: string,
  requestingApp: typeof chatAppId,
): Promise<{
  source: "user_config" | "ai_studio_default" | "first_available";
  modelId: string;
  model: any;
  config?: any;
  teamConfig?: any;
}> {
  // ✅ 1ª Prioridade: Verificar preferredModelId nas configurações de USUÁRIO
  try {
    const userConfigs = await appRepository.findUserAppTeamConfigs({
      appId: chatAppId,
      teamIds: [teamId],
      userIds: [userId],
    });

    const userConfig = userConfigs[0]; // Só haverá um config por usuário/app/team
    const preferredModelId = userConfig
      ? (userConfig.config as any)?.preferredModelId
      : null;

    if (preferredModelId) {
      try {
        const model = await AiStudioService.getModelById({
          modelId: preferredModelId,
          teamId,
          requestingApp,
        });

        if (model) {
          return {
            source: "user_config",
            modelId: model.modelId,
            model,
            config: userConfig?.config,
          };
        }
      } catch (error) {
        console.log(
          "⚠️ [PREFERRED_MODEL] preferredModelId do User Config inválido, continuando para AI Studio",
        );
      }
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar User Config, continuando para AI Studio:",
      error,
    );
  }

  // ✅ 2ª Prioridade: Buscar modelo padrão no AI Studio via Service Layer
  try {
    const defaultModelConfig = await AiStudioService.getDefaultModel({
      teamId,
      requestingApp,
    });

    if (defaultModelConfig.model) {
      return {
        source: "ai_studio_default",
        modelId: defaultModelConfig.model.modelId,
        model: defaultModelConfig.model,
        teamConfig: defaultModelConfig,
      };
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar modelo padrão do AI Studio:",
      error,
    );
  }

  // ✅ 3ª Prioridade: Buscar primeiro modelo ativo disponível via Service Layer
  try {
    const availableModels = await AiStudioService.getAvailableModels({
      teamId,
      requestingApp,
    });

    const firstActiveModel = (availableModels || []).find(
      (m: any) => m.teamConfig?.enabled,
    );

    if (firstActiveModel) {
      return {
        source: "first_available",
        modelId: firstActiveModel.modelId,
        model: firstActiveModel,
        teamConfig: firstActiveModel.teamConfig,
      };
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar modelos disponíveis:",
      error,
    );
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
  });
}

export async function getPreferredModelHandler({
  ctx,
}: {
  ctx: TProtectedProcedureContext;
}) {
  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  try {
    const result = await getPreferredModelHelper(teamId, userId, chatAppId);

    return result;
  } catch (error: any) {
    console.error("❌ [PREFERRED_MODEL] Erro:", error);
    throw error;
  }
}
