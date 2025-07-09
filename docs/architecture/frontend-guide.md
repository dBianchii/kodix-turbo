# Frontend Development Guide - Kodix Project

## 📖 Overview

Este guia detalha como implementar interfaces no frontend do projeto Kodix. Para implementação de backend, consulte o [Backend Development Guide](./backend-guide.md).

## 🏗️ **Pré-requisitos**

- ✅ Schema de banco de dados criado
- ✅ Repositórios implementados
- ✅ Endpoints tRPC funcionando

## 🎨 **1. Tipos TypeScript Compartilhados**

```typescript
// packages/shared/src/types/seuRecurso.ts
export interface SeuRecurso {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  usuarioId: string;
  equipeId: string;
  usuario: {
    id: string;
    name: string;
    email: string;
  };
  categorias: Array<{
    categoria: {
      id: string;
      nome: string;
    };
  }>;
}

export interface SeuRecursoFormData {
  nome: string;
  descricao?: string;
  categoriaIds?: string[];
}
```

```typescript
// packages/shared/src/types/index.ts
export * from "./seuRecurso";
```

## 🎣 **2. Criar Hooks Customizados**

### 2.1 Hook para Listagem

```typescript
// apps/kdx/src/hooks/use-seu-recurso.ts
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SeuRecursoFilters } from "@kdx/shared/types";

import { useTRPC } from "~/trpc/react";

export function useSeuRecursoList(initialFilters: SeuRecursoFilters = {}) {
  const [filtros, setFiltros] = useState<SeuRecursoFilters>(initialFilters);
  const [pagina, setPagina] = useState(1);
  const limite = 20;
  const trpc = useTRPC();

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    trpc.app.seuRecurso.listar.queryOptions({
      ...filtros,
      pagina,
      limite,
    }),
  );

  const recursos = useMemo(() => data?.recursos ?? [], [data]);
  const paginacao = useMemo(() => data?.paginacao, [data]);

  const atualizarFiltros = (novosFiltros: Partial<SeuRecursoFilters>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
    setPagina(1); // Reset para primeira página
  };

  const limparFiltros = () => {
    setFiltros({});
    setPagina(1);
  };

  return {
    recursos,
    paginacao,
    filtros,
    pagina,
    isLoading,
    isFetching,
    error,
    atualizarFiltros,
    limparFiltros,
    setPagina,
    refetch,
  };
}
```

### 2.2 Hook para Formulários

```typescript
// apps/kdx/src/hooks/useSeuRecurso.ts (continuação)
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { SeuRecursoFormData } from "@kdx/shared/types";
import { criarSeuRecursoSchema } from "@kdx/validators/trpc/app/seuRecurso";

export function useSeuRecursoForm(
  onSuccess?: (recurso: any) => void,
  defaultValues?: Partial<SeuRecursoFormData>,
) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<SeuRecursoFormData>({
    resolver: zodResolver(criarSeuRecursoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoriaIds: [],
      ...defaultValues,
    },
  });

  const createMutation = useMutation(
    trpc.app.seuRecurso.criar.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        onSuccess?.(data);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.app.seuRecurso.atualizar.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        queryClient.invalidateQueries(
          trpc.app.seuRecurso.buscarPorId.pathFilter({ id: data.id }),
        );
        onSuccess?.(data);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.app.seuRecurso.excluir.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
      },
    }),
  );

  const handleSubmit = (data: SeuRecursoFormData, id?: string) => {
    if (id) {
      updateMutation.mutate({ id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    form,
    handleSubmit,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    deletar: deleteMutation.mutate,
  };
}
```

### 2.3 Hook para Item Individual

```typescript
// apps/kdx/src/hooks/useSeuRecurso.ts (continuação)
export function useSeuRecursoItem(id: string) {
  const trpc = useTRPC();

  const {
    data: recurso,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.app.seuRecurso.buscarPorId.queryOptions({ id }, { enabled: !!id }),
  );

  return {
    recurso,
    isLoading,
    error,
    refetch,
  };
}
```

## 🧩 **3. Criar Componentes de Interface**

### 3.1 Componente Card Individual

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/_components/seu-recurso-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
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
import {
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Calendar,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SeuRecurso } from "@kdx/shared/types";
import { useSeuRecursoForm } from "~/hooks/useSeuRecurso";

