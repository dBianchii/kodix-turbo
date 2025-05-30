"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Key, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Label } from "@kdx/ui/label";
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
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

// Schema de validação para o formulário de criação
const createTokenSchema = z.object({
  modelId: z.string().min(1, "Selecione um modelo"),
  token: z.string().min(1, "Token é obrigatório"),
});

// Schema de validação para o formulário de edição
const editTokenSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

type CreateTokenFormData = z.infer<typeof createTokenSchema>;
type EditTokenFormData = z.infer<typeof editTokenSchema>;

export function TokensSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<any>(null);
  const [tokenToEdit, setTokenToEdit] = useState<any>(null);

  // Queries
  const tokensQuery = useQuery(trpc.app.aiStudio.buscarTokens.queryOptions());
  const modelsQuery = useQuery(
    trpc.app.aiStudio.buscarAiModels.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const tokens = tokensQuery.data || [];
  const models = modelsQuery.data?.models || [];
  const isLoading = tokensQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      modelId: "",
      token: "",
    },
  });

  // Form setup para edição
  const editForm = useForm<EditTokenFormData>({
    resolver: zodResolver(editTokenSchema),
    defaultValues: {
      token: "",
    },
  });

  // Mutations
  const createTokenMutation = useMutation(
    trpc.app.aiStudio.criarAiModelToken.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarTokens.pathFilter(),
        );
        toast.success("Token criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao criar token");
      },
    }),
  );

  const updateTokenMutation = useMutation(
    trpc.app.aiStudio.atualizarAiModelToken.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarTokens.pathFilter(),
        );
        toast.success("Token atualizado com sucesso!");
        setShowEditForm(false);
        setTokenToEdit(null);
        editForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao atualizar token");
      },
    }),
  );

  const deleteTokenMutation = useMutation(
    trpc.app.aiStudio.removerTokenPorModelo.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarTokens.pathFilter(),
        );
        toast.success("Token removido com sucesso!");
        setShowDeleteDialog(false);
        setTokenToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao remover token");
      },
    }),
  );

  const handleCreateSubmit = (data: CreateTokenFormData) => {
    createTokenMutation.mutate({
      modelId: data.modelId,
      token: data.token,
    });
  };

  const handleEditSubmit = (data: EditTokenFormData) => {
    if (tokenToEdit?.id) {
      updateTokenMutation.mutate({
        id: tokenToEdit.id,
        token: data.token,
      });
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    createForm.reset();
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setTokenToEdit(null);
    editForm.reset();
  };

  const handleEditClick = (token: any) => {
    setTokenToEdit(token);
    editForm.setValue("token", token.token);
    setShowEditForm(true);
  };

  const handleDeleteClick = (token: any) => {
    setTokenToDelete(token);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (tokenToDelete?.model?.id) {
      deleteTokenMutation.mutate({
        modelId: tokenToDelete.model.id,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setTokenToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("apps.aiStudio.tokens.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("apps.aiStudio.tokens.description")}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("apps.aiStudio.tokens.create")}
        </Button>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>{t("apps.aiStudio.tokens.title")}</CardTitle>
          <CardDescription>
            Gerencie os tokens de acesso aos modelos de IA por equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">Carregando...</div>
            </div>
          ) : !tokens || tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Key className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.aiStudio.tokens.noTokens")}
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione tokens para habilitar o acesso aos modelos
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("apps.aiStudio.tokens.create")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token: any) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">
                      {token.model.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {token.token.substring(0, 20)}...
                    </TableCell>
                    <TableCell>
                      {new Date(token.createdAt).toLocaleDateString()}
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
                            onClick={() => handleEditClick(token)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.tokens.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(token)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.tokens.delete")}
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
            <DialogTitle>Adicionar Token de Acesso</DialogTitle>
            <DialogDescription>
              Adicione um token de acesso para um modelo de IA específico.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models.map((model: any) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} ({model.provider})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Escolha o modelo para o qual você está adicionando o token
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token de Acesso</FormLabel>
                    <FormControl>
                      <Input placeholder="sk-..." type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cole aqui seu token de API (ex: sk-... para OpenAI)
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
                  disabled={createTokenMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTokenMutation.isPending}>
                  {createTokenMutation.isPending
                    ? "Salvando..."
                    : "Salvar Token"}
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
            <DialogTitle>Editar Token de Acesso</DialogTitle>
            <DialogDescription>
              Atualize o token de acesso para o modelo "
              {tokenToEdit?.model?.name}".
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <div className="rounded-lg border p-3">
                <Label className="text-sm font-medium">Modelo</Label>
                <p className="text-muted-foreground text-sm">
                  {tokenToEdit?.model?.name} ({tokenToEdit?.model?.provider})
                </p>
              </div>

              <FormField
                control={editForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Token de Acesso</FormLabel>
                    <FormControl>
                      <Input placeholder="sk-..." type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cole aqui o novo token de API
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
                  disabled={updateTokenMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateTokenMutation.isPending}>
                  {updateTokenMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar Token"}
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
              Tem certeza que deseja remover o token de acesso para o modelo "
              {tokenToDelete?.model?.name}"? Esta ação não pode ser desfeita e
              você não conseguirá usar este modelo até adicionar um novo token.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteTokenMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTokenMutation.isPending ? "Removendo..." : "Remover Token"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
