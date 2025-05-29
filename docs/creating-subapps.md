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

**Exemplos:**

- **KodixCare** (gestão de cuidados)
- **Calendar** (calendário unificado)
- **Todo** (lista de tarefas)
- **Agent** (chat com IA)

### 1.2 Benefícios de um SubApp

- Modularidade e deploy independente
- Reuso de infraestrutura e componentes
- Experiência de usuário consistente
- Facilidade de manutenção e escalabilidade

---

## 2. Visão Arquitetural

```text
             +-------------+    fetch / event    +-------------+    SQL    +------------+
             |   Frontend  | <----------------->  |    API      | <------> |  Database  |
             |  (Next.js)  |    stream ou REST    | (Route Hdl)  |   Drizzle |  (MySQL)   |
             +-------------+                      +-------------+           +------------+
                    ^             useTranslations()     ^
                    |                                      |
                    v                                      v
             +-------------+                       shared types/roles/config
             | next-intl   |<-- mapeamento de chaves -->  shared
             | (i18n Hooks)|
             +-------------+
```

---

## 3. Fluxo de Trabalho End-to-End (SubApp "Notes")

1. Registrar ID e roles no pacote **shared**.
   - **Ícone:** adicione o arquivo de ícone em `apps/kdx/public/appIcons/<pathname>.png` e registre o mapeamento em `apps/kdx/src/helpers/miscelaneous/index.ts` (objeto `appIdToPathname`) para o novo subapp.
2. Modelar schema com Drizzle ORM + `pnpm db:push`.
3. Adicionar traduções (JSON) e hooks de i18n.
4. Implementar Frontend (page + componentes) com `"use client"`, hooks e tipagem.
5. Criar endpoint API com CORS, validação (Zod) e streaming/CRUD.

- Ao adicionar um novo SubApp, atualize também os esquemas Zod em `packages/validators/src/trpc/app/index.ts` (ex.: `ZInstallAppInputSchema` e `ZUninstallAppInputSchema`) para incluir o novo `appId`.

6. Registrar rota no layout principal.
7. Escrever testes automatizados (UI, loading, erros).
8. Validar logs, tratamento de erros e cobertura de testes.

---

## 4. Pré-requisitos

