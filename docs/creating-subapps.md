# Criando Sub-aplicações no Projeto Kodix

## Visão Geral

Este guia detalha como criar novas sub-aplicações (SubApps) no monorepo Kodix. O sistema de SubApps permite expandir a funcionalidade da plataforma de forma modular e organizada.

## Conceito de SubApps

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

## Estrutura de um SubApp

### Anatomia Básica

# Guia de Criação de SubApps no Kodix

> Um guia completo e reorganizado para desenvolver SubApps no Kodix, cobrindo desde a conceitualização até a entrega com qualidade.

## Sumário

1. [Introdução](#introdução)
2. [Visão Arquitetural](#visão-arquitetural)
3. [Fluxo de Trabalho End-to-End](#fluxo-de-trabalho-end-to-end)
4. [Pré-requisitos](#pré-requisitos)
5. [Registrar SubApp no Shared](#registrar-subapp-no-shared)
6. [Banco de Dados e ORM (Drizzle)](#banco-de-dados-e-orm-drizzle)
7. [Internacionalização (i18n)](#internacionalização-i18n)
8. [Tipos Compartilhados](#tipos-compartilhados)
9. [Frontend (Next.js)](#frontend-nextjs)
10. [Endpoint API](#endpoint-api)
11. [Registro de Rota e Navegação](#registro-de-rota-e-navegação)
12. [Testes Automatizados](#testes-automatizados)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Boas Práticas](#boas-práticas)
15. [Comandos Úteis](#comandos-úteis)
16. [Próximos Passos](#próximos-passos)
17. [Checklist de Finalização](#checklist-de-finalização)

---

## 1. Introdução

### 1.1 O que é um SubApp?

No Kodix, um **SubApp** é um módulo independente que se integra à plataforma principal, reutilizando autenticação, roles, design system e infraestrutura compartilhada.

**Exemplos Implementados:**

- **KodixCare** (gestão de cuidados médicos)
- **Calendar** (calendário unificado)
- **Todo** (lista de tarefas)
- **Chat** (sistema de comunicação)

### 1.2 Benefícios de um SubApp

- Modularidade e deploy independente
- Reuso de infraestrutura e componentes
- Experiência de usuário consistente
- Facilidade de manutenção e escalabilidade

---

## 2. Visão Arquitetural

```text
             +-------------+    tRPC/API     +-------------+    SQL    +------------+
             |   Frontend  | <-------------> |    API      | <------> |  Database  |
             |  (Next.js)  |    procedures   | (tRPC)      |   Drizzle |  (MySQL)   |
             +-------------+                 +-------------+           +------------+
                    ^             useTranslations()     ^
                    |                                      |
                    v                                      v
             +-------------+                       shared types/roles/config
             | next-intl   |<-- mapeamento de chaves -->  @kdx/shared
             | (i18n Hooks)|
             +-------------+
```

---

## 3. Fluxo de Trabalho End-to-End (Exemplo: SubApp "Notes")

1. **Registrar ID e roles** no pacote `@kdx/shared`.
   - **Ícone:** adicione o arquivo de ícone em `apps/kdx/public/appIcons/<pathname>.png`
   - **Mapeamento:** registre em `apps/kdx/src/helpers/miscelaneous/index.ts` (objeto `appIdToPathname`)
2. **Modelar schema** com Drizzle ORM + `pnpm db:push`.
3. **Adicionar traduções** (JSON) em `packages/locales/src/messages/kdx/`.
4. **Implementar Frontend** em `apps/kdx/src/app/[locale]/(authed)/apps/<pathname>/`
5. **Criar routers tRPC** em `packages/api/src/trpc/routers/app/<pathname>/`
6. **Criar endpoints API** (se necessário) em `apps/kdx/src/app/api/<pathname>/`
7. **Atualizar validators** em `packages/validators/src/trpc/app/index.ts`
8. **Escrever testes** automatizados
9. **Validar** logs, tratamento de erros e cobertura

---

## 4. Pré-requisitos

- Node.js ≥ 20.18.1, PNPM ≥ 9.14.2
- Clonar e instalar dependências: `pnpm install`
- Copiar `.env.example` → `.env` (configurar `MYSQL_URL`, `OPENAI_API_KEY`, etc.)
- MySQL configurado e acessível via `MYSQL_URL`

---

## 5. Registrar SubApp no Shared

**Exemplo (Notes):** ID `notesAppId`

```ts
// packages/shared/src/db.ts

//* Notes *//
export const notesAppId = "n8xm2k9vl3p1";

export const appIdToRoles = {
  [kodixCareAppId]: [...commonRolesForAllApps, "CAREGIVER"] as const,
  [calendarAppId]: [...commonRolesForAllApps] as const,
  [todoAppId]: [...commonRolesForAllApps] as const,
  [chatAppId]: [...commonRolesForAllApps] as const,
  [notesAppId]: [...commonRolesForAllApps] as const,
};

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof notesAppId;
```

### 5.1 Registrar Mapeamento de Pathname

```ts
// apps/kdx/src/helpers/miscelaneous/index.ts
import {
  calendarAppId,
  chatAppId,
  kodixCareAppId,
  notesAppId, // Adicionar import
  todoAppId,
} from "@kdx/shared";

export const appIdToPathname = {
  [kodixCareAppId]: "kodixCare",
  [calendarAppId]: "calendar",
  [todoAppId]: "todo",
  [chatAppId]: "chat",
  [notesAppId]: "notes", // Adicionar mapeamento
} as const;
```

### 5.2 Esquema de Configurações (Opcional)

```ts
// packages/shared/src/db.ts
export const notesConfigSchema = z.object({
  defaultCategory: z.string().optional(),
  autoSave: z.boolean().default(true),
});

export const notesUserAppTeamConfigSchema = z.object({
  enableNotifications: z.boolean().optional(),
});

export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
  [notesAppId]: notesConfigSchema, // Adicionar se necessário
};

export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [notesAppId]: notesUserAppTeamConfigSchema, // Adicionar se necessário
};
```

---

## 6. Banco de Dados e ORM (Drizzle)

> **📚 Para um guia completo sobre banco de dados, consulte [banco-de-dados-kodix.md](./banco-de-dados-kodix.md)**

### 6.1 Modelagem Rápida

```ts
// packages/db/src/schema/apps/notes.ts
import { relations } from "drizzle-orm";
import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { users } from "../auth";
import { teams } from "../team";
import { createId } from "../utils";

export const notes = mysqlTable("notes", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  userId: varchar("userId", { length: 30 }).notNull(),
  teamId: varchar("teamId", { length: 30 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [notes.teamId],
    references: [teams.id],
  }),
}));
```

### 6.2 Aplicar Schema

```bash
pnpm db:push
```

### 6.3 Criar Repositório (Opcional)

```ts
// packages/db/src/repositories/notes.ts
import { and, eq } from "drizzle-orm";

import { db } from "../client";
import { notes } from "../schema/apps/notes";

export const NotesRepository = {
  create: async (data: {
    title: string;
    content?: string;
    userId: string;
    teamId: string;
  }) => {
    const [created] = await db.insert(notes).values(data).returning();
    return created;
  },

  findByTeam: async (teamId: string) => {
    return db.select().from(notes).where(eq(notes.teamId, teamId));
  },

  findById: async (id: string, teamId: string) => {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.teamId, teamId)));
    return note;
  },

  update: async (
    id: string,
    teamId: string,
    data: Partial<typeof notes.$inferInsert>,
  ) => {
    const [updated] = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.teamId, teamId)))
      .returning();
    return updated;
  },

  delete: async (id: string, teamId: string) => {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.teamId, teamId)));
  },
};
```

### 6.4 Integração com tRPC

### 6.4.1 Rotas tRPC

Crie um roteador em `packages/api/src/trpc/routers/app/notes/`:

```ts
// packages/api/src/trpc/routers/app/notes/_router.ts
import { router } from "../../../trpc";
import { createHandler } from "./create.handler";
import { deleteHandler } from "./delete.handler";
import { getAllHandler } from "./getAll.handler";
import { getByIdHandler } from "./getById.handler";
import { updateHandler } from "./update.handler";

export const notesRouter = router({
  create: createHandler,
  getAll: getAllHandler,
  getById: getByIdHandler,
  update: updateHandler,
  delete: deleteHandler,
});
```

```ts
// packages/api/src/trpc/routers/app/notes/create.handler.ts
import { z } from "zod";

import { NotesRepository } from "@kdx/db/repositories/notes";

import { protectedProcedure } from "../../../procedures";

export const createHandler = protectedProcedure
  .input(
    z.object({
      title: z.string().min(1).max(255),
      content: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return await NotesRepository.create({
      ...input,
      userId: ctx.user.id,
      teamId: ctx.user.activeTeamId,
    });
  });
```

Adicione o roteador em `packages/api/src/trpc/routers/app/_router.ts`:

```ts
// packages/api/src/trpc/routers/app/_router.ts
import { router } from "../../trpc";
// ... outros imports
import { notesRouter } from "./notes/_router";

export const appRouter = router({
  // ... outros routers
  notes: notesRouter,
});
```

### 6.4.2 Uso no Frontend

```tsx
"use client";

import React from "react";

import { api } from "~/trpc/react";

export function NotesList() {
  const { data: notes, isLoading } = api.app.notes.getAll.useQuery();
  const createMutation = api.app.notes.create.useMutation();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      {notes?.map((note) => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Internacionalização (i18n)

### 7.1 Traduções

```jsonc
// packages/locales/src/messages/kdx/pt-BR.json
{
  "apps": {
    "notes": {
      "appName": "Notas",
      "appDescription": "Gerencie suas notas e anotações",
      "createNote": "Criar Nota",
      "editNote": "Editar Nota",
      "deleteNote": "Excluir Nota",
      "noteTitle": "Título da Nota",
      "noteContent": "Conteúdo",
      "noNotesFound": "Nenhuma nota encontrada",
    },
  },
}
```

```jsonc
// packages/locales/src/messages/kdx/en.json
{
  "apps": {
    "notes": {
      "appName": "Notes",
      "appDescription": "Manage your notes and annotations",
      "createNote": "Create Note",
      "editNote": "Edit Note",
      "deleteNote": "Delete Note",
      "noteTitle": "Note Title",
      "noteContent": "Content",
      "noNotesFound": "No notes found",
    },
  },
}
```

### 7.2 Mapeamento e Hooks

```ts
// packages/locales/src/next-intl/internal/appIdToName.ts
import { notesAppId } from "@kdx/shared";

export const appIdToName: Record<KodixAppId, string> = {
  [kodixCareAppId]: "apps.kodixCare.appName",
  [calendarAppId]: "apps.calendar.appName",
  [todoAppId]: "apps.todo.appName",
  [chatAppId]: "apps.chat.appName",
  [notesAppId]: "apps.notes.appName", // Adicionar
} as const;

export const getAppDescription = (appId: KodixAppId, t: IsomorficT) => {
  const descMap: Record<KodixAppId, string> = {
    [kodixCareAppId]: t("apps.kodixCare.appDescription"),
    [calendarAppId]: t("apps.calendar.appDescription"),
    [todoAppId]: t("apps.todo.appDescription"),
    [chatAppId]: t("apps.chat.appDescription"),
    [notesAppId]: t("apps.notes.appDescription"), // Adicionar
  };
  return descMap[appId] || "";
};
```

---

## 8. Tipos Compartilhados

```ts
// packages/shared/src/types/notes.ts
export interface Note {
  id: string;
  title: string;
  content?: string;
  userId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: string;
}
```

```ts
// packages/shared/src/types/index.ts
export * from "./notes";
```

---

## 9. Frontend (Next.js App Router)

### 9.1 Estrutura de Pastas

```
apps/kdx/src/app/[locale]/(authed)/apps/notes/
├── page.tsx                    # Página principal
├── _components/
│   ├── notes-list.tsx         # Lista de notas
│   ├── note-card.tsx          # Card individual
│   ├── create-note-dialog.tsx # Dialog de criação
│   └── note-editor.tsx        # Editor de nota
```

### 9.2 Página Principal

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/notes/page.tsx
import { getTranslations } from "next-intl/server";

import { notesAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { CreateNoteDialog } from "./_components/create-note-dialog";
import { NotesList } from "./_components/notes-list";

export default async function NotesPage() {
  await redirectIfAppNotInstalled({
    appId: notesAppId,
  });

  const t = await getTranslations();

  return (
    <MaxWidthWrapper>
      <main className="pt-6">
        <div className="flex items-center space-x-4">
          <IconKodixApp appId={notesAppId} renderText={false} />
          <H1>{t("apps.notes.appName")}</H1>
        </div>
        <Separator className="my-4" />
        <CreateNoteDialog />
        <NotesList />
      </main>
    </MaxWidthWrapper>
  );
}
```

### 9.3 Componentes Básicos

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/notes/_components/notes-list.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { api } from "~/trpc/react";
import { NoteCard } from "./note-card";

export function NotesList() {
  const t = useTranslations();
  const { data: notes, isLoading } = api.app.notes.getAll.useQuery();

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("apps.notes.noNotesFound")}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
```

---

## 10. Endpoint API (Opcional)

Para casos que necessitam de endpoints REST específicos:

```ts
// apps/kdx/src/app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerAuthSession } from "@kdx/auth";
import { NotesRepository } from "@kdx/db/repositories/notes";

import { OPTIONS, setCorsHeaders } from "../_enableCors";

const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
      setCorsHeaders(response);
      return response;
    }

    const body = await req.json();
    const { title, content } = createNoteSchema.parse(body);

    const note = await NotesRepository.create({
      title,
      content,
      userId: session.user.id,
      teamId: session.user.activeTeamId,
    });

    const response = NextResponse.json(note);
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Error creating note:", error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
      setCorsHeaders(response);
      return response;
    }

    const notes = await NotesRepository.findByTeam(session.user.activeTeamId);

    const response = NextResponse.json(notes);
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Error fetching notes:", error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
}

export { OPTIONS };
```

---

## 11. Atualizar Validators

```ts
// packages/validators/src/trpc/app/index.ts
import { z } from "zod";

import {
  calendarAppId,
  chatAppId,
  kodixCareAppId,
  notesAppId, // Adicionar import
  todoAppId,
} from "@kdx/shared";

export const ZInstallAppInputSchema = z.object({
  appId: z.enum([
    kodixCareAppId,
    calendarAppId,
    todoAppId,
    chatAppId,
    notesAppId, // Adicionar aqui
  ]),
});

export const ZUninstallAppInputSchema = z.object({
  appId: z.enum([
    kodixCareAppId,
    calendarAppId,
    todoAppId,
    chatAppId,
    notesAppId, // Adicionar aqui
  ]),
});
```

---

## 12. Testes Automatizados

```tsx
// apps/kdx/src/__tests__/apps/notes/notes-list.test.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { NotesList } from "~/app/[locale]/(authed)/apps/notes/_components/notes-list";

// Mock do tRPC
jest.mock("~/trpc/react", () => ({
  api: {
    app: {
      notes: {
        getAll: {
          useQuery: jest.fn(() => ({
            data: [{ id: "1", title: "Test Note", content: "Test content" }],
            isLoading: false,
          })),
        },
      },
    },
  },
}));

describe("NotesList", () => {
  it("deve renderizar lista de notas", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <NotesList />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });
});
```

---

## 13. Tratamento de Erros e Validação

### Frontend

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";

export function CreateNoteForm() {
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const utils = api.useUtils();
  const createMutation = api.app.notes.create.useMutation({
    onSuccess: () => {
      toast.success(t("apps.notes.noteCreated"));
      setTitle("");
      setContent("");
      utils.app.notes.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title, content });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Backend (tRPC)

```ts
// packages/api/src/trpc/routers/app/notes/create.handler.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { NotesRepository } from "@kdx/db/repositories/notes";

import { protectedProcedure } from "../../../procedures";

export const createHandler = protectedProcedure
  .input(
    z.object({
      title: z
        .string()
        .min(1, "Título é obrigatório")
        .max(255, "Título muito longo"),
      content: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      return await NotesRepository.create({
        ...input,
        userId: ctx.user.id,
        teamId: ctx.user.activeTeamId,
      });
    } catch (error) {
      console.error("Error creating note:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao criar nota",
      });
    }
  });
```

---

## 14. Boas Práticas

### 14.1 Estrutura de Código

- **Arquivos pequenos** (≤ 300 linhas)
- **Componentes reutilizáveis** na pasta `_components`
- **Tipagem forte** com TypeScript
- **Separação de responsabilidades** (UI, lógica, dados)

### 14.2 Padrões de Nomenclatura

- **Pastas**: kebab-case (`notes`, `kodix-care`)
- **Arquivos**: kebab-case (`notes-list.tsx`, `create-note-dialog.tsx`)
- **Componentes**: PascalCase (`NotesList`, `CreateNoteDialog`)
- **Variáveis**: camelCase (`notesAppId`, `createMutation`)

### 14.3 Performance

- Use `"use client"` apenas quando necessário
- Implemente loading states
- Use React.memo para componentes pesados
- Otimize queries com `enabled` e `staleTime`

### 14.4 Acessibilidade

- Use componentes do `@kdx/ui`
- Implemente navegação por teclado
- Adicione labels e aria-labels apropriados
- Teste com screen readers

---

## 15. Comandos Úteis

```bash
# Desenvolvimento
pnpm install
pnpm dev:kdx

# Banco de dados
pnpm db:push
pnpm db:seed
pnpm db:studio

# Qualidade de código
pnpm lint:fix
pnpm format:fix
pnpm typecheck

# Testes
pnpm test
pnpm test:watch
pnpm test:coverage
```

---

## 16. Próximos Passos

1. **Configurações avançadas**: Implementar schemas de config específicos
2. **Permissões granulares**: Definir roles específicos do SubApp
3. **Analytics**: Integrar tracking de eventos
4. **Templates CLI**: Criar gerador automático de SubApps
5. **Documentação**: Adicionar Storybook para componentes

---

## 17. Checklist de Finalização

### Código

- [ ] `pnpm typecheck` sem erros
- [ ] `pnpm lint:fix` e `pnpm format:fix` executados
- [ ] `pnpm test` com coverage adequado
- [ ] Validar fluxo completo com `pnpm dev:kdx`

### Configuração

- [ ] ID único registrado em `@kdx/shared`
- [ ] Pathname mapeado em `appIdToPathname`
- [ ] Ícone adicionado em `public/appIcons/`
- [ ] Traduções em pt-BR e en
- [ ] Validators atualizados

### Funcionalidade

- [ ] Página principal funcionando
- [ ] Componentes renderizando corretamente
- [ ] tRPC procedures funcionando
- [ ] Tratamento de erros implementado
- [ ] Loading states implementados

### Qualidade

- [ ] Testes unitários escritos
- [ ] Acessibilidade verificada
- [ ] Performance otimizada
- [ ] Documentação atualizada

## Recursos Adicionais

- [Documentação Principal](./documentacao-projeto-kodix.md) - Visão geral do projeto
- [Guia de Banco de Dados](./banco-de-dados-kodix.md) - Padrões e convenções de banco de dados
- [Guia de Implementação Frontend](./guia-implementacao-frontend-kodix.md) - Padrões de desenvolvimento frontend
- [Guia de Desenvolvimento](./guia-desenvolvimento-kodix.md) - Práticas gerais de desenvolvimento

_Este guia fornece tudo o que é necessário para criar SubApps robustos, tipados e bem integrados ao ecossistema Kodix._
