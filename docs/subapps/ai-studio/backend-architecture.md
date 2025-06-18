# Backend Architecture - AI Studio SubApp

## ⚙️ Visão Geral

O backend do AI Studio é construído com tRPC v11, oferecendo APIs type-safe para gerenciamento de recursos de IA. A arquitetura modular permite fácil extensão e manutenção, com forte ênfase em segurança e isolamento por equipe.

## 🏗️ Estrutura de APIs

### Router Principal (`_router.ts`)

```typescript
export const aiStudioRouter = {
  // Provedores
  createAiProvider: protectedProcedure.mutation(),
  findAiProviders: protectedProcedure.query(),
  updateAiProvider: protectedProcedure.mutation(),
  deleteAiProvider: protectedProcedure.mutation(),

  // Modelos
  createAiModel: protectedProcedure.mutation(),
  findAiModels: protectedProcedure.query(),
  updateAiModel: protectedProcedure.mutation(),
  deleteAiModel: protectedProcedure.mutation(),

  // Agentes
  createAiAgent: protectedProcedure.mutation(),
  findAiAgents: protectedProcedure.query(),
  updateAiAgent: protectedProcedure.mutation(),
  deleteAiAgent: protectedProcedure.mutation(),

  // Tokens
  createAiTeamProviderToken: protectedProcedure.mutation(),
  findAiTeamProviderTokens: protectedProcedure.query(),
  updateAiTeamProviderToken: protectedProcedure.mutation(),
  removeTokenByProvider: protectedProcedure.mutation(),
} satisfies TRPCRouterRecord;
```

### Organização Modular

- **`providers.ts`** - Gerenciamento de provedores de IA
- **`models.ts`** - Configuração e gestão de modelos
- **`agents.ts`** - Sistema de agentes personalizados
- **`tokens.ts`** - Gestão segura de tokens de API

## 🗄️ Modelo de Dados

### Schemas Principais

#### Provider

```typescript
{
  id: string;
  teamId: string;
  name: string;
  type: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE";
  enabled: boolean;
  config?: Record<string, any>;
  createdAt: Date;
}
```

#### Model

```typescript
{
  id: string;
  teamId: string;
  providerId: string;
  name: string;
  enabled: boolean;
  maxTokens?: number;
  config?: Record<string, any>;
  createdAt: Date;
}
```

#### Agent

```typescript
{
  id: string;
  teamId: string;
  modelId: string;
  name: string;
  systemPrompt?: string;
  enabled: boolean;
  config?: Record<string, any>;
  createdById: string;
  createdAt: Date;
}
```

#### Token (Criptografado)

```typescript
{
  id: string;
  teamId: string;
  providerId: string;
  encryptedToken: string; // AES-256-GCM
  createdAt: Date;
}
```

## 🔐 Sistema de Segurança

### Criptografia de Tokens

```typescript
// Criptografia AES-256-GCM
function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}
```

### Isolamento por Team

```typescript
// Todas as operações validam teamId
const teamId = ctx.auth.user.activeTeamId;
if (!resource || resource.teamId !== teamId) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Resource not found",
  });
}
```

## 🔄 Service Layer

### AiStudioService

O AI Studio expõe funcionalidades para outros SubApps através do Service Layer:

```typescript
export class AiStudioService {
  static async getModelById({
    modelId,
    teamId,
    requestingApp,
  }: {
    modelId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    // Validação e logging
    this.validateTeamAccess(teamId);
    this.logAccess("getModelById", { teamId, requestingApp });

    // Buscar modelo com validação de acesso
    const model = await aiModelRepository.findById(modelId);
    const teamConfig = await aiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      modelId,
    );

    if (!model || !teamConfig?.enabled) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Model not available for this team",
      });
    }

    return model;
  }

  static async getAvailableModels({ teamId, requestingApp }) {
    // Retorna apenas modelos habilitados para o team
    return await aiTeamModelConfigRepository.findAvailableModelsByTeam(teamId);
  }
}
```

## 📊 Processamento de Dados

### Validação com Zod

```typescript
const createAiProviderSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"]),
  description: z.string().optional(),
  config: z
    .object({
      baseUrl: z.string().url().optional(),
      version: z.string().optional(),
    })
    .optional(),
});
```

### Paginação Padrão

```typescript
const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Resposta paginada
{
  providers: Provider[],
  pagination: {
    total: number,
    limit: number,
    totalPages: number,
  },
  success: boolean,
}
```

## 🚀 Performance

### Otimizações de Query

```typescript
// Queries paralelas para melhor performance
const [providers, totalCount] = await Promise.all([
  aiProviderRepository.findByTeam(teamId, { limit, offset }),
  aiProviderRepository.countByTeam(teamId),
]);
```

### Cache de Configurações

```typescript
// Cache de modelos disponíveis por team
const cacheKey = `ai-models:${teamId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const models = await findAvailableModels(teamId);
await redis.set(cacheKey, JSON.stringify(models), "EX", 300); // 5 min
```

## 🔄 Integração com Chat

### Fornecimento de Modelos

```typescript
// Chat busca modelos via Service Layer
const models = await AiStudioService.getAvailableModels({
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```

### Seleção de Modelo Padrão

```typescript
// Sistema de prioridade para modelo padrão
const defaultModel = models
  .filter((m) => m.enabled)
  .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
```

## 🧪 Tratamento de Erros

### Padrões de Erro

```typescript
// Erro de validação
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Invalid provider configuration",
});

// Erro de autorização
throw new TRPCError({
  code: "UNAUTHORIZED",
  message: "Team ID is required",
});

// Recurso não encontrado
throw new TRPCError({
  code: "NOT_FOUND",
  message: "AI provider not found",
});

// Conflito de dados
throw new TRPCError({
  code: "CONFLICT",
  message: "Provider name already exists",
});
```

### Logging de Erros

```typescript
try {
  // Operação
} catch (error) {
  console.error(`❌ [AI_STUDIO] Error in ${operation}:`, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to process request",
    cause: error,
  });
}
```

## 📊 Métricas e Monitoramento

### Tracking de Uso

```typescript
// Log de operações para auditoria
await logActivity({
  appId: aiStudioAppId,
  teamId: ctx.auth.user.activeTeamId,
  userId: ctx.auth.user.id,
  action: "create_provider",
  metadata: { providerId: provider.id },
});
```

### Métricas de Performance

```typescript
// Tempo de resposta das APIs
const startTime = Date.now();
const result = await operation();
const duration = Date.now() - startTime;

metrics.recordHistogram("ai_studio.api.duration", duration, {
  operation: "createProvider",
});
```

## 🔒 Configurações de Ambiente

### Variáveis Obrigatórias

```bash
# Criptografia
ENCRYPTION_KEY=your-32-character-encryption-key

# Redis para cache (opcional)
REDIS_URL=redis://localhost:6379

# Configurações de rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30
```

### Configurações por Ambiente

```typescript
const config = {
  development: {
    encryptionKey: "dev-key-for-testing",
    enableCache: false,
  },
  production: {
    encryptionKey: process.env.ENCRYPTION_KEY!,
    enableCache: true,
  },
};
```
