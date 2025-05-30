# Guia de Criação de SubApps no Kodix

> **🔄 ATUALIZADO:** Baseado na implementação real do AI Studio

Este guia detalha como criar novas sub-aplicações (SubApps) no monorepo Kodix. O sistema de SubApps permite expandir a funcionalidade da plataforma de forma modular e organizada.

## Visão Geral

### O que são SubApps?

SubApps são módulos independentes que estendem a funcionalidade principal do Kodix. Cada SubApp possui:

- **Namespace próprio** para isolamento
- **Rotas dedicadas** no sistema de roteamento
- **Componentes específicos** para suas funcionalidades
- **APIs próprias** via tRPC
- **Schemas de banco** independentes (quando necessário)

### Exemplos de SubApps Implementados

- **KodixCare** - Gestão de cuidados médicos (`kodixCare`)
- **Calendar** - Sistema de calendário unificado (`calendar`)
- **Todo** - Lista de tarefas (`todo`)
- **Chat** - Sistema de comunicação (`chat`)
- **AI Studio** - Gestão de agentes IA (`aiStudio`)

## Fluxo de Trabalho End-to-End

1. **Registrar ID e roles** no pacote `@kdx/shared`
2. **Adicionar ícone** em `apps/kdx/public/appIcons/<pathname>.png`
3. **Registrar mapeamento** em `apps/kdx/src/helpers/miscelaneous/index.ts`
4. **Modelar schema** com Drizzle ORM + `pnpm db:push`
5. **Adicionar traduções** em `packages/locales/src/messages/kdx/`
6. **Criar routers tRPC** com estrutura adequada
7. **Implementar Frontend** com padrões corretos
8. **Atualizar validators** em `packages/validators/src/trpc/app/index.ts`
9. **Escrever testes** automatizados

---

## 1. Registrar SubApp no Shared

**Exemplo (AI Studio):**

```ts
// packages/shared/src/db.ts

//* AI Studio *//
export const aiStudioAppId = "ai_studio_123";

export const appIdToRoles = {
  [kodixCareAppId]: [...commonRolesForAllApps, "CAREGIVER"] as const,
  [calendarAppId]: [...commonRolesForAllApps] as const,
  [todoAppId]: [...commonRolesForAllApps] as const,
  [chatAppId]: [...commonRolesForAllApps] as const,
  [aiStudioAppId]: [...commonRolesForAllApps] as const,
};

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof aiStudioAppId;
```

### Registrar Mapeamento de Pathname

```ts
// apps/kdx/src/helpers/miscelaneous/index.ts
export const appIdToPathname = {
  [kodixCareAppId]: "kodixCare",
  [calendarAppId]: "calendar",
  [todoAppId]: "todo",
  [chatAppId]: "chat",
  [aiStudioAppId]: "aiStudio", // Adicionar
} as const;
```

---

## 2. Banco de Dados e Schema

### 2.1 Modelagem (Exemplo AI Studio)

```ts
// packages/db/src/schema/apps/ai-studio.ts
import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  json,
  mysqlTable,
  text,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { users } from "../auth";
import { teams } from "../team";
import { createId } from "../utils";

export const aiModels = mysqlTable("ai_model", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  name: varchar("name", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  config: json("config"),
  enabled: boolean("enabled").default(true).notNull(),
});

export const aiModelTokens = mysqlTable(
  "ai_model_token",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    teamId: varchar("teamId", { length: 30 }).notNull(),
    modelId: varchar("modelId", { length: 30 }).notNull(),
    token: text("token").notNull(),
    createdAt: datetime("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    // ⚠️ IMPORTANTE: Unique constraint para evitar tokens duplicados
    unique: unique("ai_model_token_team_model_unique").on(
      table.teamId,
      table.modelId,
    ),
  }),
);

export const aiLibraries = mysqlTable("ai_library", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  teamId: varchar("teamId", { length: 30 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  files: json("files"),
  createdAt: datetime("createdAt").defaultNow().notNull(),
});

export const aiAgents = mysqlTable("ai_agent", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  teamId: varchar("teamId", { length: 30 }).notNull(),
  createdById: varchar("createdById", { length: 30 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  instructions: text("instructions").notNull(),
  libraryId: varchar("libraryId", { length: 30 }),
  createdAt: datetime("createdAt").defaultNow().notNull(),
  updatedAt: datetime("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Relations
export const aiModelTokensRelations = relations(aiModelTokens, ({ one }) => ({
  team: one(teams, { fields: [aiModelTokens.teamId], references: [teams.id] }),
  model: one(aiModels, {
    fields: [aiModelTokens.modelId],
    references: [aiModels.id],
  }),
}));

export const aiLibrariesRelations = relations(aiLibraries, ({ one }) => ({
  team: one(teams, { fields: [aiLibraries.teamId], references: [teams.id] }),
}));

export const aiAgentsRelations = relations(aiAgents, ({ one }) => ({
  team: one(teams, { fields: [aiAgents.teamId], references: [teams.id] }),
  createdBy: one(users, {
    fields: [aiAgents.createdById],
    references: [users.id],
  }),
  library: one(aiLibraries, {
    fields: [aiAgents.libraryId],
    references: [aiLibraries.id],
  }),
}));
```

