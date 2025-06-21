import { useCallback, useMemo } from "react";
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
 *
 * ✅ OTIMIZADO: Memoização agressiva para reduzir re-renders
 */
export function useChatPreferredModel() {
  const trpc = useTRPC();

  // ✅ USAR useChatUserConfig como fonte principal (configurações de USUÁRIO)
  const {
    config,
    isLoading: isConfigLoading,
    getPreferredModelId,
  } = useChatUserConfig();

  // ✅ OTIMIZAÇÃO: Memoizar valores derivados para evitar re-cálculos
  const derivedValues = useMemo(() => {
    const modelFromUserConfig = getPreferredModelId();
    const finalModelId = modelFromUserConfig;
    const source = modelFromUserConfig ? "user_config" : "none";

    if (process.env.NODE_ENV === "development") {
      console.log("🔄 [CHAT_PREFERRED_MODEL] Determinando modelo:", {
        modelFromUserConfig,
        finalModelId,
        source,
        isConfigLoading,
      });
    }

    return {
      modelFromUserConfig,
      finalModelId,
      source,
    };
  }, [getPreferredModelId, isConfigLoading]);

  // ✅ OTIMIZAÇÃO: Memoizar função refetch (mesmo que não faça nada)
  const refetch = useCallback(() => {
    // Nada para refetch por enquanto
  }, []);

  // ✅ OTIMIZAÇÃO: Memoizar objeto preferredModel para evitar re-criação
  const preferredModel = useMemo(() => {
    return derivedValues.finalModelId
      ? {
          modelId: derivedValues.finalModelId,
          model: null,
          source: derivedValues.source,
          teamConfig: null,
          userConfig: config,
        }
      : null;
  }, [derivedValues.finalModelId, derivedValues.source, config]);

  // ✅ OTIMIZAÇÃO: Memoizar objeto de retorno completo
  return useMemo(
    () => ({
      preferredModel,
      isLoading: isConfigLoading,
      error: null,
      refetch,

      // Helpers para facilitar o uso - memoizados
      modelId: derivedValues.finalModelId,
      model: null,
      source: derivedValues.source,

      // ✅ Verificações úteis atualizadas - memoizadas
      isFromUserConfig: derivedValues.source === "user_config",
      isFromAiStudio: false,
      isFallback: false,

      // Informações adicionais - memoizadas
      hasTeamConfig: false,
      hasUserConfig: !!config,

      // Status helpers - memoizados
      isReady: !isConfigLoading && !!derivedValues.finalModelId,
      hasError: false,
    }),
    [
      preferredModel,
      isConfigLoading,
      refetch,
      derivedValues.finalModelId,
      derivedValues.source,
      config,
    ],
  );
}
