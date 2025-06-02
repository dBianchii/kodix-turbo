"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@kdx/ui/switch";
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

// Schema de validação para o formulário de criação de modelo
const createModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  providerId: z.string().min(1, "Provedor é obrigatório"),
  config: z.string().optional(),
  enabled: z.boolean().default(true),
});

// Schema de validação para o formulário de edição de modelo
const editModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  providerId: z.string().min(1, "Provedor é obrigatório"),
  config: z.string().optional(),
  enabled: z.boolean().default(true),
});

// Schema para configuração de prioridade
const priorityConfigSchema = z.object({
  priority: z.number().min(0).max(999),
});

type CreateModelFormData = z.infer<typeof createModelSchema>;
type EditModelFormData = z.infer<typeof editModelSchema>;
type PriorityConfigFormData = z.infer<typeof priorityConfigSchema>;

export function ModelsSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<any>(null);
  const [modelToEdit, setModelToEdit] = useState<any>(null);

  // Queries para modelos do sistema (admin)
  const systemModelsQuery = useQuery(
    trpc.app.aiStudio.findModels.queryOptions({
      limite: 50,
      offset: 0,
    }),
  );

  // Buscar providers para criação de novos modelos
  const providersQuery = useQuery(
    trpc.app.aiStudio.findAiProviders.queryOptions({
      limite: 50,
      offset: 0,
    }),
  );

  const systemModels = systemModelsQuery.data || [];
  const providers = providersQuery.data || [];
  const isLoading = systemModelsQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateModelFormData>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      name: "",
      providerId: "",
      config: "",
      enabled: true,
    },
  });

  // Form setup para edição
  const editForm = useForm<EditModelFormData>({
    resolver: zodResolver(editModelSchema),
    defaultValues: {
      name: "",
      providerId: "",
      config: "",
      enabled: true,
    },
  });

  // Mutation para habilitar/desabilitar modelo global individual
  const toggleGlobalModelMutation = useMutation(
    trpc.app.aiStudio.toggleGlobalModel.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findModels.pathFilter(),
        );
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao alterar modelo");
      },
    }),
  );

  // Mutations para modelos do sistema
  const createModelMutation = useMutation(
    trpc.app.aiStudio.createAiModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findModels.pathFilter(),
        );
        toast.success("Modelo criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao criar modelo");
      },
    }),
  );

  const updateModelMutation = useMutation(
    trpc.app.aiStudio.updateAiModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findModels.pathFilter(),
        );
        toast.success("Modelo atualizado com sucesso!");
        setShowEditForm(false);
        setModelToEdit(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao atualizar modelo");
      },
    }),
  );

  const deleteModelMutation = useMutation(
    trpc.app.aiStudio.deleteAiModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findModels.pathFilter(),
        );
        toast.success("Modelo excluído com sucesso!");
        setShowDeleteDialog(false);
        setModelToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao excluir modelo");
      },
    }),
  );

  // Handlers para modelos do sistema
  const handleCreateSubmit = (data: CreateModelFormData) => {
    let configJson = null;
    if (data.config?.trim()) {
      try {
        configJson = JSON.parse(data.config);
      } catch (error) {
        toast.error("Configuração JSON inválida");
        return;
      }
    }

    createModelMutation.mutate({
      name: data.name,
      providerId: data.providerId,
      config: configJson,
      enabled: data.enabled,
    });
  };

  const handleEditSubmit = (data: EditModelFormData) => {
    if (!modelToEdit) return;

    let configJson = null;
    if (data.config?.trim()) {
      try {
        configJson = JSON.parse(data.config);
      } catch (error) {
        toast.error("Configuração JSON inválida");
        return;
      }
    }

    updateModelMutation.mutate({
      id: modelToEdit.id,
      name: data.name,
      providerId: data.providerId,
      config: configJson,
      enabled: data.enabled,
    });
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    createForm.reset();
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setModelToEdit(null);
    editForm.reset();
  };

  const handleEditClick = (model: any) => {
    setModelToEdit(model);
    editForm.reset({
      name: model.name,
      providerId: model.providerId,
      config: model.config ? JSON.stringify(model.config, null, 2) : "",
      enabled: model.enabled,
    });
    setShowEditForm(true);
  };

  const handleDeleteClick = (model: any) => {
    setModelToDelete(model);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!modelToDelete) return;
    deleteModelMutation.mutate({ id: modelToDelete.id });
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setModelToDelete(null);
  };

  const handleToggleGlobalModel = (modelId: string, enabled: boolean) => {
    toggleGlobalModelMutation.mutate({
      modelId,
      enabled,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Modelos de IA</h2>
          <p className="text-muted-foreground">
            Gerencie todos os modelos de IA homologados no Kodix
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Modelo
          </Button>
        </div>
      </div>

      {/* Modelos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos Homologados</CardTitle>
          <CardDescription>
            Todos os modelos de IA disponíveis no sistema Kodix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">Carregando...</div>
            </div>
          ) : !systemModels || systemModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Brain className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Nenhum modelo encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro modelo de IA
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Modelo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemModels.map((model: any) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell className="capitalize">
                      {model.provider?.name || model.providerId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={model.enabled}
                          onCheckedChange={(enabled) =>
                            handleToggleGlobalModel(model.id, enabled)
                          }
                          disabled={toggleGlobalModelMutation.isPending}
                        />
                        <span className="text-muted-foreground text-sm">
                          {model.enabled ? "Ativo" : "Inativo"}
                        </span>
                      </div>
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
                            onClick={() => handleEditClick(model)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(model)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
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
            <DialogTitle>Criar Novo Modelo de IA</DialogTitle>
            <DialogDescription>
              Configure um novo modelo de IA no sistema.
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
                    <FormLabel>Nome do Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="gpt-4o-mini" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome identificador do modelo (ex: gpt-4o, claude-3)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Empresa que fornece este modelo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="config"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuração (JSON) - Opcional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"temperature": 0.7, "max_tokens": 4000}'
                        className="font-mono text-sm"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Configurações específicas do modelo em formato JSON
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modelo Ativo</FormLabel>
                      <FormDescription>
                        Define se o modelo estará disponível globalmente no
                        sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateCancel}
                  disabled={createModelMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createModelMutation.isPending}>
                  {createModelMutation.isPending
                    ? "Criando..."
                    : "Criar Modelo"}
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
            <DialogTitle>Editar Modelo de IA</DialogTitle>
            <DialogDescription>
              Atualize as configurações do modelo "{modelToEdit?.name}".
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
                    <FormLabel>Nome do Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="gpt-4o-mini" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome identificador do modelo (ex: gpt-4o, claude-3)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Empresa que fornece este modelo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="config"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuração (JSON) - Opcional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"temperature": 0.7, "max_tokens": 4000}'
                        className="font-mono text-sm"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Configurações específicas do modelo em formato JSON
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modelo Ativo</FormLabel>
                      <FormDescription>
                        Define se o modelo estará disponível globalmente no
                        sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={updateModelMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateModelMutation.isPending}>
                  {updateModelMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar Modelo"}
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
              Tem certeza que deseja excluir o modelo "{modelToDelete?.name}"?
              Esta ação não pode ser desfeita e pode afetar tokens associados a
              este modelo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteModelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteModelMutation.isPending
                ? "Excluindo..."
                : "Excluir Modelo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
