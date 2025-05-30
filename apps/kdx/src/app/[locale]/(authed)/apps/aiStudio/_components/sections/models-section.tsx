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

// Schema de validação para o formulário de criação
const createModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  provider: z.string().min(1, "Provedor é obrigatório"),
  enabled: z.boolean().default(true),
  config: z.string().optional(),
});

// Schema de validação para o formulário de edição
const editModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  provider: z.string().min(1, "Provedor é obrigatório"),
  enabled: z.boolean().default(true),
  config: z.string().optional(),
});

type CreateModelFormData = z.infer<typeof createModelSchema>;
type EditModelFormData = z.infer<typeof editModelSchema>;

const providerOptions = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "meta", label: "Meta" },
  { value: "microsoft", label: "Microsoft" },
  { value: "other", label: "Outro" },
];

export function ModelsSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<any>(null);
  const [modelToEdit, setModelToEdit] = useState<any>(null);

  // Queries
  const modelsQuery = useQuery(
    trpc.app.aiStudio.buscarAiModels.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const models = modelsQuery.data?.models || [];
  const isLoading = modelsQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateModelFormData>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      name: "",
      provider: "",
      enabled: true,
      config: "",
    },
  });

  // Form setup para edição
  const editForm = useForm<EditModelFormData>({
    resolver: zodResolver(editModelSchema),
    defaultValues: {
      name: "",
      provider: "",
      enabled: true,
      config: "",
    },
  });

  // Mutations
  const createModelMutation = useMutation(
    trpc.app.aiStudio.criarAiModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiModels.pathFilter(),
        );
        toast.success("Modelo criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao criar modelo");
      },
    }),
  );

  const updateModelMutation = useMutation(
    trpc.app.aiStudio.atualizarAiModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiModels.pathFilter(),
        );
        toast.success("Modelo atualizado com sucesso!");
        setShowEditForm(false);
        setModelToEdit(null);
        editForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao atualizar modelo");
      },
    }),
  );

  const deleteModelMutation = useMutation(
    trpc.app.aiStudio.excluirAiModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiModels.pathFilter(),
        );
        toast.success("Modelo excluído com sucesso!");
        setShowDeleteDialog(false);
        setModelToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao excluir modelo");
      },
    }),
  );

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
      provider: data.provider,
      enabled: data.enabled,
      config: configJson,
    });
  };

  const handleEditSubmit = (data: EditModelFormData) => {
    if (!modelToEdit?.id) return;

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
      provider: data.provider,
      enabled: data.enabled,
      config: configJson,
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
    editForm.setValue("name", model.name);
    editForm.setValue("provider", model.provider);
    editForm.setValue("enabled", model.enabled);
    editForm.setValue(
      "config",
      model.config ? JSON.stringify(model.config, null, 2) : "",
    );
    setShowEditForm(true);
  };

  const handleDeleteClick = (model: any) => {
    setModelToDelete(model);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (modelToDelete?.id) {
      deleteModelMutation.mutate({
        id: modelToDelete.id,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setModelToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("apps.aiStudio.models.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("apps.aiStudio.models.description")}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("apps.aiStudio.models.create")}
        </Button>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>{t("apps.aiStudio.models.title")}</CardTitle>
          <CardDescription>
            Gerencie os modelos de IA disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">Carregando...</div>
            </div>
          ) : !models || models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Brain className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.aiStudio.models.noModels")}
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro modelo de IA
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("apps.aiStudio.models.create")}
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
                {models.map((model: any) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell className="capitalize">
                      {model.provider}
                    </TableCell>
                    <TableCell>
                      <Badge variant={model.enabled ? "default" : "secondary"}>
                        {model.enabled
                          ? t("apps.aiStudio.models.enabled")
                          : t("apps.aiStudio.models.disabled")}
                      </Badge>
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
                            {t("apps.aiStudio.models.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(model)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.models.delete")}
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
                name="provider"
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
                        {providerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modelo Ativo</FormLabel>
                      <FormDescription>
                        Se este modelo deve estar disponível para uso
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
                name="provider"
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
                        {providerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modelo Ativo</FormLabel>
                      <FormDescription>
                        Se este modelo deve estar disponível para uso
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