### 2.2 Aplicar Schema

```bash
pnpm db:push
```

---

## 3. tRPC Routers - Estrutura Correta

### 3.1 Router Principal

```ts
// packages/api/src/trpc/routers/app/aiStudio/_router.ts
import { router } from "../../../trpc";
import { buscarAiAgentsHandler } from "./buscarAiAgents.handler";
import { buscarAiLibrariesHandler } from "./buscarAiLibraries.handler";
import { buscarAiModelsHandler } from "./buscarAiModels.handler";
import { buscarTokensPorModeloHandler } from "./buscarTokensPorModelo.handler";
import { criarAiAgentHandler } from "./criarAiAgent.handler";
import { criarAiLibraryHandler } from "./criarAiLibrary.handler";
import { criarAiModelHandler } from "./criarAiModel.handler";
import { criarTokenPorModeloHandler } from "./criarTokenPorModelo.handler";

// ... outros imports

export const aiStudioRouter = router({
  // Models
  buscarAiModels: buscarAiModelsHandler,
  criarAiModel: criarAiModelHandler,
  atualizarAiModel: atualizarAiModelHandler,
  excluirAiModel: excluirAiModelHandler,

  // Tokens
  buscarTokensPorModelo: buscarTokensPorModeloHandler,
  criarTokenPorModelo: criarTokenPorModeloHandler,
  atualizarAiModelToken: atualizarAiModelTokenHandler,
  removerTokenPorModelo: removerTokenPorModeloHandler,

  // Libraries
  buscarAiLibraries: buscarAiLibrariesHandler,
  criarAiLibrary: criarAiLibraryHandler,
  atualizarAiLibrary: atualizarAiLibraryHandler,
  excluirAiLibrary: excluirAiLibraryHandler,

  // Agents
  buscarAiAgents: buscarAiAgentsHandler,
  criarAiAgent: criarAiAgentHandler,
  atualizarAiAgent: atualizarAiAgentHandler,
  excluirAiAgent: excluirAiAgentHandler,
});
```

### 3.2 Handler Exemplo

```ts
// packages/api/src/trpc/routers/app/aiStudio/criarAiModel.handler.ts
import { z } from "zod";

import { aiModels } from "@kdx/db/schema/apps/ai-studio";

import { protectedProcedure } from "../../../procedures";

export const criarAiModelHandler = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      provider: z.string().min(1),
      enabled: z.boolean().default(true),
      config: z.any().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const [created] = await ctx.db
      .insert(aiModels)
      .values({
        name: input.name,
        provider: input.provider,
        enabled: input.enabled,
        config: input.config,
      })
      .returning();

    return created;
  });
```

### 3.3 Registrar no App Router

```ts
// packages/api/src/trpc/routers/app/_router.ts
import { router } from "../../trpc";
import { aiStudioRouter } from "./aiStudio/_router";

// ... outros imports

export const appRouter = router({
  kodixCare: kodixCareRouter,
  calendar: calendarRouter,
  todo: todoRouter,
  chat: chatRouter,
  aiStudio: aiStudioRouter, // Adicionar aqui
});
```

---

## 4. Frontend - Padrões Corretos

### 4.1 Estrutura de Pastas

```
apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/
├── page.tsx                           # Página principal
├── _components/
│   ├── main-nav.tsx                  # Navegação por tabs
│   └── sections/
│       ├── models-section.tsx        # Seção de modelos
│       ├── tokens-section.tsx        # Seção de tokens
│       ├── agents-section.tsx        # Seção de agentes
│       └── libraries-section.tsx     # Seção de bibliotecas
```

### 4.2 Página Principal com Tabs

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/page.tsx
import { getTranslations } from "next-intl/server";

import { aiStudioAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { MainNav } from "./_components/main-nav";

export default async function AiStudioPage() {
  await redirectIfAppNotInstalled({ appId: aiStudioAppId });
  const t = await getTranslations();

  return (
    <MaxWidthWrapper>
      <main className="pt-6">
        <div className="flex items-center space-x-4">
          <IconKodixApp appId={aiStudioAppId} renderText={false} />
          <H1>{t("apps.aiStudio.appName")}</H1>
        </div>
        <Separator className="my-4" />
        <MainNav />
      </main>
    </MaxWidthWrapper>
  );
}
```

### 4.3 Navegação por Tabs

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/main-nav.tsx
"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui/tabs";

import { AgentsSection } from "./sections/agents-section";
import { LibrariesSection } from "./sections/libraries-section";
import { ModelsSection } from "./sections/models-section";
import { TokensSection } from "./sections/tokens-section";

export function MainNav() {
  return (
    <Tabs defaultValue="models" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="models">Modelos</TabsTrigger>
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="agents">Agentes</TabsTrigger>
        <TabsTrigger value="libraries">Bibliotecas</TabsTrigger>
      </TabsList>

      <TabsContent value="models">
        <ModelsSection />
      </TabsContent>
      <TabsContent value="tokens">
        <TokensSection />
      </TabsContent>
      <TabsContent value="agents">
        <AgentsSection />
      </TabsContent>
      <TabsContent value="libraries">
        <LibrariesSection />
      </TabsContent>
    </Tabs>
  );
}
```

### 4.4 Seção Exemplo - Padrão Correto

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/sections/models-section.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

// ⚠️ PADRÃO CORRETO: TanStack Query + useTRPC
const createModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  provider: z.string().min(1, "Provedor é obrigatório"),
  enabled: z.boolean().default(true),
  config: z.string().optional(),
});

type CreateModelFormData = z.infer<typeof createModelSchema>;

