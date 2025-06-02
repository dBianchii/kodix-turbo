# Referência da API - AI Studio

## 📋 Visão Geral

Esta é a documentação completa das APIs do AI Studio. Todas as APIs seguem o padrão tRPC com validação Zod e isolamento por `teamId`.

## 🔧 Estrutura Base

### Padrões de Nomenclatura

- **Criação**: `createAi*`
- **Busca**: `findAi*` ou `find*`
- **Atualização**: `updateAi*`
- **Remoção**: `deleteAi*`

### Estrutura de Resposta

```typescript
// Sucesso - Lista com Paginação
{
  [entities]: Entity[],
  pagination: {
    total: number,
    limit: number,
    totalPages: number
  },
  success: boolean
}

// Sucesso - Operação Simples
{
  [entity]: Entity,
  success: boolean,
  message?: string
}

// Erro (tRPC padrão)
{
  error: {
    code: "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
    message: string
  }
}
```

## 🏢 Providers API

### `createAiProvider`

Criar novo provedor de IA.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;           // 1-255 caracteres
  type: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE";
  description?: string;   // Opcional
  config?: {              // Opcional
    baseUrl?: string;     // URL válida
    version?: string;
  };
}
```

**Resposta**:

```typescript
{
  provider: {
    id: string;
    teamId: string;
    name: string;
    type: ProviderType;
    enabled: boolean;
    description?: string;
    config?: Record<string, any>;
    createdAt: Date;
  };
  success: true;
}
```

**Exemplo**:

```typescript
const result = await trpc.app.aiStudio.createAiProvider.mutate({
  name: "OpenAI Prod",
  type: "OPENAI",
  description: "Provedor principal",
  config: {
    baseUrl: "https://api.openai.com/v1",
  },
});
```

### `findAiProviders`

Listar provedores com paginação e filtros.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limit?: number;         // Padrão: 20, Max: 100
  offset?: number;        // Padrão: 0
  name?: string;          // Filtro por nome
  type?: ProviderType;    // Filtro por tipo
  enabled?: boolean;      // Filtro por status
}
```

**Resposta**:

```typescript
{
  providers: Provider[];
  pagination: {
    total: number;
    limit: number;
    totalPages: number;
  };
  success: true;
}
```

**Exemplo**:

```typescript
const { data } = trpc.app.aiStudio.findAiProviders.useQuery({
  limit: 10,
  type: "OPENAI",
  enabled: true,
});
```

### `updateAiProvider`

Atualizar provedor existente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  config?: Record<string, any>;
}
```

**Resposta**:

```typescript
{
  provider: Provider;
  message: "Provider updated successfully";
  success: true;
}
```

### `deleteAiProvider`

Remover provedor.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
}
```

**Resposta**:

```typescript
{
  success: true;
  message: "Provider deleted successfully";
}
```

### `enableProviderModels`

Habilitar todos os modelos de um provedor.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  providerId: string;
}
```

### `toggleGlobalModel`

Ativar/desativar modelo globalmente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  modelId: string;
  enabled: boolean;
}
```

## 🧠 Models API

### `createAiModel`

Criar novo modelo.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;           // 1-255 caracteres
  providerId: string;     // ID do provedor
  maxTokens?: number;     // Limite de tokens
  enabled?: boolean;      // Padrão: true
  config?: Record<string, any>;
}
```

**Resposta**:

```typescript
{
  model: {
    id: string;
    teamId: string;
    providerId: string;
    name: string;
    enabled: boolean;
    maxTokens?: number;
    config?: Record<string, any>;
    createdAt: Date;
  };
  success: true;
}
```

**Exemplo**:

```typescript
const result = await trpc.app.aiStudio.createAiModel.mutate({
  name: "GPT-4",
  providerId: "provider_123",
  maxTokens: 8192,
  config: {
    temperature: 0.7,
    top_p: 1.0,
  },
});
```

### `findAiModels`

Buscar modelos com filtros.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limit?: number;         // Padrão: 20
  offset?: number;        // Padrão: 0
  providerId?: string;    // Filtro por provedor
  name?: string;          // Filtro por nome
  enabled?: boolean;      // Filtro por status
}
```

