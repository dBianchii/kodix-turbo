"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();

  const syncNow = useCallback(async () => {
    if (!sessionId || !enabled) {
      return;
    }

    try {
      // Usar invalidação direta com queryKey construída manualmente
      await queryClient.invalidateQueries({
        queryKey: ["app", "chat", "findSession", { sessionId }],
      });
    } catch (error) {
      console.error("Erro ao sincronizar título:", error);
    }
  }, [sessionId, enabled, queryClient]);

  return {
    syncNow,
    isSyncing: false, // Simplificado - não precisamos do status de loading
  };
}
