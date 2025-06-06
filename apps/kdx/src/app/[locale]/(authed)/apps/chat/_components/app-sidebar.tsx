// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { toast } from "@kdx/ui/toast";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import { api } from "~/trpc/react";

interface AppSidebarProps {
  selectedSessionId?: string;
  onSessionSelect?: (sessionId: string | undefined) => void;
}

export function AppSidebar({
  selectedSessionId,
  onSessionSelect,
}: AppSidebarProps) {
  const { isMobile } = useSidebar();
  const t = useTranslations();
  const utils = api.useUtils();

  // Estados para modais
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showEditSession, setShowEditSession] = useState(false);
  const [showDeleteSession, setShowDeleteSession] = useState(false);
  const [showMoveSession, setShowMoveSession] = useState(false);

  // Estados para dados temporários
  const [folderName, setFolderName] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("none");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [deletingFolder, setDeletingFolder] = useState<any>(null);
  const [deletingSession, setDeletingSession] = useState<any>(null);
  const [movingSession, setMovingSession] = useState<any>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("none");
  const [targetFolderId, setTargetFolderId] = useState<string>("none");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  // Queries
  const foldersQuery = api.app.chat.buscarChatFolders.useQuery({
    limite: 50,
    pagina: 1,
  });

  // Query para buscar todas as sessões (vamos filtrar no frontend)
  const allSessionsQuery = api.app.chat.listarSessions.useQuery({
    limite: 100,
    pagina: 1,
  });

  const agentsQuery = api.app.aiStudio.findAiAgents.useQuery({
    limite: 50,
    offset: 0,
  });

  // Filtrar apenas modelos habilitados para o time (com prioridade ordenada)
  const modelsQuery = api.app.aiStudio.findAvailableModels.useQuery();

  // Mutations
  const createFolderMutation = api.app.chat.criarChatFolder.useMutation({
    onSuccess: () => {
      utils.app.chat.buscarChatFolders.invalidate();
      toast.success(t("apps.chat.folders.created"));
      setShowCreateFolder(false);
      setFolderName("");
    },
    onError: (error: any) => {
      toast.error(error.message || t("apps.chat.folders.error"));
    },
  });

  const updateFolderMutation = api.app.chat.atualizarChatFolder.useMutation({
    onSuccess: () => {
      utils.app.chat.buscarChatFolders.invalidate();
      toast.success(t("apps.chat.folders.updated"));
      setShowEditFolder(false);
      setEditingFolder(null);
      setFolderName("");
    },
    onError: (error: any) => {
      toast.error(error.message || t("apps.chat.folders.error"));
    },
  });

  const deleteFolderMutation = api.app.chat.excluirChatFolder.useMutation({
    onSuccess: () => {
      utils.app.chat.buscarChatFolders.invalidate();
      utils.app.chat.listarSessions.invalidate();
      toast.success(t("apps.chat.folders.deleted"));
      setShowDeleteFolder(false);
      setDeletingFolder(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t("apps.chat.folders.error"));
    },
  });

  const createSessionMutation = api.app.chat.criarSession.useMutation({
    onSuccess: (newSession: any) => {
      utils.app.chat.listarSessions.invalidate();
      toast.success(t("apps.chat.sessions.created"));
      setShowCreateSession(false);
      if (newSession) {
        onSessionSelect?.(newSession.id);
      }
      // Reset form
      setSessionTitle("");
      setSelectedAgent("none");
      setSelectedModel("");
      setSelectedFolderId("none");
    },
    onError: (error: any) => {
      toast.error(error.message || t("apps.chat.sessions.error"));
    },
  });

  const updateSessionMutation = api.app.chat.atualizarSession.useMutation({
    onSuccess: () => {
      utils.app.chat.listarSessions.invalidate();
      toast.success(t("apps.chat.sessions.updated"));
      setShowEditSession(false);
      setEditingSession(null);
      // Reset form states
      setSessionTitle("");
      setSelectedAgent("none");
      setSelectedModel("");
      setSelectedFolderId("none");
    },
    onError: (error: any) => {
      toast.error(error.message || t("apps.chat.sessions.error"));
    },
  });

  const deleteSessionMutation = api.app.chat.excluirSession.useMutation({
    onSuccess: () => {
      utils.app.chat.listarSessions.invalidate();
      toast.success(t("apps.chat.sessions.deleted"));
      setShowDeleteSession(false);
      setDeletingSession(null);
      // Desselecionar sessão se for a que foi deletada
      if (selectedSessionId === deletingSession?.id) {
        onSessionSelect?.(undefined as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t("apps.chat.sessions.error"));
    },
  });

  const moveSessionMutation = api.app.chat.atualizarSession.useMutation({
    onSuccess: () => {
      utils.app.chat.listarSessions.invalidate();
      toast.success("Sessão movida com sucesso!");
      setShowMoveSession(false);
      setMovingSession(null);
      setTargetFolderId("none");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao mover sessão");
    },
  });

  // Handlers
  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolderMutation.mutate({ name: folderName.trim() });
    }
  };

  const handleEditFolder = (folder: any) => {
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

  const handleDeleteFolder = (folder: any) => {
    setDeletingFolder(folder);
    setShowDeleteFolder(true);
  };

  const handleConfirmDeleteFolder = () => {
    if (deletingFolder) {
      deleteFolderMutation.mutate({ id: deletingFolder.id });
    }
  };

  const handleCreateSession = () => {
    if (sessionTitle.trim() && selectedModel && models.length > 0) {
      createSessionMutation.mutate({
        title: sessionTitle.trim(),
        chatFolderId:
          selectedFolderId === "none" ? undefined : selectedFolderId,
        aiAgentId: selectedAgent === "none" ? undefined : selectedAgent,
        aiModelId: selectedModel,
      });
    }
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setSessionTitle(session.title);
    setSelectedAgent(session.aiAgentId || "none");
    setSelectedModel(session.aiModelId || "");
    setSelectedFolderId(session.chatFolderId || "none");
    setShowEditSession(true);
  };

  const handleUpdateSession = () => {
    if (
      editingSession &&
      sessionTitle.trim() &&
      selectedModel &&
      models.length > 0
    ) {
      updateSessionMutation.mutate({
        id: editingSession.id,
        title: sessionTitle.trim(),
        chatFolderId:
          selectedFolderId === "none" ? undefined : selectedFolderId,
        aiAgentId: selectedAgent === "none" ? undefined : selectedAgent,
        aiModelId: selectedModel,
      });
    }
  };

  const handleDeleteSession = (session: any) => {
    setDeletingSession(session);
    setShowDeleteSession(true);
  };

  const handleConfirmDeleteSession = () => {
    if (deletingSession) {
      // Fix: excluirSession expects sessionId, not id
      deleteSessionMutation.mutate({ sessionId: deletingSession.id });
    }
  };

  const handleMoveSession = (session: any) => {
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

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // @ts-expect-error - Type inference issue: folders property should exist based on router definition
  const folders = foldersQuery.data?.folders || [];
  // @ts-expect-error - Type inference issue: sessions property should exist based on router definition
  const allSessions = allSessionsQuery.data?.sessions || [];
  // Filtrar sessões que não têm pasta atribuída
  const sessionsWithoutFolder = allSessions.filter(
    (session: any) => !session.chatFolderId,
  );
  const agents = agentsQuery.data?.agents || [];

  // Filtrar apenas modelos habilitados para o time (com prioridade ordenada)
  const models =
    modelsQuery.data?.filter(
      (model: any) => !model.teamConfig || model.teamConfig.enabled === true,
    ) || [];

  // Debug: log dos modelos disponíveis
  console.log(
    "🔍 [SIDEBAR] Modelos carregados:",
    modelsQuery.data?.length || 0,
  );
  console.log("🔍 [SIDEBAR] Modelos filtrados:", models.length);
  models.forEach((model: any) => {
    console.log(
      `   • ${model.name} (ID: ${model.id}) - teamConfig: ${model.teamConfig ? `enabled=${model.teamConfig.enabled}` : "null"}`,
    );
  });

  return (
    <>
      <Sidebar
        collapsible={isMobile ? "offcanvas" : "none"}
        className="h-full w-80 shrink-0 border-r border-gray-800"
      >
        <SidebarContent className="h-full">
          {/* Header Section */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Header */}
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

                {/* Quick Actions */}
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

          {/* Folders Section */}
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

          {/* Sessions without folder Section */}
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
                    sessionsWithoutFolder.map((session: any) => (
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

      {/* Create Folder Modal */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("apps.chat.folders.create")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">
                {t("apps.chat.folders.folderName")}
              </Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={t("apps.chat.folders.folderName")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(false)}
            >
              {t("apps.chat.actions.cancel")}
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!folderName.trim() || createFolderMutation.isPending}
            >
              {createFolderMutation.isPending
                ? t("apps.chat.actions.creating")
                : t("apps.chat.actions.createFolder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Modal */}
      <Dialog open={showEditFolder} onOpenChange={setShowEditFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("apps.chat.folders.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFolderName">
                {t("apps.chat.folders.folderName")}
              </Label>
              <Input
                id="editFolderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={t("apps.chat.folders.folderName")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFolder(false)}>
              {t("apps.chat.actions.cancel")}
            </Button>
            <Button
              onClick={handleUpdateFolder}
              disabled={!folderName.trim() || updateFolderMutation.isPending}
            >
              {updateFolderMutation.isPending
                ? t("apps.chat.actions.updating")
                : t("apps.chat.actions.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Modal */}
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
                      {model.name} ({model.provider.name || "Provider"})
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
              onClick={handleCreateSession}
              disabled={
                !sessionTitle.trim() ||
                !selectedModel ||
                createSessionMutation.isPending
              }
            >
              {createSessionMutation.isPending
                ? t("apps.chat.actions.creating")
                : t("apps.chat.actions.createChat")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Modal */}
      <Dialog open={showEditSession} onOpenChange={setShowEditSession}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("apps.chat.sessions.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
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

            <div>
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

            <div>
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

            <div>
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
                      {model.name} ({model.provider.name || "Provider"})
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
              onClick={handleUpdateSession}
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

      {/* Delete Folder Alert */}
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

      {/* Delete Session Alert */}
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

      {/* Move Session Modal */}
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
              <div>
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
                  onClick={handleConfirmMoveSession}
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
  folder: any;
  isExpanded: boolean;
  selectedSessionId?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSessionSelect?: (sessionId: string | undefined) => void;
  onEditSession: (session: any) => void;
  onDeleteSession: (session: any) => void;
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
  const utils = api.useUtils();

  const sessionsQuery = api.app.chat.listarSessions.useQuery({
    chatFolderId: folder.id,
    limite: 50,
    pagina: 1,
  });

  const sessions = sessionsQuery.data?.sessions || [];

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
              <div
                key={session.id}
                className={`group hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 ${
                  selectedSessionId === session.id ? "bg-muted" : ""
                }`}
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
