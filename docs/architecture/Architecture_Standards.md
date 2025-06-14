# Padrões Arquiteturais Oficiais - Kodix

## 📖 **Visão Geral**

Este documento estabelece os **padrões arquiteturais oficiais** do projeto Kodix que devem ser seguidos em toda a documentação e implementação. Use este documento como referência única para manter consistência.

## 🎯 **Versões de Tecnologias**

```json
{
  "react": "^19.1.0",
  "next": "^15.3.0",
  "trpc": "^11.0.0",
  "typescript": "^5.5.4",
  "drizzle-orm": "^0.36.3",
  "tailwindcss": "^4.0.12"
}
```

**Node.js:** `20.18.1`  
**pnpm:** `^9.14.2`

## 🗂️ **Estrutura de Arquivos**

### **Rotas de SubApps**

```
apps/kdx/src/app/[locale]/(authed)/apps/{subapp}/
├── page.tsx                    # Página principal
├── layout.tsx                  # Layout opcional
├── _components/                # Componentes privados
│   ├── {component-name}.tsx    # kebab-case
│   └── sections/
└── _hooks/                     # Hooks privados
    └── use-{hook-name}.ts      # kebab-case
```

### **Nomenclatura de Arquivos**

- **Componentes**: `kebab-case.tsx` (ex: `chat-window.tsx`, `model-selector.tsx`)
- **Hooks**: `use-{nome}.ts` (ex: `use-user-data.ts`, `use-chat-session.ts`)
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Utils**: `kebab-case.ts` (ex: `format-date.ts`, `api-helpers.ts`)
- **Types**: `kebab-case.ts` (ex: `user-types.ts`, `chat-types.ts`)

### **Nomenclatura de Código**

- **React Components**: `PascalCase` (ex: `UserProfile`, `ChatWindow`)
- **Functions & Variables**: `camelCase` (ex: `getUserData`, `chatSessions`)
- **Constants**: `SCREAMING_SNAKE_CASE` (ex: `MAX_ATTEMPTS`, `API_BASE_URL`)
- **Interfaces TypeScript**: `PascalCase` (ex: `UserInterface`, `ChatMessage`)

## 🌍 **Sistema de Traduções**

### **Estrutura**

```
packages/locales/src/messages/kdx/
├── pt-BR.json                  # Português brasileiro (padrão)
├── en.json                     # Inglês
└── ...
```

### **Formato**

- **Extensão**: `.json` (não `.ts`)
- **Idioma padrão**: `pt-BR`
- **Estrutura aninhada** por app e funcionalidade

### **Exemplo**

```json
{
  "apps": {
    "chat": {
      "appName": "Chat",
      "welcome": "Bem-vindo ao Chat",
      "actions": {
        "send": "Enviar",
        "cancel": "Cancelar"
      }
    }
  }
}
```

## 🔗 **Comunicação Entre SubApps**

### **Padrão Obrigatório: Service Layer**

```typescript
// packages/api/src/internal/services/{service-name}.service.ts
export class MySubAppService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  static async getResource({
    resourceId,
    teamId,
    requestingApp,
  }: {
    resourceId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    console.log(
      `🔄 [${this.name}] getResource by ${requestingApp} for team: ${teamId}`,
    );

    // Implementação com validação de team
    return await repository.findById(resourceId, teamId);
  }
}
```

### **Regras de Comunicação**

- ✅ **USE**: Service Layer entre SubApps
- ❌ **NÃO USE**: Acesso direto a repositórios de outros SubApps
- ✅ **OBRIGATÓRIO**: Validação de `teamId` em todos os services
- ✅ **RECOMENDADO**: Logging de auditoria

## 🏗️ **Estrutura de SubApps**

### **IDs de SubApps**

```typescript
// packages/shared/src/db.ts
export const todoAppId = "todo_app_123";
export const chatAppId = "chat_app_456";
export const aiStudioAppId = "ai_studio_789";
// ... outros
```

### **Dependências Entre SubApps**

