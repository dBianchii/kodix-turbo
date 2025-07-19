// Tipos para AI Provider - Now read-only, managed via JSON configuration
export interface AiProvider {
  providerId: string;
  name: string;
  baseUrl: string;
  // Note: models and tokens are fetched separately when needed
}

// AiProviderFormData removed - providers are no longer editable via UI

// Tipos para AI Model (atualizado)
export interface AiModel {
  id: string;
  name: string;
  providerId: string; // Mudou de 'provider' para 'providerId'
  config?: Record<string, unknown>;
  enabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  provider?: AiProvider; // Relacionamento
}

export interface AiModelFormData {
  name: string;
  providerId: string; // Mudou de 'provider' para 'providerId'
  config?: Record<string, unknown>;
  enabled?: boolean;
}

// Tipos para AI Provider Token (nova estrutura)
export interface AiProviderToken {
  id: string;
  teamId: string;
  providerId: string; // Mudou de 'modelId' para 'providerId'
  token: string;
  createdAt: Date;
  updatedAt: Date;
  team?: {
    id: string;
    name: string;
  };
  provider?: AiProvider;
}

export interface AiProviderTokenFormData {
  providerId: string;
  token: string;
}

// Tipos para filtros
export interface AiProviderFilters {
  busca?: string;
  ordenarPor?: "name" | "createdAt";
  ordem?: "asc" | "desc";
}

export interface AiModelFilters {
  busca?: string;
  providerId?: string;
  enabled?: boolean;
  ordenarPor?: "name" | "createdAt";
  ordem?: "asc" | "desc";
}

export interface AiProviderTokenFilters {
  providerId?: string;
  ordenarPor?: "createdAt";
  ordem?: "asc" | "desc";
}

// Tipos de paginação reutilizáveis
export interface Paginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ListaResponse<T> {
  data: T[];
  paginacao: Paginacao;
}

// Provider configuration from JSON
export interface ProviderConfig {
  providerId: string;
  name: string;
  baseUrl: string;
}
