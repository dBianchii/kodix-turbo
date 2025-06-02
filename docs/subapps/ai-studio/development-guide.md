# Guia de Desenvolvimento - AI Studio

## 📚 Visão Geral

Este guia cobre como desenvolver funcionalidades no **AI Studio** seguindo a arquitetura modular e as **Kodix AI Coding Rules**.

## 🏗️ Estrutura Completa do Projeto

### Backend (API)

```
packages/api/src/trpc/routers/app/ai-studio/
├── _router.ts          # Router principal agregador
├── providers.ts        # Gerenciamento de Provedores de IA
├── models.ts          # Gerenciamento de Modelos de IA
├── agents.ts          # Gerenciamento de Agentes IA
├── tokens.ts          # Tokens de provedores de equipe
└── libraries.ts       # Bibliotecas de IA (em desenvolvimento)
```

### Frontend

```
apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/
├── page.tsx                    # Página principal
├── _components/
│   ├── ai-studio-content.tsx  # Container principal
│   ├── app-sidebar.tsx        # Navegação lateral
│   └── sections/
│       ├── providers-section.tsx  # Gestão de provedores
│       ├── models-section.tsx     # Gestão de modelos
│       ├── agents-section.tsx     # Gestão de agentes
│       └── tokens-section.tsx     # Gestão de tokens
```

### Database

```
packages/db/src/
├── schema/apps/ai-studio.ts       # Schemas das tabelas
├── repositories/aiStudio/         # Repositórios por entidade
│   ├── AiProviderRepository.ts
│   ├── AiModelRepository.ts
│   ├── AiAgentRepository.ts
│   └── AiTeamProviderTokenRepository.ts
└── utils/crypto.ts                # Utilitários de criptografia
```

## 🛠️ Stack Tecnológica

- **Backend**: tRPC + TypeScript
- **Frontend**: Next.js + React + TypeScript
- **Validação**: Zod schemas
- **Database**: Repositórios com Kysely
- **Criptografia**: Node.js crypto (AES-256-GCM)
- **Estado**: React Query + Zustand

## 📊 Padrões Técnicos Obrigatórios

### **Nomenclatura (Kodix Rules)**

- **Código**: 100% em inglês (funções, variáveis, comentários)
- **Documentação**: Em português (apenas pasta `docs/`)
- **APIs**: Padrões `createAi*`, `findAi*`, `updateAi*`, `deleteAi*`

### **Estruturas de Resposta Padronizadas**

```typescript
// Listas paginadas
{
  providers: Provider[],  // ou models, agents, etc.
  pagination: {
    total: number,
    limit: number,
    totalPages: number
  },
  success: boolean
}

// Operações simples
{
  provider: Provider,     // ou model, agent, etc.
  success: boolean
}
```

### **Tratamento de Erros Padrão**

- Mensagens padronizadas em inglês
- Logs detalhados para debugging
- Códigos HTTP apropriados via tRPC

```typescript
throw new TRPCError({
  code: "NOT_FOUND",
  message: "AI provider not found",
});
```

## 🔧 Desenvolvendo Novas Funcionalidades

### 1. Escolher o Módulo Correto

```typescript
// Para PROVEDORES -> providers.ts
export const createAiProvider = protectedProcedure
  .input(createAiProviderSchema)
  .mutation(async ({ input, ctx }) => {
    // Implementação
  });

// Para MODELOS -> models.ts
export const createAiModel = protectedProcedure
  .input(createAiModelSchema)
  .mutation(async ({ input, ctx }) => {
    // Implementação
  });

// Para AGENTES -> agents.ts
export const createAiAgent = protectedProcedure
  .input(createAiAgentSchema)
  .mutation(async ({ input, ctx }) => {
    // Implementação
  });
```

### 2. Padrões de Nomenclatura

**✅ USAR - Nomes em inglês:**

```typescript
// Funções
createAiProvider, findAiProviders, updateAiProvider, deleteAiProvider;
createAiModel, findAiModels, updateAiModel, deleteAiModel;
createAiAgent, findAiAgents, updateAiAgent, deleteAiAgent;

// Variáveis
const teamId = ctx.auth.user.activeTeamId;
const pagination = { total, limit, totalPages };
const success = true;

// Mensagens de erro
throw new TRPCError({
  code: "NOT_FOUND",
  message: "AI provider not found",
});
```

### 3. Validação com Zod

