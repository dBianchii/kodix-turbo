# Guia de Migração tRPC v11 - Kodix

## 📖 Visão Geral

Este guia documenta como manter a arquitetura **tRPC v11** correta no projeto Kodix, baseada na implementação funcional do commit `92a76e90` para o **web app**.

> **⚠️ IMPORTANTE:** O padrão utilizado no `care-expo` (mobile app) ainda está em estudo e **não deve ser considerado** como referência arquitetural. Este guia foca exclusivamente no padrão web validado e funcional.

## 🎯 Arquitetura Correta (Target)

### Web App (Next.js)

```typescript
// ✅ CORRETO - apps/kdx/src/trpc/react.tsx
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// ✅ CORRETO - Uso no frontend
const trpc = useTRPC();
const query = useQuery(trpc.app.*.queryOptions());
```

## 🚨 Padrões Proibidos

### ❌ Padrão Incorreto - `import { api }`

```typescript
// ❌ NUNCA USAR - Padrão incorreto
import { api } from "~/trpc/react";
const query = api.app.*.useQuery();
```

### ❌ Uso Direto de Métodos

```typescript
// ❌ NUNCA USAR - Métodos diretos
const mutation = trpc.app.*.useMutation();
const query = trpc.app.*.useQuery();
```

## ✅ Padrão Correto - Web App (Next.js)

### Configuração

```typescript
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

### Uso em Componentes

```typescript
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

### Custom Hooks

```typescript
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

## 🔧 Migração de Código Incorreto

### Cenário 1: Corrigir Import Incorreto

#### ❌ Antes (Incorreto)

```typescript
import { api } from "~/trpc/react";

const query = api.app.kodixCare.careTask.getCareTasks.useQuery(input);
```

#### ✅ Depois (Correto)

```typescript
import { useTRPC } from "~/trpc/react";

const trpc = useTRPC();
const query = useQuery(
  trpc.app.kodixCare.careTask.getCareTasks.queryOptions(input),
);
```

### Cenário 2: Corrigir Mutations Diretas

#### ❌ Antes (Incorreto)

```typescript
const mutation = trpc.app.kodixCare.careTask.editCareTask.useMutation({
  onSuccess: () => {
    // ...
  },
});
```

#### ✅ Depois (Correto)

```typescript
const trpc = useTRPC();
const mutation = useMutation(
  trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
    onSuccess: () => {
      // ...
    },
  }),
);
```

### Cenário 3: Corrigir Invalidação de Queries

#### ❌ Antes (Incorreto)

```typescript
// Invalidar queries
queryClient.invalidateQueries(
  trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
);
```

#### ✅ Depois (Correto)

```typescript
const trpc = useTRPC();
// Invalidar queries
queryClient.invalidateQueries(
  trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
);
```

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

```bash
# Executar verificação automática
pnpm check:trpc
```

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

```typescript
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

## 🔍 Validação Final

### Comandos de Verificação

```bash
# 1. Verificar imports incorretos
grep -r "import.*{ api }.*from.*trpc" apps/kdx/src/

# 2. Verificar uso direto de mutations
grep -r "\.useMutation(" apps/kdx/src/

# 3. Verificar uso direto de queries
grep -r "\.useQuery(" apps/kdx/src/

# 4. Executar script completo
pnpm check:trpc
```

### Resultado Esperado

- ✅ **0 imports** de `{ api }` no web app
- ✅ **0 usos diretos** de `.useMutation()` no web app
- ✅ **0 usos diretos** de `.useQuery()` no web app

---

**Última atualização:** 2024-12-21  
**Versão tRPC:** 11.0.0  
**Arquitetura Base:** Commit 92a76e90 (kodix-care-web)
