# Sistema de Configurações de SubApps - Kodix

## 📖 Visão Geral

O Kodix oferece um **sistema robusto de configurações** que permite guardar informações específicas para cada app de **duas formas distintas**:

### 🏢 **Configurações de Time** (`appTeamConfig`)

- **Escopo**: Toda a equipe compartilha as mesmas configurações
- **Gerenciado por**: Admin/Owner da equipe
- **Exemplo**: Modelo padrão de IA para toda a equipe no Chat

### 👤 **Configurações de Usuário** (`userAppTeamConfig`)

- **Escopo**: Configurações pessoais de cada usuário
- **Gerenciado por**: O próprio usuário
- **Exemplo**: Preferências de notificação pessoais no Kodix Care

Ambos os sistemas garantem **isolamento completo** por `teamId` e `appId`, permitindo que cada app tenha suas próprias configurações em cada equipe.

---

## 🗄️ Estrutura de Banco de Dados

> 🎯 **CRÍTICO**: Todas as configurações dos SubApps são armazenadas em campos JSON `config` nas tabelas existentes. **NÃO crie tabelas separadas** - use sempre o sistema existente via schemas Zod em `packages/shared/src/db.ts`:
>
> - **🏢 Configurações de Time**: `appTeamConfig.config` (compartilhadas por toda equipe)
> - **👤 Configurações de Usuário**: `userAppTeamConfig.config` (específicas de cada usuário)

### **Tabela `appTeamConfig`** - Configurações de Time

```sql
CREATE TABLE appTeamConfig (
  id VARCHAR(21) PRIMARY KEY,
  config JSON NOT NULL,        -- 🏢 Configurações da EQUIPE
  appId VARCHAR(21) NOT NULL,  -- 📱 ID do app
  teamId VARCHAR(21) NOT NULL, -- 🏢 ID da equipe
  UNIQUE KEY unique_appId_teamId (appId, teamId)
);
```

### **Tabela `userAppTeamConfig`** - Configurações de Usuário

```sql
CREATE TABLE userAppTeamConfig (
  id VARCHAR(21) PRIMARY KEY,
  config JSON NOT NULL,        -- 👤 Configurações do USUÁRIO
  userId VARCHAR(21) NOT NULL, -- 👤 ID do usuário
  appId VARCHAR(21) NOT NULL,  -- 📱 ID do app
  teamId VARCHAR(21) NOT NULL, -- 🏢 ID da equipe
  UNIQUE KEY unique_userId_appId_teamId (userId, appId, teamId)
);
```

---

## 🔧 APIs e Endpoints

### **🏢 Configurações de Time**

#### **GET** - Buscar Configuração da Equipe

```typescript
// Endpoint: app.getConfig
const trpc = useTRPC();
const query = useQuery(
  trpc.app.getConfig.queryOptions({
    appId: "az1x2c3bv4n5", // chatAppId
  }),
);

// Handler
export const getConfigHandler = async ({ ctx, input }) => {
  const [config] = await appRepository.findAppTeamConfigs({
    appId: input.appId,
    teamIds: [ctx.auth.user.activeTeamId],
  });

  return config?.config || null;
};
```

#### **POST** - Salvar Configuração da Equipe

```typescript
// Endpoint: app.saveConfig
const trpc = useTRPC();
const mutation = useMutation(
  trpc.app.saveConfig.mutationOptions({
    appId: "az1x2c3bv4n5", // chatAppId
    config: {
      lastSelectedModelId: "gpt-4o-2024-11-20",
      aiSettings: {
        maxTokens: 2000,
        temperature: 0.7,
      },
    },
  }),
);

// Handler
export const saveConfigHandler = async ({ ctx, input }) => {
  await appRepository.upsertAppTeamConfigs({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
    input: input.config,
  });
};
```

### **👤 Configurações de Usuário**

#### **GET** - Buscar Configuração do Usuário

```typescript
// Endpoint: app.getUserAppTeamConfig
const trpc = useTRPC();
const query = useQuery(
  trpc.app.getUserAppTeamConfig.queryOptions({
    appId: "1z50i9xblo4b", // kodixCareAppId
  }),
);

// Handler
export const getUserAppTeamConfigHandler = async ({ ctx, input }) => {
  const [userConfig] = await appRepository.findUserAppTeamConfigs({
    userIds: [ctx.auth.user.id],
    teamIds: [ctx.auth.user.activeTeamId],
    appId: input.appId,
  });

  return userConfig?.config || null;
};
```

#### **POST** - Salvar Configuração do Usuário

