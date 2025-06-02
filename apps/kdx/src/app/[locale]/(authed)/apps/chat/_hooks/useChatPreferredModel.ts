import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

/**
 * Hook para buscar o modelo preferido do team seguindo hierarquia de prioridade:
 * 1ª Prioridade: lastSelectedModelId do Chat Team Config
 * 2ª Prioridade: Modelo padrão do AI Studio (via HTTP)
 * 3ª Prioridade: Primeiro modelo ativo disponível (via HTTP)
 *
 * ✅ Implementação respeitando isolamento total entre subapps
 * Chat ──HTTP──> AI Studio API ──> AI Studio Repository ──> Database
 */
export function useChatPreferredModel() {
  const trpc = useTRPC();

  const {
    data: preferredModel,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...trpc.app.chat.getPreferredModel.queryOptions(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });

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
