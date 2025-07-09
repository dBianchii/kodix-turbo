# 🚨 Regras ESLint Kodix - Guia de Referência Obrigatória

**Data de Criação:** 2025-07-02  
**Versão:** 1.0  
**Status:** ATIVO - Uso Obrigatório

> **📌 INSTRUÇÕES DE USO:** Este documento deve ser consultado SEMPRE antes de escrever qualquer código no projeto Kodix. Todas as regras aqui são **OBRIGATÓRIAS** e **NÃO NEGOCIÁVEIS**.

## 🎯 REGRAS CRÍTICAS - TOLERÂNCIA ZERO

### 1. **tRPC - Padrão Arquitetural Obrigatório**

#### ✅ **CORRETO - Web App (Next.js)**

```typescript
// ✅ Import correto
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

// ✅ Uso correto
const trpc = useTRPC();
const query = useQuery(trpc.app.method.queryOptions());
const mutation = useMutation(trpc.app.method.mutationOptions());
const queryClient = useQueryClient();
queryClient.invalidateQueries(trpc.app.method.pathFilter());
```

#### ❌ **PROIBIDO - Nunca usar estes padrões**

```typescript
// ❌ NUNCA - Import incorreto
import { api } from "~/trpc/react";

// ❌ NUNCA - Métodos diretos
const mutation = trpc.app.method.useMutation();
const query = trpc.app.method.useQuery();
const utils = api.useUtils();
```

**🔧 ESLint Rule:** `no-api-import` - Auto-fix disponível

### 2. **TypeScript - Type Safety Absoluta**

#### ❌ **PROIBIDO - @ts-nocheck**

```typescript
// ❌ NUNCA USAR - Esconde erros de tipo
// @ts-nocheck
```

#### ❌ **PROIBIDO - any sem tipagem**

```typescript
// ❌ NUNCA - Tipo any sem validação
const data: any = response;
```

#### ✅ **CORRETO - Tipagem explícita**

```typescript
// ✅ Interface definida
interface UserData {
  id: string;
  name: string;
  email: string;
}

// ✅ Tipo unknown com validação
const data: unknown = response;
if (isUserData(data)) {
  // Agora data é UserData
}

// ✅ Generics para flexibilidade
function processData<T>(data: T): T {
  return data;
}
```

**🔧 ESLint Rules:** `no-ts-nocheck`, `@typescript-eslint/no-explicit-any`

### 3. **Imports - Padrões de Organização**

#### ✅ **CORRETO - Imports organizados**

```typescript
// ✅ Imports de tipos separados
import type { ComponentProps } from "react";
// ✅ Imports regulares
import { useEffect, useState } from "react";

import type { User } from "@kdx/shared/types";
import { Button } from "@kdx/ui/button";

import { useTRPC } from "~/trpc/react";
```

#### ❌ **PROIBIDO - Imports misturados**

```typescript
// ❌ Tipos e valores misturados
import { User, useState } from "react";
```

**🔧 ESLint Rule:** `@typescript-eslint/consistent-type-imports`

### 4. **React - Padrões Modernos**

#### ❌ **PROIBIDO - Import default do React**

```typescript
// ❌ NUNCA - React não precisa ser importado
import React from "react";
```

#### ✅ **CORRETO - Imports específicos**

```typescript
import type { FC } from "react";
import { useEffect, useState } from "react";

// ✅ Apenas o que precisa
```

**🔧 ESLint Rule:** `no-restricted-imports` (React default)

### 5. **Promises - Tratamento de Erros**

#### ❌ **PROIBIDO - Promise.all**

```typescript
// ❌ NUNCA - Falha silenciosa
const results = await Promise.all([fetchUser(), fetchPosts()]);
```

#### ✅ **CORRETO - Promise.allSettled**

```typescript
// ✅ Tratamento adequado de erros
import { getSuccessesAndErrors } from "@kdx/shared";

const results = await Promise.allSettled([fetchUser(), fetchPosts()]);

const { successes, errors } = getSuccessesAndErrors(results);
```

**🔧 ESLint Rule:** `no-restricted-syntax` (Promise.all)

### 6. **Environment Variables - Validação Obrigatória**

#### ❌ **PROIBIDO - process.env direto**

```typescript
// ❌ NUNCA - Sem validação
const apiUrl = process.env.API_URL;
```

#### ✅ **CORRETO - Env validado**

```typescript
// ✅ Sempre usar env validado
import { env } from "~/env";

const apiUrl = env.API_URL; // Tipado e validado
```

**🔧 ESLint Rule:** `no-restricted-properties` (process.env)

### 7. **Database - Operações Seguras**

#### ❌ **PROIBIDO - Delete/Update sem WHERE**

```typescript
// ❌ NUNCA - Perigoso
await db.delete(users);
await db.update(users).set({ active: false });
```

#### ✅ **CORRETO - Sempre com WHERE**

```typescript
// ✅ Seguro
await db.delete(users).where(eq(users.id, userId));
await db.update(users).set({ active: false }).where(eq(users.id, userId));
```

**🔧 ESLint Rule:** `drizzle/enforce-delete-with-where`, `drizzle/enforce-update-with-where`

## 📋 CHECKLIST PRÉ-CÓDIGO

Antes de escrever qualquer código, verifique:

- [ ] ✅ Vou usar `import { useTRPC }` e não `import { api }`?
- [ ] ✅ Vou usar `useMutation(trpc.method.mutationOptions())`?
- [ ] ✅ Vou usar `useQuery(trpc.method.queryOptions())`?
- [ ] ✅ Não vou usar `// @ts-nocheck` em lugar algum?
- [ ] ✅ Vou tipar explicitamente ou usar `unknown` com validação?
- [ ] ✅ Vou separar imports de tipos com `import type`?
- [ ] ✅ Não vou importar React como default?
- [ ] ✅ Vou usar `Promise.allSettled` em vez de `Promise.all`?
- [ ] ✅ Vou usar `env` validado em vez de `process.env`?
- [ ] ✅ Vou usar WHERE em operações de delete/update?

## 🛠️ COMANDOS DE VERIFICAÇÃO

### Verificar Conformidade

```bash
# Verificar todo o projeto
pnpm lint

# Verificar e corrigir automaticamente
pnpm lint:fix

# Verificar tRPC especificamente
pnpm check:trpc

# Verificar um pacote específico (NÃO use --filter)
pnpm eslint packages/api/
pnpm eslint apps/kdx/
```

### Resultados Esperados

- ✅ **0 erros** de `no-api-import`
- ✅ **0 erros** de `no-ts-nocheck`
- ✅ **0 erros** de `@typescript-eslint/no-explicit-any`
- ✅ **0 warnings** de imports incorretos

## 🎯 PADRÕES POR CONTEXTO

### **Frontend (Next.js)**

```typescript
// Estrutura padrão de componente
"use client";

import type { User } from "@kdx/shared/types";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@kdx/ui/button";
import { useTRPC } from "~/trpc/react";

interface ComponentProps {
  user: User;
}

export function MyComponent({ user }: ComponentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const query = useQuery(
    trpc.app.method.queryOptions(input)
  );

  const mutation = useMutation(
    trpc.app.method.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.method.pathFilter()
        );
      },
    })
  );

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### **Backend (tRPC Handlers)**

```typescript
// Estrutura padrão de handler
import type { TInputSchema } from "@kdx/validators";

import type { TProtectedProcedureContext } from "../procedures";

interface HandlerOptions {
  ctx: TProtectedProcedureContext;
  input: TInputSchema;
}

export const myHandler = async ({ ctx, input }: HandlerOptions) => {
  // 1. Validações de permissão
  const { services } = ctx;
  const ability = await services.permissions.getUserPermissionsForApp({
    appId: myAppId,
    user: ctx.auth.user,
  });

  ForbiddenError.from(ability).throwUnlessCan("Action", resource);

  // 2. Lógica de negócio
  const result = await repository.method({
    ...input,
    teamId: ctx.auth.user.activeTeamId,
  });

  // 3. Logging
  await logActivity({
    appId: myAppId,
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
    tableName: "myTable",
    rowId: result.id,
    type: "create",
    diff: diff({}, result),
  });

  return result;
};
```

## 🚨 VIOLAÇÕES COMUNS E CORREÇÕES

### 1. **Import de API incorreto**

```typescript
// ❌ ERRO COMUM
import { api } from "~/trpc/react";
const query = api.app.method.useQuery();

// ✅ CORREÇÃO AUTOMÁTICA
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";

const trpc = useTRPC();
const query = useQuery(trpc.app.method.queryOptions());
```

### 2. **Uso de @ts-nocheck**

```typescript
// ❌ ERRO COMUM
// @ts-nocheck
function problematicFunction(data: any) {
  return data.someProperty;
}

// ✅ CORREÇÃO
interface ExpectedData {
  someProperty: string;
}

function typedFunction(data: ExpectedData) {
  return data.someProperty;
}
```

### 3. **Promise.all sem tratamento**

```typescript
// ✅ CORREÇÃO
import { getSuccessesAndErrors } from "@kdx/shared";

// ❌ ERRO COMUM
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

const results = await Promise.allSettled([fetchUsers(), fetchPosts()]);

const { successes, errors } = getSuccessesAndErrors(results);
if (errors.length > 0) {
  console.error("Errors occurred:", errors);
}
```

## 🔧 CONFIGURAÇÃO DE EDITOR

### VS Code Settings

```json
{
  "eslint.enable": true,
  "eslint.autoFixOnSave": true,
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

## 📚 REFERÊNCIAS RÁPIDAS

- **tRPC Patterns:** `docs/architecture/trpc-patterns.md`
- **Architecture Standards:** `docs/architecture/Architecture_Standards.md`
- **Custom Rules:** `packages/eslint-config/eslint-rules/`
- **Base Config:** `tooling/eslint/base.js`

## ⚡ PROMPT PARA CURSOR/IA

Use este prompt quando solicitar código:

> "Crie código seguindo RIGOROSAMENTE as regras ESLint do Kodix em `@docs/eslint/kodix-eslint-coding-rules.md`. OBRIGATÓRIO: usar `useTRPC()` pattern, tipagem explícita, Promise.allSettled, env validado, imports organizados. PROIBIDO: `import { api }`, `@ts-nocheck`, `any` sem validação, `Promise.all`, `process.env` direto."

---

**🎯 LEMBRE-SE:** Estas regras são **INEGOCIÁVEIS**. Código que viole qualquer regra **NÃO SERÁ ACEITO** no projeto Kodix.