```typescript
// Endpoint: app.saveUserAppTeamConfig
const trpc = useTRPC();
const mutation = useMutation(
  trpc.app.saveUserAppTeamConfig.mutationOptions({
    appId: "1z50i9xblo4b", // kodixCareAppId
    config: {
      sendNotificationsForDelayedTasks: true,
    },
  }),
);

// Handler
export const saveUserAppTeamConfigHandler = async ({ ctx, input }) => {
  await appRepository.upsertUserAppTeamConfigs({
    userId: ctx.auth.user.id,
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
    input: input.config,
  });
};
```

---

## ⚙️ Definição de Schemas

### **1. Definir Schema Zod**

```typescript
// packages/shared/src/db.ts

// Schema para configurações de TIME
export const meuAppConfigSchema = z.object({
  // Configurações gerais da equipe
  appSettings: z
    .object({
      enableFeatureX: z.boolean().default(true),
      maxItemsPerPage: z.number().min(10).max(100).default(20),
    })
    .default({}),

  // Integrações da equipe
  integrations: z
    .object({
      externalApiEnabled: z.boolean().default(false),
      externalApiUrl: z.string().url().optional(),
    })
    .default({}),
});

// Schema para configurações de USUÁRIO
export const meuAppUserConfigSchema = z.object({
  // Preferências pessoais
  personalSettings: z
    .object({
      enableNotifications: z.boolean().default(true),
      notificationSound: z.boolean().default(false),
    })
    .default({}),

  // Configurações de UI pessoais
  uiPreferences: z
    .object({
      theme: z.enum(["light", "dark", "auto"]).default("auto"),
      compactMode: z.boolean().default(false),
    })
    .default({}),
});
```

### **2. Registrar nos Mapeamentos**

```typescript
// Configurações de TIME
export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
  [chatAppId]: chatConfigSchema,
  [meuAppId]: meuAppConfigSchema, // ← Adicionar aqui
};

// Configurações de USUÁRIO
export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [chatAppId]: chatUserAppTeamConfigSchema,
  [meuAppId]: meuAppUserConfigSchema, // ← Adicionar aqui
};

// Definir quais apps suportam cada tipo
export type AppIdsWithConfig =
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof meuAppId; // ← Adicionar se tiver config de time

export type AppIdsWithUserAppTeamConfig =
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof meuAppId; // ← Adicionar se tiver config de usuário
```

---

## 📊 Exemplos Práticos

### **Kodix Care** ✅ Implementado

#### **Configurações de Time** (`appTeamConfig`)

```json
{
  "patientName": "João Silva",
  "clonedCareTasksUntil": "2024-12-31T23:59:59Z"
}
```

#### **Configurações de Usuário** (`userAppTeamConfig`)

```json
{
  "sendNotificationsForDelayedTasks": true
}
```

### **Chat** ✅ Parcialmente Implementado

#### **Configurações de Time** (`appTeamConfig`) - ✅ Implementado

```json
{
  "lastSelectedModelId": "gpt-4o-2024-11-20",
  "aiSettings": {
    "maxTokens": 2000,
    "temperature": 0.7,
    "enableStreaming": true
  },
  "uiSettings": {
    "showModelInHeader": true,
    "autoSelectModel": true,
    "defaultChatTitle": "Nova Conversa"
  },
  "behaviorSettings": {
    "rememberLastModel": true,
    "autoSaveConversations": true,
    "enableTypingIndicator": true
  }
}
```

#### **Configurações de Usuário** (`userAppTeamConfig`) - ❌ Schema definido, mas sem UI

```json
{
  "personalSettings": {
    "preferredModelId": "claude-3-sonnet",
    "enableNotifications": true,
    "notificationSound": false
  },
  "uiPreferences": {
    "chatTheme": "dark",
    "fontSize": "large",
    "compactMode": false
  }
}
```

### **Calendar** ❌ Não Implementado

- Nenhum dos dois tipos de configuração

---

## 🎯 Implementação Frontend

### **Hook para Configurações de Time**

```typescript
// hooks/useAppTeamConfig.ts
export function useAppTeamConfig(appId: AppIdsWithConfig) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery(
    trpc.app.getConfig.queryOptions({ appId }),
  );

  const saveConfigMutation = useMutation(
    trpc.app.saveConfig.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.app.getConfig.pathFilter({ appId }));
        toast.success("Configurações da equipe salvas!");
      },
    }),
  );

  return {
    config,
    isLoading,
    saveConfig: (newConfig: any) =>
      saveConfigMutation.mutate({ appId, config: newConfig }),
    isSaving: saveConfigMutation.isPending,
  };
}
```

### **Hook para Configurações de Usuário**

