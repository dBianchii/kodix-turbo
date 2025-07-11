# Padrões de Uso do tRPC v11 no Kodix

## 📖 Visão Geral

Este documento detalha os padrões arquiteturais e de implementação do **tRPC v11** no monorepo Kodix, baseado na implementação real e funcional do projeto para o **web app**.

> **⚠️ IMPORTANTE:** O padrão utilizado no `care-expo` (mobile app) ainda está em estudo e **não deve ser considerado** como referência arquitetural. Este documento foca exclusivamente no padrão web validado e funcional.

## 🏗️ Arquitetura Geral

### Estrutura de Arquivos

```
packages/api/src/trpc/
├── trpc.ts                 # Configuração base do tRPC
├── root.ts                 # Router principal
├── procedures.ts           # Procedures base (public, protected, etc.)
├── middlewares.ts          # Middlewares customizados
└── routers/
    ├── app/
    │   ├── _router.ts      # Router principal de apps
    │   ├── kodixCare/
    │   │   ├── _router.ts  # Router do Kodix Care
    │   │   ├── careTask/
    │   │   │   ├── _router.ts
    │   │   │   ├── createCareTask.handler.ts
    │   │   │   └── ...
    │   │   └── *.handler.ts
    │   └── ...
    ├── auth/
    ├── team/
    └── user/
```

### Versões tRPC

```yaml
# pnpm-workspace.yaml
trpc:
  "@trpc/client": ^11.0.0
  "@trpc/tanstack-react-query": ^11.0.0
  "@trpc/react-query": ^11.0.0
  "@trpc/server": ^11.0.0
```

## 🔧 Configuração Base

### Context Creation

```typescript
// packages/api/src/trpc/trpc.ts
export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: AuthResponse;
}) => {
  const authToken = opts.headers.get("Authorization") ?? null;
  const auth = opts.auth;
  const source = opts.headers.get("x-trpc-source") ?? "unknown";

  const locale = await getLocaleBasedOnCookie();
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  const services = initializeServices({ t });

  return {
    format,
    services,
    t,
    auth,
    token: authToken,
  };
};
```

### tRPC Initialization

```typescript
export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});
```

## 🎨 Configuração Cliente Web

### Cliente React (Next.js) - Web App

```typescript
// apps/kdx/src/trpc/react.tsx
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";
import type { AppRouter } from "@kdx/api";

// ✅ Padrão correto para Next.js
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
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

## 📝 Procedures

### Tipos de Procedures

#### 1. Public Procedure

```typescript
// packages/api/src/trpc/procedures.ts
export const publicProcedure = t.procedure.use(timingMiddleware);
export type TPublicProcedureContext = inferProcedureBuilderResolverOptions<
  typeof publicProcedure
>["ctx"];
```

**Uso:** Endpoints que não requerem autenticação (login, registro, etc.)

#### 2. Protected Procedure

```typescript
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.auth.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth, // user is now non-nullable
    },
  });
});
export type TProtectedProcedureContext = inferProcedureBuilderResolverOptions<
  typeof protectedProcedure
>["ctx"];
```

**Uso:** Endpoints que requerem usuário autenticado

#### 3. Team Owner Procedure

```typescript
export const isTeamOwnerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const team = await teamRepository.findTeamById(ctx.auth.user.activeTeamId);

    if (!team)
      throw new TRPCError({
        message: ctx.t("api.No Team Found"),
        code: "NOT_FOUND",
      });

    if (team.ownerId !== ctx.auth.user.id)
      throw new TRPCError({
        message: ctx.t("api.Only the team owner can perform this action"),
        code: "FORBIDDEN",
      });

    return next({
      ctx: {
        ...ctx,
        team,
      },
    });
  },
);
export type TIsTeamOwnerProcedureContext = inferProcedureBuilderResolverOptions<
  typeof isTeamOwnerProcedure