```typescript
// Sempre usar schemas Zod para validação
export const createAiProviderSchema = z.object({
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

### 4. Segurança - Validação de Team ID

```typescript
// SEMPRE validar teamId PRIMEIRO
const teamId = ctx.auth.user.activeTeamId;
if (!teamId) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Team ID is required",
  });
}

// Validar propriedade dos recursos
const existingProvider = await aiProviderRepository.findById(input.id);
if (!existingProvider || existingProvider.teamId !== teamId) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "AI provider not found",
  });
}
```

### 5. Tratamento de Erros Padrão

```typescript
try {
  const provider = await aiProviderRepository.create({
    ...input,
    teamId,
  });

  return {
    provider,
    success: true,
  };
} catch (error) {
  console.error("Error creating AI provider:", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to create AI provider",
    cause: error,
  });
}
```

### 6. Estruturas de Resposta

```typescript
// Para listas com paginação
return {
  providers: results,
  pagination: {
    total: totalCount,
    limit: input.limit,
    totalPages: Math.ceil(totalCount / input.limit),
  },
  success: true,
};

// Para operações simples
return {
  provider,
  success: true,
};

// Para atualizações
return {
  provider: updatedProvider,
  message: "Provider updated successfully",
  success: true,
};
```

## 🎨 Desenvolvimento Frontend

### Usando tRPC com React Query

```tsx
import { trpc } from "@/utils/trpc";

