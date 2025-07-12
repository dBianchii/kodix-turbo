"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Key,
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  providerId: z.string().min(1, "Selecione um provedor"),
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

  // ✅ CORRIGIDO: Usar padrão useTRPC
  const tokensQuery = useQuery(
    trpc.app.aiStudio.findAiTeamProviderTokens.queryOptions(),
  );

  const providersQuery = useQuery(
    trpc.app.aiStudio.findAiProviders.queryOptions({
      limite: 50,
      offset: 0,
    }),
  );

  const tokens = tokensQuery.data || [];
  const providers = providersQuery.data || [];
  const isLoading = tokensQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      providerId: "",
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

  // ✅ CORRIGIDO: Usar padrão useTRPC com useMutation
  const createTokenMutation = useMutation(
    trpc.app.aiStudio.createAiTeamProviderToken.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiTeamProviderTokens.pathFilter(),
        );
        toast.success("Token criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error: any) => {
        console.error("Erro ao criar token:", error);
        toast.error(error.message || "Erro ao criar token");
      },
    }),
  );

  const updateTokenMutation = useMutation(
    trpc.app.aiStudio.updateAiTeamProviderToken.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiTeamProviderTokens.pathFilter(),
        );
        toast.success("Token atualizado com sucesso!");
        setShowEditForm(false);
        setTokenToEdit(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao atualizar token");
      },
    }),
  );

  const deleteTokenMutation = useMutation(
    trpc.app.aiStudio.removeTokenByProvider.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiTeamProviderTokens.pathFilter(),
        );
        toast.success("Token removido com sucesso!");
        setShowDeleteDialog(false);
        setTokenToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao remover token");
      },
    }),
  );

  const handleCreateSubmit = (data: CreateTokenFormData) => {
    createTokenMutation.mutate({
      providerId: data.providerId,
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
    if (tokenToDelete?.providerId) {
      deleteTokenMutation.mutate({
        providerId: tokenToDelete.providerId,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setTokenToDelete(null);
  };

  // Função para mascarar o token
  const maskToken = (token: string) => {
    if (token.length <= 8) return token;
    return token.substring(0, 8) + "..." + token.substring(token.length - 4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tokens de Acesso
          </h2>
          <p className="text-muted-foreground">
            Gerencie tokens de API para cada provedor de IA
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Token
        </Button>
      </div>

      {/* Aviso de Segurança */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança:</strong> Os tokens são criptografados e apenas
          visíveis durante a criação. Mantenha seus tokens seguros e não os
          compartilhe.
        </AlertDescription>
      </Alert>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens Configurados</CardTitle>
          <CardDescription>
            Configure tokens de API por provedor para habilitar o acesso aos
            modelos de IA
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
                Nenhum token configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure tokens de API para provedores como OpenAI, Anthropic,
                Google para habilitar o uso dos modelos de IA
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Configurar Primeiro Token
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token: any) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 rounded p-1">
                          <Key className="h-3 w-3" />
                        </div>
                        {token.provider?.name || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {maskToken(token.token)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Configurado
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(token.createdAt).toLocaleDateString("pt-BR")}
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
                            Editar Token
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-muted-foreground"
                            onClick={() => handleDeleteClick(token)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover Token
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
            <DialogTitle>Adicionar Token de API</DialogTitle>
            <DialogDescription>
              Configure um token de API para acessar os modelos do provedor
              selecionado.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor *</FormLabel>
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
                        {providers.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Escolha o provedor de IA para configurar o token
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
                    <FormLabel>Token da API *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Token de API do provedor (será criptografado)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Segurança:</strong> O token será criptografado e
                  armazenado com segurança. Apenas você poderá visualizar o
                  token completo durante esta criação.
                </AlertDescription>
              </Alert>

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
                    ? "Configurando..."
                    : "Configurar Token"}
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
            <DialogTitle>Editar Token</DialogTitle>
            <DialogDescription>
              Atualize o token do provedor "{tokenToEdit?.provider?.name}".
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Token da API *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Novo token de API do provedor (será criptografado)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  O token anterior será substituído e não poderá ser recuperado.
                </AlertDescription>
              </Alert>

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
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o token do provedor "
              {tokenToDelete?.provider?.name}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita</strong> e impedirá o
              acesso aos modelos deste provedor até que um novo token seja
              configurado.
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