>["ctx"];
```

**Uso:** Endpoints que requerem ser dono do team

## 🛡️ Middlewares

### App Installation Middleware

```typescript
// packages/api/src/trpc/middlewares.ts
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  t.middleware(async ({ ctx, next }) => {
    const apps = await getInstalledHandler({ ctx });

    if (!apps.some((app) => app.id === appId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t("api.appName is not installed", {
          app: getAppName(ctx.t, appId),
        }),
      });
    }

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);
```

## 🎯 Padrões de Router

### **🚨 Padrão Crítico: Construção com `t.router` para Preservar Tipos**

- **Regra**: **TODOS** os routers, em todos os níveis (sub-routers e o router principal), **DEVEM** ser construídos usando a função `t.router({...})`.
- **Causa de Erros Graves**: A exportação de um router como um objeto TypeScript genérico (ex: `const seuRouter: TRPCRouterRecord = {...}`) **APAGA** as informações de tipo detalhadas de cada procedure. Isso quebra a inferência de tipos end-to-end e causa uma cascata de erros "unsafe" no frontend que são difíceis de diagnosticar.

  ```diff
  // ❌ ERRADO: Este padrão quebra a inferência de tipos.
  - import type { TRPCRouterRecord } from "@trpc/server";
  - export const seuRouter: TRPCRouterRecord = { /* ... */ };

  // ✅ CORRETO: Este padrão preserva e propaga os tipos.
  + import { t } from "../../trpc";
  + export const seuRouter = t.router({ /* ... */ });
  ```

### Estrutura de Router do Kodix Care

```typescript
// packages/api/src/trpc/routers/app/kodixCare/_router.ts
import type { TRPCRouterRecord } from "@trpc/server";

export const kodixCareRouter = {
  careTask: careTaskRouter, // Sub-router aninhado

  // Endpoints públicos
  checkEmailForRegister: publicProcedure
    .input(ZCheckEmailForRegisterInputSchema)
    .query(checkEmailForRegisterHandler),

  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),

  // Endpoints protegidos básicos
  getAllCareShifts: protectedProcedure.query(getAllCareShiftsHandler),

  // Endpoints com middleware de app instalado
  createCareShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareShiftInputSchema))
    .mutation(createCareShiftHandler),

  getAllCaregivers: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(getAllCaregiversHandler),

  // Endpoints com validação mas sem middleware específico
  findOverlappingShifts: protectedProcedure
    .input(ZFindOverlappingShiftsInputSchema)
    .query(findOverlappingShiftsHandler),

  editCareShift: protectedProcedure
    .input(T(ZEditCareShiftInputSchema))
    .mutation(editCareShiftHandler),

  deleteCareShift: protectedProcedure
    .input(ZDeleteCareShiftInputSchema)
    .mutation(deleteCareShiftHandler),
} satisfies TRPCRouterRecord;
```

### Sub-Router (careTask)

```typescript
// packages/api/src/trpc/routers/app/kodixCare/careTask/_router.ts
export const careTaskRouter = {
  getCareTasks: protectedProcedure
    .input(ZGetCareTasksInputSchema)
    .use(kodixCareInstalledMiddleware)
    .query(getCareTasksHandler),

  editCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZEditCareTaskInputSchema)) // Função T() para i18n
    .mutation(editCareTaskHandler),

  createCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareTaskInputSchema))
    .mutation(createCareTaskHandler),

  deleteCareTask: protectedProcedure
    .input(ZDeleteCareTaskInputSchema)
    .mutation(deleteCareTaskHandler),

  // Mutation sem input
  syncCareTasksFromCalendar: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .mutation(syncCareTasksFromCalendarHandler),
} satisfies TRPCRouterRecord;
```

## 📋 Padrões de Handler

### Estrutura Padrão de Handler

```typescript
// Exemplo: createCareShift.handler.ts
import type { TCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CreateCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareShiftInputSchema;
}