export function ModelsSection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ⚠️ PADRÃO CORRETO: useQuery do TanStack Query
  const modelsQuery = useQuery(
    trpc.app.aiStudio.buscarAiModels.queryOptions({
      limite: 50,
      pagina: 1,
    }),
  );

  const models = modelsQuery.data?.models || [];
  const isLoading = modelsQuery.isLoading;

  // ⚠️ PADRÃO CORRETO: React Hook Form
  const createForm = useForm<CreateModelFormData>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      name: "",
      provider: "",
      enabled: true,
      config: "",
    },
  });

  // ⚠️ PADRÃO CORRETO: useMutation do TanStack Query
  const createModelMutation = useMutation(
    trpc.app.aiStudio.criarAiModel.mutationOptions({
      onSuccess: () => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries(
          trpc.app.aiStudio.buscarAiModels.pathFilter(),
        );
        toast.success("Modelo criado com sucesso!");
        setShowCreateForm(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao criar modelo");
      },
    }),
  );

  const handleCreateSubmit = (data: CreateModelFormData) => {
    let configJson = null;
    if (data.config?.trim()) {
      try {
        configJson = JSON.parse(data.config);
      } catch (error) {
        toast.error("Configuração JSON inválida");
        return;
      }
    }

    createModelMutation.mutate({
      name: data.name,
      provider: data.provider,
      enabled: data.enabled,
      config: configJson,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de criar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Modelos de IA</h2>
          <p className="text-muted-foreground">
            Gerencie os modelos de IA disponíveis
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>Criar Modelo</Button>
      </div>

      {/* Tabela ou cards com dados */}
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div>{/* Renderizar modelos */}</div>
      )}

      {/* Modal de criação */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Modelo</DialogTitle>
          </DialogHeader>
          {/* Form de criação */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 5. Internacionalização

### 5.1 Traduções Estruturadas

```jsonc
// packages/locales/src/messages/kdx/pt-BR.json
{
  "apps": {
    "aiStudio": {
      "appName": "AI Studio",
      "appDescription": "Gerencie seus agentes de IA e configurações",
      "models": {
        "title": "Modelos de IA",
        "description": "Gerencie os modelos de IA disponíveis",
        "create": "Criar Modelo",
        "edit": "Editar Modelo",
        "delete": "Excluir Modelo",
        "noModels": "Nenhum modelo encontrado",
        "enabled": "Ativo",
        "disabled": "Inativo",
      },
      "tokens": {
        "title": "Tokens de Acesso",
        "description": "Gerencie os tokens de acesso aos modelos",
        "create": "Adicionar Token",
        "edit": "Editar Token",
        "delete": "Remover Token",
        "noTokens": "Nenhum token configurado",
      },
      // ... outras seções
    },
  },
}
```

### 5.2 Mapeamento de Nomes

```ts
// packages/locales/src/next-intl/internal/appIdToName.ts
export const appIdToName: Record<KodixAppId, string> = {
  [kodixCareAppId]: "apps.kodixCare.appName",
  [calendarAppId]: "apps.calendar.appName",
  [todoAppId]: "apps.todo.appName",
  [chatAppId]: "apps.chat.appName",
  [aiStudioAppId]: "apps.aiStudio.appName", // Adicionar
} as const;
```

---

## 6. Validators

```ts
// packages/validators/src/trpc/app/index.ts
export const ZInstallAppInputSchema = z.object({
  appId: z.enum([
    kodixCareAppId,
    calendarAppId,
    todoAppId,
    chatAppId,
    aiStudioAppId, // Adicionar
  ]),
});
```

---

## 7. Principais Correções do Guia

### ❌ Problemas Anteriores

1. **TanStack Query incorreto**: Uso de `api.app.xxx.useQuery()` em vez de `useQuery(trpc.app.xxx.queryOptions())`
2. **Estrutura tRPC inadequada**: Faltava organização por handlers separados
3. **Frontend patterns**: Componentes muito simplificados
4. **Validação**: Schemas Zod mal estruturados
5. **Error handling**: Tratamento de erros inadequado

### ✅ Padrões Corretos

1. **TanStack Query**: `useQuery(trpc.app.xxx.queryOptions())` e `useMutation(trpc.app.xxx.mutationOptions())`
2. **tRPC Structure**: Handlers separados, router organizado
3. **React Hook Form**: Validação adequada com Zod
4. **Components**: Estrutura por seções com tabs
5. **Error handling**: Toast notifications e validação

---

## 8. Problemas Comuns e Soluções

### 8.1 SelectItem com Value Vazio

**❌ Erro Comum:**

```tsx
<SelectItem value="">Nenhuma opção</SelectItem>
```

**Error:** `A <Select.Item /> must have a value prop that is not an empty string`

**✅ Solução:**

```tsx
// Use um valor específico em vez de string vazia
<SelectItem value="none">Nenhuma opção</SelectItem>;

// Trate adequadamente no submit
const handleSubmit = (data: FormData) => {
  mutation.mutate({
    ...data,
    optionalField:
      data.optionalField === "none" ? undefined : data.optionalField,
  });
};

// Configure o valor padrão
const form = useForm({
  defaultValues: {
    optionalField: "none", // em vez de ""
  },
});
```

### 8.2 TanStack Query com tRPC

**❌ Erro Comum:**

```tsx
const { data } = api.app.myRouter.myQuery.useQuery();
```

**✅ Solução:**

```tsx
const query = useQuery(trpc.app.myRouter.myQuery.queryOptions(params));
```

### 8.3 Unique Constraints no Schema

**❌ Problema:** Permitir registros duplicados

**✅ Solução:**

```ts
export const myTable = mysqlTable(
  "my_table",
  {
    // ... campos
  },
  (table) => ({
    unique: unique("my_table_unique_constraint").on(table.field1, table.field2),
  }),
);
```

### 8.4 Error Handling em Mutations

**❌ Básico:**

```tsx
const mutation = useMutation(trpc.app.create.mutationOptions());
```

**✅ Completo:**

```tsx
const mutation = useMutation(
  trpc.app.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.app.list.pathFilter());
      toast.success("Criado com sucesso!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar");
    },
  }),
);
```

---

## Checklist de Implementação

### Backend

- [ ] Schema do banco criado com relations corretas
- [ ] Unique constraints para evitar duplicações
- [ ] tRPC handlers implementados
- [ ] Validação de input com Zod

### Frontend

- [ ] TanStack Query com queryOptions corretos
- [ ] React Hook Form com validação
- [ ] Componentes organizados por seções
- [ ] Loading states e error handling
- [ ] Toast notifications

### Configuração

- [ ] ID registrado no shared
- [ ] Pathname mapeado
- [ ] Traduções adicionadas
- [ ] Validators atualizados
- [ ] Ícone adicionado

---

_Este guia foi corrigido baseado na implementação real do AI Studio, garantindo padrões consistentes e funcionais._
