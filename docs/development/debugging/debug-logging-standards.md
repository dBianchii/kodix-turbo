<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: advanced
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Padrões de Debug e Logging - Kodix

## 📖 Visão Geral

Este documento estabelece os **padrões oficiais de debug e logging** para todo o projeto Kodix, facilitando a filtragem e debugging através de prefixos únicos por módulo.

## 🎯 **Sistema de Prefixos por Módulo**

### **Princípio Fundamental**

Cada módulo/funcionalidade tem seu **prefixo único** que permite filtragem fácil no console do browser e logs do terminal.

**Formato padrão:**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
console.log("[PREFIXO_MODULO] Mensagem de debug");
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📋 **Lista de Prefixos Oficiais**

### **🚀 SubApps**

| SubApp         | Prefixo       | Exemplo de Uso                            |
| -------------- | ------------- | ----------------------------------------- |
| **Chat**       | `[CHAT_`      | `[CHAT_WINDOW]`, `[CHAT_SESSION]`         |
| **AI Studio**  | `[AI_STUDIO_` | `[AI_STUDIO_MODEL]`, `[AI_STUDIO_CONFIG]` |
| **Calendar**   | `[CALENDAR_`  | `[CALENDAR_EVENT]`, `[CALENDAR_SYNC]`     |
| **Todo**       | `[TODO_`      | `[TODO_TASK]`, `[TODO_LIST]`              |
| **Kodix Care** | `[CARE_`      | `[CARE_TASK]`, `[CARE_PATIENT]`           |
| **Cupom**      | `[CUPOM_`     | `[CUPOM_VALIDATE]`, `[CUPOM_APPLY]`       |

### **🔧 Sistemas Core**

| Sistema        | Prefixo  | Exemplo de Uso                              |
| -------------- | -------- | ------------------------------------------- |
| **tRPC**       | `[TRPC]` | `[TRPC] app.chat.listarSessions took 234ms` |
| **Auth**       | `[AUTH_` | `[AUTH_LOGIN]`, `[AUTH_MIDDLEWARE]`         |
| **Database**   | `[DB_`   | `[DB_QUERY]`, `[DB_MIGRATION]`              |
| **API**        | `[API_`  | `[API_ENDPOINT]`, `[API_ERROR]`             |
| **Navigation** | `[NAV_`  | `[NAV_ROUTER]`, `[NAV_REDIRECT]`            |

### **🎨 Frontend**

| Componente     | Prefixo   | Exemplo de Uso                         |
| -------------- | --------- | -------------------------------------- |
| **Components** | `[UI_`    | `[UI_MODAL]`, `[UI_FORM]`              |
| **Hooks**      | `[HOOK_`  | `[HOOK_USER_CONFIG]`, `[HOOK_SESSION]` |
| **State**      | `[STATE_` | `[STATE_UPDATE]`, `[STATE_SYNC]`       |

### **🔄 Integrações**

| Integração        | Prefixo     | Exemplo de Uso                              |
| ----------------- | ----------- | ------------------------------------------- |
| **Service Layer** | `[SERVICE_` | `[SERVICE_AI_STUDIO]`, `[SERVICE_CALENDAR]` |
| **External APIs** | `[EXT_`     | `[EXT_OPENAI]`, `[EXT_ANTHROPIC]`           |
| **Webhooks**      | `[WEBHOOK_` | `[WEBHOOK_RECEIVED]`, `[WEBHOOK_PROCESS]`   |

## 🛠️ **Utilitários de Logging**

### **Logger Centralizado**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/shared/src/logger.ts
type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
type ModulePrefix =
  | "CHAT_"
  | "AI_STUDIO_"
  | "CALENDAR_"
  | "TODO_"
  | "CARE_"
  | "CUPOM_"
  | "TRPC"
  | "AUTH_"
  | "DB_"
  | "API_"
  | "NAV_"
  | "UI_"
  | "HOOK_"
  | "STATE_"
  | "SERVICE_"
  | "EXT_"
  | "WEBHOOK_";

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  modules: ModulePrefix[];
}

