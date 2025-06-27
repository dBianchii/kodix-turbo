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
      // Title sync ignored - log removed for performance
      return;
    }

    // Invalidating queries for session - log removed for performance

    try {
      // Invalidar query da sessão específica
      await queryClient.invalidateQueries({
        queryKey: ["app", "chat", "buscarSession", { sessionId }],
      });

      // Invalidar lista de sessões
      await queryClient.invalidateQueries({
        queryKey: ["app", "chat", "listarSessions"],
      });

      // Title sync queries invalidated - log removed for performance
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