interface SeuRecursoCardProps {
  recurso: SeuRecurso;
  onEditar?: (id: string) => void;
  onVisualizar?: (id: string) => void;
}

export function SeuRecursoCard({
  recurso,
  onEditar,
  onVisualizar
}: SeuRecursoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deletar, isDeleting } = useSeuRecursoForm();

  const handleDelete = () => {
    deletar({ id: recurso.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {recurso.nome}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={recurso.ativo ? "default" : "secondary"}>
                  {recurso.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(recurso.criadoEm), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onVisualizar?.(recurso.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditar?.(recurso.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {recurso.descricao && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {recurso.descricao}
            </p>
          )}

          {recurso.categorias.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {recurso.categorias.slice(0, 3).map((cat) => (
                <Badge key={cat.categoria.id} variant="outline" className="text-xs">
                  {cat.categoria.nome}
                </Badge>
              ))}
              {recurso.categorias.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{recurso.categorias.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {recurso.usuario.name}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVisualizar?.(recurso.id)}
              >
                Ver detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o recurso "{recurso.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### 3.2 Skeleton de Carregamento

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/_components/seu-recurso-skeleton.tsx
import { Card, CardContent, CardHeader } from "@kdx/ui/card";
import { Skeleton } from "@kdx/ui/skeleton";

interface SeuRecursoSkeletonProps {
  count?: number;
}

export function SeuRecursoSkeleton({ count = 3 }: SeuRecursoSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 3.3 Componente de Listagem Principal

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/_components/seu-recurso-lista.tsx
"use client";

import { useState } from "react";
import { useSeuRecursoList } from "~/hooks/use-seu-recurso";
import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@kdx/ui/select";
import {
  Search,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react";
import { SeuRecursoCard } from "./seu-recurso-card";
import { SeuRecursoSkeleton } from "./seu-recurso-skeleton";

interface SeuRecursoListaProps {
  onNovo?: () => void;
  onEditar?: (id: string) => void;
  onVisualizar?: (id: string) => void;
}

export function SeuRecursoLista({ onNovo, onEditar, onVisualizar }: SeuRecursoListaProps) {
  const [buscaLocal, setBuscaLocal] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const {
    recursos,
    paginacao,
    filtros,
    pagina,
    isLoading,
    isFetching,
    atualizarFiltros,
    limparFiltros,
    setPagina,
    refetch,
  } = useSeuRecursoList();

  const handleBuscar = () => {
    atualizarFiltros({ busca: buscaLocal });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBuscar();
    }
  };

  const handleFiltroAtivo = (valor: string) => {
    const ativo = valor === "todos" ? undefined : valor === "ativo";
    atualizarFiltros({ ativo });
  };

  const handleOrdenar = (ordenarPor: "nome" | "criadoEm") => {
    const novaOrdem = filtros.ordenarPor === ordenarPor && filtros.ordem === "asc" ? "desc" : "asc";
    atualizarFiltros({ ordenarPor, ordem: novaOrdem });
  };

  const hasActiveFilters = filtros.busca || filtros.ativo !== undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeuRecursoSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seus Recursos</h2>
          <p className="text-muted-foreground">
            Gerencie seus recursos e categorias
          </p>
        </div>
        <Button onClick={onNovo} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Recurso
        </Button>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Linha principal - Busca */}
            <div className="flex gap-2">
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Buscar recursos..."
                  value={buscaLocal}
                  onChange={(e) => setBuscaLocal(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleBuscar}
                  variant="outline"
                  size="icon"
                  disabled={isFetching}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Filtros Avançados */}
            {showFilters && (
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Select
                  value={filtros.ativo === undefined ? "todos" : filtros.ativo ? "ativo" : "inativo"}
                  onValueChange={handleFiltroAtivo}
                >
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOrdenar("nome")}
                    className={filtros.ordenarPor === "nome" ? "bg-muted" : ""}
                  >
                    Nome {filtros.ordenarPor === "nome" && (filtros.ordem === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOrdenar("criadoEm")}
                    className={filtros.ordenarPor === "criadoEm" ? "bg-muted" : ""}
                  >
                    Data {filtros.ordenarPor === "criadoEm" && (filtros.ordem === "asc" ? "↑" : "↓")}
                  </Button>
                </div>
              </div>
            )}

            {/* Filtros ativos */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Filtros ativos:</span>
                {filtros.busca && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md">
                    Busca: "{filtros.busca}"
                  </span>
                )}
                {filtros.ativo !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md">
                    Status: {filtros.ativo ? "Ativo" : "Inativo"}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparFiltros}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de recursos */}
      {recursos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Nenhum recurso encontrado</h3>
              <p className="text-muted-foreground mt-2">
                {hasActiveFilters
                  ? "Tente ajustar os filtros ou criar um novo recurso."
                  : "Comece criando seu primeiro recurso."}
              </p>
              <Button
                onClick={onNovo}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                {hasActiveFilters ? "Criar Novo Recurso" : "Criar Primeiro Recurso"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recursos.map((recurso) => (
            <SeuRecursoCard
              key={recurso.id}
              recurso={recurso}
              onEditar={onEditar}
              onVisualizar={onVisualizar}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {paginacao && paginacao.totalPaginas > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {recursos.length} de {paginacao.total} recursos
              {paginacao.totalPaginas > 1 && (
                <span> • Página {pagina} de {paginacao.totalPaginas}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina >= paginacao.totalPaginas}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 3.4 Formulário de Criação/Edição

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/_components/seu-recurso-form.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { criarSeuRecursoSchema } from "@kdx/validators/trpc/app/seuRecurso";
import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { Textarea } from "@kdx/ui/textarea";
import { Label } from "@kdx/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@kdx/ui/form";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@kdx/ui/multi-select";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@kdx/ui/alert";
import type { SeuRecursoFormData } from "@kdx/shared/types";

interface SeuRecursoFormProps {
  recursoId?: string;
  onSuccess?: (recurso: any) => void;
  onCancel?: () => void;
}

export function SeuRecursoForm({
  recursoId,
  onSuccess,
  onCancel
}: SeuRecursoFormProps) {
  const isEditing = !!recursoId;
  const trpc = useTRPC();

  const form = useForm<SeuRecursoFormData>({
    resolver: zodResolver(criarSeuRecursoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoriaIds: [],
    },
  });

  // Buscar dados do recurso se estiver editando
  const { data: recurso, isLoading: loadingRecurso } = useQuery(
    trpc.app.seuRecurso.buscarPorId.queryOptions({ id: recursoId! }, { enabled: isEditing })
  );

  // Buscar categorias disponíveis
  const { data: categorias = [] } = useQuery(trpc.app.categoria.listar.queryOptions());

  // Mutations
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.app.seuRecurso.criar.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        onSuccess?.(data);
      },
    })
  );

  const updateMutation = useMutation(
    trpc.app.seuRecurso.atualizar.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        queryClient.invalidateQueries(trpc.app.seuRecurso.buscarPorId.pathFilter({ id: data.id }));
        onSuccess?.(data);
      },
    })
  );

  // Preencher formulário quando carregar dados para edição
  useEffect(() => {
    if (recurso) {
      form.reset({
        nome: recurso.nome,
        descricao: recurso.descricao || "",
        categoriaIds: recurso.categorias.map(cat => cat.categoria.id),
      });
    }
  }, [recurso, form]);

  const onSubmit = (data: SeuRecursoFormData) => {
    if (isEditing) {
      updateMutation.mutate({ id: recursoId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  if (loadingRecurso) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando dados do recurso...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Recurso" : "Novo Recurso"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "Erro ao salvar recurso"}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do recurso"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome identificador do recurso (mínimo 2 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição opcional do recurso"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição detalhada do recurso (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoriaIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorias</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={field.value || []}
                      onValueChange={field.onChange}
                    >
                      <MultiSelectTrigger>
                        <MultiSelectValue placeholder="Selecione as categorias" />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        {categorias.map((categoria) => (
                          <MultiSelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectContent>
                    </MultiSelect>
                  </FormControl>
                  <FormDescription>
                    Categorias associadas ao recurso (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? (isLoading ? "Atualizando..." : "Atualizar Recurso")
                  : (isLoading ? "Criando..." : "Criar Recurso")
                }
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### 3.5 Modal/Dialog de Visualização

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/_components/seu-recurso-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@kdx/ui/dialog";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import { Separator } from "@kdx/ui/separator";
import { ScrollArea } from "@kdx/ui/scroll-area";
import {
  Calendar,
  User,
  Edit,
  ExternalLink,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSeuRecursoItem } from "~/hooks/use-seu-recurso";
import { Skeleton } from "@kdx/ui/skeleton";

interface SeuRecursoDialogProps {
  recursoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditar?: (id: string) => void;
}

export function SeuRecursoDialog({
  recursoId,
  open,
  onOpenChange,
  onEditar
}: SeuRecursoDialogProps) {
  const { recurso, isLoading } = useSeuRecursoItem(recursoId || "");

  if (!recursoId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Recurso</span>
            {recurso && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditar?.(recurso.id)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ) : recurso ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{recurso.nome}</h2>
                  <Badge variant={recurso.ativo ? "default" : "secondary"}>
                    {recurso.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {recurso.descricao && (
                  <p className="text-muted-foreground">{recurso.descricao}</p>
                )}
              </div>

              <Separator />

              {/* Categorias */}
              {recurso.categorias.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    {recurso.categorias.map((cat) => (
                      <Badge key={cat.categoria.id} variant="outline">
                        {cat.categoria.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Informações de Criação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Criado por</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{recurso.usuario.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recurso.usuario.email}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Equipe</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>{recurso.equipe.name}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Data de Criação</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(recurso.criadoEm), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Última Atualização</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(recurso.atualizadoEm), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Recurso não encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

## 📱 **4. Criar Páginas**

### 4.1 Página Principal

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/page.tsx
"use client";

import { useState } from "react";
import { SeuRecursoLista } from "./_components/seu-recurso-lista";
import { SeuRecursoForm } from "./_components/seu-recurso-form";
import { SeuRecursoDialog } from "./_components/seu-recurso-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@kdx/ui/sheet";

export default function SeuRecursoPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleNovo = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditar = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleVisualizar = (id: string) => {
    setViewingId(id);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Lista principal */}
      <SeuRecursoLista
        onNovo={handleNovo}
        onEditar={handleEditar}
        onVisualizar={handleVisualizar}
      />

      {/* Formulário em Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Editar Recurso" : "Novo Recurso"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SeuRecursoForm
              recursoId={editingId || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de visualização */}
      <SeuRecursoDialog
        recursoId={viewingId}
        open={!!viewingId}
        onOpenChange={(open) => !open && setViewingId(null)}
        onEditar={handleEditar}
      />
    </div>
  );
}
```

### 4.2 Layout da Seção (Opcional)

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recursos - Kodix",
  description: "Gerencie seus recursos e categorias",
};
```

## 📊 **5. Estados de UI e UX**

### 5.1 Estados de Carregamento

````typescript
// apps/kdx/src/app/[locale]/(authed)/apps/seu-recurso/_components/SeuRecursoStates.tsx
import { Card, CardContent } from "@kdx/ui/card";
import { Button } from "@kdx/ui/button";
import { Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react";

export function LoadingState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Carregando recursos...</h3>
          <p className="text-muted-foreground">
            Aguarde enquanto buscamos seus dados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  error,
  onRetry
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ops! Algo deu errado</h3>
          <p className="text-muted-foreground mb-4">
            {error || "Erro inesperado ao carregar os dados"}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title = "Nenhum recurso encontrado",
  description = "Comece criando seu primeiro recurso",
  onAction,
  actionLabel = "Criar Recurso"
}: {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          {onAction && (
            <Button onClick={onAction}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// apps/kdx/src/hooks/useSeuRecurso.ts (adição ao hook existente)
import { toast } from "@kdx/ui/use-toast";

// Adicionar ao useSeuRecursoForm
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.app.seuRecurso.criar.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        toast({
          title: "Recurso criado com sucesso!",
          description: `O recurso "${data.nome}" foi criado.`,
        });
        onSuccess?.(data);
      },
      onError: (error) => {
        toast({
          title: "Erro ao criar recurso",
          description: error.message,
          variant: "destructive",
        });
      },
    })
  );

  const updateMutation = useMutation(
    trpc.app.seuRecurso.atualizar.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        queryClient.invalidateQueries(
          trpc.app.seuRecurso.buscarPorId.pathFilter({ id: data.id })
        );
        toast({
          title: "Recurso atualizado!",
          description: `As alterações foram salvas.`,
        });
        onSuccess?.(data);
      },
      onError: (error) => {
        toast({
          title: "Erro ao atualizar recurso",
          description: error.message,
          variant: "destructive",
        });
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.app.seuRecurso.excluir.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.app.seuRecurso.listar.pathFilter());
        toast({
          title: "Recurso excluído",
          description: "O recurso foi removido com sucesso.",
        });
      },
      onError: (error) => {
        toast({
          title: "Erro ao excluir recurso",
          description: error.message,
          variant: "destructive",
        });
      },
    })
  );

// apps/kdx/src/hooks/useDebounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


// Usar no componente de lista
import { useDebounce } from "~/hooks/useDebounce";

export function SeuRecursoLista({ onNovo, onEditar, onVisualizar }: SeuRecursoListaProps) {
  const [buscaLocal, setBuscaLocal] = useState("");
  const buscaDebounced = useDebounce(buscaLocal, 300);

  const {
    recursos,
    // ... outros dados
  } = useSeuRecursoList({
    busca: buscaDebounced, // Usar valor debounced
  });

  // ... resto do componente
}


// apps/kdx/src/app/(authenticated)/seu-recurso/components/SeuRecursoVirtualList.tsx
import { FixedSizeList as List } from "react-window";
import { SeuRecursoCard } from "./SeuRecursoCard";

interface VirtualListProps {
  recursos: SeuRecurso[];
  onEditar?: (id: string) => void;
  onVisualizar?: (id: string) => void;
}

export function SeuRecursoVirtualList({
  recursos,
  onEditar,
  onVisualizar
}: VirtualListProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="px-2 pb-4">
      <SeuRecursoCard
        recurso={recursos[index]}
        onEditar={onEditar}
        onVisualizar={onVisualizar}
      />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={recursos.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
}


// apps/kdx/src/app/(authenticated)/seu-recurso/components/SeuRecursoCard.tsx
import { memo } from "react";

export const SeuRecursoCard = memo(function SeuRecursoCard({
  recurso,
  onEditar,
  onVisualizar
}: SeuRecursoCardProps) {
  // ... implementação do componente
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.recurso.id === nextProps.recurso.id &&
    prevProps.recurso.atualizadoEm === nextProps.recurso.atualizadoEm
  );
});


// apps/kdx/src/app/(authenticated)/seu-recurso/components/__tests__/SeuRecursoCard.test.ts
import { render, screen, fireEvent } from "@testing-library/react";
import { SeuRecursoCard } from "../SeuRecursoCard";

const mockRecurso = {
  id: "1",
  nome: "Recurso Teste",
  descricao: "Descrição do teste",
  ativo: true,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  usuarioId: "user1",
  equipeId: "team1",
  usuario: { id: "user1", name: "João", email: "joao@test.com" },
  equipe: { id: "team1", name: "Equipe Teste" },
  categorias: [],
};

describe("SeuRecursoCard", () => {
  it("deve renderizar informações do recurso", () => {
    render(<SeuRecursoCard recurso={mockRecurso} />);

    expect(screen.getByText("Recurso Teste")).toBeInTheDocument();
    expect(screen.getByText("Descrição do teste")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve chamar onEditar quando clicar em editar", () => {
    const onEditar = jest.fn();
    render(<SeuRecursoCard recurso={mockRecurso} onEditar={onEditar} />);

    const editButton = screen.getByText("Editar");
    fireEvent.click(editButton);

    expect(onEditar).toHaveBeenCalledWith("1");
  });

  it("deve mostrar dialog de confirmação ao excluir", () => {
    render(<SeuRecursoCard recurso={mockRecurso} />);

    const deleteButton = screen.getByText("Excluir");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument();
  });
});


// apps/kdx/src/hooks/__tests__/useSeuRecurso.test.ts
import { renderHook, act } from "@testing-library/react";
import { useSeuRecursoList } from "../useSeuRecurso";

// Mock do tRPC
jest.mock("~/trpc/react", () => ({
  useTRPC: () => ({
    app: {
      seuRecurso: {
        listar: {
          queryOptions: jest.fn(),
        },
      },
    },
  }),
}));

describe("useSeuRecursoList", () => {
  it("deve inicializar com filtros padrão", () => {
    const { result } = renderHook(() => useSeuRecursoList());

    expect(result.current.filtros).toEqual({});
    expect(result.current.pagina).toBe(1);
  });

  it("deve atualizar filtros e resetar página", () => {
    const { result } = renderHook(() => useSeuRecursoList());

    act(() => {
      result.current.setPagina(3);
    });

    expect(result.current.pagina).toBe(3);

    act(() => {
      result.current.atualizarFiltros({ busca: "teste" });
    });

    expect(result.current.filtros.busca).toBe("teste");
    expect(result.current.pagina).toBe(1); // Reset para primeira página
  });
});


// apps/kdx/src/app/(authenticated)/seu-recurso/components/SeuRecursoMobileCard.tsx
"use client";

import { Card, CardContent } from "@kdx/ui/card";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { MoreVertical, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SeuRecurso } from "@kdx/shared/types";

interface SeuRecursoMobileCardProps {
  recurso: SeuRecurso;
  onEditar?: (id: string) => void;
  onVisualizar?: (id: string) => void;
  onExcluir?: (id: string) => void;
}

export function SeuRecursoMobileCard({
  recurso,
  onEditar,
  onVisualizar,
  onExcluir
}: SeuRecursoMobileCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{recurso.nome}</h3>
            <Badge
              variant={recurso.ativo ? "default" : "secondary"}
              className="mt-1"
            >
              {recurso.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onVisualizar?.(recurso.id)}>
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditar?.(recurso.id)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExcluir?.(recurso.id)}
                className="text-destructive"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {recurso.descricao && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {recurso.descricao}
          </p>
        )}

        {recurso.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recurso.categorias.slice(0, 2).map((cat) => (
              <Badge key={cat.categoria.id} variant="outline" className="text-xs">
                {cat.categoria.nome}
              </Badge>
            ))}
            {recurso.categorias.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{recurso.categorias.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-24">{recurso.usuario.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(recurso.criadoEm), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// apps/kdx/src/hooks/useMediaQuery.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addListener(listener);

    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}


// apps/kdx/src/app/(authenticated)/seu-recurso/components/SeuRecursoResponsiveList.tsx
"use client";

import { useIsMobile } from "~/hooks/useMediaQuery";
import { SeuRecursoCard } from "./SeuRecursoCard";
import { SeuRecursoMobileCard } from "./SeuRecursoMobileCard";
import type { SeuRecurso } from "@kdx/shared/types";

interface SeuRecursoResponsiveListProps {
  recursos: SeuRecurso[];
  onEditar?: (id: string) => void;
  onVisualizar?: (id: string) => void;
  onExcluir?: (id: string) => void;
}

export function SeuRecursoResponsiveList({
  recursos,
  onEditar,
  onVisualizar,
  onExcluir,
}: SeuRecursoResponsiveListProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-0">
        {recursos.map((recurso) => (
          <SeuRecursoMobileCard
            key={recurso.id}
            recurso={recurso}
            onEditar={onEditar}
            onVisualizar={onVisualizar}
            onExcluir={onExcluir}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recursos.map((recurso) => (
        <SeuRecursoCard
          key={recurso.id}
          recurso={recurso}
          onEditar={onEditar}
          onVisualizar={onVisualizar}
        />
      ))}
    </div>
  );
}


// apps/kdx/src/lib/formatters.ts
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy") {
  return format(new Date(date), pattern, { locale: ptBR });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR
  });
}

export function truncateText(text: string, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function formatUserName(name: string | null | undefined) {
  if (!name) return "Usuário sem nome";
  return name.split(" ").slice(0, 2).join(" ");
}


// apps/kdx/src/lib/validations.ts
export function validateRequired(value: any, fieldName: string) {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} é obrigatório`;
  }
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string) {
  if (value && value.length < minLength) {
    return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string) {
  if (value && value.length > maxLength) {
    return `${fieldName} deve ter no máximo ${maxLength} caracteres`;
  }
  return null;
}

export function validateForm(data: Record<string, any>, rules: Record<string, Function[]>) {
  const errors: Record<string, string> = {};

  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator(data[field], field);
      if (error) {
        errors[field] = error;
        break; // Para no primeiro erro
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

## 🧭 Padrões de Navegação e Roteamento

### Navegação Internacionalizada

O sistema Kodix usa **next-intl** com roteamento internacionalizado. Sempre use os utilitários corretos:

```typescript
// ✅ CORRETO: Usar router internacionalizado
import { useRouter } from "~/i18n/routing";

const router = useRouter();
router.push("/apps/chat/session-id"); // Automaticamente adiciona locale

// ❌ INCORRETO: Usar router do Next.js diretamente
import { useRouter } from "next/navigation";
````

### Navegação Absoluta vs Relativa

**SEMPRE use caminhos absolutos** para evitar duplicação de URLs:

```typescript
// ✅ CORRETO: Caminhos absolutos
router.push("/apps/chat/session-id");
router.push("/apps/todo");
router.push("/apps/calendar");

// ❌ INCORRETO: Caminhos relativos (podem causar duplicação)
router.push("session-id"); // Pode resultar em /apps/apps/chat/
router.push("."); // Comportamento inconsistente
router.push("../other-page"); // Dependente do contexto atual
```

### Padrões de Navegação por Contexto

#### 1. Navegação entre Sessões de Chat

```typescript
// ✅ PADRÃO RECOMENDADO
const handleSessionSelect = (sessionId: string) => {
  router.push(`/apps/chat/${sessionId}`);
};

// ✅ PADRÃO PARA NOVA SESSÃO
const handleNewSession = (sessionId: string) => {
  // Evitar navegações duplas - deixar para um único ponto
  onNewSession?.(sessionId); // Delegar para callback
};
```

#### 2. Navegação com Fallback

```typescript
// ✅ PADRÃO COM FALLBACK PARA PROBLEMAS DE ROUTER
const navigateToSession = (sessionId: string) => {
  const targetUrl = `/apps/chat/${sessionId}`;
  router.push(targetUrl);

  // Fallback se router falhar (raro, mas pode acontecer)
  setTimeout(() => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes(sessionId)) {
      const pathParts = currentPath.split("/");
      const locale = pathParts[1]; // pt-BR, en, etc
      window.location.href = `/${locale}/apps/chat/${sessionId}`;
    }
  }, 500);
};
```

### Problemas Comuns e Soluções

#### ❌ Problema: URLs Duplicadas

```typescript
// PROBLEMA: Navegações duplas causam /apps/apps/chat/
useEmptySession({
  onSuccess: (sessionId) => {
    router.push(`/apps/chat/${sessionId}`); // 1ª navegação
    onNewSession?.(sessionId); // Chama callback que navega novamente
  },
});
```

```typescript
// ✅ SOLUÇÃO: Delegar navegação para um único ponto
useEmptySession({
  onSuccess: (sessionId) => {
    // Apenas chama callback, não navega aqui
    onNewSession?.(sessionId);
  },
});

// Navegação acontece no callback do componente pai
const handleNewSession = (sessionId: string) => {
  router.push(`/apps/chat/${sessionId}`);
};
```

#### ❌ Problema: Context de Roteamento Incorreto

```typescript
// PROBLEMA: Router relativo em contexto errado
router.push("."); // Pode não voltar para onde esperamos
```

```typescript
// ✅ SOLUÇÃO: Sempre especificar destino absoluto
router.push("/apps/chat"); // Destino explícito e previsível
```

### Boas Práticas

1. **✅ Use sempre caminhos absolutos** iniciando com `/`
2. **✅ Use o router internacionalizado** de `~/i18n/routing`
3. **✅ Evite navegações duplas** - centralize em um ponto
4. **✅ Teste navegação** em diferentes contextos de URL
5. **✅ Use fallbacks** apenas quando necessário
6. **✅ Documente comportamentos especiais** de navegação

### Debugging de Navegação

```typescript
// 🔍 DEBUGGING: Adicionar logs para identificar problemas
const handleNavigation = (sessionId: string) => {
  console.log("🔍 [NAV] Current path:", window.location.pathname);
  console.log("🔍 [NAV] Target:", `/apps/chat/${sessionId}`);

  router.push(`/apps/chat/${sessionId}`);

  // Verificar se navegação funcionou
  setTimeout(() => {
    console.log("🔍 [NAV] After navigation:", window.location.pathname);
  }, 100);
};
```