```typescript
export const appDependencies: Record<KodixAppId, KodixAppId[]> = {
  [chatAppId]: [aiStudioAppId], // Chat depende de AI Studio
  [kodixCareAppId]: [calendarAppId], // KodixCare depende de Calendar
  [todoAppId]: [], // Todo é independente
};
```

### **Configurações por Team**

```typescript
// Schema de configuração
export const myAppConfigSchema = z.object({
  features: z.object({
    enableX: z.boolean().default(true),
    maxItems: z.number().min(1).max(100).default(20),
  }),
  integrations: z.object({
    externalApi: z.boolean().default(false),
  }),
});

// Mapeamento
export const appIdToAppTeamConfigSchema = {
  [myAppId]: myAppConfigSchema,
};
```

## 🗄️ **Banco de Dados**

### **Schema Padrão**

```typescript
export const myTable = mysqlTable(
  "my_table",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    name: varchar("name", { length: 100 }).notNull(),
    teamId: varchar("team_id", { length: 30 }).notNull(),
    createdById: varchar("created_by_id", { length: 30 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    teamIdx: index("team_idx").on(table.teamId),
    createdByIdx: index("created_by_idx").on(table.createdById),
  }),
);
```

### **Regras Obrigatórias**

- ✅ **teamId** em todas as tabelas principais
- ✅ **Timestamps** de criação e atualização
- ✅ **Índices** para foreign keys
- ✅ **nanoid** para IDs primárias

## 🎛️ **Scripts Padrão**

### **Desenvolvimento**

```bash
pnpm dev:kdx          # Aplicação web principal
pnpm dev:care         # Aplicação móvel
pnpm db:studio        # Interface visual do banco
```

### **Banco de Dados**

```bash
pnpm db:push          # Aplicar schema (dev)
pnpm db:seed          # Popular dados de teste
pnpm db:migrate       # Aplicar migrations (prod)
```

### **Qualidade**

```bash
pnpm lint:fix         # Corrigir linting
pnpm format:fix       # Formatar código
pnpm typecheck        # Verificar tipos
pnpm build            # Build completo
```

## 📋 **Checklist de Conformidade**

### **Para Novos SubApps**

- [ ] ID único registrado em `@kdx/shared`
- [ ] Schema de configuração definido com Zod
- [ ] Dependências declaradas em `appDependencies`
- [ ] Estrutura de rotas: `[locale]/(authed)/apps/{subapp}/`
- [ ] Componentes usando nomenclatura kebab-case
- [ ] Service Layer criado se necessário
- [ ] Traduções em pt-BR e en
- [ ] Validação de teamId em todos os endpoints

### **Para Atualizações de Documentação**

- [ ] Versões de tecnologias atualizadas
- [ ] Estrutura de rotas consistente
- [ ] Nomenclatura de arquivos em kebab-case
- [ ] Exemplos funcionais e testáveis
- [ ] Referências cruzadas entre documentos
- [ ] Service Layer documentado para comunicação cross-app

## 📚 **Documentos de Referência**

- **[SubApp Architecture](./subapp-architecture.md)** - Padrões completos de SubApps
- **[Backend Guide](./backend-guide.md)** - Implementação backend
- **[Frontend Guide](./frontend-guide.md)** - Implementação frontend
- **[tRPC Patterns](./trpc-patterns.md)** - Padrões de API
- **[Development Setup](./development-setup.md)** - Setup de ambiente

## 🔄 **Processo de Atualização**

### **Ao Atualizar Padrões**

1. **Atualize este documento** primeiro
2. **Sincronize todos os guias** relacionados
3. **Teste exemplos** para garantir funcionamento
4. **Comunique mudanças** para a equipe

### **Ao Adicionar Tecnologia**

1. **Documente versão** no catalog do pnpm
2. **Atualize este documento**
3. **Crie exemplos** nos guias relevantes
4. **Teste integração** com stack existente

---

**Versão:** 1.0  
**Última Atualização:** 2024-12-21  
**Próxima Revisão:** 2025-01-21

**⚠️ IMPORTANTE**: Este é o documento de **fonte única de verdade** para padrões arquiteturais. Sempre consulte e atualize este documento ao fazer mudanças na arquitetura.
