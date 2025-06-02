# Padrões de Uso do tRPC no Kodix

## 📖 Visão Geral

Este documento detalha os padrões arquiteturais e de implementação do tRPC no monorepo Kodix, baseado no estudo da implementação do Kodix Care e outros SubApps.

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

### Configuração Cliente/Servidor

#### Cliente React (Next.js)

```typescript
// apps/kdx/src/trpc/react.tsx
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          /* ... */
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
  // ...
}
```

#### Cliente Mobile (Expo)

```typescript
// apps/care-expo/src/utils/api.tsx
export const api = createTRPCReact<AppRouter>();

export function TRPCProvider(props: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          /* ... */
        }),
        httpBatchLink({
          transformer: superjson,
          url: `${getBaseKdxUrl()}/api/trpc`,
          headers() {
            const headers = new Map<string, string>();
            headers.set("x-trpc-source", "expo-react");

            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);

            return Object.fromEntries(headers);
          },
        }),
      ],
    }),
  );
  // ...
}
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

## 📝 Procedures

### Tipos de Procedures

#### 1. Public Procedure

```typescript
// packages/api/src/trpc/procedures.ts
export const publicProcedure = t.procedure.use(timingMiddleware);
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
```

**Uso:** Endpoints que requerem usuário autenticado

#### 3. Team Owner Procedure

```typescript
export const isTeamOwnerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const team = await teamRepository.findTeamById(ctx.auth.user.activeTeamId);

    if (!team) throw new TRPCError({ code: "NOT_FOUND" });
    if (team.ownerId !== ctx.auth.user.id)
      throw new TRPCError({ code: "FORBIDDEN" });

    return next({ ctx: { ...ctx, team } });
  },
);
```

**Uso:** Endpoints que requerem ser dono do team

## 🛡️ Middlewares

### App Installation Middleware

```typescript
// packages/api/src/trpc/middlewares.ts
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
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

### Dependencies Middleware

```typescript
const appWithDependenciesInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const installedApps = await getInstalledHandler({ ctx });
    const installedAppIds = installedApps.map((app) => app.id);

    // Verificar app principal
    if (!installedAppIds.includes(appId)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Verificar dependências
    const dependencies = getAppDependencies(appId);
    const missingDependencies = dependencies.filter(
      (depId) => !installedAppIds.includes(depId),
    );

    if (missingDependencies.length > 0) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    return next({ ctx });
  });
```

## 🎯 Padrões de Router

### Estrutura de Router do Kodix Care

```typescript
// packages/api/src/trpc/routers/app/kodixCare/_router.ts
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
// Exemplo: createCareTask.handler.ts
import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  // 1. Validações de permissão
  const { services } = ctx;
  const ability = await services.permissions.getUserPermissionsForApp({
    user: ctx.auth.user,
    appId: kodixCareAppId,
  });
  ForbiddenError.from(ability).throwUnlessCan("Create", "CareTask");

  // 2. Lógica de negócio
  const [created] = await careTaskRepository.createCareTask({
    ...input,
    teamId: ctx.auth.user.activeTeamId,
    createdBy: ctx.auth.user.id,
    createdFromCalendar: false,
  });

  // 3. Validação de resultado
  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create care task",
    });
  }

  // 4. Logging de atividade
  await logActivity({
    appId: kodixCareAppId,
    teamId: ctx.auth.user.activeTeamId,
    tableName: "careTask",
    rowId: created.id,
    diff: diff({}, careTaskInserted),
    userId: ctx.auth.user.id,
    type: "create",
  });

  return created;
};
```

### Handler com Transação