```typescript
// hooks/useUserAppTeamConfig.ts
export function useUserAppTeamConfig(appId: AppIdsWithUserAppTeamConfig) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery(
    trpc.app.getUserAppTeamConfig.queryOptions({ appId }),
  );

  const saveConfigMutation = useMutation(
    trpc.app.saveUserAppTeamConfig.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.getUserAppTeamConfig.pathFilter({ appId }),
        );
        toast.success("Suas configurações foram salvas!");
      },
    }),
  );

  return {
    config,
    isLoading,
    saveConfig: (newConfig: any) =>
      saveConfigMutation.mutate({ appId, config: newConfig }),
    isSaving: saveConfigMutation.isPending,
  };
}
```

### **Formulário de Configurações**

```typescript
// Exemplo baseado no Kodix Care
export function MinhasConfiguracoes() {
  const { config, saveConfig, isSaving } = useUserAppTeamConfig(meuAppId);

  const form = useForm({
    schema: ZSaveUserAppTeamConfigInputSchema,
    defaultValues: {
      appId: meuAppId,
      config: config || {}
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(saveConfig)}>
        <FormField
          control={form.control}
          name="config.personalSettings.enableNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Notificações</FormLabel>
                <FormDescription>
                  Receber notificações do app
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" loading={isSaving}>
          Salvar Configurações
        </Button>
      </form>
    </Form>
  );
}
```

---

## 🚀 Guia de Implementação

### **Para Configurações de Time**

1. **Definir Schema** em `packages/shared/src/db.ts`
2. **Registrar no mapeamento** `appIdToAppTeamConfigSchema`
3. **Adicionar em** `AppIdsWithConfig`
4. **Criar página** de configurações para admins
5. **Usar hook** `useAppTeamConfig`

### **Para Configurações de Usuário**

1. **Definir Schema** em `packages/shared/src/db.ts`
2. **Registrar no mapeamento** `appIdToUserAppTeamConfigSchema`
3. **Adicionar em** `AppIdsWithUserAppTeamConfig`
4. **Atualizar validadores** em `packages/validators/src/trpc/app/index.ts`
5. **Criar página** de configurações pessoais
6. **Usar hook** `useUserAppTeamConfig`

### **Checklist de Validação**

- [ ] Schema definido e validado
- [ ] Mapeamentos atualizados
- [ ] Types exportados corretamente
- [ ] APIs funcionando (getConfig/saveConfig)
- [ ] Interface de usuário implementada
- [ ] Hooks criados e testados
- [ ] Isolamento por team funcionando
- [ ] Validação de permissões (owner para configs de time)

---

## 🔒 Segurança e Isolamento

### **Isolamento Automático**

- ✅ **Por Team**: Cada `teamId` tem configurações isoladas
- ✅ **Por App**: Cada `appId` tem seu próprio namespace
- ✅ **Por Usuário**: Configurações pessoais isoladas por `userId`

### **Validação de Permissões**

- ✅ **Middleware**: `appInstalledMiddleware` verifica se app está instalado
- ✅ **Schemas Zod**: Validação automática de entrada
- ✅ **Context**: `ctx.auth.user.activeTeamId` garante isolamento

### **Exemplo de Middleware**

```typescript
// Middleware aplicado automaticamente
export const appInstalledMiddleware = t.middleware(
  async ({ ctx, next, rawInput }) => {
    const { appId } = rawInput as { appId: string };

    const isInstalled = await appRepository.isAppInstalledInTeam({
      appId,
      teamId: ctx.auth.user.activeTeamId,
    });

    if (!isInstalled) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `App ${appId} não está instalado nesta equipe`,
      });
    }

    return next({ ctx });
  },
);
```

---

## 📋 Comparação de Status

| App            | Configurações de Time | Configurações de Usuário |
| -------------- | --------------------- | ------------------------ |
| **Kodix Care** | ✅ Implementado       | ✅ **Implementado**      |
| **Chat**       | ✅ Implementado       | ❌ Só schema, sem UI     |
| **Calendar**   | ❌ Não implementado   | ❌ Não implementado      |
| **Todo**       | ❌ Não implementado   | ❌ Não implementado      |
| **AI Studio**  | ❌ Não implementado   | ❌ Não implementado      |

---

## 📚 Recursos Relacionados

- **[SubApp Architecture](./subapp-architecture.md)** - Arquitetura geral de SubApps
- **[Database Schema Reference](../database/schema-reference.md)** - Schemas completos
- **[Backend Guide](./backend-guide.md)** - Implementação de APIs tRPC
- **[Frontend Guide](./frontend-guide.md)** - Desenvolvimento de interfaces

---

_Este sistema é a base para personalização flexível de qualquer SubApp no Kodix. Para dúvidas ou implementação, consulte os exemplos práticos do Kodix Care e Chat._
