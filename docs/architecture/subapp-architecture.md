# SubApp Architecture - Kodix

## 📖 **Overview**

Este documento consolida **todos os aspectos arquiteturais** dos SubApps no Kodix:

- **🏗️ Arquitetura e Padrões** - Conceitos fundamentais
- **🔒 Isolamento e Comunicação** - Regras de isolamento entre apps
- **⚙️ Configurações por Team** - Sistema AppTeamConfig
- **🚀 Criação de Novos SubApps** - Processo passo-a-passo

## 🚨 **CRÍTICO: Leitura Obrigatória**

**Antes de trabalhar com SubApps**, leia esta seção sobre problemas críticos identificados:

### ⚠️ **TeamId Context Loss (2024-12-19)**

**Problema Crítico:** Chat app falhava com erro 412 "Nenhum modelo de IA disponível" devido à falta de contexto `teamId` em chamadas entre apps.

**✅ Solução Implementada:** Migração de `teamId` para `userId` com resolução interna de contexto:

```typescript
// ❌ PROBLEMA ANTERIOR - Passar teamId complexo de gerenciar
await callAiStudioEndpoint("getModel", teamId, params, headers);

// ✅ SOLUÇÃO ATUAL - Passar userId, SubApp resolve contexto
await callAiStudioEndpoint("getModel", userId, params, headers);
```

### 🐛 **Erros Comuns na Migração teamId → userId**

**Problema:** Código legacy ainda passando `session.teamId` em vez de `userId`:

```typescript
// ❌ ERRO COMUM - Esquecer de atualizar código legacy
const model = await callAiStudioEndpoint(
  "getModel",
  session.teamId, // ❌ INCORRETO - Ainda usando teamId
  { modelId: session.aiModelId },
);

// ✅ CORRETO - Usar userId do contexto autenticado
const model = await callAiStudioEndpoint(
  "getModel",
  ctx.auth.user.id, // ✅ CORRETO - userId do usuário autenticado
  { modelId: session.aiModelId },
);
```

**Checklist para Migração:**

- [ ] Verificar todas as chamadas `callAiStudioEndpoint`
- [ ] Substituir `session.teamId` por `ctx.auth.user.id`
- [ ] Substituir `teamId` parâmetro por `userId` em helpers
- [ ] Testar comunicação entre SubApps após mudanças

### **🎯 Por que `userId` é melhor que `teamId`:**

1. **🔒 Responsabilidade Única:** Cada SubApp gerencia seu próprio contexto de team
2. **🚀 Simplicidade:** SubApp remetente não precisa gerenciar contexto de team
3. **🔄 Consistência:** Usa a mesma lógica de autenticação que já existe
4. **🛡️ Segurança:** Validação baseada no usuário autenticado é mais robusta
5. **📦 Isolamento:** Cada SubApp resolve contexto do team internalmente

```typescript
// ❌ PROBLEMÁTICO - Abordagem teamId (complexa e acoplada)
const response = await fetch(
  `/api/ai-studio/integration?action=getModel&teamId=${teamId}`,
);
// Problema: SubApp remetente precisa gerenciar teamId

// ✅ MELHOR - Abordagem userId (simples e desacoplada)
const response = await fetch(
  `/api/ai-studio/integration?action=getModel&userId=${userId}`,
);
// AI Studio resolve: const teamId = session.user.activeTeamId;
```

---

## 🏗️ **Arquitetura Fundamental**

### **O que são SubApps?**

SubApps são módulos independentes que estendem a funcionalidade principal do Kodix:

- **Namespace próprio** para isolamento completo
- **Rotas dedicadas** no sistema de roteamento
- **APIs específicas** via tRPC
- **Configurações por team** via AppTeamConfig
- **Comunicação via HTTP** (nunca acesso direto a repositórios)

### **SubApps Implementados**

| SubApp        | ID               | Descrição                  | Dependências |
| ------------- | ---------------- | -------------------------- | ------------ |
| **AI Studio** | `aiStudioAppId`  | Gestão de agentes IA       | -            |
| **Chat**      | `chatAppId`      | Sistema de comunicação     | AI Studio    |
| **Calendar**  | `calendarAppId`  | Sistema de calendário      | -            |
| **Todo**      | `todoAppId`      | Lista de tarefas           | -            |
| **KodixCare** | `kodixCareAppId` | Gestão de cuidados médicos | Calendar     |
| **Cupom**     | `cupomAppId`     | Sistema de cupons          | -            |

---

## 🔒 **Regras de Isolamento ENTRE SubApps**

### **🚨 Regra Fundamental: Isolamento Total Entre SubApps**

**NUNCA** permitido acesso direto **de um SubApp para outro SubApp**:

