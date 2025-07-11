"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { chatAppId } from "@kdx/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@kdx/ui/sidebar";

import type { ChatFolderType, ChatSessionType, ModelType } from "~/trpc/shared";
import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import { useTRPC } from "~/trpc/react";
import { useFolderModals } from "../_hooks/useFolderModals";
import { useSessionModals } from "../_hooks/useSessionModals";

interface AppSidebarProps {
  selectedSessionId?: string;
  onSessionSelect?: (sessionId: string | undefined) => void;
  onAgentChange?: (agentId: string | null) => void;
  onModelChange?: (modelId: string) => void;
}

function AppSidebar({
  selectedSessionId,
  onSessionSelect,
  onAgentChange,
  onModelChange,
}: AppSidebarProps) {
  const { isMobile } = useSidebar();
  const t = useTranslations();
  const trpc = useTRPC();

  const {
    showCreateFolder,
    setShowCreateFolder,
    showEditFolder,
    setShowEditFolder,
    showDeleteFolder,
    setShowDeleteFolder,
    folderName,
    setFolderName,
    deletingFolder,
    createFolderMutation,
    updateFolderMutation,
    handleCreateFolder,
    handleEditFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    handleConfirmDeleteFolder,
  } = useFolderModals();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("chat-expanded-folders");
        const parsed = saved ? (JSON.parse(saved) as unknown) : [];
        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "string")
        ) {
          return new Set(parsed);
        }
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const foldersQuery = useQuery(
    trpc.app.chat.findChatFolders.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const allSessionsQuery = useQuery(
    trpc.app.chat.findSessions.queryOptions(
      {
        limite: 100,
        pagina: 1,
      },
      {
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    ),
  );

  const agentsQuery = useQuery(
    trpc.app.aiStudio.findAiAgents.queryOptions(
      {
        limite: 50,
        offset: 0,
      },
      {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    ),
  );

  const modelsQuery = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "chat-expanded-folders",
          JSON.stringify(Array.from(expandedFolders)),
        );
      } catch (error) {
        console.warn("Erro ao salvar pastas expandidas:", error);
      }
    }
  }, [expandedFolders]);

  const folders = foldersQuery.data?.folders ?? [];
  const allSessions = useMemo(
    () => allSessionsQuery.data?.sessions ?? [],
    [allSessionsQuery.data],
  );
  const agents = agentsQuery.data?.agents ?? [];

  const {
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
    deletingSession,
    movingSession,
    selectedFolderId,
    setSelectedFolderId,
    targetFolderId,
    setTargetFolderId,
    updateSessionMutation,
    moveSessionMutation,
    handleCreateSession,
    handleEditSession,
    handleUpdateSession,
    handleDeleteSession,
    handleConfirmDeleteSession,
    handleMoveSession,
    handleConfirmMoveSession,
    isCreatingSession,
  } = useSessionModals({
    onSessionSelect,
    selectedSessionId,
    onAgentChange,
    onModelChange,
  });

  useEffect(() => {
    if (selectedSessionId && allSessions.length > 0) {
      const selectedSession = allSessions.find(
        (session) => session.id === selectedSessionId,
      );

      const folderId = selectedSession?.chatFolderId;
      if (folderId) {
        setExpandedFolders((prev) => {
          const newExpanded = new Set(prev);
          newExpanded.add(folderId);
          return newExpanded;
        });
      }
    }
  }, [selectedSessionId, allSessions]);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const sessionsWithoutFolder = allSessions.filter(
    (session) => !session.chatFolderId,
  );

  const models = useMemo(() => {
    const data = modelsQuery.data;
    if (Array.isArray(data)) {
      return data.filter(
        (model: ModelType) =>
          !model.teamConfig ||
          (model.teamConfig as { enabled?: boolean }).enabled === true,
      );
    }
    return [];
  }, [modelsQuery.data]);

  return (
    <>
      <Sidebar
        collapsible={isMobile ? "offcanvas" : "none"}
        className="h-full w-80 shrink-0 border-r border-gray-800"
      >
        <SidebarContent className="h-full">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-end gap-2 font-semibold">
                    <IconKodixApp
                      appId={chatAppId}
                      renderText={false}
                      size={35}
                    />
                    <span className="text-lg">{t("apps.chat.appName")}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSessionSelect?.(undefined)}
                    disabled={models.length === 0}
                    title={
                      models.length === 0
                        ? "Configure modelos no AI Studio primeiro"
                        : "Novo Chat"
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFolderName("");
                      setShowCreateFolder(true);
                    }}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {t("apps.chat.folders.create")}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onSessionSelect?.(undefined)}
                    disabled={models.length === 0}
                    title={
                      models.length === 0
                        ? "Configure modelos no AI Studio primeiro"
                        : t("apps.chat.sessions.create")
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("apps.chat.sessions.create")}
                  </Button>
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-medium tracking-wider uppercase">
              {t("apps.chat.folders.title")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <div className="space-y-1">
                  {foldersQuery.isLoading ? (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      {t("apps.chat.actions.loadingFolders")}
                    </div>
                  ) : folders.length === 0 ? (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      {t("apps.chat.folders.noFolders")}
                    </div>
                  ) : (
                    folders.map((folder) => (
                      <FolderItem
                        key={folder.id}
                        folder={folder}
                        isExpanded={expandedFolders.has(folder.id)}
                        selectedSessionId={selectedSessionId}
                        onToggle={() => toggleFolder(folder.id)}
                        onEdit={() => handleEditFolder(folder)}
                        onDelete={() => handleDeleteFolder(folder)}
                        onSessionSelect={onSessionSelect}
                        onEditSession={handleEditSession}
                        onDeleteSession={handleDeleteSession}
                      />
                    ))
                  )}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-medium tracking-wider uppercase">
              {t("apps.chat.sessions.title")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <div className="space-y-1">
                  {allSessionsQuery.isLoading ? (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      {t("apps.chat.actions.loadingChats")}
                    </div>
                  ) : sessionsWithoutFolder.length === 0 ? (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      {t("apps.chat.sessions.noSessions")}
                    </div>
                  ) : (
                    sessionsWithoutFolder.map((session) => (
                      <SidebarMenuItem key={session.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={selectedSessionId === session.id}
                        >
                          <div
                            className="group hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2"
                            onClick={() => onSessionSelect?.(session.id)}
                          >
                            <div className="flex min-w-0 flex-1 items-center">
                              <MessageSquare className="text-muted-foreground mr-2 h-4 w-4" />
                              <span className="truncate text-sm">
                                {session.title}
                              </span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSession(session);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t("apps.chat.actions.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSession(session);
                                  }}
                                >
                                  <Folder className="mr-2 h-4 w-4" />
                                  {t("apps.chat.actions.moveToFolder")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(session);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("apps.chat.actions.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateFolder();
            }}
          >
            <DialogHeader>
              <DialogTitle>{t("apps.chat.folders.create")}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={t("apps.chat.folders.folderName")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateFolder(false)}
              >
                {t("apps.chat.actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!folderName.trim() || createFolderMutation.isPending}
              >
                {createFolderMutation.isPending
                  ? t("apps.chat.actions.creating")
                  : t("apps.chat.actions.createFolder")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditFolder} onOpenChange={setShowEditFolder}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateFolder();
            }}
          >
            <DialogHeader>
              <DialogTitle>{t("apps.chat.folders.edit")}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                id="editFolderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={t("apps.chat.folders.folderName")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditFolder(false)}
              >
                {t("apps.chat.actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!folderName.trim() || updateFolderMutation.isPending}
              >
                {updateFolderMutation.isPending
                  ? t("apps.chat.actions.updating")
                  : t("apps.chat.actions.update")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("apps.chat.sessions.create")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTitle">
                {t("apps.chat.sessions.sessionTitle")}
              </Label>
              <Input
                id="sessionTitle"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={t("apps.chat.sessions.sessionTitle")}
              />
            </div>

            <div>
              <Label htmlFor="folderSelect">
                {t("apps.chat.sessions.selectFolder")}
              </Label>
              <Select
                value={selectedFolderId}
                onValueChange={setSelectedFolderId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("apps.chat.sessions.selectFolder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("apps.chat.sessions.noFolder")}
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="agentSelect">
                {t("apps.chat.sessions.selectAgent")}
              </Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("apps.chat.sessions.selectAgent")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("apps.chat.sessions.noAgent")}
                  </SelectItem>
                  {agents.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-center text-sm">
                      {t("apps.aiStudio.agents.noAgents")}
                    </div>
                  ) : (
                    agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modelSelect">
                {t("apps.chat.sessions.selectModel")}
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("apps.chat.sessions.selectModel")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.displayName} ({model.provider.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateSession(false)}
            >
              {t("apps.chat.actions.cancel")}
            </Button>
            <Button
              onClick={() => handleCreateSession()}
              disabled={
                !sessionTitle.trim() || !selectedModel || isCreatingSession
              }
            >
              {isCreatingSession
                ? t("apps.chat.actions.creating")
                : t("apps.chat.actions.createChat")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditSession} onOpenChange={setShowEditSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("apps.chat.sessions.edit")}</DialogTitle>
            <DialogDescription>
              {t("apps.chat.sessions.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editSessionTitle">
                {t("apps.chat.sessions.sessionTitle")}
              </Label>
              <Input
                id="editSessionTitle"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={t("apps.chat.sessions.sessionTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editFolderSelect">
                {t("apps.chat.sessions.selectFolder")}
              </Label>
              <Select
                value={selectedFolderId}
                onValueChange={setSelectedFolderId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("apps.chat.sessions.selectFolder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("apps.chat.sessions.noFolder")}
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAgentSelect">
                {t("apps.chat.sessions.selectAgent")}
              </Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("apps.chat.sessions.selectAgent")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("apps.chat.sessions.noAgent")}
                  </SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editModelSelect">
                {t("apps.chat.sessions.selectModel")}
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("apps.chat.sessions.selectModel")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.displayName} ({model.provider.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSession(false)}>
              {t("apps.chat.actions.cancel")}
            </Button>
            <Button
              onClick={() => handleUpdateSession(models)}
              disabled={
                !sessionTitle.trim() ||
                !selectedModel ||
                updateSessionMutation.isPending
              }
            >
              {updateSessionMutation.isPending
                ? t("apps.chat.actions.updating")
                : t("apps.chat.actions.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteFolder} onOpenChange={setShowDeleteFolder}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("apps.chat.folders.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("apps.chat.confirmDelete.folder", {
                name: deletingFolder?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("apps.chat.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("apps.chat.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteSession} onOpenChange={setShowDeleteSession}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("apps.chat.sessions.delete")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("apps.chat.confirmDelete.session", {
                title: deletingSession?.title,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("apps.chat.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("apps.chat.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showMoveSession} onOpenChange={setShowMoveSession}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mover para Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Selecione a pasta para onde deseja mover a sessão "
              {movingSession?.title}":
            </p>

            {folders.length === 0 ? (
              <div className="py-4 text-center">
                <Folder className="text-muted-foreground/50 mx-auto h-12 w-12" />
                <p className="text-muted-foreground mt-2 text-sm">
                  Nenhuma pasta disponível
                </p>
                <p className="text-muted-foreground text-xs">
                  Crie uma pasta primeiro para organizar seus chats
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="targetFolderSelect">Pasta de Destino</Label>
                <Select
                  value={targetFolderId}
                  onValueChange={setTargetFolderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4" />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            {folders.length === 0 ? (
              <Button
                onClick={() => {
                  setShowMoveSession(false);
                  setShowCreateFolder(true);
                }}
                className="w-full"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Criar Nova Pasta
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowMoveSession(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleConfirmMoveSession()}
                  disabled={
                    targetFolderId === "none" || moveSessionMutation.isPending
                  }
                >
                  {moveSessionMutation.isPending ? "Movendo..." : "Mover"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente para item de pasta
interface FolderItemProps {
  folder: ChatFolderType;
  isExpanded: boolean;
  selectedSessionId?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSessionSelect?: (sessionId: string | undefined) => void;
  onEditSession: (session: ChatSessionType) => void;
  onDeleteSession: (session: ChatSessionType) => void;
}

function FolderItem({
  folder,
  isExpanded,
  selectedSessionId,
  onToggle,
  onEdit,
  onDelete,
  onSessionSelect,
  onEditSession,
  onDeleteSession,
}: FolderItemProps) {
  const trpc = useTRPC();

  // ✅ CORRIGIDO: Query real das sessões da pasta
  const sessionsQuery = useQuery(
    trpc.app.chat.findSessions.queryOptions({
      chatFolderId: folder.id,
      limite: 50,
      pagina: 1,
    }),
  );

  const sessions = sessionsQuery.data?.sessions ?? [];

  return (
    <div>
      <div className="group flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex-1 justify-start p-2"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronDown className="mr-2 h-4 w-4" />
          ) : (
            <ChevronRight className="mr-2 h-4 w-4" />
          )}
          <Folder className="mr-2 h-4 w-4" />
          <span className="truncate">{folder.name}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sessions list - only show when expanded */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {sessionsQuery.isLoading ? (
            <div className="text-muted-foreground py-2 text-xs">
              Carregando sessões...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-muted-foreground py-2 text-xs">
              Nenhuma sessão encontrada
            </div>
          ) : (
            sessions.map((session) => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  asChild
                  isActive={selectedSessionId === session.id}
                >
                  <div
                    className="group hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2"
                    onClick={() => onSessionSelect?.(session.id)}
                  >
                    <div className="flex min-w-0 flex-1 items-center">
                      <MessageSquare className="text-muted-foreground mr-2 h-3 w-3" />
                      <span className="truncate text-sm">{session.title}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSession(session);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const MemoizedAppSidebar = memo(AppSidebar);
export { MemoizedAppSidebar as AppSidebar };
