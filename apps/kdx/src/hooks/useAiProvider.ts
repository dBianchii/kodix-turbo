"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Importar do zod diretamente enquanto resolver dependências
import { z } from "zod";

// Tipos temporários - serão substituídos pelos tipos reais quando resolver imports
interface AiProvider {
  providerId: string; // Renamed from 'id'
  name: string;
  baseUrl?: string;
  // createdAt: REMOVED COMPLETELY
  models?: AiModel[];
  tokens?: any[];
}

interface AiModel {
  id: string;
  name: string;
  providerId: string;
  config?: any;
  enabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  provider?: AiProvider;
}

interface AiProviderFormData {
  name: string;
  baseUrl?: string;
}

interface AiProviderFilters {
  busca?: string;
  ordenarPor?: "name" | "createdAt";
  ordem?: "asc" | "desc";
}

// Schema de validação temporário
const criarAiProviderSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  baseUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

// Placeholder toast - substituir quando disponível
const toast = (options: any) => console.log("Toast:", options);

// Hook para listagem de providers
export function useAiProviderList(initialFilters: AiProviderFilters = {}) {
  const [filtros, setFiltros] = useState<AiProviderFilters>(initialFilters);
  const [pagina, setPagina] = useState(1);
  const limite = 20;

  // TODO: Substituir por API real quando tRPC estiver funcionando
  const providers = useMemo(() => [], []);
  const paginacao = useMemo(
    () => ({
      total: 0,
      pagina: 1,
      limite: 20,
      totalPaginas: 1,
    }),
    [],
  );

  const atualizarFiltros = (novosFiltros: Partial<AiProviderFilters>) => {
    setFiltros((prev: AiProviderFilters) => ({ ...prev, ...novosFiltros }));
    setPagina(1);
  };

  const limparFiltros = () => {
    setFiltros({});
    setPagina(1);
  };

  return {
    providers,
    paginacao,
    filtros,
    pagina,
    isLoading: false,
    isFetching: false,
    error: null,
    atualizarFiltros,
    limparFiltros,
    setPagina,
    refetch: () => {},
  };
}

// Hook para item individual
export function useAiProviderItem(id: string): {
  provider: AiProvider | null;
  isLoading: boolean;
  error: any;
  refetch: () => void;
} {
  // TODO: Implementar com API real
  return {
    provider: null,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}

// Hook para formulários
export function useAiProviderForm(
  onSuccess?: (provider: AiProvider) => void,
  defaultValues?: Partial<AiProviderFormData>,
) {
  const form = useForm<AiProviderFormData>({
    resolver: zodResolver(criarAiProviderSchema),
    defaultValues: {
      name: "",
      baseUrl: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: AiProviderFormData, id?: string) => {
    console.log("Submitting provider:", data, id);

    toast({
      title: "Provider salvo!",
      description: `O provider "${data.name}" foi ${id ? "atualizado" : "criado"}.`,
    });

    // Mock response
    onSuccess?.({
      providerId: id || `provider-${Date.now()}`, // Renamed from 'id'
      name: data.name,
      baseUrl: data.baseUrl,
      // createdAt: REMOVED COMPLETELY
    });
  };

  const deletar = (provider: AiProvider) => {
    console.log("Deleting provider:", provider.providerId);
    toast({
      title: "Provider excluído",
      description: "O provider foi removido com sucesso.",
    });
  };

  return {
    form,
    handleSubmit,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    createError: null,
    updateError: null,
    deleteError: null,
    deletar,
  };
}

// Hook simplificado para listar apenas providers (para selects)
export function useAiProviderOptions() {
  // TODO: Implementar com API real
  const options = useMemo(() => [], []);

  return {
    options,
    isLoading: false,
  };
}

// Export dos tipos
export type { AiProvider, AiProviderFormData, AiProviderFilters, AiModel };
