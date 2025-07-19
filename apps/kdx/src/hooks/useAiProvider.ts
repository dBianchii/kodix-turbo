// useAiProvider hook has been simplified - providers are now read-only
// Providers are managed via JSON configuration file:
// packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json

"use client";

// Provider interface for read-only operations
export interface AiProvider {
  providerId: string;
  name: string;
  baseUrl: string;
}

// This hook is deprecated - providers are now read-only from JSON configuration
// Use the tRPC query directly: trpc.app.aiStudio.findAiProviders.useQuery()

export function useAiProviderForm() {
  // Return deprecated functions that throw errors
  return {
    criar: () => {
      throw new Error("Provider creation is no longer supported. Providers are managed via JSON configuration.");
    },
    atualizar: () => {
      throw new Error("Provider updates are no longer supported. Providers are managed via JSON configuration.");
    },
    deletar: () => {
      throw new Error("Provider deletion is no longer supported. Providers are managed via JSON configuration.");
    },
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  };
}

export function useAiProviderItem(providerId?: string) {
  // Return deprecated function that throws error
  return {
    provider: null,
    isLoading: false,
    error: new Error("Individual provider queries are no longer supported. Use findAiProviders query instead."),
    refetch: () => {
      throw new Error("Individual provider queries are no longer supported. Use findAiProviders query instead.");
    },
  };
}

// Re-export the interface for backward compatibility
export type { AiProvider as AiProviderFormData };