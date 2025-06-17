import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { useChatUserConfig } from "./useChatUserConfig";

/**
 * Hook para buscar o modelo preferido do usuário seguindo hierarquia de prioridade:
 * 1ª Prioridade: preferredModelId do usuário (via useChatUserConfig)
 * 2ª Prioridade: Modelo padrão do AI Studio (via Service Layer)
 * 3ª Prioridade: Primeiro modelo ativo disponível (via Service Layer)
 *
 * ✅ CORRIGIDO: Agora usa useChatUserConfig com escopo de USUÁRIO, não team
 * Chat ──useChatUserConfig──> userAppTeamConfig ──> Fallback para AI Studio
 */
export function useChatPreferredModel() {
  const trpc = useTRPC();

  // ✅ USAR useChatUserConfig como fonte principal (configurações de USUÁRIO)
  const {
    config,
    isLoading: isConfigLoading,
    getPreferredModelId,
  } = useChatUserConfig();

  // ✅ Simplificado: usar apenas config do usuário por enquanto
  const modelFromUserConfig = getPreferredModelId();
  const finalModelId = modelFromUserConfig;
  const source = modelFromUserConfig ? "user_config" : "none";

  console.log("🔄 [useChatPreferredModel] Determinando modelo:", {
    modelFromUserConfig,
    finalModelId,
    source,
    isConfigLoading,
  });

  const isLoading = isConfigLoading;
  const error = null;
  const refetch = () => {
    // Nada para refetch por enquanto
  };

  return {
    preferredModel: finalModelId
      ? {
          modelId: finalModelId,
          model: null,
          source,
          teamConfig: null,
          userConfig: config,
        }
      : null,
    isLoading,
    error,
    refetch,

    // Helpers para facilitar o uso
    modelId: finalModelId,
    model: null,
    source,

    // ✅ Verificações úteis atualizadas
    isFromUserConfig: source === "user_config",
    isFromAiStudio: false,
    isFallback: false,

    // Informações adicionais
    hasTeamConfig: false,
    hasUserConfig: !!config,

    // Status helpers
    isReady: !isLoading && !!finalModelId,
    hasError: false,
  };
}
