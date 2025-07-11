"use client";

import type { TRPCClientErrorLike } from "@trpc/client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { AppRouter } from "@kdx/api";
import type {
  AutoCreateSessionWithMessageInput,
  CreateEmptySessionInput,
} from "@kdx/validators/trpc/app";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

interface UseChatSessionManagerOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: TRPCClientErrorLike<AppRouter>) => void;
}

export function useChatSessionManager(options?: UseChatSessionManagerOptions) {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<TRPCClientErrorLike<AppRouter> | null>(
    null,
  );

  const handleSuccess = (sessionId: string) => {
    void queryClient.invalidateQueries(trpc.app.chat.findSessions.pathFilter());
    options?.onSuccess?.(sessionId);
    setIsCreating(false);
  };

  const handleError = (error: TRPCClientErrorLike<AppRouter>) => {
    trpcErrorToastDefault(error);
    setError(error);
    options?.onError?.(error);
    setIsCreating(false);
  };

  const createEmptySessionMutation = useMutation(
    trpc.app.chat.createEmptySession.mutationOptions({
      onSuccess: (result) => handleSuccess(result.session.id),
      onError: handleError,
    }),
  );

  const createSessionWithMessageMutation = useMutation(
    trpc.app.chat.autoCreateSessionWithMessage.mutationOptions({
      onSuccess: (result) => {
        if (result?.session?.id) {
          toast.success(t("apps.chat.sessions.created"));
          handleSuccess(result.session.id);
        }
      },
      onError: handleError,
    }),
  );

  const createSessionWithMessage = async (
    input: AutoCreateSessionWithMessageInput,
  ) => {
    if (isCreating) {
      toast.info(t("apps.chat.actions.creating"));
      return;
    }
    if (!input.firstMessage.trim()) {
      toast.error(t("apps.chat.sessions.error"));
      return;
    }

    setIsCreating(true);
    setError(null);

    await createSessionWithMessageMutation.mutateAsync({
      ...input,
      useAgent: input.useAgent ?? true,
      generateTitle: input.generateTitle ?? true,
    });
  };

  const createEmptySession = async (input?: CreateEmptySessionInput) => {
    if (isCreating) {
      toast.info(t("apps.chat.actions.creating"));
      return;
    }

    setIsCreating(true);
    setError(null);

    await createEmptySessionMutation.mutateAsync({
      title: input?.title,
      generateTitle: input?.generateTitle ?? false,
      metadata: input?.metadata,
      aiModelId: input?.aiModelId,
    });
  };

  const reset = () => {
    setError(null);
    setIsCreating(false);
    createSessionWithMessageMutation.reset();
    createEmptySessionMutation.reset();
  };

  return {
    createSessionWithMessage,
    createEmptySession,
    isCreating:
      isCreating ||
      createSessionWithMessageMutation.isPending ||
      createEmptySessionMutation.isPending,
    error:
      error ||
      createSessionWithMessageMutation.error ||
      createEmptySessionMutation.error,
    reset,
  };
}