**Resposta**:

```typescript
{
  models: Model[];
  pagination: PaginationInfo;
  success: true;
}
```

### `findAiModelById`

Buscar modelo específico.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  id: string;
}
```

**Resposta**:

```typescript
{
  model: Model;
  success: true;
}
```

### `updateAiModel`

Atualizar modelo.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  name?: string;
  maxTokens?: number;
  enabled?: boolean;
  config?: Record<string, any>;
}
```

### `deleteAiModel`

Remover modelo.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
}
```

## 👤 Agents API

### `createAiAgent`

Criar novo agente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;           // 1-255 caracteres
  modelId: string;        // ID do modelo
  systemPrompt?: string;  // Prompt de sistema
  enabled?: boolean;      // Padrão: true
  config?: Record<string, any>;
}
```

**Resposta**:

```typescript
{
  agent: {
    id: string;
    teamId: string;
    modelId: string;
    name: string;
    systemPrompt?: string;
    enabled: boolean;
    config?: Record<string, any>;
    createdById: string;
    createdAt: Date;
  };
  success: true;
}
```

**Exemplo**:

```typescript
const result = await trpc.app.aiStudio.createAiAgent.mutate({
  name: "Assistente de Código",
  modelId: "model_123",
  systemPrompt: "Você é um especialista em programação TypeScript.",
  config: {
    temperature: 0.3,
    maxResponseTokens: 2000,
  },
});
```

### `findAiAgents`

Listar agentes da equipe.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limit?: number;         // Padrão: 20
  offset?: number;        // Padrão: 0
  modelId?: string;       // Filtro por modelo
  enabled?: boolean;      // Filtro por status
}
```

**Resposta**:

```typescript
{
  agents: Agent[];
  pagination: PaginationInfo;
  success: true;
}
```

### `findAiAgentById`

Buscar agente específico.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  id: string;
}
```

### `updateAiAgent`

Atualizar agente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  name?: string;
  systemPrompt?: string;
  enabled?: boolean;
  config?: Record<string, any>;
}
```

### `deleteAiAgent`

Remover agente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
}
```

## 🔐 Tokens API

### `createAiTeamProviderToken`

Criar token de equipe para provedor.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  providerId: string; // ID do provedor
  token: string; // Token da API (será criptografado)
}
```

**Resposta**:

```typescript
{
  token: {
    id: string;
    teamId: string;
    providerId: string;
    // Token criptografado não é retornado
    createdAt: Date;
  }
  success: true;
}
```

**Exemplo**:

```typescript
const result = await trpc.app.aiStudio.createAiTeamProviderToken.mutate({
  providerId: "provider_123",
  token: "sk-...", // Token real da OpenAI
});
```

### `findAiTeamProviderTokens`

Listar tokens da equipe.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limit?: number;         // Padrão: 20
  offset?: number;        // Padrão: 0
}
```

**Resposta**:

```typescript
{
  tokens: {
    id: string;
    teamId: string;
    providerId: string;
    provider: Provider; // Dados do provedor
    createdAt: Date;
    // Token criptografado não é incluído
  }
  [];
  pagination: PaginationInfo;
  success: true;
}
```

### `findTokenByProvider`

Buscar token por provedor.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  providerId: string;
}
```

**Resposta**:

```typescript
{
  token: {
    id: string;
    teamId: string;
    providerId: string;
    createdAt: Date;
  } | null;
  success: true;
}
```

### `updateAiTeamProviderToken`

Atualizar token.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  providerId: string; // Usado como identificador
  token: string; // Novo token
}
```

### `removeTokenByProvider`

Remover token por provedor.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  providerId: string;
}
```

## ⚙️ Team Model Config API

### `findAvailableModels`

Buscar modelos disponíveis para a equipe.

**Método**: `query`

**Entrada**: Nenhuma (usa `teamId` do contexto)

**Resposta**:

```typescript
{
  models: {
    id: string;
    name: string;
    providerId: string;
    provider: Provider;
    enabled: boolean;
    priority?: number;
  }[];
  success: true;
}
```

### `toggleModel`

Ativar/desativar modelo para equipe.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  modelId: string;
  enabled: boolean;
}
```

