"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { Textarea } from "@kdx/ui/textarea";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

// Schema de validação para o formulário de criação
const createAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  instructions: z.string().min(1, "Instruções são obrigatórias"),
  libraryId: z.string().optional(),
});

// Schema de validação para o formulário de edição
const editAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  instructions: z.string().min(1, "Instruções são obrigatórias"),
  libraryId: z.string().optional(),
});

type CreateAgentFormData = z.infer<typeof createAgentSchema>;
type EditAgentFormData = z.infer<typeof editAgentSchema>;

// Tipo temporário para agente (será substituído pelos tipos do backend)
interface Agent {
  id: string;
  name: string;
  instructions: string;
  library?: { name: string } | null;
  createdAt: string | Date;
}

export function AgentsSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  const [agentToEdit, setAgentToEdit] = useState<any>(null);

  // Queries
  const agentsQuery = useQuery(
    trpc.app.aiStudio.buscarAiAgents.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const librariesQuery = useQuery(
    trpc.app.aiStudio.buscarAiLibraries.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const agents = agentsQuery.data?.agents || [];
  const libraries = librariesQuery.data?.libraries || [];
  const isLoading = agentsQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      instructions: "",
      libraryId: "none",
    },
  });

  // Form setup para edição
  const editForm = useForm<EditAgentFormData>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      name: "",
      instructions: "",
      libraryId: "none",
    },
  });

  // Mutations
  const createAgentMutation = useMutation(
    trpc.app.aiStudio.criarAiAgent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiAgents.pathFilter(),
        );
        toast.success("Agente criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao criar agente");
      },
    }),
  );

  const updateAgentMutation = useMutation(
    trpc.app.aiStudio.atualizarAiAgent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiAgents.pathFilter(),
        );
        toast.success("Agente atualizado com sucesso!");
        setShowEditForm(false);
        setAgentToEdit(null);
        editForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao atualizar agente");
      },
    }),
  );

  const deleteAgentMutation = useMutation(
    trpc.app.aiStudio.excluirAiAgent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiAgents.pathFilter(),
        );
        toast.success("Agente excluído com sucesso!");
        setShowDeleteDialog(false);
        setAgentToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao excluir agente");
      },
    }),
  );

  const handleCreateSubmit = (data: CreateAgentFormData) => {
    createAgentMutation.mutate({
      name: data.name,
      instructions: data.instructions,
      libraryId: data.libraryId === "none" ? undefined : data.libraryId,
    });
  };

  const handleEditSubmit = (data: EditAgentFormData) => {
    if (!agentToEdit?.id) return;

    updateAgentMutation.mutate({
      id: agentToEdit.id,
      name: data.name,
      instructions: data.instructions,
      libraryId: data.libraryId === "none" ? undefined : data.libraryId,
    });
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    createForm.reset();
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setAgentToEdit(null);
    editForm.reset();
  };

  const handleEditClick = (agent: any) => {
    setAgentToEdit(agent);
    editForm.setValue("name", agent.name);
    editForm.setValue("instructions", agent.instructions);
    editForm.setValue("libraryId", agent.libraryId || "none");
    setShowEditForm(true);
  };

  const handleDeleteClick = (agent: any) => {
    setAgentToDelete(agent);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (agentToDelete?.id) {
      deleteAgentMutation.mutate({
        id: agentToDelete.id,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setAgentToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("apps.aiStudio.agents.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("apps.aiStudio.agents.description")}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("apps.aiStudio.agents.create")}
        </Button>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>{t("apps.aiStudio.agents.title")}</CardTitle>
          <CardDescription>
            Gerencie seus agentes de IA e suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Carregando...</div>
            </div>
          ) : !agents || agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.aiStudio.agents.noAgents")}
              </h3>
              <p className="mb-4 text-muted-foreground">
                Comece criando seu primeiro agente de IA
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("apps.aiStudio.agents.create")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Instruções</TableHead>
                  <TableHead>Biblioteca</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent: any) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {agent.instructions}
                    </TableCell>
                    <TableCell>
                      {agent.library ? (
                        <Badge variant="outline">{agent.library.name}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("apps.aiStudio.agents.noLibrary")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(agent)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.agents.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(agent)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.agents.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Agente</DialogTitle>
            <DialogDescription>
              Configure um novo agente inteligente para sua equipe.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Agente</FormLabel>
                    <FormControl>
                      <Input placeholder="Assistente de Marketing" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome identificador do agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Você é um assistente especializado em marketing que ajuda..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Instruções detalhadas sobre o comportamento do agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="libraryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biblioteca (Opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma biblioteca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("apps.aiStudio.agents.noLibrary")}
                        </SelectItem>
                        {libraries.map((library: any) => (
                          <SelectItem key={library.id} value={library.id}>
                            {library.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Biblioteca de conhecimento para este agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateCancel}
                  disabled={createAgentMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAgentMutation.isPending}>
                  {createAgentMutation.isPending
                    ? "Criando..."
                    : "Criar Agente"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
            <DialogDescription>
              Atualize as configurações do agente "{agentToEdit?.name}".
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Agente</FormLabel>
                    <FormControl>
                      <Input placeholder="Assistente de Marketing" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome identificador do agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Você é um assistente especializado em marketing que ajuda..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Instruções detalhadas sobre o comportamento do agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="libraryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biblioteca (Opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma biblioteca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("apps.aiStudio.agents.noLibrary")}
                        </SelectItem>
                        {libraries.map((library: any) => (
                          <SelectItem key={library.id} value={library.id}>
                            {library.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Biblioteca de conhecimento para este agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={updateAgentMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAgentMutation.isPending}>
                  {updateAgentMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar Agente"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agente "{agentToDelete?.name}"?
              Esta ação não pode ser desfeita e pode afetar conversas associadas
              a este agente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteAgentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAgentMutation.isPending
                ? "Excluindo..."
                : "Excluir Agente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
