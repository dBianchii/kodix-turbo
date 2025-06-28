# Roadmap de Padronização do Sistema de Configurações

**Data:** 2025-06-28  
**Autor:** KodixAgent  
**Status:** 📋 Proposta de Implementação  
**Relacionado a:**

- [Configuration Model](../architecture/configuration-model.md)
- [Critical Analysis Core Engine](./critical-analysis-and-evolution.md)

---

## 📋 Sumário Executivo

Este documento propõe um roadmap para unificar e padronizar o sistema de configurações do Kodix, integrando o modelo hierárquico de 3 níveis com o futuro Core Engine. O objetivo é criar um sistema coeso que elimine a fragmentação atual e forneça uma API consistente para todos os SubApps.

---

## 🎯 Visão Unificada: Configuration as a Service

### Estado Atual vs. Estado Desejado

```typescript
// ❌ ATUAL: Fragmentado e inconsistente
// Nível 1 - Plataforma: Hardcoded em arquivos config.ts dispersos
// Nível 2 - Time: Via appTeamConfig (DB)
// Nível 3 - Usuário: Via userAppTeamConfig (DB)
// Sem merge automático ou API unificada

// ✅ FUTURO: Unificado via Core Engine
const config = await CoreEngine.config.get({
  appId: "chat_app_456",
  teamId: ctx.user.activeTeamId,
  userId: ctx.user.id, // opcional
});
// Retorna configuração mesclada automaticamente
```

---

## 🏗️ Arquitetura Proposta

### 1. **ConfigurationService no Core Engine**

```typescript
// packages/core-engine/src/configuration/configuration.service.ts
export class ConfigurationService {
  private platformConfigs: Map<string, any>;
  private cache: ConfigCache;

  constructor(private context: CoreContext) {
    this.platformConfigs = new Map();
    this.cache = new ConfigCache(context.cache);
    this.loadPlatformConfigs();
  }

  // API Principal - Get mesclado
  async get<T = any>(params: {
    appId: string;
    teamId: string;
    userId?: string;
    options?: ConfigOptions;
  }): Promise<T> {
    const { appId, teamId, userId, options } = params;

    // Check cache first
    const cacheKey = this.getCacheKey(appId, teamId, userId);
    if (!options?.skipCache) {
      const cached = await this.cache.get<T>(cacheKey);
      if (cached) return cached;
    }

    // Build merged config
    const merged = await this.buildMergedConfig(appId, teamId, userId);

    // Cache result
    await this.cache.set(cacheKey, merged, options?.ttl);

    return merged as T;
  }

  // API - Set (detecta nível automaticamente)
  async set(params: {
    appId: string;
    teamId: string;
    userId?: string;
    config: any;
    partial?: boolean;
  }): Promise<void> {
    const { appId, teamId, userId, config, partial = true } = params;

    if (userId) {
      // Configuração de usuário
      await this.setUserConfig(appId, teamId, userId, config, partial);
    } else {
      // Configuração de time (requer permissão)
      await this.setTeamConfig(appId, teamId, config, partial);
    }

    // Invalidate cache
    await this.cache.invalidate(this.getCacheKey(appId, teamId, userId));
  }

  // Método privado - Merge hierárquico
  private async buildMergedConfig(
    appId: string,
    teamId: string,
    userId?: string,
  ): Promise<any> {
    // 1. Platform config (base)
    const platformConfig = this.getPlatformConfig(appId) || {};

    // 2. Team config
    const teamConfig = (await this.getTeamConfig(appId, teamId)) || {};

    // 3. User config (if applicable)
    const userConfig = userId
      ? (await this.getUserConfig(appId, teamId, userId)) || {}
      : {};

    // 4. Deep merge with precedence: User > Team > Platform
    return deepMerge(platformConfig, teamConfig, userConfig);
  }
}
```

### 2. **Registro Centralizado de Configurações de Plataforma**

```typescript
// packages/core-engine/src/configuration/platform-configs/index.ts
export const platformConfigs = {
  // Chat App
  [chatAppId]: {
    ai: {
      defaultModel: "gpt-4o-mini",
      maxTokens: 2000,
      temperature: 0.7,
      streamingEnabled: true,
    },
    ui: {
      theme: "light",
      showModelSelector: true,
      enableMarkdown: true,
    },
    features: {
      voiceInput: false,
      codeHighlighting: true,
      exportChat: true,
    },
  },

  // AI Studio
  [aiStudioAppId]: {
    providers: {
      enabledByDefault: ["openai", "anthropic"],
      allowCustomEndpoints: false,
    },
    agents: {
      maxPerTeam: 10,
      allowSharing: true,
    },
  },

  // Calendar
  [calendarAppId]: {
    display: {
      defaultView: "month",
      weekStartsOn: 0, // Sunday
      timeFormat: "24h",
    },
    features: {
      recurringEvents: true,
      reminders: true,
      teamCalendar: true,
    },
  },
};
```

### 3. **Migração dos Hooks Existentes**