### `setModelPriority`

Definir prioridade do modelo.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  modelId: string;
  priority: number; // 1-100
}
```

## 🚨 Códigos de Erro

### Códigos Comuns

| Código                  | Descrição                  | Situação                  |
| ----------------------- | -------------------------- | ------------------------- |
| `BAD_REQUEST`           | Dados de entrada inválidos | Schema Zod falhou         |
| `UNAUTHORIZED`          | Sem permissão              | `teamId` ausente          |
| `NOT_FOUND`             | Recurso não encontrado     | ID inválido ou sem acesso |
| `CONFLICT`              | Conflito de dados          | Nome duplicado            |
| `INTERNAL_SERVER_ERROR` | Erro interno               | Falha no banco/sistema    |

### Mensagens de Erro por Contexto

**Providers**:

- `"Provider name already exists"` - Nome duplicado
- `"AI provider not found"` - ID inválido
- `"Failed to create AI provider"` - Erro interno

**Models**:

- `"Model name already exists for this provider"` - Nome duplicado
- `"AI model not found"` - ID inválido
- `"Provider not found"` - `providerId` inválido

**Agents**:

- `"Agent name already exists"` - Nome duplicado
- `"AI agent not found"` - ID inválido
- `"Model not found"` - `modelId` inválido

**Tokens**:

- `"Token already exists for this provider"` - Token duplicado
- `"Provider token not found"` - Não existe token
- `"Failed to encrypt token"` - Erro de criptografia

## 🔧 Uso com React Query

### Exemplo Completo

```tsx
import { trpc } from "@/utils/trpc";

function ProvidersPage() {
  // Query para listar
  const {
    data: providersData,
    isLoading,
    error,
  } = trpc.app.aiStudio.findAiProviders.useQuery({
    limit: 20,
    enabled: true,
  });

  // Mutation para criar
  const createMutation = trpc.app.aiStudio.createAiProvider.useMutation({
    onSuccess: (data) => {
      console.log("Criado:", data.provider);
      // Invalidar cache
      trpc.useContext().app.aiStudio.findAiProviders.invalidate();
    },
    onError: (error) => {
      console.error("Erro:", error.message);
    },
  });

  // Mutation para atualizar
  const updateMutation = trpc.app.aiStudio.updateAiProvider.useMutation({
    onSuccess: () => {
      trpc.useContext().app.aiStudio.findAiProviders.invalidate();
    },
  });

  // Mutation para deletar
  const deleteMutation = trpc.app.aiStudio.deleteAiProvider.useMutation({
    onSuccess: () => {
      trpc.useContext().app.aiStudio.findAiProviders.invalidate();
    },
  });

  const handleCreate = (data: CreateProviderInput) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: string, data: UpdateProviderInput) => {
    updateMutation.mutate({ id, ...data });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  const { providers, pagination } = providersData || { providers: [] };

  return (
    <div>
      {providers.map((provider) => (
        <div key={provider.id}>
          {provider.name}
          <button
            onClick={() =>
              handleUpdate(provider.id, { enabled: !provider.enabled })
            }
          >
            {provider.enabled ? "Desativar" : "Ativar"}
          </button>
          <button onClick={() => handleDelete(provider.id)}>Deletar</button>
        </div>
      ))}
    </div>
  );
}
```

## 🔒 Segurança

### Validação de Acesso

Todas as APIs validam automaticamente:

1. **Autenticação**: Usuário logado
2. **Team ID**: Recurso pertence à equipe ativa
3. **Permissões**: Acesso baseado na função do usuário

### Criptografia

- **Tokens**: Criptografados com AES-256-GCM
- **Logs**: Tokens nunca aparecem em logs
- **Respostas**: Tokens criptografados nunca são retornados

### Rate Limiting

- **Criação**: 30 requests/minuto
- **Consultas**: 100 requests/minuto
- **Atualizações**: 60 requests/minuto

Esta referência fornece toda a informação necessária para integrar com as APIs do AI Studio de forma segura e eficiente.
