git # Referência da API - AI Studio

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
// Lista simples ou array de entidades
Entity[]

// Operação simples (sem wrapper padrão)
Entity

// Erro (tRPC padrão)
{
  error: {
    code: "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
    message: string
  }
}
```

## 🎯 Team Instructions API

### `getTeamInstructions`

Buscar instruções da equipe.

**Método**: `query`

**Entrada**: Nenhuma (usa teamId do contexto)

**Resposta**:

```typescript
{
  teamInstructions: {
    content: string;
    enabled: boolean;
    appliesTo: "chat" | "all";
  } | null;
}
```

### `updateTeamInstructions`

Atualizar instruções da equipe.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  content: string;
  enabled: boolean;
  appliesTo: "chat" | "all";
}
```

## 🏢 Providers API

### `findAiProviders`

Listar provedores da equipe.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limite?: number;        // Padrão: 20
  offset?: number;        // Padrão: 0
}
```

**Resposta**: `Provider[]`

### `createAiProvider`

Criar novo provedor.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;           // 1-255 caracteres
  baseUrl?: string;       // URL válida (opcional)
}
```

### `updateAiProvider`

Atualizar provedor existente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  name?: string;
  baseUrl?: string;
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

## 🔐 Tokens API

### `findAiTeamProviderTokens`

Listar tokens da equipe.

**Método**: `query`

**Entrada**: Nenhuma (usa teamId do contexto)

**Resposta**:

```typescript
{
  id: string;
  teamId: string;
  providerId: string;
  provider: Provider;
  token: string; // Mascarado na resposta
  createdAt: Date;
}
[];
```

### `createAiTeamProviderToken`

Criar token para provedor.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  providerId: string;
  token: string; // Será criptografado
}
```

### `updateAiTeamProviderToken`

Atualizar token existente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  token: string;
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

## 🧠 Enabled Models API

### `findAvailableModels`

Buscar modelos disponíveis para a equipe.

**Método**: `query`

**Entrada**: Nenhuma (usa teamId do contexto)

**Resposta**:

```typescript
{
  id: string;
  name: string;
  providerId: string;
  provider: Provider;
  teamConfig?: {
    enabled: boolean;
    priority?: number;
  };
  config?: {
    pricing?: {
      input: number;
      output: number;
    };
    description?: string;
    maxTokens?: number;
    temperature?: number;
  };
}[]
```

### `getDefaultModel`

Buscar modelo padrão da equipe.

**Método**: `query`

**Entrada**: Nenhuma

**Resposta**:

```typescript
{
  modelId: string;
} | null
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

### `reorderModelsPriority`

Reordenar prioridade dos modelos.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  orderedModelIds: string[];
}
```

### `testModel`

Testar conectividade de um modelo.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  modelId: string;
  testPrompt?: string;
}
```

**Resposta**:

```typescript
{
  success: boolean;
  latencyMs?: number;
  error?: string;
}
```

### `setDefaultModel`

Definir modelo padrão.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  modelId: string;
}
```

## 👤 Agents API

### `findAiAgents`

Listar agentes da equipe.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limite?: number;        // Padrão: 20
  offset?: number;        // Padrão: 0
}
```

**Resposta**:

```typescript
{
  agents: {
    id: string;
    name: string;
    instructions: string;
    libraryId?: string;
    library?: {
      name: string;
    };
    createdAt: Date;
  }[];
}
```

### `createAiAgent`

Criar novo agente.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;
  instructions: string;
  libraryId?: string;     // Opcional - biblioteca de conhecimento
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
  instructions?: string;
  libraryId?: string;
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

## 📚 Libraries API

### `findAiLibraries`

Listar bibliotecas da equipe.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limite?: number;        // Padrão: 20
  offset?: number;        // Padrão: 0
}
```

**Resposta**:

```typescript
{
  libraries: {
    id: string;
    name: string;
    files?: any[];          // Metadados dos arquivos em JSON
    createdAt: Date;
  }[];
}
```

### `createAiLibrary`

Criar nova biblioteca.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;
  files?: string;         // JSON string com metadados dos arquivos
}
```

