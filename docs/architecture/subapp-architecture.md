# SubApp Architecture - Kodix

## 📖 **Overview**

Este documento consolida **todos os aspectos arquiteturais** dos SubApps no Kodix:

- **🏗️ Arquitetura e Padrões** - Conceitos fundamentais
- **🔒 Isolamento e Comunicação** - Regras de isolamento entre apps
- **⚙️ Configurações por Team** - Sistema AppTeamConfig
- **🚀 Criação de Novos SubApps** - Processo passo-a-passo

## 🚨 **CRÍTICO: Leitura Obrigatória**

**Antes de trabalhar com SubApps**, leia esta seção sobre problemas críticos identificados:

### ⚠️ **TeamId Context Loss (2024-12-19)** ✅ RESOLVIDO

**Problema Crítico:** Chat app falhava com erro 412 "Nenhum modelo de IA disponível" devido à falta de contexto `teamId` em chamadas entre apps.

**✅ Solução Implementada:** Migração completa do padrão HTTP (`callAiStudioEndpoint`) para **Service Layer** pragmático:

```typescript
// ❌ REMOVIDO - Comunicação HTTP problemática
await callAiStudioEndpoint("getModel", teamId, params, headers);

// ✅ ATUAL - Service Layer com type safety
await AiStudioService.getModelById({
  modelId,
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```

### 🔄 **Status da Implementação Service Layer**

**✅ IMPLEMENTADOS:**

- `AiStudioService` - Completo e em uso pelo Chat app
- Validação de `teamId` e isolamento por team
- Logging de auditoria para rastreamento

**🔄 PENDENTES:**

- `CalendarService` - Para comunicação com KodixCare
- `KodixCareService` - Para funcionalidades expostas
- `TodoService` - Para integrações futuras

**📋 TODO para Desenvolvedores:**

```typescript
// packages/api/src/internal/services/calendar.service.ts - PENDENTE
export class CalendarService {
  static async getTasksByDateRange({
    teamId,
    dateStart,
    dateEnd,
    requestingApp,
  }) {
    // Implementar seguindo padrão AiStudioService
  }
}

// Usar no KodixCare:
const tasks = await CalendarService.getTasksByDateRange({
  teamId: ctx.auth.user.activeTeamId,
  dateStart,
  dateEnd,
  requestingApp: kodixCareAppId,
});
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

// ✅ CORRETO - Usar Service Layer com contexto adequado
const model = await AiStudioService.getModelById({
  modelId: session.aiModelId,
  teamId: ctx.auth.user.activeTeamId, // ✅ CORRETO - teamId do contexto autenticado
  requestingApp: chatAppId,
});
```

**Checklist para Nova Implementação:**

- [ ] Usar Service Layer (não HTTP) para comunicação entre SubApps
- [ ] Implementar service seguindo padrão `AiStudioService`
- [ ] Validar `teamId` obrigatoriamente em todos os métodos
- [ ] Adicionar logging de auditoria
- [ ] Testar isolamento de team adequadamente

### **🎯 Por que Service Layer é melhor que HTTP:**

1. **🔒 Performance:** Sem overhead de HTTP desnecessário
2. **🚀 Type Safety:** Interfaces TypeScript tipadas
3. **🔄 Simplicidade:** Sem necessidade de gerenciar headers/auth manualmente
4. **🛡️ Segurança:** Validação baseada em service methods é mais robusta
5. **📦 Manutenibilidade:** Contratos de API claramente definidos em TypeScript

---

## 🏗️ **Arquitetura Fundamental**

### **O que são SubApps?**

SubApps são módulos independentes que estendem a funcionalidade principal do Kodix:

- **Namespace próprio** para isolamento completo
- **Rotas dedicadas** no sistema de roteamento
- **APIs específicas** via tRPC
- **Configurações por team** via AppTeamConfig
- **Comunicação via Service Layer** para interoperabilidade segura

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

## 🔒 **Regras de Comunicação ENTRE SubApps**

### **🎯 Princípio Fundamental: Isolamento Lógico com Service Layer**

O Kodix adota **isolamento lógico** entre SubApps através de **Service Layer**, garantindo:

- **Performance**: Sem overhead de HTTP desnecessário
- **Type Safety**: Interfaces TypeScript tipadas
- **Team Isolation**: Validação obrigatória de `teamId`
- **Auditabilidade**: Controle de acessos cross-app

### **✅ Padrão RECOMENDADO: Service Layer**

#### **1. Acesso via Services (NÃO repositórios diretos)**

