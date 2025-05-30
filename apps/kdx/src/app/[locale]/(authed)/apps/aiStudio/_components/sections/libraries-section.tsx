"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
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
const createLibrarySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  files: z.string().optional(),
});

// Schema de validação para o formulário de edição
const editLibrarySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  files: z.string().optional(),
});

type CreateLibraryFormData = z.infer<typeof createLibrarySchema>;
type EditLibraryFormData = z.infer<typeof editLibrarySchema>;

export function LibrariesSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [libraryToDelete, setLibraryToDelete] = useState<any>(null);
  const [libraryToEdit, setLibraryToEdit] = useState<any>(null);

  // Queries
  const librariesQuery = useQuery(
    trpc.app.aiStudio.buscarAiLibraries.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const libraries = librariesQuery.data?.libraries || [];
  const isLoading = librariesQuery.isLoading;

  // Form setup para criação
  const createForm = useForm<CreateLibraryFormData>({
    resolver: zodResolver(createLibrarySchema),
    defaultValues: {
      name: "",
      files: "",
    },
  });

  // Form setup para edição
  const editForm = useForm<EditLibraryFormData>({
    resolver: zodResolver(editLibrarySchema),
    defaultValues: {
      name: "",
      files: "",
    },
  });

  // Mutations
  const createLibraryMutation = useMutation(
    trpc.app.aiStudio.criarAiLibrary.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiLibraries.pathFilter(),
        );
        toast.success("Biblioteca criada com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao criar biblioteca");
      },
    }),
  );

  const updateLibraryMutation = useMutation(
    trpc.app.aiStudio.atualizarAiLibrary.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiLibraries.pathFilter(),
        );
        toast.success("Biblioteca atualizada com sucesso!");
        setShowEditForm(false);
        setLibraryToEdit(null);
        editForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao atualizar biblioteca");
      },
    }),
  );

  const deleteLibraryMutation = useMutation(
    trpc.app.aiStudio.excluirAiLibrary.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiLibraries.pathFilter(),
        );
        toast.success("Biblioteca excluída com sucesso!");
        setShowDeleteDialog(false);
        setLibraryToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao excluir biblioteca");
      },
    }),
  );

  const handleCreateSubmit = (data: CreateLibraryFormData) => {
    let filesJson = null;
    if (data.files?.trim()) {
      try {
        filesJson = JSON.parse(data.files);
      } catch (error) {
        toast.error("Dados de arquivos JSON inválidos");
        return;
      }
    }

    createLibraryMutation.mutate({
      name: data.name,
      files: filesJson,
    });
  };

  const handleEditSubmit = (data: EditLibraryFormData) => {
    if (!libraryToEdit?.id) return;

    let filesJson = null;
    if (data.files?.trim()) {
      try {
        filesJson = JSON.parse(data.files);
      } catch (error) {
        toast.error("Dados de arquivos JSON inválidos");
        return;
      }
    }

    updateLibraryMutation.mutate({
      id: libraryToEdit.id,
      name: data.name,
      files: filesJson,
    });
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    createForm.reset();
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setLibraryToEdit(null);
    editForm.reset();
  };

  const handleEditClick = (library: any) => {
    setLibraryToEdit(library);
    editForm.setValue("name", library.name);
    editForm.setValue(
      "files",
      library.files ? JSON.stringify(library.files, null, 2) : "",
    );
    setShowEditForm(true);
  };

  const handleDeleteClick = (library: any) => {
    setLibraryToDelete(library);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (libraryToDelete?.id) {
      deleteLibraryMutation.mutate({
        id: libraryToDelete.id,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setLibraryToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("apps.aiStudio.libraries.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("apps.aiStudio.libraries.description")}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("apps.aiStudio.libraries.create")}
        </Button>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>{t("apps.aiStudio.libraries.title")}</CardTitle>
          <CardDescription>
            Gerencie suas bibliotecas de conhecimento e arquivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">Carregando...</div>
            </div>
          ) : !libraries || libraries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Database className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.aiStudio.libraries.noLibraries")}
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira biblioteca de conhecimento
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("apps.aiStudio.libraries.create")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Arquivos</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {libraries.map((library: any) => (
                  <TableRow key={library.id}>
                    <TableCell className="font-medium">
                      {library.name}
                    </TableCell>
                    <TableCell>
                      {library.files && Array.isArray(library.files) ? (
                        <Badge variant="outline">
                          {library.files.length} arquivo(s)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Nenhum arquivo
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(library.createdAt).toLocaleDateString()}
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
                            onClick={() => handleEditClick(library)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.libraries.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(library)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("apps.aiStudio.libraries.delete")}
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
            <DialogTitle>Criar Nova Biblioteca</DialogTitle>
            <DialogDescription>
              Configure uma nova biblioteca de conhecimento para seus agentes.
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
                    <FormLabel>Nome da Biblioteca</FormLabel>
                    <FormControl>
                      <Input placeholder="Documentação Técnica" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome identificador da biblioteca de conhecimento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dados dos Arquivos (JSON) - Opcional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='[{"name": "documento.pdf", "url": "https://...", "type": "pdf"}]'
                        className="font-mono text-sm"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Lista de arquivos em formato JSON (futuro: upload de
                      arquivos)
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
                  disabled={createLibraryMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createLibraryMutation.isPending}
                >
                  {createLibraryMutation.isPending
                    ? "Criando..."
                    : "Criar Biblioteca"}
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
            <DialogTitle>Editar Biblioteca</DialogTitle>
            <DialogDescription>
              Atualize as configurações da biblioteca "{libraryToEdit?.name}".
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
                    <FormLabel>Nome da Biblioteca</FormLabel>
                    <FormControl>
                      <Input placeholder="Documentação Técnica" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome identificador da biblioteca de conhecimento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dados dos Arquivos (JSON) - Opcional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='[{"name": "documento.pdf", "url": "https://...", "type": "pdf"}]'
                        className="font-mono text-sm"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Lista de arquivos em formato JSON (futuro: upload de
                      arquivos)
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
                  disabled={updateLibraryMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateLibraryMutation.isPending}
                >
                  {updateLibraryMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar Biblioteca"}
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
              Tem certeza que deseja excluir a biblioteca "
              {libraryToDelete?.name}"? Esta ação não pode ser desfeita e pode
              afetar agentes associados a esta biblioteca.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLibraryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLibraryMutation.isPending
                ? "Excluindo..."
                : "Excluir Biblioteca"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
