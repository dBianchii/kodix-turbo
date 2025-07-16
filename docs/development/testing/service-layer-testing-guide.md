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

# 🔧 Service Layer Testing Guide - Kodix

## 📖 Visão Geral

Este guia detalha as **melhores práticas** para testar a camada de Service Layer no Kodix, que é responsável pela **comunicação segura entre SubApps** mantendo isolamento por team e type safety.

## 🎯 Por que Testar Service Layer?

### Importância Crítica

1. **Ponto Central de Integração**: Todo SubApp depende dele
2. **Segurança**: Validação de `teamId` e permissões
3. **Contratos de API**: Garantir compatibilidade
4. **Performance**: Identificar gargalos cedo

### O que Testar

- ✅ **Validação de Parâmetros** (teamId obrigatório)
- ✅ **Isolamento de Dados** (team boundaries)
- ✅ **Tratamento de Erros** (casos edge)
- ✅ **Contratos de Interface** (tipos TypeScript)
- ✅ **Logging e Auditoria** (rastreabilidade)

## 🏗️ Estrutura de Testes

```
packages/api/src/
├── __tests__/
│   └── services/
│       ├── ai-studio.service.test.ts
│       ├── calendar.service.test.ts
│       ├── kodix-care.service.test.ts
│       └── base.service.test.ts
├── internal/
│   └── services/
│       ├── __mocks__/
│       │   └── repositories.ts
│       └── test-utils.ts
```

## 📋 Padrões de Teste por Service

### 1. **Teste Base do Service**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// __tests__/services/base.service.test.ts
import { TRPCError } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";

import { BaseService } from "@kdx/api/internal/services/base.service";

class TestService extends BaseService {
  static testValidation(teamId: string) {
    return this.validateTeamAccess(teamId);
  }

  static testLogging(action: string, context: any) {
    return this.logAccess(action, context);
  }
}

