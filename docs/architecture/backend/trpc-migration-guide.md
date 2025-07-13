<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: backend
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Guia de Migração tRPC v11 - Kodix

## 📖 Visão Geral

Este guia documenta como manter a arquitetura **tRPC v11** correta no projeto Kodix, baseada na implementação funcional do commit `92a76e90` para o **web app**.

> **⚠️ IMPORTANTE:** O padrão utilizado no `care-expo` (mobile app) ainda está em estudo e **não deve ser considerado** como referência arquitetural. Este guia foca exclusivamente no padrão web validado e funcional.

## 🎯 Arquitetura Correta (Target)

### Web App (Next.js)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CORRETO - apps/kdx/src/trpc/react.tsx
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// ✅ CORRETO - Uso no frontend
const trpc = useTRPC();
const query = useQuery(trpc.app.*.queryOptions());
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚨 Padrões Proibidos

### ❌ Padrão Incorreto - `import { api }`

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ NUNCA USAR - Padrão incorreto
import { api } from "~/trpc/react";
const query = api.app.*.useQuery();
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### ❌ Uso Direto de Métodos

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ NUNCA USAR - Métodos diretos
const mutation = trpc.app.*.useMutation();
const query = trpc.app.*.useQuery();
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## ✅ Padrão Correto - Web App (Next.js)

### Configuração

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/trpc/react.tsx
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
          // ...
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Uso em Componentes

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CORRETO - Web pattern
export function MyComponent() {
  const trpc = useTRPC();

  // Queries
  const query = useQuery(
    trpc.app.kodixCare.careTask.getCareTasks.queryOptions(input),
  );

  // Mutations
  const mutation = useMutation(
    trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
    }),
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Custom Hooks

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CORRETO - Custom hook para web
export const useSaveCareTaskMutation = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
    }),
  );
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Migração de Código Incorreto

### Cenário 1: Corrigir Import Incorreto

#### ❌ Antes (Incorreto)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { api } from "~/trpc/react";

const query = api.app.kodixCare.careTask.getCareTasks.useQuery(input);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### ✅ Depois (Correto)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { useTRPC } from "~/trpc/react";

const trpc = useTRPC();
const query = useQuery(
  trpc.app.kodixCare.careTask.getCareTasks.queryOptions(input),
);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Cenário 2: Corrigir Mutations Diretas

#### ❌ Antes (Incorreto)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
const mutation = trpc.app.kodixCare.careTask.editCareTask.useMutation({
  onSuccess: () => {
    // ...
  },
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### ✅ Depois (Correto)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
const trpc = useTRPC();
const mutation = useMutation(
  trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
    onSuccess: () => {
      // ...
    },
  }),
);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Cenário 3: Corrigir Invalidação de Queries

#### ❌ Antes (Incorreto)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Invalidar queries
queryClient.invalidateQueries(
  trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### ✅ Depois (Correto)

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
const trpc = useTRPC();
// Invalidar queries
queryClient.invalidateQueries(
  trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📋 Checklist de Migração

### Para Web App (Next.js)

- [ ] ✅ Usar `createTRPCContext<AppRouter>()`
- [ ] ✅ Hook: `const trpc = useTRPC()`
- [ ] ✅ Queries: `useQuery(trpc.*.queryOptions())`
- [ ] ✅ Mutations: `useMutation(trpc.*.mutationOptions())`
- [ ] ✅ Invalidation: `queryClient.invalidateQueries(trpc.*.pathFilter())`
- [ ] ❌ Nunca usar `import { api }`
- [ ] ❌ Nunca usar `.useMutation()` direto
- [ ] ❌ Nunca usar `.useQuery()` direto

## 🛠️ Scripts de Verificação

### Verificar Problemas

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Executar verificação automática
pnpm check:trpc
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Problemas Detectados

1. **Incorrect `{ api }` imports**: Deve ser 0 no web app
2. **Direct `.useMutation()` usage**: Deve ser 0 no web app
3. **Direct `.useQuery()` usage**: Deve ser 0 no web app

## 📁 Arquivos Alvo

### Web App Files (usar padrão `useTRPC()`)

```
apps/kdx/src/**/*.tsx
apps/kdx/src/**/*.ts
```

## 🎯 Exemplo Completo

### Web Component Completo

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/app/.../component.tsx
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useTRPC } from "~/trpc/react";

export function DataTableKodixCare() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();

  // Query
  const careTasksQuery = useQuery(
    trpc.app.kodixCare.careTask.getCareTasks.queryOptions(input),
  );

  // Mutation
  const editMutation = useMutation(
    trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
    }),
  );

  return (
    // JSX
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔍 Validação Final

### Comandos de Verificação

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# 1. Verificar imports incorretos
grep -r "import.*{ api }.*from.*trpc" apps/kdx/src/

# 2. Verificar uso direto de mutations
grep -r "\.useMutation(" apps/kdx/src/

# 3. Verificar uso direto de queries
grep -r "\.useQuery(" apps/kdx/src/

# 4. Executar script completo
pnpm check:trpc
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Resultado Esperado

- ✅ **0 imports** de `{ api }` no web app
- ✅ **0 usos diretos** de `.useMutation()` no web app
- ✅ **0 usos diretos** de `.useQuery()` no web app

---

**Última atualização:** 2024-12-21  
**Versão tRPC:** 11.0.0  
**Arquitetura Base:** Commit 92a76e90 (kodix-care-web)