class KodixLogger {
  private config: LogConfig;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === "development",
      level: "DEBUG",
      modules: [], // Empty = log all modules
    };
  }

  private shouldLog(module: ModulePrefix, level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    // Check if module is allowed (empty array = all modules)
    if (
      this.config.modules.length > 0 &&
      !this.config.modules.includes(module)
    ) {
      return false;
    }

    // Check log level hierarchy
    const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  debug(module: ModulePrefix, submodule: string, message: string, data?: any) {
    if (!this.shouldLog(module, "DEBUG")) return;

    const prefix = `[${module}${submodule}]`;
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  info(module: ModulePrefix, submodule: string, message: string, data?: any) {
    if (!this.shouldLog(module, "INFO")) return;

    const prefix = `[${module}${submodule}]`;
    if (data) {
      console.info(`${prefix} ${message}`, data);
    } else {
      console.info(`${prefix} ${message}`);
    }
  }

  warn(module: ModulePrefix, submodule: string, message: string, data?: any) {
    if (!this.shouldLog(module, "WARN")) return;

    const prefix = `[${module}${submodule}]`;
    if (data) {
      console.warn(`${prefix} ${message}`, data);
    } else {
      console.warn(`${prefix} ${message}`);
    }
  }

  error(module: ModulePrefix, submodule: string, message: string, error?: any) {
    if (!this.shouldLog(module, "ERROR")) return;

    const prefix = `[${module}${submodule}]`;
    if (error) {
      console.error(`${prefix} ${message}`, error);
    } else {
      console.error(`${prefix} ${message}`);
    }
  }

  // Configuração dinâmica
  configure(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Ativar apenas módulos específicos
  enableModules(modules: ModulePrefix[]) {
    this.config.modules = modules;
  }

  // Desativar logging
  disable() {
    this.config.enabled = false;
  }
}

export const logger = new KodixLogger();

// Exports de conveniência
export const chatLogger = {
  debug: (submodule: string, message: string, data?: any) =>
    logger.debug("CHAT_", submodule, message, data),
  info: (submodule: string, message: string, data?: any) =>
    logger.info("CHAT_", submodule, message, data),
  warn: (submodule: string, message: string, data?: any) =>
    logger.warn("CHAT_", submodule, message, data),
  error: (submodule: string, message: string, error?: any) =>
    logger.error("CHAT_", submodule, message, error),
};

export const aiStudioLogger = {
  debug: (submodule: string, message: string, data?: any) =>
    logger.debug("AI_STUDIO_", submodule, message, data),
  info: (submodule: string, message: string, data?: any) =>
    logger.info("AI_STUDIO_", submodule, message, data),
  warn: (submodule: string, message: string, data?: any) =>
    logger.warn("AI_STUDIO_", submodule, message, data),
  error: (submodule: string, message: string, error?: any) =>
    logger.error("AI_STUDIO_", submodule, message, error),
};

export const navLogger = {
  debug: (submodule: string, message: string, data?: any) =>
    logger.debug("NAV_", submodule, message, data),
  info: (submodule: string, message: string, data?: any) =>
    logger.info("NAV_", submodule, message, data),
  warn: (submodule: string, message: string, data?: any) =>
    logger.warn("NAV_", submodule, message, data),
  error: (submodule: string, message: string, error?: any) =>
    logger.error("NAV_", submodule, message, error),
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Hooks de Logging**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/shared/src/hooks/useLogger.ts
import { useCallback } from "react";

import type { ModulePrefix } from "../logger";
import { env } from "~/env";
import { logger } from "../logger";

export function useLogger(module: ModulePrefix) {
  const debug = useCallback(
    (submodule: string, message: string, data?: any) => {
      logger.debug(module, submodule, message, data);
    },
    [module],
  );

  const info = useCallback(
    (submodule: string, message: string, data?: any) => {
      logger.info(module, submodule, message, data);
    },
    [module],
  );

  const warn = useCallback(
    (submodule: string, message: string, data?: any) => {
      logger.warn(module, submodule, message, data);
    },
    [module],
  );

  const error = useCallback(
    (submodule: string, message: string, error?: any) => {
      logger.error(module, submodule, message, error);
    },
    [module],
  );

  return { debug, info, warn, error };
}

// Hook específico para Chat
export function useChatLogger() {
  return useLogger("CHAT_");
}

// Hook específico para AI Studio
export function useAiStudioLogger() {
  return useLogger("AI_STUDIO_");
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎯 **Regras de Implementação**

### **✅ Padrões OBRIGATÓRIOS**

1. **Sempre usar prefixos** em todos os logs de debug
2. **Manter consistência** de nomenclatura por módulo
3. **Logs condicionais** apenas em desenvolvimento (produção limpa)
4. **Estrutura hierárquica** `[MODULO_SUBMODULO]`

### **📋 Template de Logging**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CORRETO - Estrutura padrão
console.log("[CHAT_WINDOW] Iniciando renderização da janela");
console.log("[CHAT_SESSION] Carregando sessão:", sessionId);
console.log("[CHAT_MESSAGE] Nova mensagem recebida:", message);

// ✅ CORRETO - Com dados
console.log("[AI_STUDIO_MODEL] Modelo selecionado:", { modelId, teamId });

// ✅ CORRETO - Logs de erro
console.error("[CHAT_API] Erro ao carregar mensagens:", error);

// ❌ INCORRETO - Sem prefixo
console.log("Iniciando renderização da janela");

// ❌ INCORRETO - Prefixo inconsistente
console.log("[Chat] Mensagem"); // Deveria ser [CHAT_WINDOW]
console.log("[chat_window]"); // Deveria ser maiúsculo
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🔧 Implementação por Ambiente**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CORRETO - Usando logger centralizado
import { chatLogger } from "@kdx/shared/logger";

import { env } from "~/env";

// ✅ CORRETO - Logs condicionais por ambiente
const isDev = env.NODE_ENV === "development";

if (isDev) {
  console.log("[CHAT_WINDOW] Debug info");
}

chatLogger.debug("WINDOW", "Iniciando renderização");
// Automaticamente só roda em development
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔍 **Guia de Filtragem**

### **No Console do Browser**

#### **Filtrar por Módulo Específico**

```javascript
// Ver apenas logs do Chat
// No console do browser, digite:
[CHAT_

// Ver apenas logs do AI Studio
[AI_STUDIO_

// Ver apenas logs de navegação
[NAV_

// Ver apenas logs de tRPC
[TRPC]
```

#### **Filtrar por Submódulo**

```javascript
// Ver apenas logs da janela do chat
// Ver apenas logs de configuração
// Ver apenas logs de sessão do chat
[CHAT_WINDOW][CHAT_SESSION][CHAT_USER_CONFIG];
```

#### **Filtros Combinados**

```javascript
// Ver Chat OU AI Studio
[CHAT_|[AI_STUDIO_

// Ver apenas erros (qualquer módulo)
ERROR

// Ver performance de tRPC
took.*ms
```

### **No Terminal/Logs do Servidor**

#### **Usando grep**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Ver apenas logs do Chat
pnpm dev:kdx | grep "\[CHAT_"

# Ver apenas logs de tRPC
pnpm dev:kdx | grep "\[TRPC\]"

# Ver apenas logs de erro
pnpm dev:kdx | grep "ERROR"

# Ver logs de performance
pnpm dev:kdx | grep "took.*ms"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **Filtros Avançados**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Ver Chat e AI Studio
pnpm dev:kdx | grep -E "\[CHAT_|\[AI_STUDIO_"

# Ver apenas logs de sessão (qualquer módulo)
pnpm dev:kdx | grep "SESSION"

# Ver logs com dados específicos
pnpm dev:kdx | grep "teamId"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Configuração Dinâmica no Browser**

```javascript
// No console do browser, configurar logging:

// Ativar apenas Chat
window.kodixLogger?.enableModules(["CHAT_"]);

// Ativar apenas erros
window.kodixLogger?.configure({ level: "ERROR" });

// Desativar todos os logs
window.kodixLogger?.disable();

// Reativar todos
window.kodixLogger?.configure({ enabled: true, level: "DEBUG", modules: [] });
```

## 📊 **Exemplos Práticos por Módulo**

### **Chat SubApp**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/chat-window.tsx
import { chatLogger } from "@kdx/shared/logger";

export function ChatWindow() {
  useEffect(() => {
    chatLogger.debug("WINDOW", "Componente montado");
    chatLogger.info("WINDOW", "Carregando configurações de usuário");
  }, []);

  const handleSendMessage = (message: string) => {
    chatLogger.debug("WINDOW", "Enviando mensagem:", { message, sessionId });
  };

  const handleError = (error: Error) => {
    chatLogger.error("WINDOW", "Erro no componente:", error);
  };
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **AI Studio Service**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/api/src/internal/services/ai-studio.service.ts
import { aiStudioLogger } from "@kdx/shared/logger";

export class AiStudioService {
  static async getModelById({ modelId, teamId, requestingApp }) {
    aiStudioLogger.debug("SERVICE", "Buscando modelo:", { modelId, teamId });

    const model = await repository.findById(modelId);

    if (!model) {
      aiStudioLogger.warn("SERVICE", "Modelo não encontrado:", modelId);
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    aiStudioLogger.info(
      "SERVICE",
      "Modelo encontrado com sucesso:",
      model.name,
    );
    return model;
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Navigation**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/hooks/useNavigation.ts
import { navLogger } from "@kdx/shared/logger";

export function useNavigation() {
  const router = useRouter();

  const navigateToSession = (sessionId: string) => {
    const targetUrl = `/apps/chat/${sessionId}`;

    navLogger.debug("ROUTER", "Navegando para sessão:", {
      sessionId,
      targetUrl,
    });
    router.push(targetUrl);

    // Verificar navegação
    setTimeout(() => {
      const currentPath = window.location.pathname;
      if (currentPath.includes(sessionId)) {
        navLogger.info("ROUTER", "Navegação bem-sucedida");
      } else {
        navLogger.warn("ROUTER", "Possível falha na navegação:", {
          expected: targetUrl,
          actual: currentPath,
        });
      }
    }, 100);
  };
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎛️ **Configuração por Ambiente**

### **Development (.env.local)**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Ativar todos os logs em desenvolvimento
KODIX_LOG_ENABLED=true
KODIX_LOG_LEVEL=DEBUG
KODIX_LOG_MODULES=all

# Ou ativar apenas módulos específicos
KODIX_LOG_MODULES=CHAT_,AI_STUDIO_,NAV_
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Production (.env.production)**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Apenas erros em produção
KODIX_LOG_ENABLED=true
KODIX_LOG_LEVEL=ERROR
KODIX_LOG_MODULES=all
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Testing (.env.test)**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Logs mínimos em testes
KODIX_LOG_ENABLED=false
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📋 **Checklist de Implementação**

### **Para Novos Módulos**

- [ ] **Prefixo único** definido e documentado
- [ ] **Logger específico** criado em `@kdx/shared/logger`
- [ ] **Logs implementados** em pontos críticos
- [ ] **Filtragem testada** no browser e terminal
- [ ] **Documentação atualizada** neste arquivo

### **Para Refatoração de Logs Existentes**

- [ ] **Prefixos aplicados** em todos os logs
- [ ] **Logs condicionais** por ambiente
- [ ] **Logger centralizado** usado em vez de `console.log` direto
- [ ] **Testes de filtragem** realizados

## 🚀 **Migração de Logs Existentes**

### **Chat SubApp (Já Implementado)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ JÁ MIGRADO - Exemplo atual do Chat
console.log("[CHAT_WINDOW] Inicializando componente");
console.log("[CHAT_SESSION] Carregando sessão:", sessionId);
console.log("[CHAT_USER_CONFIG] Configuração carregada:", config);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Outros Módulos (Pendentes)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// 🔄 PENDENTE - AI Studio
console.log("Model loaded"); // ❌
console.log("[AI_STUDIO_MODEL] Model loaded"); // ✅

// 🔄 PENDENTE - Navigation
console.log("Navigating to:", url); // ❌
console.log("[NAV_ROUTER] Navigating to:", url); // ✅

// 🔄 PENDENTE - Database
console.log("Query executed"); // ❌
console.log("[DB_QUERY] Query executed"); // ✅
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🎯 **Palavra de Filtro Principal**

### **Para Console do Browser:**

Digite `[` no filtro do console para ver todos os logs padronizados do Kodix.

### **Para Terminal:**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
pnpm dev:kdx | grep "\["
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Filtros Específicos mais Usados:**

- **Chat**: `[CHAT_`
- **AI Studio**: `[AI_STUDIO_`
- **tRPC**: `[TRPC]`
- **Navegação**: `[NAV_`
- **Erros**: `ERROR`
- **Performance**: `took.*ms`

---

**Última Atualização:** 2024-12-21  
**Próxima Revisão:** 2025-01-21  
**Status:** ✅ Chat implementado, 🔄 Outros módulos pendentes

<!-- AI-CONTEXT-BOUNDARY: end -->
