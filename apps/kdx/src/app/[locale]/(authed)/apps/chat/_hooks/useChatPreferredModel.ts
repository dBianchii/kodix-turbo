import { useQuery } from "@tanstack/react-query";

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
  const query = useQuery({
    queryKey: ["chat", "preferred-model"],
    queryFn: async () => {
      // Formato correto para tRPC query batch
      const input = {
        0: {}, // getPreferredModel não tem parâmetros
      };

      const params = new URLSearchParams({
        batch: "1",
        input: JSON.stringify(input),
      });

      const response = await fetch(
        `/api/trpc/app.chat.getPreferredModel?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Para batch queries, o resultado vem em um array
      return data[0]?.result?.data || null;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
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
