import type { TRPCClientErrorLike } from "@trpc/client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import type { AppRouter } from "@kdx/api";
import type { CreateEmptySessionInput } from "@kdx/validators/trpc/app";

import { useTRPC } from "~/trpc/react";

interface UseEmptySessionOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: TRPCClientErrorLike<AppRouter>) => void;
}

export function useEmptySession(options?: UseEmptySessionOptions) {
  const router = useRouter();
  const trpc = useTRPC();
  const [isCreating, setIsCreating] = useState(false);

  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (data) => {
        const sessionId = data.session.id;

        // Chamar callback de sucesso
        options?.onSuccess?.(sessionId);

        // Navegar para a nova sessão
        router.push(`/apps/chat/${sessionId}`);
      },
      onError: (error) => {
        console.error("❌ [USE_EMPTY_SESSION] Erro ao criar sessão:", error);
        options?.onError?.(error);
        setIsCreating(false);
      },
    }),
  );

  const createEmptySession = useCallback(
    async (input: CreateEmptySessionInput) => {
      if (isCreating) return;

      setIsCreating(true);
      try {
        await createEmptySessionMutation.mutateAsync(input);
      } finally {
        setIsCreating(false);
      }
    },
    [createEmptySessionMutation, isCreating],
  );

  return {
    createEmptySession,
    isCreating,
  };
}
