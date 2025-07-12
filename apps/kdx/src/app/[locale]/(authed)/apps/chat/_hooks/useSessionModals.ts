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
}

export function useSessionModals({
  onSessionSelect,
  selectedSessionId,
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
    if (selectedModel && selectedAgent !== "none") {
      setSelectedAgent("none");
    }
  }, [selectedModel]);

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
        toast.error(error.message);
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

  const handleEditSession = (session: ChatSessionType) => {
    setEditingSession(session);
    setSessionTitle(session.title);
    setSelectedAgent(session.aiAgentId || "none");
    setSelectedModel(session.aiModelId || "");
    setSelectedFolderId(session.chatFolderId || "none");
    setShowEditSession(true);
  };

  const handleUpdateSession = (models: { id: string }[]) => {
    if (
      editingSession &&
      sessionTitle.trim() &&
      selectedModel &&
      models.length > 0
    ) {
      // Detectar se houve troca de agente
      const agentChanged =
        selectedAgent !== (editingSession.aiAgentId || "none");
      const newAgentId = selectedAgent === "none" ? undefined : selectedAgent;

      console.log(
        `🔄 [SESSION_MODALS] Agent change detected: ${agentChanged}`,
        {
          oldAgent: editingSession.aiAgentId || "none",
          newAgent: selectedAgent,
        },
      );

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

        console.log(
          `📝 [SESSION_MODALS] Adding to agent history:`,
          previousAgentEntry,
        );
      }

      updateSessionMutation.mutate({
        id: editingSession.id,
        title: sessionTitle.trim(),
        chatFolderId:
          selectedFolderId === "none" ? undefined : selectedFolderId,
        aiAgentId: newAgentId,
        aiModelId: selectedModel,
        // Atualizar activeAgentId se houve mudança
        activeAgentId: agentChanged ? newAgentId : editingSession.activeAgentId,
        // Atualizar histórico se houve mudança
        agentHistory: agentChanged ? agentHistory : undefined,
      });
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
