import { TRPCError } from "@trpc/server";

import { appRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

// Helper para buscar modelo preferido seguindo hierarquia usando Service Layer
export async function getPreferredModelHelper(
  teamId: string,
  requestingApp: typeof chatAppId,
): Promise<{
  source: "chat_config" | "ai_studio_default" | "first_available";
  modelId: string;
  model: any;
  config?: any;
  teamConfig?: any;
}> {
  // 1ª Prioridade: Verificar lastSelectedModelId no Chat Team Config
  try {
    const chatConfigs = await appRepository.findAppTeamConfigs({
      appId: chatAppId,
      teamIds: [teamId],
    });

    const chatConfig = chatConfigs.find(
      (config: any) => config.teamId === teamId,
    );
    const lastSelectedModelId = chatConfig
      ? (chatConfig.config as any)?.lastSelectedModelId
      : null;

    if (lastSelectedModelId) {
      console.log(
        "✅ [PREFERRED_MODEL] Encontrado lastSelectedModelId:",
        lastSelectedModelId,
      );

      try {
        // ✅ USAR SERVICE LAYER ao invés de HTTP
        const model = await AiStudioService.getModelById({
          modelId: lastSelectedModelId,
          teamId,
          requestingApp,
        });

        if (model) {
          console.log("✅ [PREFERRED_MODEL] Modelo encontrado:", model.name);
          return {
            source: "chat_config",
            modelId: model.id,
            model,
            config: chatConfig?.config,
          };
        }
      } catch (error) {
        console.log(
          "⚠️ [PREFERRED_MODEL] lastSelectedModelId inválido, continuando para próximo fallback",
        );
      }
    }
  } catch (error) {
    console.log(
      "⚠️ [PREFERRED_MODEL] Erro ao buscar chat config, continuando para AI Studio:",
      error,
    );
  }

  // 2ª Prioridade: Buscar modelo padrão no AI Studio via Service Layer
  try {
    // ✅ USAR SERVICE LAYER ao invés de HTTP
    const defaultModelConfig = await AiStudioService.getDefaultModel({
      teamId,
      requestingApp,
    });

    if (defaultModelConfig.model) {
      console.log(
        "✅ [PREFERRED_MODEL] Modelo padrão do AI Studio encontrado:",
        defaultModelConfig.model.name,
      );
      return {
        source: "ai_studio_default",
        modelId: defaultModelConfig.model.id,
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

  // 3ª Prioridade: Buscar primeiro modelo ativo disponível via Service Layer
  try {
    // ✅ USAR SERVICE LAYER ao invés de HTTP
    const availableModels = await AiStudioService.getAvailableModels({
      teamId,
      requestingApp,
    });

    const firstActiveModel = (availableModels || []).find(
      (m: any) => m.teamConfig?.enabled,
    );

    if (firstActiveModel) {
      console.log(
        "🔄 [PREFERRED_MODEL] Usando primeiro modelo ativo como fallback:",
        firstActiveModel.name,
      );
      return {
        source: "first_available",
        modelId: firstActiveModel.id,
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

  try {
    console.log(
      "🎯 [PREFERRED_MODEL] Buscando modelo preferido para team:",
      teamId,
    );

    const result = await getPreferredModelHelper(teamId, chatAppId);

    console.log(
      `✅ [PREFERRED_MODEL] Modelo encontrado via ${result.source}:`,
      result.model.name,
    );

    return result;
  } catch (error: any) {
    console.error("❌ [PREFERRED_MODEL] Erro:", error);
    throw error;
  }
}