```typescript
// ❌ PROIBIDO - SubApp "Chat" acessando diretamente repositório do SubApp "AI Studio"
import { aiStudioRepository } from "@kdx/db/repositories";

export const chatRouter = {
  someEndpoint: protectedProcedure.query(async ({ ctx }) => {
    // ❌ VIOLAÇÃO: SubApp Chat não pode acessar diretamente dados do SubApp AI Studio
    const model = await aiStudioRepository.AiModelRepository.findById(modelId);
  }),
};
```

**SEMPRE** obrigatório - **Comunicação entre SubApps APENAS via HTTP**:

```typescript
// ✅ CORRETO - SubApp Chat se comunicando com SubApp AI Studio via HTTP
async function callAiStudioEndpoint(
  action: string,
  userId: string, // ✅ MELHOR: Enviar userId - cada SubApp resolve seu contexto
  params?: Record<string, string>,
  headers?: Record<string, string>,
): Promise<any> {
  const baseUrl = process.env.KODIX_API_URL || "http://localhost:3000";
  const searchParams = new URLSearchParams({
    action,
    userId, // ✅ SubApp receptor resolve teamId internamente
    ...(params || {}),
  });

  const response = await fetch(
    `${baseUrl}/api/ai-studio/integration?${searchParams}`,
    {
      headers: {
        Authorization: headers?.Authorization, // ✅ Forward auth
        "Content-Type": "application/json",
        ...headers,
      },
    },
  );

  return response.json();
}
```

### **Sistema de Dependências Entre SubApps**

Dependências **entre SubApps** são declaradas explicitamente:

```typescript
// packages/shared/src/db.ts
export const appDependencies: Record<KodixAppId, KodixAppId[]> = {
  [chatAppId]: [aiStudioAppId], // SubApp Chat depende do SubApp AI Studio
  [kodixCareAppId]: [calendarAppId], // SubApp KodixCare depende do SubApp Calendar
  [todoAppId]: [], // SubApp Todo é independente
  [aiStudioAppId]: [], // SubApp AI Studio é base
};
```

**Instalação Automática:** Quando um SubApp é instalado, suas dependências (outros SubApps) são instaladas automaticamente.

**Validação Runtime:** Use middlewares para validar dependências entre SubApps:

```typescript
// Middleware específico para SubApp Chat (requer SubApp AI Studio)
export const chatWithDependenciesMiddleware =
  appWithDependenciesInstalledMiddlewareFactory(chatAppId);

const chatProtectedProcedure = protectedProcedure.use(
  chatWithDependenciesMiddleware,
);
```

---

## ⚙️ **Sistema de Configurações por Team**

### **AppTeamConfig Overview**

Sistema que permite configurações específicas por **aplicativo** e por **equipe**:

```typescript
// Schema exemplo para AI Studio
export const aiStudioConfigSchema = z.object({
  modelSettings: z.object({
    defaultModel: z.string().optional(),
    maxTokens: z.number().min(100).max(8000).default(2000),
    temperature: z.number().min(0).max(2).default(0.7),
  }),
  permissions: z.object({
    allowModelSwitching: z.boolean().default(true),
    allowTemperatureAdjustment: z.boolean().default(false),
  }),
});

// Mapeamento global
export const appIdToAppTeamConfigSchema = {
  [aiStudioAppId]: aiStudioConfigSchema,
  [chatAppId]: chatConfigSchema,
  // ... outros apps
};
```

### **Estrutura de Banco**

```typescript
export const appTeamConfigs = mysqlTable(
  "appTeamConfig",
  (t) => ({
    id: nanoidPrimaryKey(t),
    config: t.json().notNull(),
    appId: t.varchar({ length: NANOID_SIZE }).notNull(),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
  (table) => ({
    // Uma configuração por app/team
    unique_appId_teamId: unique("unique_appId_teamId").on(
      table.appId,
      table.teamId,
    ),
  }),
);
```

### **API de Configurações**

```typescript
// Buscar configuração do team
export const getConfigHandler = protectedProcedure
  .input(z.object({ appId: z.string() }))
  .query(async ({ input, ctx }) => {
    const [config] = await appRepository.findAppTeamConfigs({
      appId: input.appId,
      teamIds: [ctx.auth.user.activeTeamId],
    });

    return config?.config || getDefaultConfig(input.appId);
  });

// Salvar configuração
export const saveConfigHandler = protectedProcedure
  .input(z.object({ appId: z.string(), config: z.any() }))
  .mutation(async ({ input, ctx }) => {
    await appRepository.upsertAppTeamConfig({
      appId: input.appId,
      teamId: ctx.auth.user.activeTeamId,
      config: input.config,
    });
  });
```

### **Hook Frontend**

