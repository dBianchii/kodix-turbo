"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseTitleSyncOptions {
  sessionId?: string;
  enabled?: boolean;
}

/**
 * ✅ THREAD-FIRST: Hook simplificado para sincronização de título
 *
 * Remove toda a lógica complexa de polling e retry.
 * Foca apenas em invalidar queries para refetch.
 */
export function useTitleSync({
  sessionId,
  enabled = true,
}: UseTitleSyncOptions) {
  const queryClient = useQueryClient();

  // ✅ THREAD-FIRST: Função simples para invalidar queries
  const syncNow = useCallback(async () => {
    if (!sessionId || !enabled) {
      console.log("⚠️ [TITLE_SYNC] Sync ignorado - sessionId ou enabled falso");
      return;
    }

    console.log("🔄 [TITLE_SYNC] Invalidando queries para sessão:", sessionId);

    try {
      // Invalidar query da sessão específica
      await queryClient.invalidateQueries({
        queryKey: ["app", "chat", "buscarSession", { sessionId }],
      });

      // Invalidar lista de sessões
      await queryClient.invalidateQueries({
        queryKey: ["app", "chat", "listarSessions"],
      });

      console.log("✅ [TITLE_SYNC] Queries invalidadas com sucesso");
    } catch (error) {
      console.error("❌ [TITLE_SYNC] Erro na sincronização:", error);
    }
  }, [sessionId, enabled, queryClient]);

  return {
    syncNow,
    isGenerating: false, // Sempre false já que não temos mutation
    error: null,
  };
}