```typescript
// Exemplo: editCareTask.ts
export const editCareTaskHandler = async ({
  ctx,
  input,
}: EditCareTaskOptions) => {
  // 1. Buscar estado anterior
  const oldCareTask = await careTaskRepository.findCareTaskById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });

  if (!oldCareTask) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  // 2. Executar em transação
  await db.transaction(async (tx) => {
    await careTaskRepository.updateCareTask(
      {
        id: input.id,
        input: set,
      },
      tx,
    );

    // 3. Logging assíncrono
    after(async () => {
      const newCareTask = await careTaskRepository.findCareTaskById(
        {
          id: input.id,
          teamId: ctx.auth.user.activeTeamId,
        },
        tx,
      );

      const diff = deepDiff(oldCareTask, newCareTask);
      await logActivity(
        {
          appId: kodixCareAppId,
          diff,
          tableName: "careTask",
          teamId: ctx.auth.user.activeTeamId,
          type: "update",
          userId: ctx.auth.user.id,
          rowId: input.id,
        },
        tx,
      );
    });
  });
};
```

## 🎨 Padrões de Uso no Frontend

### Hook useTRPC Básico

```typescript
// Uso em componente React
export default function DataTableKodixCare({ user }: { user: User }) {
  const trpc = useTRPC();
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

### Custom Hook para Mutation

```typescript
// apps/kdx/src/app/.../hooks.ts
export const useSaveCareTaskMutation = () => {
  const trpc = useTRPC();
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

### Mutation com Optimistic Updates

```typescript
export const useEditCareShift = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.app.kodixCare.editCareShift.mutationOptions({
      // 1. Optimistic update
      onMutate: async (newShift) => {
        await queryClient.cancelQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );

        const previousData = queryClient.getQueryData(
          trpc.app.kodixCare.getAllCareShifts.queryKey(),
        );

        queryClient.setQueryData(
          trpc.app.kodixCare.getAllCareShifts.queryKey(),
          (old) =>
            old?.map((shift) =>
              shift.id === newShift.id ? { ...shift, ...newShift } : shift,
            ),
        );

        return { previousData };
      },

      // 2. Rollback em caso de erro
      onError: (err, _newShift, context) => {
        trpcErrorToastDefault(err);
        if (context?.previousData) {
          queryClient.setQueryData(
            trpc.app.kodixCare.getAllCareShifts.queryKey(),
            context.previousData,
          );
        }
      },

      // 3. Refetch final
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );
      },
    }),
  );

  return mutation;
};
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
  type: "create", // "create" | "update" | "delete"
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
pnpm trpc-cli
```

Gera automaticamente:

- Router files (`_router.ts`)
- Handler files (`*.handler.ts`)
- Validator imports
- Type definitions

## 📝 Boas Práticas

### ✅ DO (Faça)

1. **Sempre use middlewares apropriados**

   ```typescript
   protectedProcedure
     .use(kodixCareInstalledMiddleware)
     .input(ZSchema)
     .mutation(handler);
   ```

2. **Implemente logging de atividades**

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

3. **Use validação Zod com i18n**

   ```typescript
   .input(T(ZCreateCareTaskInputSchema))
   ```

4. **Invalidate queries relacionadas**

   ```typescript
   onSettled: () => {
     void queryClient.invalidateQueries(
       trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
     );
   };
   ```

5. **Use transações para operações críticas**
   ```typescript
   await db.transaction(async (tx) => {
     // múltiplas operações
   });
   ```

### ❌ DON'T (Não faça)

1. **Não exponha dados de outros teams**

   ```typescript
   // SEMPRE filtrar por teamId
   teamId: ctx.auth.user.activeTeamId;
   ```

2. **Não ignore validações de permissão**

   ```typescript
   // SEMPRE verificar permissões
   ForbiddenError.from(ability).throwUnlessCan("Action", resource);
   ```

3. **Não hardcode strings**

   ```typescript
   // ❌ Errado
   message: "Task not found";

   // ✅ Correto
   message: ctx.t("api.Task not found");
   ```

4. **Não misture lógica de negócio no router**
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

---

**Última atualização:** 2024-12-20  
**Versão tRPC:** 10.x  
**Compatibilidade:** Next.js 14+, React 18+