export const createCareShiftHandler = async ({
  ctx,
  input,
}: CreateCareShiftOptions) => {
  // 1. Validações de permissão
  const { services } = ctx;
  const ability = await services.permissions.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("Create", {
    __typename: "CareShift",
    caregiverId: input.careGiverId,
    createdById: ctx.auth.user.id,
  });

  // 2. Validações de negócio
  const overlappingShifts = await kodixCareRepository.findOverlappingShifts({
    start: input.startAt,
    end: input.endAt,
    teamId: ctx.auth.user.activeTeamId,
  });
  assertNoOverlappingShiftsForThisCaregiver(ctx.t, {
    caregiverId: input.careGiverId,
    overlappingShifts: overlappingShifts,
  });

  // 3. Executar em transação
  await db.transaction(async (tx) => {
    const shift = {
      createdById: ctx.auth.user.id,
      caregiverId: input.careGiverId,
      endAt: input.endAt,
      startAt: input.startAt,
      teamId: ctx.auth.user.activeTeamId,
    };

    const [result] = await kodixCareRepository.createCareShift(shift, tx);
    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: ctx.t("api.Could not create shift"),
      });
    }

    // 4. Logging de atividade
    await logActivity({
      appId: kodixCareAppId,
      teamId: ctx.auth.user.activeTeamId,
      userId: ctx.auth.user.id,
      tableName: "careShift",
      rowId: result.id,
      type: "create",
      diff: diff({}, shift),
    });
  });
};
```

## 🎨 Padrões de Uso no Frontend Web

### Web App (Next.js) - Padrão useTRPC

```typescript
// apps/kdx/src/app/.../hooks.ts
export const useSaveCareTaskMutation = () => {
  const trpc = useTRPC(); // ✅ Hook correto para web
  const queryClient = useQueryClient();
  const t = useTranslations();

  const saveCareTaskMutation = useMutation(
    trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
      onSettled: () => {
        // Invalidar queries relacionadas
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.getAppActivityLogs.queryFilter({
            tableNames: ["careTask"],
          }),
        );
      },
    }),
  );

  const mutateAsync = (values: TEditCareTaskInputSchema) =>
    toast
      .promise(saveCareTaskMutation.mutateAsync(values), {
        loading: t("Updating"),
        success: t("Updated"),
        error: getErrorMessage,
      })
      .unwrap();

  return { ...saveCareTaskMutation, mutateAsync };
};
```

### Web App - Uso em Componente

```typescript
// Uso em componente React (Web)
export default function DataTableKodixCare({ user }: { user: User }) {
  const trpc = useTRPC(); // ✅ Hook correto
  const t = useTranslations();

  // Query
  const query = useQuery(
    trpc.app.kodixCare.careTask.getCareTasks.queryOptions(input),
  );
  const data = useMemo(() => query.data ?? [], [query.data]);

  // Mutation
  const saveCareTaskMutation = useSaveCareTaskMutation();

  return (
    // JSX components
  );
}
```

## 🌐 Validação e Internacionalização

### Schemas Zod com i18n

```typescript
// packages/validators/src/trpc/app/kodixCare/careTask/index.ts
export const ZCreateCareTaskInputSchema = (t: IsomorficT) =>
  z.object({
    date: z
      .date()
      .min(new Date(), {
        message: t("validators.Date cannot be in the past"),
      })
      .transform((date) => dayjs(date).second(0).millisecond(0).toDate()),
    title: z.string(),
    description: z.string().optional(),
    type: z.custom<typeof careTasks.$inferInsert.type>(),
  });
```

### Uso da Função T() nos Routers

```typescript
// Router com validação internacionalizada
createCareTask: protectedProcedure
  .use(kodixCareInstalledMiddleware)
  .input(T(ZCreateCareTaskInputSchema)) // T() aplica o contexto de tradução
  .mutation(createCareTaskHandler),
```

## 🔍 Server-Side Calls

### tRPC Caller para RSC

```typescript
// apps/kdx/src/trpc/server.tsx
export const trpcCaller = createCaller(createContext);

// Uso em Server Components
export default async function KodixCareSettingsPage() {
  await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <main>
      <KodixCareUserSettingsForm
        config={trpcCaller.app.getUserAppTeamConfig({
          appId: kodixCareAppId,
        })}
      />
    </main>
  );
}
```

## 🚨 Tratamento de Erros

### Padrão de Error Handling

```typescript
// Handler com múltiplos tipos de erro
export const deleteCareShiftHandler = async ({
  ctx,
  input,
}: DeleteCareShiftOptions) => {
  const careShift = await kodixCareRepository.getCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });

  if (!careShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Shift not found"),
    });
  }

  const ability = await services.permissions.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });

  ForbiddenError.from(ability).throwUnlessCan("Delete", {
    __typename: "CareShift",
    ...careShift,
  });

  await kodixCareRepository.deleteCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
};
```

### Frontend Error Handling

```typescript
// Helper para tratamento de erros
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