```typescript
export function useAppTeamConfig(appId: AppIdsWithConfig) {
  const { data: config, isLoading } = api.app.getConfig.useQuery({ appId });

  const saveConfigMutation = useMutation(
    api.app.saveConfig.mutationOptions({
      onSuccess: () => {
        utils.app.getConfig.invalidate({ appId });
        toast.success("Configurações salvas!");
      },
    }),
  );

  return {
    config,
    isLoading,
    saveConfig: (newConfig: any) =>
      saveConfigMutation.mutate({ appId, config: newConfig }),
    isSaving: saveConfigMutation.isLoading,
  };
}
```

---

## 🚀 **Criando Novos SubApps**

### **Processo Completo**

#### **1. Registrar no Shared**

```typescript
// packages/shared/src/db.ts
export const meuNovoAppId = "meu_novo_app_123";

export const appIdToRoles = {
  // ... outros apps
  [meuNovoAppId]: [...commonRolesForAllApps] as const,
};

export type KodixAppId = typeof todoAppId | typeof meuNovoAppId; // Adicionar
```

#### **2. Definir Schema de Configuração**

```typescript
export const meuNovoAppConfigSchema = z.object({
  appSettings: z.object({
    enableFeatureX: z.boolean().default(true),
    maxItemsPerPage: z.number().min(10).max(100).default(20),
  }),
  integrations: z.object({
    externalApiEnabled: z.boolean().default(false),
    externalApiUrl: z.string().url().optional(),
  }),
});

export const appIdToAppTeamConfigSchema = {
  // ... outros
  [meuNovoAppId]: meuNovoAppConfigSchema,
};
```

#### **3. Criar Schema de Banco**

```typescript
// packages/db/src/schema/apps/meu-novo-app.ts
export const meuRecurso = mysqlTable("meu_recurso", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  name: varchar("name", { length: 100 }).notNull(),
  teamId: varchar("teamId", { length: 30 }).notNull(),
  createdById: varchar("createdById", { length: 30 }).notNull(),
  createdAt: datetime("createdAt").defaultNow().notNull(),
  updatedAt: datetime("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

#### **4. Implementar APIs tRPC**

```typescript
// packages/api/src/trpc/routers/app/meuNovoApp/_router.ts
export const meuNovoAppRouter = router({
  // CRUD básico
  buscarRecursos: protectedProcedure
    .input(buscarRecursosSchema)
    .query(async ({ input, ctx }) => {
      return await meuNovoAppRepository.findByTeam({
        teamId: ctx.auth.user.activeTeamId,
        ...input,
      });
    }),

  criarRecurso: protectedProcedure
    .input(criarRecursoSchema)
    .mutation(async ({ input, ctx }) => {
      return await meuNovoAppRepository.create({
        ...input,
        teamId: ctx.auth.user.activeTeamId,
        createdById: ctx.auth.user.id,
      });
    }),

  // Configurações
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const [config] = await appRepository.findAppTeamConfigs({
      appId: meuNovoAppId,
      teamIds: [ctx.auth.user.activeTeamId],
    });
    return config?.config || meuNovoAppConfigSchema.parse({});
  }),

  saveConfig: protectedProcedure
    .input(meuNovoAppConfigSchema.partial())
    .mutation(async ({ ctx, input }) => {
      await appRepository.upsertAppTeamConfig({
        appId: meuNovoAppId,
        teamId: ctx.auth.user.activeTeamId,
        config: input,
      });
    }),
});
```

#### **5. Estrutura Frontend**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/meuNovoApp/
├── page.tsx                    # Página principal
├── _components/
│   ├── main-nav.tsx           # Navegação por tabs
│   └── sections/
│       ├── recursos-section.tsx    # Funcionalidade principal
│       └── config-section.tsx      # Configurações
```

#### **6. Página Principal**

```tsx
// page.tsx
export default async function MeuNovoAppPage() {
  await redirectIfAppNotInstalled({ appId: meuNovoAppId });
  const t = await getTranslations();

  return (
    <MaxWidthWrapper>
      <main className="pt-6">
        <div className="flex items-center space-x-4">
          <IconKodixApp appId={meuNovoAppId} renderText={false} />
          <H1>{t("apps.meuNovoApp.appName")}</H1>
        </div>
        <Separator className="my-4" />
        <MainNav />
      </main>
    </MaxWidthWrapper>
  );
}
```

#### **7. Adicionar Traduções**

```typescript
// packages/locales/src/messages/kdx/pt.ts
export default {
  apps: {
    meuNovoApp: {
      appName: "Meu Novo App",
      welcome: "Bem-vindo ao Meu Novo App",
      sections: {
        recursos: "Recursos",
        configuracao: "Configuração",
      },
    },
  },
} as const;
```

---

## 🔒 **Padrões de Segurança**

### **Isolamento por Team**

