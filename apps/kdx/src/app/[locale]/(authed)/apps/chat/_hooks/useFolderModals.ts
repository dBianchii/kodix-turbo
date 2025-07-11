import type { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { AppRouter } from "@kdx/api";
import { toast } from "@kdx/ui/toast";

import type { ChatFolderType } from "~/trpc/shared";
import { useTRPC } from "~/trpc/react";

export function useFolderModals() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // States for modals and temporary data
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<ChatFolderType | null>(
    null,
  );
  const [deletingFolder, setDeletingFolder] = useState<ChatFolderType | null>(
    null,
  );

  // Mutations
  const createFolderMutation = useMutation(
    trpc.app.chat.createChatFolder.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.chat.findChatFolders.pathFilter(),
        );
        toast.success(t("apps.chat.folders.created"));
        setShowCreateFolder(false);
        setFolderName("");
      },
      onError: (error: any) => {
        toast.error(error.message || t("apps.chat.folders.error"));
      },
    }),
  );

  const updateFolderMutation = useMutation(
    trpc.app.chat.updateChatFolder.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.chat.findChatFolders.pathFilter(),
        );
        toast.success(t("apps.chat.folders.updated"));
        setShowEditFolder(false);
        setEditingFolder(null);
        setFolderName("");
      },
      onError: (error: any) => {
        toast.error(error.message || t("apps.chat.folders.error"));
      },
    }),
  );

  const deleteFolderMutation = useMutation(
    trpc.app.chat.deleteChatFolder.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.chat.findChatFolders.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.chat.findSessions.pathFilter(),
        );
        toast.success(t("apps.chat.folders.deleted"));
        setShowDeleteFolder(false);
        setDeletingFolder(null);
      },
      onError: (error: any) => {
        toast.error(error.message || t("apps.chat.folders.error"));
      },
    }),
  );

  // Handlers
  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolderMutation.mutate({ name: folderName.trim() });
    }
  };

  const handleEditFolder = (folder: ChatFolderType) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setShowEditFolder(true);
  };

  const handleUpdateFolder = () => {
    if (editingFolder && folderName.trim()) {
      updateFolderMutation.mutate({
        id: editingFolder.id,
        name: folderName.trim(),
      });
    }
  };

  const handleDeleteFolder = (folder: ChatFolderType) => {
    setDeletingFolder(folder);
    setShowDeleteFolder(true);
  };

  const handleConfirmDeleteFolder = () => {
    if (deletingFolder) {
      deleteFolderMutation.mutate({ id: deletingFolder.id });
    }
  };

  return {
    // states
    showCreateFolder,
    setShowCreateFolder,
    showEditFolder,
    setShowEditFolder,
    showDeleteFolder,
    setShowDeleteFolder,
    folderName,
    setFolderName,
    editingFolder,
    deletingFolder,
    // mutations
    createFolderMutation,
    updateFolderMutation,
    deleteFolderMutation,
    // handlers
    handleCreateFolder,
    handleEditFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    handleConfirmDeleteFolder,
  };
}