```typescript
// ❌ PROIBIDO - Acesso direto a repositórios de outros SubApps
import { aiStudioRepository } from "@kdx/db/repositories";

export const chatRouter = {
  someEndpoint: protectedProcedure.query(async ({ ctx }) => {
    // ❌ VIOLAÇÃO: SubApp Chat acessando diretamente repositório do SubApp AI Studio
    const model = await aiStudioRepository.AiModelRepository.findById(modelId);
  }),
};

// ✅ CORRETO - SubApp Chat acessando AI Studio via Service Layer
import { AiStudioService } from "../../../internal/services/ai-studio.service";

export const chatRouter = {
  someEndpoint: protectedProcedure.query(async ({ ctx }) => {
    // ✅ CORRETO: Acesso via service com isolamento e validação
    const model = await AiStudioService.getModelById({
      modelId,
      teamId: ctx.auth.user.activeTeamId,
      requestingApp: chatAppId, // Para auditoria opcional
    });
  }),
};
```

#### **2. Estrutura do Service Layer**

```typescript
// packages/api/src/internal/services/base.service.ts
export interface ServiceContext {
  teamId: string;
  requestingApp: KodixAppId;
  userId?: string;
}

export abstract class BaseService {
  protected static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  protected static logAccess(action: string, context: ServiceContext) {
    // Logging opcional para auditoria
    console.log(
      `🔄 [${this.name}] ${action} by ${context.requestingApp} for team: ${context.teamId}`,
    );
  }
}

// packages/api/src/internal/services/ai-studio.service.ts
export class AiStudioService extends BaseService {
  static async getModelById({
    modelId,
    teamId,
    requestingApp,
  }: {
    modelId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getModelById", { teamId, requestingApp });

    const model = await aiStudioRepository.AiModelRepository.findById(modelId);

    // Validar que o modelo pertence ao team
    if (!model || model.teamId !== teamId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Model not found or access denied",
      });
    }

    return model;
  }

  static async getAvailableModels({
    teamId,
    requestingApp,
  }: {
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getAvailableModels", { teamId, requestingApp });

    return await aiStudioRepository.AiTeamModelConfigRepository.findAvailableModelsByTeam(
      teamId,
    );
  }
}

// packages/api/src/internal/services/calendar.service.ts
export class CalendarService extends BaseService {
  static async getTasksByDateRange({
    teamId,
    dateStart,
    dateEnd,
    onlyCritical = false,
    requestingApp,
  }: {
    teamId: string;
    dateStart: Date;
    dateEnd: Date;
    onlyCritical?: boolean;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getTasksByDateRange", { teamId, requestingApp });

    return await getCalendarTasks({
      teamIds: [teamId],
      dateStart,
      dateEnd,
      onlyCritical,
    });
  }
}
```

#### **3. Usando Services nos SubApps**

```typescript
// packages/api/src/trpc/routers/app/kodixCare/utils/index.ts
import { CalendarService } from "../../../internal/services/calendar.service";

export async function cloneCalendarTasksToCareTasks({
  tx,
  start,
  end,
  ctx,
}: {
  tx: Drizzle;
  start: Date;
  end?: Date;
  ctx: TProtectedProcedureContext;
}) {
  // ✅ Acesso via service com isolamento de team
  const calendarTasks = await CalendarService.getTasksByDateRange({
    teamId: ctx.auth.user.activeTeamId,
    dateStart: start,
    dateEnd: end,
    requestingApp: kodixCareAppId,
  });

  // ... resto da implementação
}
```

### **🔄 Quando Usar HTTP vs Service Layer**

| Cenário                                    | Método Recomendado | Justificativa                       |
| ------------------------------------------ | ------------------ | ----------------------------------- |
| **SubApp → SubApp (mesmo processo)**       | ✅ Service Layer   | Performance, type safety            |
| **SubApp → API Externa**                   | ✅ HTTP            | Necessário para comunicação externa |
| **Frontend → Backend**                     | ✅ tRPC            | Padrão estabelecido                 |
| **Server → Server (diferentes processos)** | ✅ HTTP            | Necessário para isolamento real     |

### **📋 Regras de Implementação**

#### **✅ PERMITIDO**

- Acesso via Service Layer entre SubApps
- Validação obrigatória de `teamId`
- Type safety com interfaces TypeScript
- Logging opcional para auditoria

#### **❌ PROIBIDO**

- Acesso direto a repositórios de outros SubApps
- Bypass de validação de `teamId`
- Importação de handlers de outros SubApps sem service layer

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

## 🧪 **Testing - Comunicação Entre SubApps**

### **Testes de Service Layer**