const mutation = useMutation(
  trpc.app.kodixCare.careTask.deleteCareTask.mutationOptions({
    onError: trpcErrorToastDefault, // Toast automático com erro formatado
    onSettled: () => {
      void (queryClient.invalidateQueries(/* ... */));
    },
  }),
);
```

## 📊 Logging e Auditoria

### Padrão de Activity Logs

```typescript
// Logging de atividades
await logActivity({
  appId: kodixCareAppId,
  teamId: ctx.auth.user.activeTeamId,
  tableName: "careTask",
  rowId: created.id,
  diff: diff({}, careTaskInserted),
  userId: ctx.auth.user.id,
  type: "create" | "update" | "delete",
});
```

### Query de Logs no Frontend

```typescript
// Visualização de logs
const getAppActivityLogsQuery = useQuery(
  trpc.app.getAppActivityLogs.queryOptions({
    appId: kodixCareAppId,
    tableNames: ["careTask"],
    rowId: careTaskId,
  }),
);
```

## 🛠️ Ferramentas e CLI

### tRPC CLI

O projeto inclui uma CLI customizada para geração de endpoints:

```bash
# Localização: packages/trpc-cli/
pnpm trpc:new
```

Gera automaticamente:

- Router files (`_router.ts`)
- Handler files (`*.handler.ts`)
- Validator imports
- Type definitions

## 📝 Boas Práticas

### ✅ DO (Faça)

1. **Use o padrão correto para web app**

   ```typescript
   // ✅ Web (Next.js)
   const trpc = useTRPC();
   const query = useQuery(trpc.app.*.queryOptions());
   ```

2. **Sempre use middlewares apropriados**

   ```typescript
   protectedProcedure
     .use(kodixCareInstalledMiddleware)
     .input(ZSchema)
     .mutation(handler);
   ```

3. **Implemente logging de atividades**

   ```typescript
   await logActivity({
     appId,
     teamId,
     tableName,
     rowId,
     type: "create" | "update" | "delete",
     // ...
   });
   ```

4. **Use validação Zod com i18n**

   ```typescript
   .input(T(ZCreateCareTaskInputSchema))
   ```

5. **Invalidate queries relacionadas**

   ```typescript
   // Web
   onSettled: () => {
     void queryClient.invalidateQueries(
       trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
     );
   };
   ```

6. **Use transações para operações críticas**
   ```typescript
   await db.transaction(async (tx) => {
     // múltiplas operações
   });
   ```

### ❌ DON'T (Não faça)

1. **Não use padrões incorretos**

   ```typescript
   // ❌ Errado - padrão incorreto
   import { api } from "~/trpc/react";
   const query = api.app.*.useQuery();
   ```

2. **Não exponha dados de outros teams**

   ```typescript
   // SEMPRE filtrar por teamId
   teamId: ctx.auth.user.activeTeamId;
   ```

3. **Não ignore validações de permissão**

   ```typescript
   // SEMPRE verificar permissões
   ForbiddenError.from(ability).throwUnlessCan("Action", resource);
   ```

4. **Não hardcode strings**

   ```typescript
   // ❌ Errado
   message: "Task not found";

   // ✅ Correto
   message: ctx.t("api.Task not found");
   ```

5. **Não misture lógica de negócio no router**
   ```typescript
   // ❌ Errado - lógica no router
   // ✅ Correto - lógica no handler
   ```

## 🎯 Considerações de Performance

### Query Optimization

- Use `pathFilter()` para invalidação seletiva
- Implemente optimistic updates quando apropriado
- Cache queries com `staleTime` adequado
- Use `select` para transformar dados

### Bundle Optimization

- Use imports dinâmicos para routers grandes
- Separate client/server code apropriadamente
- Configure code splitting por app

## 🔄 Padrão Único - Web App

### Web App (Next.js)

- **Setup**: `createTRPCContext<AppRouter>()`
- **Hook**: `useTRPC()`
- **Queries**: `useQuery(trpc.*.queryOptions())`
- **Mutations**: `useMutation(trpc.*.mutationOptions())`
- **Invalidation**: `queryClient.invalidateQueries(trpc.*.pathFilter())`

---

**Última atualização:** 2024-12-21  
**Versão tRPC:** 11.0.0  
**Compatibilidade:** Next.js 15+, React 19+  
**Arquitetura Base:** Commit 92a76e90 (kodix-care-web)
