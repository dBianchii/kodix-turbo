"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building,
  Globe,
  Key,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AppRouter } from "@kdx/api";
import { Alert, AlertDescription } from "@kdx/ui/alert";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";
import { ModelSyncDialog } from "../dialogs/model-sync-dialog";

type ProvidersQueryOutput =
  inferRouterOutputs<AppRouter>["app"]["aiStudio"]["findAiProviders"];
type Provider = ProvidersQueryOutput[number];

// Schema de validação para o formulário de criação
const createProviderSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  baseUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

// Schema de validação para o formulário de edição
const editProviderSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  baseUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type CreateProviderFormData = z.infer<typeof createProviderSchema>;
type EditProviderFormData = z.infer<typeof editProviderSchema>;

export function ProvidersSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(
    null,
  );
  const [providerToEdit, setProviderToEdit] = useState<Provider | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [providerToSync, setProviderToSync] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ✅ CORRIGIDO: Usar padrão useTRPC
  const providersQuery = useQuery(
    trpc.app.aiStudio.findAiProviders.queryOptions({
      limite: 50,
      offset: 0,
    }),
  );

  const providers = providersQuery.data || [];
  const isLoading = providersQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateProviderFormData>({
    resolver: zodResolver(createProviderSchema),
    defaultValues: {
      name: "",
      baseUrl: "",
    },
  });

  // Form setup para edição
  const editForm = useForm<EditProviderFormData>({
    resolver: zodResolver(editProviderSchema),
    defaultValues: {
      name: "",
      baseUrl: "",
    },
  });

  // ✅ CORRIGIDO: Usar padrão useTRPC com useMutation
  const createProviderMutation = useMutation(
    trpc.app.aiStudio.createAiProvider.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiProviders.pathFilter(),
        );
        toast.success("Provider criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao criar provider");
      },
    }),
  );

  const updateProviderMutation = useMutation(
    trpc.app.aiStudio.updateAiProvider.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiProviders.pathFilter(),
        );
        toast.success("Provider atualizado com sucesso!");
        setShowEditForm(false);
        setProviderToEdit(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao atualizar provider");
      },
    }),
  );

  const deleteProviderMutation = useMutation(
    trpc.app.aiStudio.deleteAiProvider.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiProviders.pathFilter(),
        );
        toast.success("Provider excluído com sucesso!");
        setShowDeleteDialog(false);
        setProviderToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao excluir provider");
      },
    }),
  );

  const handleCreateSubmit = (data: CreateProviderFormData) => {
    createProviderMutation.mutate({
      name: data.name,
      baseUrl: data.baseUrl,
    });
  };

  const handleEditSubmit = (data: EditProviderFormData) => {
    if (providerToEdit?.id) {
      updateProviderMutation.mutate({
        id: providerToEdit.id,
        name: data.name,
        baseUrl: data.baseUrl,
      });
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    createForm.reset();
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setProviderToEdit(null);
    editForm.reset();
  };

  const handleEditClick = (provider: any) => {
    setProviderToEdit(provider);
    editForm.setValue("name", provider.name);
    editForm.setValue("baseUrl", provider.baseUrl || "");
    setShowEditForm(true);
  };

  const handleDeleteClick = (provider: any) => {
    setProviderToDelete(provider);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (providerToDelete?.id) {
      deleteProviderMutation.mutate({
        id: providerToDelete.id,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setProviderToDelete(null);
  };

  const handleSyncClick = (provider: { id: string; name: string }) => {
    // Convert provider name to lowercase for backend compatibility
    const providerId = provider.name.toLowerCase();
    setProviderToSync({ id: providerId, name: provider.name });
    setShowSyncDialog(true);
  };

  const handleSyncDialogClose = () => {
    setShowSyncDialog(false);
    setProviderToSync(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Provedores de IA
          </h2>
          <p className="text-muted-foreground">
            Gerencie os provedores de IA disponíveis no sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Provider
        </Button>
      </div>

      {/* Aviso informativo */}
      <Alert>
        <Building className="h-4 w-4" />
        <AlertDescription>
          <strong>Provedores de IA:</strong> Configure os provedores como
          OpenAI, Anthropic, Google para depois criar modelos e tokens de
          acesso.
        </AlertDescription>
      </Alert>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Provedores Configurados</CardTitle>
          <CardDescription>
            Lista de provedores de IA disponíveis para criação de modelos e
            tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">Carregando...</div>
            </div>
          ) : !providers || providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Building className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Nenhum provider configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando provedores como OpenAI, Anthropic, Google para
                habilitar o uso de modelos de IA
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Provider
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>URL Base</TableHead>
                  <TableHead>Modelos</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider: any) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 rounded p-1">
                          <Building className="h-3 w-3" />
                        </div>
                        {provider.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {provider.baseUrl ? (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="max-w-48 truncate">
                            {provider.baseUrl}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Não configurado
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {provider.models?.length || 0} modelos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {provider.tokens?.length > 0 ? (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          <Key className="mr-1 h-3 w-3" />
                          Configurado
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground"
                        >
                          Sem token
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(provider.createdAt).toLocaleDateString("pt-BR")}
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
                            onClick={() => handleEditClick(provider)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Provider
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSyncClick(provider)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sincronizar Modelos
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-muted-foreground"
                            onClick={() => handleDeleteClick(provider)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Provider
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Provider</DialogTitle>
            <DialogDescription>
              Configure um novo provedor de IA como OpenAI, Anthropic, Google,
              etc.
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
                    <FormLabel>Nome do Provider *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: OpenAI, Anthropic, Google"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nome identificador do provedor (ex: OpenAI, Anthropic)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Base da API (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.openai.com/v1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL base da API do provedor (deixe vazio para usar o
                      padrão)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Após criar o provider, você poderá criar modelos e configurar
                  tokens de acesso.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateCancel}
                  disabled={createProviderMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProviderMutation.isPending}
                >
                  {createProviderMutation.isPending
                    ? "Criando..."
                    : "Criar Provider"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Provider</DialogTitle>
            <DialogDescription>
              Atualize as configurações do provider "{providerToEdit?.name}".
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
                    <FormLabel>Nome do Provider *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: OpenAI, Anthropic, Google"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nome identificador do provedor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Base da API (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.openai.com/v1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL base da API do provedor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Alterar o nome do provider pode afetar modelos e tokens
                  associados.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={updateProviderMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateProviderMutation.isPending}
                >
                  {updateProviderMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar Provider"}
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
              Tem certeza que deseja excluir o provider "
              {providerToDelete?.name}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita</strong> e irá remover
              todos os modelos e tokens associados a este provider.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteProviderMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProviderMutation.isPending
                ? "Excluindo..."
                : "Excluir Provider"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {providerToSync && (
        <ModelSyncDialog
          isOpen={showSyncDialog}
          onClose={handleSyncDialogClose}
          providerId={providerToSync.id}
          providerName={providerToSync.name}
        />
      )}
    </div>
  );
}