```typescript
describe("SubApp Service Layer", () => {
  it("should enforce team isolation in service calls", async () => {
    const team1Id = "team-1";
    const team2Id = "team-2";

    // Criar modelo para team1
    const model = await aiStudioRepository.AiModelRepository.create({
      name: "Test Model",
      teamId: team1Id,
      // ... outros campos
    });

    // Team1 deve conseguir acessar
    const result1 = await AiStudioService.getModelById({
      modelId: model.id,
      teamId: team1Id,
      requestingApp: chatAppId,
    });
    expect(result1).toBeDefined();

    // Team2 não deve conseguir acessar
    await expect(
      AiStudioService.getModelById({
        modelId: model.id,
        teamId: team2Id,
        requestingApp: chatAppId,
      }),
    ).rejects.toThrow("Model not found or access denied");
  });

  it("should validate required teamId in service calls", async () => {
    await expect(
      CalendarService.getTasksByDateRange({
        teamId: "", // ❌ teamId vazio
        dateStart: new Date(),
        dateEnd: new Date(),
        requestingApp: kodixCareAppId,
      }),
    ).rejects.toThrow("teamId is required for cross-app access");
  });

  it("should not allow direct repository access between SubApps", async () => {
    // Verificar que SubApp Chat não importa repositórios de outros SubApps
    const chatRouterCode = await fs.readFile("chat/_router.ts", "utf8");
    expect(chatRouterCode).not.toContain("aiStudioRepository");
    expect(chatRouterCode).not.toContain("calendarRepository");
  });

  it("should enforce service layer communication", async () => {
    // Verificar que SubApps usam services, não handlers diretos
    const kodixCareUtilsCode = await fs.readFile(
      "kodixCare/utils/index.ts",
      "utf8",
    );

    // ✅ Deve usar services
    expect(kodixCareUtilsCode).toContain("CalendarService");

    // ❌ Não deve importar handlers diretos
    expect(kodixCareUtilsCode).not.toContain("import { getAllHandler }");
  });
});
```

### **Testes de Integração Cross-App**

```typescript
describe("Cross-App Integration", () => {
  it("should maintain data consistency between Calendar and KodixCare", async () => {
    const teamId = "test-team";
    const dateStart = new Date("2024-01-01");
    const dateEnd = new Date("2024-01-31");

    // Criar eventos no Calendar
    await calendarRepository.createEventMaster({
      title: "Test Event",
      teamId,
      rule: "FREQ=DAILY;COUNT=5",
      // ... outros campos
    });

    // Buscar via CalendarService
    const calendarTasks = await CalendarService.getTasksByDateRange({
      teamId,
      dateStart,
      dateEnd,
      requestingApp: kodixCareAppId,
    });

    expect(calendarTasks.length).toBeGreaterThan(0);
    expect(calendarTasks[0].teamId).toBe(teamId);
  });

  it("should sync calendar tasks to care tasks correctly", async () => {
    const ctx = createMockContext({ teamId: "test-team" });

    // Simular sincronização
    await cloneCalendarTasksToCareTasks({
      tx: mockTransaction,
      start: new Date("2024-01-01"),
      end: new Date("2024-01-31"),
      ctx,
    });

    // Verificar que care tasks foram criadas
    const careTasks = await careTaskRepository.findCareTasksFromTo({
      teamIds: [ctx.auth.user.activeTeamId],
      dateStart: new Date("2024-01-01"),
      dateEnd: new Date("2024-01-31"),
    });

    expect(careTasks.some((task) => task.createdFromCalendar)).toBe(true);
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
      auth: { user: { activeTeamId: "team2" } },
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

## 📋 **Checklist de Compliance - Comunicação Entre SubApps**

### **Antes de Criar Novo SubApp**

- [ ] **ID único** registrado em `@kdx/shared`
- [ ] **Schema de configuração** definido com Zod
- [ ] **Dependências entre SubApps** declaradas em `appDependencies`
- [ ] **Ícone** adicionado em `public/appIcons/`
- [ ] **Traduções** em pt-BR e en
- [ ] **Services criados** para funcionalidades que outros SubApps precisam acessar
- [ ] **teamId** validado em todos os endpoints e services

### **Antes de Deploy**

- [ ] **Nenhum import direto** de repositórios de outros SubApps
- [ ] **Service Layer implementado** para comunicação cross-app
- [ ] **Validação de teamId** em todos os services
- [ ] **Type safety** com interfaces TypeScript
- [ ] **Testes** de isolamento de team nos services
- [ ] **Testes de integração** cross-app funcionando
- [ ] **Dependências entre SubApps** testadas em ambiente dev

### **Service Layer Checklist**

- [ ] **BaseService** estendido com validação de teamId
- [ ] **Interfaces tipadas** para parâmetros de entrada
- [ ] **Logging opcional** implementado para auditoria
- [ ] **Tratamento de erros** adequado com TRPCError
- [ ] **Documentação** dos métodos disponíveis no service

---

## 📚 **Recursos Relacionados**

- **[Backend Development Guide](./backend-guide.md)** - Padrões backend
- **[Frontend Development Guide](./frontend-guide.md)** - Padrões frontend
- **[Database Documentation](../database/)** - Schemas e migrations
- **[Components Documentation](../components/)** - Design system

---

**🎯 IMPORTANTE**: Esta é a **fonte única de verdade** para arquitetura de SubApps. Sempre consulte este documento ao trabalhar com SubApps para garantir conformidade com os padrões estabelecidos.

**Last Updated:** 2024-12-19  
**Mudanças Recentes:** Migração de isolamento HTTP para Service Layer pragmático  
**Next Review:** 2025-01-19