```typescript
// OBRIGATÓRIO em todos os endpoints
const teamId = ctx.auth.user.activeTeamId;
if (!resource || resource.teamId !== teamId) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Resource not found",
  });
}
```

### **Validação de Contexto em Integrações**

```typescript
// AI Studio - Validar teamId em endpoints de integração
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.activeTeamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId || teamId !== session.user.activeTeamId) {
    return NextResponse.json({ error: "Invalid teamId" }, { status: 403 });
  }

  // Processar request...
}
```

---

## 📊 **Monitoramento e Debugging**

### **Logs Obrigatórios**

```typescript
// Em endpoints de integração
console.log(
  `🔄 [${SUBAPP}_API] Integration request: ${action} for team: ${teamId}`,
);
console.log(`✅ [${SUBAPP}_API] Success: ${action}`);
console.log(`❌ [${SUBAPP}_API] Error: ${action} - ${error.message}`);

// Em consumers
console.log(`📡 [${CONSUMER}] Calling ${TARGET} for: ${action}`);
console.log(`✅ [${CONSUMER}] Received from ${TARGET}: ${result}`);
```

### **Métricas Recomendadas**

- Tempo de resposta entre SubApps
- Taxa de sucesso/erro das integrações
- Volume de chamadas por SubApp
- Uso de recursos por integração

---

## 🧪 **Testing - Isolamento Entre SubApps**

### **Testes de Isolamento Entre SubApps**

```typescript
describe("SubApp Isolation Between Apps", () => {
  it("should not allow SubApp to access other SubApp repositories directly", async () => {
    // Verificar que SubApp Chat não importa repositórios do SubApp AI Studio
    const chatRouterCode = await fs.readFile("chat/_router.ts", "utf8");
    expect(chatRouterCode).not.toContain("aiStudioRepository");
  });

  it("should forward teamId in cross-SubApp HTTP calls", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    // SubApp Chat chamando SubApp AI Studio
    await callAiStudioEndpoint("getModel", "team123", { modelId: "123" });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("teamId=team123"),
      expect.any(Object),
    );
  });

  it("should enforce HTTP-only communication between SubApps", async () => {
    // Verificar que não há acesso direto a banco entre SubApps
    const chatEndpoints = await getAllChatEndpoints();

    chatEndpoints.forEach((endpoint) => {
      expect(endpoint.dependencies).not.toContain("aiStudioRepository");
      expect(endpoint.dependencies).not.toContain("calendarRepository");
    });
  });
});
```

### **Testes de Configuração (Isolamento por Team)**

```typescript
describe("AppTeamConfig - Team Isolation", () => {
  it("should enforce team isolation in SubApp configs", async () => {
    const team1Caller = createCaller({
      auth: { user: { activeTeamId: "team1" } },
    });
    const team2Caller = createCaller({
      auth: { user: { activeTeamId: "team2" } } },
    });

    await team1Caller.app.saveConfig({
      appId: testAppId,
      config: { setting: true },
    });

    const team2Config = await team2Caller.app.getConfig({ appId: testAppId });
    expect(team2Config.setting).toBeUndefined(); // Team isolation
  });
});
```

---

## 📋 **Checklist de Compliance - Isolamento Entre SubApps**

### **Antes de Criar Novo SubApp**

- [ ] **ID único** registrado em `@kdx/shared`
- [ ] **Schema de configuração** definido com Zod
- [ ] **Dependências entre SubApps** declaradas em `appDependencies`
- [ ] **Ícone** adicionado em `public/appIcons/`
- [ ] **Traduções** em pt-BR e en
- [ ] **Isolamento entre SubApps** respeitado (sem imports diretos de outros SubApps)
- [ ] **teamId** validado em todos os endpoints

### **Antes de Deploy**

- [ ] **Nenhum import** de repositórios de outros SubApps
- [ ] **Endpoints HTTP** para integrações entre SubApps
- [ ] **Autenticação** em todos endpoints de integração entre SubApps
- [ ] **Logs** adicionados para monitoramento de comunicação entre SubApps
- [ ] **Testes** de isolamento entre SubApps e integração HTTP
- [ ] **Dependências entre SubApps** testadas em ambiente dev

---

## 📚 **Recursos Relacionados**

- **[Backend Development Guide](./backend-guide.md)** - Padrões backend
- **[Frontend Development Guide](./frontend-guide.md)** - Padrões frontend
- **[Database Documentation](../database/)** - Schemas e migrations
- **[Components Documentation](../components/)** - Design system

---

**🎯 IMPORTANTE**: Esta é a **fonte única de verdade** para arquitetura de SubApps. Sempre consulte este documento ao trabalhar com SubApps para garantir conformidade com os padrões estabelecidos.

**Last Updated:** 2024-12-19  
**Critical Issues:** TeamId context loss, inter-app dependencies  
**Next Review:** 2025-01-19