```typescript
// packages/ui/src/hooks/use-config.ts
import { useMutation, useQuery } from "@tanstack/react-query";

import { CoreEngine } from "@kdx/core-engine";

// Hook unificado para qualquer nível
export function useConfig(
  appId: string,
  options?: {
    includeUser?: boolean;
    skipCache?: boolean;
  },
) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: [
      "config",
      appId,
      user.activeTeamId,
      options?.includeUser ? user.id : null,
    ],
    queryFn: () =>
      CoreEngine.config.get({
        appId,
        teamId: user.activeTeamId,
        userId: options?.includeUser ? user.id : undefined,
        options: { skipCache: options?.skipCache },
      }),
  });

  const mutation = useMutation({
    mutationFn: (config: any) =>
      CoreEngine.config.set({
        appId,
        teamId: user.activeTeamId,
        userId: options?.includeUser ? user.id : undefined,
        config,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["config", appId]);
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateConfig: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

// Retrocompatibilidade
export function useAppTeamConfig(appId: string) {
  return useConfig(appId, { includeUser: false });
}

export function useUserAppTeamConfig(appId: string) {
  return useConfig(appId, { includeUser: true });
}
```

---

## 📊 Plano de Migração

### Fase 1: Preparação (1 semana)

#### 1.1 Criar ConfigurationService no Core Engine

```bash
✅ Implementar classe ConfigurationService
✅ Criar sistema de cache
✅ Implementar deep merge
✅ Adicionar testes unitários
```

#### 1.2 Migrar Configurações de Plataforma

```bash
✅ Auditar todos os config.ts dispersos
✅ Centralizar em platform-configs/
✅ Validar com schemas Zod
✅ Documentar cada configuração
```

### Fase 2: Implementação (2 semanas)

#### 2.1 Integração com Banco de Dados

```typescript
// Adapter para repositórios existentes
class ConfigRepositoryAdapter {
  async getTeamConfig(appId: string, teamId: string) {
    const [config] = await appRepository.findAppTeamConfigs({
      appId,
      teamIds: [teamId],
    });
    return config?.config;
  }

  async getUserConfig(appId: string, teamId: string, userId: string) {
    const [config] = await appRepository.findUserAppTeamConfigs({
      appId,
      teamIds: [teamId],
      userIds: [userId],
    });
    return config?.config;
  }
}
```

#### 2.2 Migração dos SubApps

**Ordem de Migração:**

1. **Chat** (já tem configurações parciais)
2. **AI Studio** (crítico para o Chat)
3. **Calendar** (sem configurações ainda)
4. **Todo** (mais simples)
5. **Kodix Care** (mais complexo)

### Fase 3: Otimização (1 semana)

#### 3.1 Sistema de Cache Inteligente

```typescript
class ConfigCache {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}
```

#### 3.2 Observabilidade

```typescript
// Métricas e logs
class ConfigurationService {
  async get(params) {
    const start = Date.now();
    try {
      const result = await this._get(params);

      // Metrics
      metrics.increment("config.get.success", {
        app: params.appId,
        cached: !!cached,
      });

      // Performance
      metrics.histogram("config.get.duration", Date.now() - start);

      return result;
    } catch (error) {
      metrics.increment("config.get.error", {
        app: params.appId,
        error: error.code,
      });
      throw error;
    }
  }
}
```

---

## 🎯 Benefícios da Padronização

### 1. **Developer Experience**

- API única e consistente
- Autocomplete com TypeScript
- Menos decisões sobre onde/como salvar configs

### 2. **Performance**

- Cache inteligente por níveis
- Menos queries ao banco
- Merge otimizado

### 3. **Manutenibilidade**

- Configurações de plataforma versionadas
- Fácil adicionar novos SubApps
- Testes centralizados

### 4. **Flexibilidade**

- Fácil adicionar novos níveis (ex: "Workspace")
- Suporte a feature flags
- Configurações temporárias

---

## 📋 Checklist de Implementação

### Para Desenvolvedores

- [ ] Toda configuração de plataforma está em `platform-configs/`
- [ ] Usar `CoreEngine.config.get()` em vez de acessos diretos
- [ ] Schemas Zod para validação de tipos
- [ ] Documentar cada configuração nova
- [ ] Testes para merge de configurações

### Para Revisores

- [ ] Verificar se não há config.ts dispersos
- [ ] Confirmar uso da API unificada
- [ ] Validar cache strategy
- [ ] Checar retrocompatibilidade

---

## 🚀 Próximos Passos

1. **Validar com equipe** a arquitetura proposta
2. **Criar POC** com o Chat App
3. **Definir schemas** TypeScript/Zod para cada app
4. **Implementar ConfigurationService** no Core Engine
5. **Migrar gradualmente** cada SubApp

---

## 📊 Métricas de Sucesso

- **Redução de código**: -60% em lógica de configuração
- **Performance**: 80% das configs servidas do cache
- **Consistência**: 100% dos SubApps usando API unificada
- **Satisfação**: Desenvolvedores reportam facilidade de uso

---

**Este roadmap transforma o sistema de configurações fragmentado em um serviço unificado, escalável e maintível, alinhado com a visão do Core Engine.**