- Node.js ≥ 20.18.1, PNPM ≥ 9.14.2
- Clonar e instalar dependências: `pnpm install`
- Copiar `.env.example` → `.env` (configurar `MYSQL_URL`, `OPENAI_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, etc.)
- MySQL configurado e acessível via `MYSQL_URL`

---

## 5. Registrar SubApp no Shared

**Exemplo (Notes):** ID `notes`

```ts
// packages/shared/src/db.ts
export const notes = "notes";

export const appIdToRoles = {
  [kodixCareAppId]: [...commonRolesForAllApps, "CAREGIVER"] as const,
  [calendarAppId]: [...commonRolesForAllApps] as const,
  [todoAppId]: [...commonRolesForAllApps] as const,
  [notes]: [...commonRolesForAllApps, "ADMIN"] as const,
};
export type KodixAppId = keyof typeof appIdToRoles;
```

> O valor `notes` será referenciado em traduções, navegação e endpoints.

### 5.1 Esquema de Configurações (Opcional)

```ts
// packages/shared/src/db.ts
import {
  appIdToAppTeamConfigSchema,
  appIdToUserAppTeamConfigSchema,
} from "@kdx/shared";

import { notesConfigSchema, notesUserConfigSchema } from "./notesConfigSchemas";

appIdToAppTeamConfigSchema[notes] = notesConfigSchema;
appIdToUserAppTeamConfigSchema[notes] = notesUserConfigSchema;
```

---

## 6. Banco de Dados e ORM (Drizzle)

> **📚 Para um guia completo sobre banco de dados, consulte [banco-de-dados-kodix.md](./banco-de-dados-kodix.md)**

### 6.1 Modelagem Rápida

```ts
// packages/db/src/schema/apps/notes.ts
import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const notes = mysqlTable("notes", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  content: varchar("content", { length: 1000 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

### 6.2 Aplicar Schema

```bash
pnpm db:push
```

### 6.3 Criar Repositório

```ts
// packages/db/src/repositories/notes.ts
import { db } from "../client";
import { notes } from "../schema/apps/notes";

export const NotesRepository = {
  create: async (data: { content: string }) => {
    const [created] = await db.insert(notes).values(data).returning();
    return created;
  },
  findAll: async () => {
    return db.select().from(notes).execute();
  },
  // ... outros métodos
};
```

> **💡 Dica**: Para padrões completos de CRUD, relações, índices e boas práticas, consulte o [Guia de Banco de Dados](./banco-de-dados-kodix.md).

### 6.4 Integração com tRPC

### 6.5.1 Rotas tRPC

Crie um roteador em `packages/api/src/trpc/routers/app/<model>.ts`:

```ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { <Model>Repository } from "@kdx/db/src/repositories/<model>";

export const <Model>Router = router({
  getAll: publicProcedure.query(async () => await <Model>Repository.findAll()),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await <Model>Repository.findById(input.id)),
  create: protectedProcedure
    .input(z.object({ /* campos */ }))
    .mutation(async ({ input }) => await <Model>Repository.create(input)),
  update: protectedProcedure
    .input(z.object({ id: z.string(), /* campos */ }))
    .mutation(async ({ input }) => await <Model>Repository.update(input.id, input)),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => await <Model>Repository.delete(input.id)),
});
```

Adicione o roteador em `packages/api/src/trpc/routers/app/index.ts`.

### 6.5.2 Uso no Frontend

No frontend, utilize os hooks gerados pelo tRPC:

```ts
const { data, isLoading } = api.app.<model>.getAll.useQuery();
const createMutation = api.app.<model>.create.useMutation();
```

Em um componente Next.js:

```tsx
"use client";
import React from "react";
import { api } from "@kdx/api";

export function <Model>List() {
  const { data, isLoading } = api.app.<model>.getAll.useQuery();
  return (
    <div>
      {isLoading ? "Carregando..." : data?.map(item => (
        <div key={item.id}>{item.<field>}</div>
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
      "appDescription": "Gerencie suas notas",
    },
  },
}
```

### 7.2 Mapeamento e Hooks

```ts
// packages/locales/src/next-intl/hooks/index.ts
import { notes } from "@kdx/shared";

// packages/locales/src/next-intl/internal/appIdToName.ts
export const appIdToName: Record<KodixAppId, string> = {
  [kodixCareAppId]: "apps.kodixCare.appName",
  [calendarAppId]: "apps.calendar.appName",
  [todoAppId]: "apps.todo.appName",
  [notes]: `apps.${notes}.appName`,
} as const;

export const getAppName = (appId: KodixAppId, t: ClientSideT) =>
  appId ? t(appIdToName[appId]) : "";
export const getAppDescription = (appId: KodixAppId, t: IsomorficT) => {
  const descMap: Record<KodixAppId, string> = {
    [kodixCareAppId]: t("apps.kodixCare.appDescription"),
    [calendarAppId]: t("apps.calendar.appDescription"),
    [todoAppId]: t("apps.todo.appDescription"),
    [notes]: t(`apps.${notes}.appDescription`),
  };
  return descMap[appId] || "";
};
```

---

## 8. Tipos Compartilhados

```ts
// packages/shared/src/types/chat.ts
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

> Use `ChatMessage` em componentes, API e testes.

---

## 9. Frontend (Next.js App Router)

### 9.1 Página de Exemplo

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/notes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { ChatMessage } from "@kdx/shared";

import { ChatWindow } from "./_components/chat-window";

export default function NotesPage() {
  const t = useTranslations();
  const { locale } = useParams();
  const [notesList, setNotesList] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/notes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setNotesList(await res.json());
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    })();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <h1 className="p-4 text-2xl font-bold">{t(`apps.${notes}.appName`)}</h1>
      {error && <p className="p-2 text-red-500">{error}</p>}
      <ChatWindow />
    </div>
  );
}
```

### 9.2 Componentes Básicos

- **InputBox**: props `onSend`, `disabled`.
- **Message**: exibe `ChatMessage` com estilos condicionais.
- **ChatWindow**: streaming via `fetchEventSource`.
  > Inclua `"use client";` em cada componente.

---

## 10. Endpoint API

```ts
// apps/kdx/src/app/api/notes/route.ts
import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

import { ChatMessage } from "@kdx/shared";

import { OPTIONS, setCorsHeaders } from "../_enableCors";

export async function POST(req: NextRequest) {
  const headers = { "Content-Type": "text/event-stream" };
  const { messages } = await req.json();
  if (!process.env.OPENAI_API_KEY) {
    const errRes = new Response(
      JSON.stringify({ error: "API key não configurada" }),
      { status: 500 },
    );
    setCorsHeaders(errRes);
    return errRes;
  }
  const stream = await streamText({ model: openai("gpt-3.5-turbo"), messages });
  const res = new Response(stream, { headers });
  setCorsHeaders(res);
  return res;
}
export { OPTIONS };
```

---

## 11. Registro de Rota e Navegação

```tsx
// apps/kdx/src/app/(authed)/layout.tsx
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { notes } from "@kdx/shared";

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { locale } = useParams();
  return (
    <div className="app-layout">
      <nav className="menu">
        {/* ... outras rotas */}
        <Link href={`/${locale}/apps/${notes}`} className="menu-item">
          {t(`apps.${notes}.appName`)}
        </Link>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}
```

---

## 12. Testes Automatizados

```tsx
// apps/kdx/src/__tests__/apps-notes/chat-window.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";

import { ChatWindow } from "../src/app/[locale]/(authed)/apps/notes/_components/chat-window";

describe("ChatWindow Notes", () => {
  it("deve renderizar sem erros e enviar mensagem", async () => {
    render(<ChatWindow />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Test" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(await screen.findByText("Test")).toBeInTheDocument();
  });
});
```

---

## 13. Tratamento de Erros e Validação

### Frontend

```tsx
try {
  const res = await fetch(`/api/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await res.json();
} catch (err: any) {
  console.error("Erro ao criar nota:", err);
  setError(err.message);
}
```

### Backend

```ts
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { content } = z
      .object({ content: z.string().min(1) })
      .parse(await req.json());
    // salvar no DB
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: err.errors }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
    });
  }
}
```

---

## 14. Boas Práticas

- Tipagem forte (use `ChatMessage`)
- Arquivos pequenos (≤ 300 linhas)
- DRY & KISS
- Separe dev/test/prod
- Logging em debug
- i18n com `useTranslations()`
- Tailwind Kodix

---

## 15. Comandos Úteis

```bash
pnpm install
pnpm dev:kdx
pnpm db:push
pnpm db:seed
pnpm lint:fix
pnpm typecheck
pnpm test
```

---

## 16. Próximos Passos

1. Adicionar schemas de config em `shared`
2. Implementar UI de settings
3. Integrar analytics
4. Criar templates CLI

---

## 17. Checklist de Finalização

- [ ] pnpm typecheck sem erros
- [ ] pnpm lint:fix e pnpm format:fix
- [ ] pnpm test com coverage
- [ ] Validar fluxo com pnpm dev:kdx
- [ ] Confirmar traduções e registro de ID
- [ ] Verificar migrations e seed

## Recursos Adicionais

- [Documentação Principal](./documentacao-projeto-kodix.md) - Visão geral do projeto
- [Guia de Banco de Dados](./banco-de-dados-kodix.md) - Padrões e convenções de banco de dados
- [Guia de Desenvolvimento](./guia-desenvolvimento-kodix.md) - Práticas gerais de desenvolvimento

_Este guia fornece tudo o que é necessário para criar SubApps robustos, tipados e bem integrados ao ecossistema Kodix._
