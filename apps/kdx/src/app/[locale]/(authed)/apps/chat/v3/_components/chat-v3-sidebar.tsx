// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
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
import { Card } from "@kdx/ui/card";
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
import { ScrollArea } from "@kdx/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";

interface ChatV3SidebarProps {
  selectedSessionId?: string;
  onSessionSelect?: (sessionId: string | undefined) => void;
  onNewThread?: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  chatFolderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatFolder {
  id: string;
  name: string;
  sessions?: ChatSession[];
}

export function ChatV3Sidebar({
  selectedSessionId,
  onSessionSelect,
  onNewThread,
}: ChatV3SidebarProps) {
  const t = useTranslations();
  const utils = api.useUtils();

  // Estados para UI
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para modais
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
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
  const [targetFolderId, setTargetFolderId] = useState<string>("none");

  // Queries para buscar dados
  // @ts-ignore - Temporário para contornar problemas de tipos do tRPC
  const foldersQuery = api.app.chat.buscarChatFolders.useQuery({
    limite: 50,
    pagina: 1,
  });

  // @ts-ignore - Temporário para contornar problemas de tipos do tRPC
  const sessionsQuery = api.app.chat.listarSessions.useQuery({
    limite: 100,
    pagina: 1,
  });

  // Queries adicionais
  // @ts-ignore
  const agentsQuery = api.app.aiStudio.findAiAgents.useQuery({
    limite: 50,
    offset: 0,
  });

  // @ts-ignore
  const modelsQuery = api.app.aiStudio.findAvailableModels.useQuery();

  // Mutations
  // @ts-ignore
  const createSessionMutation =
    api.app.chat.autoCreateSessionWithMessage.useMutation({
      onSuccess: (data: any) => {
        console.log("✅ Nova sessão criada:", data);
        if (data?.session?.id) {
          onSessionSelect?.(data.session.id);
        }
        foldersQuery.refetch();
        sessionsQuery.refetch();
      },
    });

  // @ts-ignore
  const createFolderMutation = api.app.chat.criarChatFolder.useMutation({
    onSuccess: () => {
      // @ts-ignore
      utils.app.chat.buscarChatFolders.invalidate();
      toast.success("Pasta criada com sucesso!");
      setShowCreateFolder(false);
      setFolderName("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar pasta");
    },
  });

  // @ts-ignore
  const updateFolderMutation = api.app.chat.atualizarChatFolder.useMutation({
    onSuccess: () => {
      utils.app.chat.buscarChatFolders.invalidate();
      toast.success("Pasta atualizada com sucesso!");
      setShowEditFolder(false);
      setEditingFolder(null);
      setFolderName("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar pasta");
    },
  });

  // @ts-ignore
  const deleteFolderMutation = api.app.chat.excluirChatFolder.useMutation({
    onSuccess: () => {
      utils.app.chat.buscarChatFolders.invalidate();
      utils.app.chat.listarSessions.invalidate();
      toast.success("Pasta excluída com sucesso!");
      setShowDeleteFolder(false);
      setDeletingFolder(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir pasta");
    },
  });

  // @ts-ignore
  const updateSessionMutation = api.app.chat.atualizarSession.useMutation({
    onSuccess: () => {
      utils.app.chat.listarSessions.invalidate();
      utils.app.chat.buscarSession.invalidate();
      toast.success("Sessão atualizada com sucesso!");
      setShowEditSession(false);
      setEditingSession(null);
      setSessionTitle("");
      setSelectedAgent("none");
      setSelectedModel("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar sessão");
    },
  });

  // @ts-ignore
  const deleteSessionMutation = api.app.chat.excluirSession.useMutation({
    onSuccess: () => {
      utils.app.chat.listarSessions.invalidate();
      toast.success("Sessão excluída com sucesso!");
      setShowDeleteSession(false);
      setDeletingSession(null);
      if (selectedSessionId === deletingSession?.id) {
        onSessionSelect?.(undefined);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir sessão");
    },
  });

  // @ts-ignore
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

  // Processar dados
  const folders: ChatFolder[] = foldersQuery.data?.folders || [];
  const allSessions: ChatSession[] = sessionsQuery.data?.sessions || [];
  const agents = agentsQuery.data?.agents || [];
  const models = modelsQuery.data?.models || [];

  // Sessões sem pasta
  const sessionsWithoutFolder = allSessions.filter(
    (session) => !session.chatFolderId,
  );

  // Agrupar sessões por pasta
  const foldersWithSessions = folders.map((folder) => ({
    ...folder,
    sessions: allSessions.filter(
      (session) => session.chatFolderId === folder.id,
    ),
  }));

  // Filtrar por busca
  const filteredSessions = sessionsWithoutFolder.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFolders = foldersWithSessions
    .filter(
      (folder) =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.sessions.some((session) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    )
    .map((folder) => ({
      ...folder,
      sessions: folder.sessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }));

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Handlers
  const handleNewThread = async () => {
    try {
      await createSessionMutation.mutateAsync({
        firstMessage: "Olá! Vamos começar uma nova conversa.",
        useAgent: true,
        generateTitle: true,
      });
    } catch (error) {
      console.error("Erro ao criar nova thread:", error);
    }
  };

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

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setSessionTitle(session.title || "");
    setSelectedAgent(session.agentId || "none");
    setSelectedModel(session.modelId || "");
    setShowEditSession(true);
  };

  const handleUpdateSession = () => {
    if (editingSession && sessionTitle.trim()) {
      const updateData: any = {
        id: editingSession.id,
        title: sessionTitle.trim(),
      };

      if (selectedModel && selectedModel !== "none") {
        updateData.modelId = selectedModel;
      }

      if (selectedAgent && selectedAgent !== "none") {
        updateData.agentId = selectedAgent;
      }

      updateSessionMutation.mutate(updateData);
    }
  };

  const handleDeleteSession = (session: any) => {
    setDeletingSession(session);
    setShowDeleteSession(true);
  };

  const handleConfirmDeleteSession = () => {
    if (deletingSession) {
      deleteSessionMutation.mutate({ id: deletingSession.id });
    }
  };

  const handleMoveSession = (session: any) => {
    setMovingSession(session);
    setTargetFolderId(session.chatFolderId || "none");
    setShowMoveSession(true);
  };

  const handleConfirmMoveSession = () => {
    if (movingSession) {
      const updateData: any = {
        id: movingSession.id,
        chatFolderId: targetFolderId === "none" ? null : targetFolderId,
      };
      moveSessionMutation.mutate(updateData);
    }
  };

  return (
    <div className="bg-background flex h-full w-full flex-col">
      {/* Header - Estilo assistant-ui.com */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-primary h-5 w-5" />
          <span className="font-semibold">Chat V3</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* New Thread Button - Inspirado no assistant-ui.com */}
      <div className="p-4">
        <Button
          onClick={onNewThread || handleNewThread}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-start gap-2"
          disabled={createSessionMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {createSessionMutation.isPending ? "Criando..." : "New Thread"}
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <Input
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {/* Folders */}
          {filteredFolders.map((folder) => (
            <div key={folder.id} className="space-y-1">
              {/* Folder Header */}
              <div className="text-muted-foreground hover:bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="flex flex-1 items-center gap-2"
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Folder className="h-4 w-4" />
                  <span className="truncate">{folder.name}</span>
                  <span className="text-xs">
                    ({folder.sessions.length || 0})
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Folder Sessions */}
              {expandedFolders.has(folder.id) && (
                <div className="ml-6 space-y-1">
                  {folder.sessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isSelected={selectedSessionId === session.id}
                      onSelect={() => onSessionSelect?.(session.id)}
                      onEdit={handleEditSession}
                      onMove={handleMoveSession}
                      onDelete={handleDeleteSession}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Sessions without Folder */}
          {filteredSessions.length > 0 && (
            <div className="space-y-1">
              <div className="text-muted-foreground px-3 py-2 text-xs font-medium tracking-wider uppercase">
                Conversas
              </div>
              {filteredSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isSelected={selectedSessionId === session.id}
                  onSelect={() => onSessionSelect?.(session.id)}
                  onEdit={handleEditSession}
                  onMove={handleMoveSession}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredSessions.length === 0 && (
            <div className="py-8 text-center">
              <MessageSquare className="text-muted-foreground/50 mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-2 text-sm">
                {searchQuery
                  ? "Nenhuma conversa encontrada"
                  : "Nenhuma conversa ainda"}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onNewThread || handleNewThread}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira conversa
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - Add Folder */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground w-full justify-start gap-2"
          onClick={() => setShowCreateFolder(true)}
        >
          <FolderPlus className="h-4 w-4" />
          Nova pasta
        </Button>
      </div>

      {/* Modais */}

      {/* Create Folder Modal */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">Nome da Pasta</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!folderName.trim() || createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? "Criando..." : "Criar Pasta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Modal */}
      <Dialog open={showEditFolder} onOpenChange={setShowEditFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFolderName">Nome da Pasta</Label>
              <Input
                id="editFolderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFolder(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateFolder}
              disabled={!folderName.trim() || updateFolderMutation.isPending}
            >
              {updateFolderMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Modal */}
      <AlertDialog open={showDeleteFolder} onOpenChange={setShowDeleteFolder}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pasta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta "{deletingFolder?.name}"?
              Todas as conversas dentro dela serão movidas para "Conversas".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFolderMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Session Modal */}
      <Dialog open={showEditSession} onOpenChange={setShowEditSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTitle">Título</Label>
              <Input
                id="sessionTitle"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Digite o título da conversa"
              />
            </div>
            <div>
              <Label htmlFor="sessionModel">Modelo</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Usar padrão do sistema</SelectItem>
                  {models.map((model: any) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sessionAgent">Agente</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum agente</SelectItem>
                  {agents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSession(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateSession}
              disabled={!sessionTitle.trim() || updateSessionMutation.isPending}
            >
              {updateSessionMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Modal */}
      <AlertDialog open={showDeleteSession} onOpenChange={setShowDeleteSession}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conversa "
              {deletingSession?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSessionMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Session Modal */}
      <Dialog open={showMoveSession} onOpenChange={setShowMoveSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetFolder">Pasta de Destino</Label>
              <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Conversas (sem pasta)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveSession(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmMoveSession}
              disabled={moveSessionMutation.isPending}
            >
              {moveSessionMutation.isPending ? "Movendo..." : "Mover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Session Item Component - Estilo assistant-ui.com
interface SessionItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (session: any) => void;
  onMove: (session: any) => void;
  onDelete: (session: any) => void;
}

function SessionItem({
  session,
  isSelected,
  onSelect,
  onEdit,
  onMove,
  onDelete,
}: SessionItemProps) {
  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
          "hover:bg-muted/50",
          isSelected ? "bg-muted text-foreground" : "text-muted-foreground",
        )}
      >
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate">{session.title}</span>
      </button>

      {/* Menu de ações - aparece no hover */}
      <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMove(session);
              }}
            >
              <Folder className="mr-2 h-4 w-4" />
              Mover para pasta
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
