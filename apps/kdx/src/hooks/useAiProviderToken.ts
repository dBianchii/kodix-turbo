"use client";

import { useForm } from "react-hook-form";

// Tipos temporários - serão substituídos pelos tipos reais
interface AiProviderToken {
  id: string;
  teamId: string;
  providerId: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AiProviderTokenFormData {
  providerId: string;
  token: string;
}

interface AiProviderTokenFilters {
  providerId?: string;
  ordenarPor?: "createdAt";
  ordem?: "asc" | "desc";
}

// Placeholder toast - substituir quando disponível
const toast = (options: any) => console.log("Toast:", options);

// Hook para formulários de token
export function useAiProviderTokenForm(
  onSuccess?: (token: AiProviderToken) => void,
  defaultValues?: Partial<AiProviderTokenFormData>,
) {
  const form = useForm<AiProviderTokenFormData>({
    defaultValues: {
      providerId: "",
      token: "",
      ...defaultValues,
    },
  });

  // Placeholders para mutations - serão substituídos pela implementação real
  const handleSubmit = (data: AiProviderTokenFormData, id?: string) => {
    console.log("Submitting token:", data, id);
    // TODO: Implementar com API real
    toast({
      title: "Token salvo!",
      description: "O token foi salvo e criptografado com segurança.",
    });

    onSuccess?.({
      id: id || "temp-id",
      teamId: "temp-team",
      providerId: data.providerId,
      token: data.token,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const deletar = (providerId: string) => {
    console.log("Deleting token for provider:", providerId);
    // TODO: Implementar com API real
    toast({
      title: "Token removido",
      description: "O token foi removido com sucesso.",
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

// Hook para verificar se um provider tem token configurado
export function useProviderHasToken(providerId: string): {
  hasToken: boolean;
  token: AiProviderToken | null;
  isLoading: boolean;
} {
  // TODO: Implementar com API real
  return {
    hasToken: false,
    token: null,
    isLoading: false,
  };
}

// Export dos tipos temporários
export type {
  AiProviderToken,
  AiProviderTokenFormData,
  AiProviderTokenFilters,
};