describe("BaseService", () => {
  describe("validateTeamAccess", () => {
    it("should throw error when teamId is missing", () => {
      expect(() => TestService.testValidation("")).toThrow(TRPCError);
      expect(() => TestService.testValidation(null as any)).toThrow(TRPCError);
      expect(() => TestService.testValidation(undefined as any)).toThrow(
        TRPCError,
      );
    });

    it("should pass validation with valid teamId", () => {
      expect(() => TestService.testValidation("team-123")).not.toThrow();
    });

    it("should have correct error code", () => {
      try {
        TestService.testValidation("");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect(error.code).toBe("BAD_REQUEST");
        expect(error.message).toContain("teamId is required");
      }
    });
  });

  describe("logAccess", () => {
    it("should log access with correct format", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation();

      TestService.testLogging("testAction", {
        teamId: "team-123",
        requestingApp: "chat",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "🔄 [TestService] testAction by chat for team: team-123",
        ),
      );

      consoleSpy.mockRestore();
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. **Teste do AiStudioService**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// __tests__/services/ai-studio.service.test.ts
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiStudioService } from "@kdx/api/internal/services/ai-studio.service";
import { aiStudioRepository } from "@kdx/db/repositories";
import { aiStudioAppId, chatAppId } from "@kdx/shared";

// Mock dos repositórios
vi.mock("@kdx/db/repositories", () => ({
  aiStudioRepository: {
    AiModelRepository: {
      findById: vi.fn(),
      findByTeam: vi.fn(),
    },
    AiTeamModelConfigRepository: {
      findAvailableModelsByTeam: vi.fn(),
      findDefaultModel: vi.fn(),
    },
    AiProviderRepository: {
      findById: vi.fn(),
    },
  },
}));

describe("AiStudioService", () => {
  const mockTeamId = "team-123";
  const mockModelId = "model-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getModelById", () => {
    it("should return model when found and belongs to team", async () => {
      const mockModel = {
        id: mockModelId,
        name: "GPT-4",
        teamId: mockTeamId,
        providerId: "openai",
      };

      vi.mocked(
        aiStudioRepository.AiModelRepository.findById,
      ).mockResolvedValue(mockModel);

      const result = await AiStudioService.getModelById({
        modelId: mockModelId,
        teamId: mockTeamId,
        requestingApp: chatAppId,
      });

      expect(result).toEqual(mockModel);
      expect(
        aiStudioRepository.AiModelRepository.findById,
      ).toHaveBeenCalledWith(mockModelId);
    });

    it("should throw NOT_FOUND when model does not exist", async () => {
      vi.mocked(
        aiStudioRepository.AiModelRepository.findById,
      ).mockResolvedValue(null);

      await expect(
        AiStudioService.getModelById({
          modelId: mockModelId,
          teamId: mockTeamId,
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow(TRPCError);
    });

    it("should throw NOT_FOUND when model belongs to different team", async () => {
      const mockModel = {
        id: mockModelId,
        name: "GPT-4",
        teamId: "different-team",
        providerId: "openai",
      };

      vi.mocked(
        aiStudioRepository.AiModelRepository.findById,
      ).mockResolvedValue(mockModel);

      await expect(
        AiStudioService.getModelById({
          modelId: mockModelId,
          teamId: mockTeamId,
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("Model not found or access denied");
    });

    it("should validate teamId parameter", async () => {
      await expect(
        AiStudioService.getModelById({
          modelId: mockModelId,
          teamId: "",
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("teamId is required");
    });

    it("should log access for audit", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation();
      const mockModel = {
        id: mockModelId,
        name: "GPT-4",
        teamId: mockTeamId,
        providerId: "openai",
      };

      vi.mocked(
        aiStudioRepository.AiModelRepository.findById,
      ).mockResolvedValue(mockModel);

      await AiStudioService.getModelById({
        modelId: mockModelId,
        teamId: mockTeamId,
        requestingApp: chatAppId,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `🔄 [AiStudioService] getModelById by ${chatAppId}`,
        ),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getAvailableModels", () => {
    it("should return enabled models for team", async () => {
      const mockModels = [
        { id: "gpt-4", name: "GPT-4", enabled: true },
        { id: "claude-3", name: "Claude 3", enabled: true },
      ];

      vi.mocked(
        aiStudioRepository.AiTeamModelConfigRepository
          .findAvailableModelsByTeam,
      ).mockResolvedValue(mockModels);

      const result = await AiStudioService.getAvailableModels({
        teamId: mockTeamId,
        requestingApp: chatAppId,
      });

      expect(result).toEqual(mockModels);
      expect(
        aiStudioRepository.AiTeamModelConfigRepository
          .findAvailableModelsByTeam,
      ).toHaveBeenCalledWith(mockTeamId);
    });

    it("should handle empty model list", async () => {
      vi.mocked(
        aiStudioRepository.AiTeamModelConfigRepository
          .findAvailableModelsByTeam,
      ).mockResolvedValue([]);

      const result = await AiStudioService.getAvailableModels({
        teamId: mockTeamId,
        requestingApp: chatAppId,
      });

      expect(result).toEqual([]);
    });
  });

  describe("getDefaultModel", () => {
    it("should return default model configuration", async () => {
      const mockDefaultModel = {
        model: {
          id: "gpt-4",
          name: "GPT-4",
          providerId: "openai",
        },
        config: {
          temperature: 0.7,
          maxTokens: 4000,
        },
      };

      vi.mocked(
        aiStudioRepository.AiTeamModelConfigRepository.findDefaultModel,
      ).mockResolvedValue(mockDefaultModel);

      const result = await AiStudioService.getDefaultModel({
        teamId: mockTeamId,
        requestingApp: chatAppId,
      });

      expect(result).toEqual(mockDefaultModel);
    });

    it("should throw when no default model configured", async () => {
      vi.mocked(
        aiStudioRepository.AiTeamModelConfigRepository.findDefaultModel,
      ).mockResolvedValue(null);

      await expect(
        AiStudioService.getDefaultModel({
          teamId: mockTeamId,
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("No default model configured");
    });
  });

  describe("getProviderToken", () => {
    it("should return decrypted token", async () => {
      const mockProvider = {
        id: "openai",
        name: "OpenAI",
        encryptedToken: "encrypted-token-data",
      };

      vi.mocked(
        aiStudioRepository.AiProviderRepository.findById,
      ).mockResolvedValue(mockProvider);

      // Mock do decrypt
      vi.mock("@kdx/db/utils/crypto", () => ({
        decrypt: vi.fn().mockReturnValue("sk-decrypted-token"),
      }));

      const result = await AiStudioService.getProviderToken({
        providerId: "openai",
        teamId: mockTeamId,
        requestingApp: chatAppId,
      });

      expect(result).toBe("sk-decrypted-token");
    });

    it("should throw when provider not found", async () => {
      vi.mocked(
        aiStudioRepository.AiProviderRepository.findById,
      ).mockResolvedValue(null);

      await expect(
        AiStudioService.getProviderToken({
          providerId: "invalid",
          teamId: mockTeamId,
          requestingApp: chatAppId,
        }),
      ).rejects.toThrow("Provider not found");
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. **Teste de Integração Cross-Service**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// __tests__/services/integration.test.ts
import { describe, expect, it, vi } from "vitest";

import { AiStudioService } from "@kdx/api/internal/services/ai-studio.service";
import { CalendarService } from "@kdx/api/internal/services/calendar.service";
import { chatAppId, kodixCareAppId } from "@kdx/shared";

describe("Service Layer Integration", () => {
  describe("Cross-App Communication", () => {
    it("Chat should access AI Studio models", async () => {
      const teamId = "team-123";

      // Mock AI Studio response
      vi.spyOn(AiStudioService, "getAvailableModels").mockResolvedValue([
        { id: "gpt-4", name: "GPT-4", enabled: true },
      ]);

      // Simular chamada do Chat
      const models = await AiStudioService.getAvailableModels({
        teamId,
        requestingApp: chatAppId,
      });

      expect(models).toHaveLength(1);
      expect(AiStudioService.getAvailableModels).toHaveBeenCalledWith({
        teamId,
        requestingApp: chatAppId,
      });
    });

    it("KodixCare should access Calendar tasks", async () => {
      const teamId = "team-123";
      const dateStart = new Date("2024-01-01");
      const dateEnd = new Date("2024-01-31");

      // Mock Calendar response
      vi.spyOn(CalendarService, "getTasksByDateRange").mockResolvedValue([
        {
          id: "task-1",
          title: "Medical Checkup",
          date: new Date("2024-01-15"),
          isCritical: true,
        },
      ]);

      // Simular chamada do KodixCare
      const tasks = await CalendarService.getTasksByDateRange({
        teamId,
        dateStart,
        dateEnd,
        onlyCritical: true,
        requestingApp: kodixCareAppId,
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].isCritical).toBe(true);
    });
  });

  describe("Error Propagation", () => {
    it("should propagate service errors correctly", async () => {
      const teamId = "team-123";

      vi.spyOn(AiStudioService, "getModelById").mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Model not found",
        }),
      );

      await expect(
        AiStudioService.getModelById({
          modelId: "invalid",
          teamId,
          requestingApp: chatAppId,
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Model not found",
      });
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 4. **Teste de Performance**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// __tests__/services/performance.test.ts
import { performance } from "perf_hooks";
import { describe, expect, it, vi } from "vitest";

import { AiStudioService } from "@kdx/api/internal/services/ai-studio.service";

describe("Service Layer Performance", () => {
  it("should complete operations within SLA", async () => {
    const iterations = 100;
    const maxLatency = 50; // ms

    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      await AiStudioService.getAvailableModels({
        teamId: "team-123",
        requestingApp: "chat",
      });

      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    expect(avgTime).toBeLessThan(maxLatency);
    expect(maxTime).toBeLessThan(maxLatency * 2);

    console.log(
      `Performance: avg=${avgTime.toFixed(2)}ms, max=${maxTime.toFixed(2)}ms`,
    );
  });

  it("should handle concurrent requests efficiently", async () => {
    const concurrentRequests = 50;
    const teamId = "team-123";

    const start = performance.now();

    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      AiStudioService.getAvailableModels({
        teamId,
        requestingApp: `app-${i}`,
      }),
    );

    await Promise.all(promises);

    const end = performance.now();
    const totalTime = end - start;

    // Should handle 50 concurrent requests in under 200ms
    expect(totalTime).toBeLessThan(200);
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎭 Estratégias de Mocking

### 1. **Mock de Repositórios**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// internal/services/__mocks__/repositories.ts
export const createMockRepository = () => ({
  findById: vi.fn(),
  findByTeam: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const mockAiStudioRepository = {
  AiModelRepository: createMockRepository(),
  AiProviderRepository: createMockRepository(),
  AiTeamModelConfigRepository: {
    ...createMockRepository(),
    findAvailableModelsByTeam: vi.fn(),
    findDefaultModel: vi.fn(),
  },
};

export const mockCalendarRepository = {
  CalendarTaskRepository: {
    ...createMockRepository(),
    findByDateRange: vi.fn(),
    findCriticalTasks: vi.fn(),
  },
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. **Test Utilities**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// internal/services/test-utils.ts
import { TRPCError } from "@trpc/server";

export const expectTRPCError = async (
  promise: Promise<any>,
  code: string,
  message?: string,
) => {
  try {
    await promise;
    throw new Error("Expected error but none was thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(TRPCError);
    expect(error.code).toBe(code);
    if (message) {
      expect(error.message).toContain(message);
    }
  }
};

export const createServiceContext = (overrides?: Partial<ServiceContext>) => ({
  teamId: "team-123",
  requestingApp: "test-app",
  userId: "user-456",
  ...overrides,
});

export const measureServicePerformance = async (
  fn: () => Promise<any>,
  maxLatency: number = 50,
) => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(maxLatency);

  return { result, duration };
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Métricas de Cobertura

### Requisitos Mínimos

| Aspecto         | Cobertura Mínima | Justificativa       |
| --------------- | ---------------- | ------------------- |
| **Validações**  | 100%             | Segurança crítica   |
| **Happy Path**  | 95%              | Funcionalidade core |
| **Error Cases** | 90%              | Robustez            |
| **Edge Cases**  | 80%              | Casos especiais     |
| **Performance** | 70%              | Monitoramento       |

### Comando de Cobertura

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Cobertura específica de services
pnpm test:coverage packages/api/src/__tests__/services

# Relatório detalhado
pnpm test:coverage:html
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 🔍 Debugging e Troubleshooting

### 1. **Logs de Debug**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Ativar logs detalhados durante testes
describe("Debug Service", () => {
  beforeAll(() => {
    process.env.DEBUG = "service:*";
  });

  afterAll(() => {
    delete process.env.DEBUG;
  });

  it("should show detailed logs", async () => {
    // Logs serão visíveis durante execução
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. **Snapshot Testing**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
describe("Service Contracts", () => {
  it("should maintain API contract", async () => {
    const result = await AiStudioService.getModelById({
      modelId: "test",
      teamId: "team-123",
      requestingApp: "chat",
    });

    expect(result).toMatchSnapshot({
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## ✅ Checklist de Testes Service Layer

- [ ] **Estrutura Base**

  - [ ] Testes para cada método público
  - [ ] Mocks de repositórios configurados
  - [ ] Test utilities criados

- [ ] **Validações**

  - [ ] TeamId obrigatório testado
  - [ ] Isolamento de dados verificado
  - [ ] Permissões validadas

- [ ] **Casos de Uso**

  - [ ] Happy path completo
  - [ ] Casos de erro comuns
  - [ ] Edge cases identificados

- [ ] **Integração**

  - [ ] Cross-service testado
  - [ ] Error propagation verificado
  - [ ] Logging/audit funcionando

- [ ] **Performance**

  - [ ] Latência medida
  - [ ] Concorrência testada
  - [ ] Memory leaks verificados

- [ ] **Documentação**
  - [ ] Contratos documentados
  - [ ] Exemplos de uso
  - [ ] Troubleshooting guide

---

**🚀 Com testes robustos no Service Layer, garantimos a confiabilidade da comunicação entre SubApps!**
