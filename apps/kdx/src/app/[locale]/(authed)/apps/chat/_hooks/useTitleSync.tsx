"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface UseTitleSyncOptions {
  sessionId: string;
  enabled: boolean;
}

/**
 * ✅ THREAD-FIRST: Hook simplificado para sincronização de título
 *
 * Remove toda a lógica complexa de polling e retry.
 * Foca apenas em invalidar queries para refetch.
 */
export function useTitleSync({ sessionId, enabled }: UseTitleSyncOptions) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // ✅ THREAD-FIRST: Função simples para invalidar queries
  const syncNow = useCallback(async () => {
    if (!sessionId || !enabled) {
      // Title sync ignored - log removed for performance
      return;
    }

    // Invalidating queries for session - log removed for performance

    try {
      // Invalida a query para forçar o refetch dos dados da sessão (incluindo título)
      await queryClient.invalidateQueries({
        queryKey: trpc.app.chat.findSession.queryKey({ sessionId }),
      });

      // Invalidar lista de sessões para consistência
      await queryClient.invalidateQueries(
        trpc.app.chat.findSessions.pathFilter(),
      );

      // Title sync queries invalidated - log removed for performance
    } catch (error) {
      console.error("❌ [TITLE_SYNC] Erro na sincronização:", error);
    }
  }, [sessionId, enabled, queryClient, trpc]);

  return {
    syncNow,
    isGenerating: false, // Sempre false já que não temos mutation
    error: null,
  };
}
