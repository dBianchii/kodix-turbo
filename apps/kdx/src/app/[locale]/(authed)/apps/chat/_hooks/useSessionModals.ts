import type { TRPCClientErrorLike } from "@trpc/client";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { AppRouter } from "@kdx/api";
import { toast } from "@kdx/ui/toast";

import type { ChatSessionType } from "~/trpc/shared";
import { useTRPC } from "~/trpc/react";
import { useChatSessionManager } from "./useChatSessionManager";

interface UseSessionModalsProps {
  onSessionSelect?: (sessionId: string | undefined) => void;
  selectedSessionId?: string;
  selectedAgentId?: string | null;
}

export function useSessionModals({
  onSessionSelect,
  selectedSessionId,
  selectedAgentId,
  onAgentChange,
  onModelChange,
}: UseSessionModalsProps & {
  onAgentChange?: (agentId: string | null) => void;
  onModelChange?: (modelId: string) => void;
}) {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // States
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showEditSession, setShowEditSession] = useState(false);
  const [showDeleteSession, setShowDeleteSession] = useState(false);
  const [showMoveSession, setShowMoveSession] = useState(false);

  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("none");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [editingSession, setEditingSession] = useState<ChatSessionType | null>(
    null,
  );
  const [deletingSession, setDeletingSession] =
    useState<ChatSessionType | null>(null);
  const [movingSession, setMovingSession] = useState<ChatSessionType | null>(
    null,
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>("none");
  const [targetFolderId, setTargetFolderId] = useState<string>("none");

  const { createSessionWithMessage, isCreating: isCreatingSession } =
    useChatSessionManager({
      onSuccess: (sessionId) => {
        void queryClient.invalidateQueries(
          trpc.app.chat.findSessions.pathFilter(),
        );
        toast.success(t("apps.chat.sessions.created"));
        setShowCreateSession(false);
        setSessionTitle("");
        setSelectedAgent("none");
        setSelectedModel("");
        setSelectedFolderId("none");
        onSessionSelect?.(sessionId);
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast.error(error.message);
      },
    });

  useEffect(() => {
    // Reset agent selection when model changes to avoid inconsistencies
    // ✅ Don't reset agent when editing a session - modal should preserve session data
    if (selectedModel && selectedAgent !== "none" && !showEditSession) {
      setSelectedAgent("none");
    }
  }, [selectedModel, showEditSession]);

  const handleEditSession = (session: ChatSessionType) => {
    setEditingSession(session);
    setSessionTitle(session.title);
    setSelectedAgent(session.aiAgentId || "none");
    setSelectedModel(session.aiModelId || "");
    setSelectedFolderId(session.chatFolderId || "none");
    setShowEditSession(true);
  };

  // ✅ Synchronize modal agent state with external agent state (only when external changes)
  useEffect(() => {
    // ✅ NEVER sync when modal is open for editing - modal state has priority
    if (showEditSession) {
      return;
    }

    if (selectedAgentId !== undefined) {
      const modalAgentValue = selectedAgentId || "none";
      if (selectedAgent !== modalAgentValue) {
        setSelectedAgent(modalAgentValue);
      }
    }
  }, [selectedAgentId, editingSession?.aiAgentId, showEditSession]); // ← Add showEditSession to prevent sync during editing

  // Mutations
  const updateSessionMutation = useMutation(
    trpc.app.chat.updateSession.mutationOptions({
      onSuccess: (updatedSession, variables) => {
        // ✅ Invalidar lista de sessões para sidebar
        void queryClient.invalidateQueries(
          trpc.app.chat.findSessions.pathFilter(),
        );

        // ✅ Invalidar a query específica da sessão para forçar refetch
        void queryClient.invalidateQueries({
          queryKey: ["trpc", "app", "chat", "findSession"],
          exact: false,
        });

        // ✅ Invalidar cache do AgentSelector (findAiAgents) para sincronizar
        void queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiAgents.pathFilter(),
        );

        // ✅ Invalidar cache do ModelSelector (findAvailableModels) para sincronizar
        void queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );

        // ✅ Notificar diretamente o AgentSelector sobre a mudança
        if (onAgentChange) {
          onAgentChange(updatedSession.aiAgentId || null);
        }

        // ✅ Notificar diretamente o ModelSelector sobre a mudança
        if (onModelChange && updatedSession.aiModelId) {
          onModelChange(updatedSession.aiModelId);
        }

        toast.success(t("apps.chat.sessions.updated"));
        setShowEditSession(false);
        setEditingSession(null);
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        // Show backend error message directly (already translated)
        toast.error(error.message || "Failed to update session");

        // ✅ UX Improvement: Revert agent selection to previous valid value
        if (
          editingSession &&
          (error.message?.includes("Agent switching") ||
            error.message?.includes("Troca de agente") ||
            error.message?.includes("not allowed") ||
            error.message?.includes("não é permitida"))
        ) {
          setSelectedAgent(editingSession.aiAgentId || "none");
        }
      },
    }),
  );

  const deleteSessionMutation = useMutation(
    trpc.app.chat.deleteSession.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.chat.findSessions.pathFilter(),
        );
        toast.success(t("apps.chat.sessions.deleted"));
        setShowDeleteSession(false);
        setDeletingSession(null);
        if (deletingSession?.id === selectedSessionId) {
          onSessionSelect?.(undefined);
        }
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast.error(error.message);
      },
    }),
  );

  const moveSessionMutation = useMutation(
    trpc.app.chat.moveSession.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.chat.findSessions.pathFilter(),
        );
        toast.success(t("apps.chat.sessions.updated"));
        setShowMoveSession(false);
        setMovingSession(null);
        setTargetFolderId("none");
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast.error(error.message);
      },
    }),
  );

  // Handlers
  const handleCreateSession = () => {
    if (sessionTitle.trim() && selectedModel) {
      void createSessionWithMessage({
        firstMessage: sessionTitle.trim(),
        aiModelId: selectedModel,
        generateTitle: false,
        useAgent: false,
      });
    }
  };

  const handleUpdateSession = (models: { id: string }[]) => {
    if (editingSession && sessionTitle.trim()) {
      // Detectar se houve troca de agente
      const agentChanged =
        selectedAgent !== (editingSession.aiAgentId || "none");
      const newAgentId = selectedAgent === "none" ? undefined : selectedAgent;

      // Preparar histórico de agentes se houve mudança
      let agentHistory = editingSession.agentHistory || [];

      if (agentChanged && editingSession.aiAgentId) {
        // Adicionar agente anterior ao histórico
        const previousAgentEntry = {
          agentId: editingSession.aiAgentId,
          agentName: editingSession.aiAgent?.name || "Unknown Agent",
          switchedAt: new Date().toISOString(),
          messageCount: editingSession.messages?.length || 0,
        };

        agentHistory = [...agentHistory, previousAgentEntry];
      }

      const baseMutationData = {
        id: editingSession.id,
        title: sessionTitle.trim(),
        chatFolderId:
          selectedFolderId === "none" ? undefined : selectedFolderId,
        aiModelId: selectedModel || undefined,
      };

      // ✅ Only send agent data when there's actually an agent change
      const mutationData = agentChanged
        ? {
            ...baseMutationData,
            aiAgentId: newAgentId, // undefined when "none" is selected
            activeAgentId: newAgentId || undefined, // undefined when "none" is selected
            agentHistory: agentHistory,
          }
        : baseMutationData;

      updateSessionMutation.mutate(mutationData);
    }
  };

  const handleDeleteSession = (session: ChatSessionType) => {
    setDeletingSession(session);
    setShowDeleteSession(true);
  };

  const handleConfirmDeleteSession = () => {
    if (deletingSession) {
      deleteSessionMutation.mutate({ sessionId: deletingSession.id });
    }
  };

  const handleMoveSession = (session: ChatSessionType) => {
    setMovingSession(session);
    setTargetFolderId("none");
    setShowMoveSession(true);
  };

  const handleConfirmMoveSession = () => {
    if (movingSession && targetFolderId !== "none") {
      moveSessionMutation.mutate({
        id: movingSession.id,
        chatFolderId: targetFolderId,
      });
    }
  };

  return {
    showCreateSession,
    setShowCreateSession,
    showEditSession,
    setShowEditSession,
    showDeleteSession,
    setShowDeleteSession,
    showMoveSession,
    setShowMoveSession,
    sessionTitle,
    setSessionTitle,
    selectedAgent,
    setSelectedAgent,
    selectedModel,
    setSelectedModel,
    editingSession,
    deletingSession,
    movingSession,
    selectedFolderId,
    setSelectedFolderId,
    targetFolderId,
    setTargetFolderId,
    updateSessionMutation,
    deleteSessionMutation,
    moveSessionMutation,
    handleCreateSession,
    handleEditSession,
    handleUpdateSession,
    handleDeleteSession,
    handleConfirmDeleteSession,
    handleMoveSession,
    handleConfirmMoveSession,
    isCreatingSession,
  };
}
