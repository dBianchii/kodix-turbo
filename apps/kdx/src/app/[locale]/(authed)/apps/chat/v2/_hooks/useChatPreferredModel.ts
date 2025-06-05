import { api } from "~/trpc/react";
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
  // ✅ USAR useChatUserConfig como fonte principal (configurações de USUÁRIO)
  const {
    config,
    isLoading: isConfigLoading,
    getPreferredModelId,
  } = useChatUserConfig();

  // ✅ Fallback para API do Chat apenas se não houver modelo no config de usuário
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const fallbackQuery = api.app.chat.getPreferredModel.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
    enabled: !isConfigLoading && !getPreferredModelId(), // Só buscar se não há modelo no config do usuário
    onSuccess: (data: any) => {
      console.log("✅ [CHAT] Modelo fallback carregado:", data);
    },
    onError: (error: any) => {
      console.error("❌ [CHAT] Erro ao carregar modelo fallback:", error);
    },
  });

  // ✅ Determinar o modelo a usar com prioridade
  const modelFromUserConfig = getPreferredModelId();
  const modelFromFallback = fallbackQuery.data?.modelId;

  const finalModelId = modelFromUserConfig || modelFromFallback;
  const source = modelFromUserConfig
    ? "user_config"
    : fallbackQuery.data?.source || "unknown";

  console.log("🔄 [useChatPreferredModel] Determinando modelo:", {
    modelFromUserConfig,
    modelFromFallback,
    finalModelId,
    source,
    isConfigLoading,
  });

  const isLoading =
    isConfigLoading || (!modelFromUserConfig && fallbackQuery.isLoading);
  const error = fallbackQuery.error;
  const refetch = () => {
    // Invalidar ambas as fontes
    fallbackQuery.refetch();
  };

  return {
    preferredModel: finalModelId
      ? {
          modelId: finalModelId,
          model: fallbackQuery.data?.model || null,
          source,
          teamConfig: fallbackQuery.data?.teamConfig || null,
          userConfig: config, // ✅ NOVO: Incluir config de usuário
        }
      : null,
    isLoading,
    error,
    refetch,

    // Helpers para facilitar o uso
    modelId: finalModelId,
    model: fallbackQuery.data?.model || null,
    source,

    // ✅ Verificações úteis atualizadas
    isFromUserConfig: source === "user_config", // NOVO
    isFromAiStudio: source === "ai_studio_default",
    isFallback: source === "first_available",

    // Informações adicionais
    hasTeamConfig: !!fallbackQuery.data?.teamConfig,
    hasUserConfig: !!config, // ✅ NOVO

    // Status helpers
    isReady: !isLoading && !!finalModelId,
    hasError: !!error,
  };
}