export function ProvidersList() {
  // Query para listar provedores
  const { data, isLoading, error } = trpc.app.aiStudio.findAiProviders.useQuery(
    {
      limit: 20,
      offset: 0,
    },
  );

  // Mutation para criar provedor
  const createMutation = trpc.app.aiStudio.createAiProvider.useMutation({
    onSuccess: () => {
      trpc.useContext().app.aiStudio.findAiProviders.invalidate();
      toast.success("Provedor criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar provedor: ${error.message}`);
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  const { providers, pagination } = data || {
    providers: [],
    pagination: null,
  };

  return (
    <div>
      <h2>Provedores de IA</h2>

      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}

      {pagination && (
        <Pagination
          total={pagination.total}
          limit={pagination.limit}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
}
```

### Formulários com Validação

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Usar mesmo schema do backend
const createProviderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  type: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "AZURE"]),
  description: z.string().optional(),
});

type CreateProviderForm = z.infer<typeof createProviderSchema>;

export function CreateProviderForm() {
  const form = useForm<CreateProviderForm>({
    resolver: zodResolver(createProviderSchema),
  });

  const createMutation = trpc.app.aiStudio.createAiProvider.useMutation();

  const onSubmit = async (data: CreateProviderForm) => {
    try {
      const result = await createMutation.mutateAsync(data);
      if (result.success) {
        toast.success("Provedor criado com sucesso!");
        form.reset();
      }
    } catch (error) {
      console.error("Erro ao criar provedor:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Nome</label>
        <input {...form.register("name")} />
        {form.formState.errors.name && (
          <span>{form.formState.errors.name.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="type">Tipo</label>
        <select {...form.register("type")}>
          <option value="OPENAI">OpenAI</option>
          <option value="ANTHROPIC">Anthropic</option>
          <option value="GOOGLE">Google</option>
          <option value="AZURE">Azure</option>
        </select>
      </div>

      <button type="submit" disabled={createMutation.isLoading}>
        {createMutation.isLoading ? "Criando..." : "Criar Provedor"}
      </button>
    </form>
  );
}
```

## 🧪 Testes

### Estrutura de Testes

```bash
packages/api/src/trpc/routers/app/ai-studio/__tests__/
├── providers.test.ts    # Testes do módulo de provedores
├── models.test.ts       # Testes do módulo de modelos
├── agents.test.ts       # Testes do módulo de agentes
├── tokens.test.ts       # Testes do módulo de tokens
└── integration.test.ts  # Testes de integração
```

### Exemplo de Teste

```typescript
describe("AI Providers Router", () => {
  describe("createAiProvider", () => {
    it("should create provider successfully", async () => {
      const input = {
        name: "OpenAI Test",
        type: "OPENAI" as const,
        description: "Provider para testes",
      };

      const result = await caller.app.aiStudio.createAiProvider(input);

      expect(result.success).toBe(true);
      expect(result.provider.name).toBe(input.name);
      expect(result.provider.teamId).toBe(mockTeamId);
    });

    it("should throw error when provider name already exists", async () => {
      await caller.app.aiStudio.createAiProvider({
        name: "Existing Provider",
        type: "OPENAI",
      });

      await expect(
        caller.app.aiStudio.createAiProvider({
          name: "Existing Provider",
          type: "ANTHROPIC",
        }),
      ).rejects.toThrow("Provider name already exists");
    });
  });
});
```

### Teste de Integração

```typescript
describe("AI Studio Integration", () => {
  it("should complete full workflow: provider → model → agent", async () => {
    // 1. Criar provedor
    const providerResult = await caller.app.aiStudio.createAiProvider({
      name: "OpenAI Integration",
      type: "OPENAI",
    });

    // 2. Criar modelo
    const modelResult = await caller.app.aiStudio.createAiModel({
      name: "GPT-4",
      providerId: providerResult.provider.id,
      maxTokens: 8192,
    });

    // 3. Criar agente
    const agentResult = await caller.app.aiStudio.createAiAgent({
      name: "Assistente de Teste",
      modelId: modelResult.model.id,
      systemPrompt: "Você é um assistente útil.",
    });

    expect(providerResult.success).toBe(true);
    expect(modelResult.success).toBe(true);
    expect(agentResult.success).toBe(true);
  });
});
```

## 🔒 Segurança e Boas Práticas

### 1. Validação de Acesso

```typescript
const validateTeamAccess = (
  resource: { teamId: string },
  userTeamId: string,
) => {
  if (resource.teamId !== userTeamId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Resource not found", // Não revelar que existe
    });
  }
};
```

### 2. Sanitização de Dados

```typescript
const sanitizedInput = {
  name: input.name.trim(),
  description: input.description?.trim(),
};
```

### 3. Rate Limiting

```typescript
const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  keyName: "ai-studio-create",
});

export const createAiProvider = protectedProcedure
  .use(rateLimiter)
  .input(createAiProviderSchema)
  .mutation(async ({ input, ctx }) => {
    // Implementação
  });
```

## 📊 Performance

### 1. Otimização de Queries

```typescript
// Usar Promise.all para operações paralelas
const [providers, totalCount] = await Promise.all([
  aiProviderRepository.findByTeam(teamId, { limit, offset }),
  aiProviderRepository.countByTeam(teamId),
]);

// Incluir apenas campos necessários
const providers = await aiProviderRepository.findByTeam(teamId, {
  select: {
    id: true,
    name: true,
    type: true,
    enabled: true,
    // Não carregar config por padrão
  },
});
```

### 2. Cache com React Query

```typescript
const { data } = useQuery({
  queryKey: ["ai-providers", teamId],
  queryFn: () => trpc.app.aiStudio.findAiProviders.query(),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

## 🚀 Deploy

### Variáveis de Ambiente

```bash
# .env.production
ENCRYPTION_KEY=<chave-segura>
DATABASE_URL=<url-banco>
REDIS_URL=<url-redis>
```

### Migrações

```typescript
export async function up(db: Database) {
  await db.schema
    .alterTable("ai_provider")
    .addColumn("description", "text")
    .execute();
}

export async function down(db: Database) {
  await db.schema.alterTable("ai_provider").dropColumn("description").execute();
}
```

## 📋 Checklist de Desenvolvimento

### Antes de Implementar

- [ ] Li `docs/architecture/` para entender os padrões
- [ ] Escolhi o módulo correto
- [ ] Planejo usar nomes em inglês
- [ ] Validarei `teamId` em todas as operações

### Durante o Desenvolvimento

- [ ] Usei schemas Zod para validação
- [ ] Implementei tratamento de erros consistente
- [ ] Segui estruturas de resposta padronizadas
- [ ] Adicionei logs para debugging

### Antes do Deploy

- [ ] Escrevi testes para o módulo
- [ ] Testei integração com outros módulos
- [ ] Verifiquei compliance com Kodix Rules
- [ ] Atualizei documentação se necessário

## 🎯 Dicas Importantes

1. **Sempre validar `teamId`** antes de qualquer operação
2. **Usar Promise.all** para operações paralelas
3. **Implementar cache** para dados que mudam pouco
4. **Logs em inglês** para debugging
5. **Testes unitários** para cada funcionalidade
6. **Seguir padrões** de nomenclatura consistentes

Seguindo estas práticas, você contribuirá para um codebase robusto e escalável! 🚀
