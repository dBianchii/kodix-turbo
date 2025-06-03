import { api } from "~/trpc/react";

/**
 * Hook para buscar o modelo preferido do team seguindo hierarquia de prioridade:
 * 1ª Prioridade: lastSelectedModelId do Chat Team Config
 * 2ª Prioridade: Modelo padrão do AI Studio (via Service Layer)
 * 3ª Prioridade: Primeiro modelo ativo disponível (via Service Layer)
 *
 * ✅ Implementação respeitando isolamento lógico entre subapps
 * Chat ──Service Layer──> AI Studio Repository ──> Database
 */
export function useChatPreferredModel() {
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const query = api.app.chat.getPreferredModel.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
    onSuccess: (data: any) => {
      console.log("✅ [CHAT] Modelo preferido carregado:", data);
    },
    onError: (error: any) => {
      console.error("❌ [CHAT] Erro ao carregar modelo preferido:", error);
    },
  });

  const preferredModel = query.data;
  const isLoading = query.isLoading;
  const error = query.error;
  const refetch = query.refetch;

  return {
    preferredModel,
    isLoading,
    error,
    refetch,

    // Helpers para facilitar o uso
    modelId: preferredModel?.modelId,
    model: preferredModel?.model,
    source: preferredModel?.source,

    // Verificações úteis
    isFromChatConfig: preferredModel?.source === "chat_config",
    isFromAiStudio: preferredModel?.source === "ai_studio_default",
    isFallback: preferredModel?.source === "first_available",

    // Informações adicionais
    hasTeamConfig: !!preferredModel?.teamConfig,
    hasChatConfig: !!preferredModel?.config,

    // Status helpers
    isReady: !isLoading && !!preferredModel?.modelId,
    hasError: !!error,
  };
}