### `updateAiLibrary`

Atualizar biblioteca.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  name?: string;
  files?: string;
}
```

### `deleteAiLibrary`

Remover biblioteca.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
}
```

## 🔧 System Models API

### `findModels`

Buscar modelos globais do sistema.

**Método**: `query`

**Schema de Entrada**:

```typescript
{
  limite?: number;        // Padrão: 20
  offset?: number;        // Padrão: 0
}
```

**Resposta**: `Model[]`

### `createAiModel`

Criar novo modelo global.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  name: string;
  providerId: string;
  config?: Record<string, any>;  // Configurações JSON
  enabled?: boolean;             // Padrão: true
}
```

### `updateAiModel`

Atualizar modelo global.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
  name?: string;
  providerId?: string;
  config?: Record<string, any>;
  enabled?: boolean;
}
```

### `deleteAiModel`

Remover modelo global.

**Método**: `mutation`

**Schema de Entrada**:

```typescript
{
  id: string;
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

## 🔧 Uso com React Query

### Exemplo Completo - Seção de Tokens

```tsx
import { trpc } from "@/utils/trpc";

function TokensSection() {
  // Query para listar tokens
  const tokensQuery = useQuery(
    trpc.app.aiStudio.findAiTeamProviderTokens.queryOptions(),
  );

  // Query para provedores (para dropdown)
  const providersQuery = useQuery(
    trpc.app.aiStudio.findAiProviders.queryOptions({
      limite: 50,
      offset: 0,
    }),
  );

  // Mutation para criar token
  const createMutation = useMutation(
    trpc.app.aiStudio.createAiTeamProviderToken.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiTeamProviderTokens.pathFilter(),
        );
        toast.success("Token criado com sucesso!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao criar token");
      },
    }),
  );

  // Mutation para remover token
  const deleteMutation = useMutation(
    trpc.app.aiStudio.removeTokenByProvider.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAiTeamProviderTokens.pathFilter(),
        );
        toast.success("Token removido com sucesso!");
      },
    }),
  );

  const handleCreate = (data: { providerId: string; token: string }) => {
    createMutation.mutate(data);
  };

  const handleDelete = (providerId: string) => {
    deleteMutation.mutate({ providerId });
  };

  // ... resto do componente
}
```

### Exemplo - Enabled Models com Drag & Drop

```tsx
function EnabledModelsSection() {
  const { data: models } = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(),
  );

  const { data: defaultModel } = useQuery(
    trpc.app.aiStudio.getDefaultModel.queryOptions(),
  );

  const reorderMutation = useMutation(
    trpc.app.aiStudio.reorderModelsPriority.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        toast.success("Prioridade atualizada!");
      },
    }),
  );

  const testMutation = useMutation(
    trpc.app.aiStudio.testModel.mutationOptions({
      onSuccess: (data, variables) => {
        // Resultado do teste
        console.log(`Model ${variables.modelId} test:`, data);
      },
    }),
  );

  // ... handlers para drag & drop e teste
}
```

## 🔒 Segurança

### Validação de Acesso

Todas as APIs validam automaticamente:

1. **Autenticação**: Usuário logado
2. **Team ID**: Recurso pertence à equipe ativa
3. **Isolamento**: Dados separados por equipe

### Criptografia

- **Tokens**: Criptografados com AES-256-GCM
- **Logs**: Tokens nunca aparecem em logs
- **Respostas**: Tokens sempre mascarados

### Rate Limiting

- **Criação**: 30 requests/minuto
- **Consultas**: 100 requests/minuto
- **Atualizações**: 60 requests/minuto

Esta referência documenta todas as APIs realmente implementadas no AI Studio, refletindo a arquitetura e funcionalidades atuais do sistema.
