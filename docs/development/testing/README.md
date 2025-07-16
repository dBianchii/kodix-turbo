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

# 🧪 Arquitetura de Testes CI - Kodix Monorepo

## 📖 Visão Geral

Este documento define a **arquitetura completa de testes CI** para o monorepo Kodix, estabelecendo padrões, estrutura e melhores práticas para garantir qualidade, confiabilidade e manutenibilidade em escala.

## 🎯 Princípios Fundamentais

### 1. **Isolamento e Independência**

- Cada SubApp deve ter testes independentes
- Testes não devem depender de estado externo
- Mocks devem ser usados para isolar dependências

### 2. **Escalabilidade**

- Estrutura que suporta crescimento do monorepo
- Testes paralelos para performance
- Reutilização de configurações e utilitários

### 3. **Confiabilidade**

- Testes determinísticos (sem flakiness)
- Retry automático para testes de integração
- Tolerância a falhas esperadas (ex: banco de dados em CI)

### 4. **Observabilidade**

- Logs detalhados e estruturados
- Métricas de cobertura por SubApp
- Relatórios visuais de testes

## 🏗️ Estrutura de Diretórios

```
kodix-turbo/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Pipeline principal
│       ├── subapp-tests.yml          # Testes específicos de SubApps
│       └── integration-tests.yml     # Testes de integração cross-app
├── tests/                            # Testes globais do monorepo
│   ├── e2e/                          # Testes end-to-end
│   │   ├── auth/                     # Fluxos de autenticação
│   │   ├── subapps/                  # Testes E2E por SubApp
│   │   └── cross-app/                # Interações entre SubApps
│   ├── integration/                  # Testes de integração
│   │   ├── api/                      # Testes de API
│   │   ├── database/                 # Testes de banco
│   │   └── services/                 # Testes de Service Layer
│   ├── performance/                  # Testes de performance
│   │   ├── load/                     # Testes de carga
│   │   └── stress/                   # Testes de stress
│   └── utils/                        # Utilitários compartilhados
│       ├── test-helpers.ts           # Helpers reutilizáveis
│       ├── mock-factory.ts           # Factory de mocks
│       └── setup-files/              # Arquivos de setup
├── packages/
│   ├── api/
│   │   └── src/
│   │       └── __tests__/            # Testes unitários da API
│   │           ├── services/         # Testes de services
│   │           ├── trpc/             # Testes de routers
│   │           └── middlewares/      # Testes de middlewares
│   ├── db/
│   │   └── src/
│   │       └── __tests__/            # Testes de repositórios
│   └── ui/
│       └── src/
│           └── __tests__/            # Testes de componentes
├── apps/
│   └── kdx/
│       └── src/
│           └── app/
│               └── [locale]/
│                   └── (authed)/
│                       └── apps/
│                           ├── aiStudio/
│                           │   └── __tests__/    # Testes do AI Studio
│                           ├── chat/
│                           │   └── __tests__/    # Testes do Chat
│                           └── calendar/
│                               └── __tests__/    # Testes do Calendar
└── vitest.workspace.ts               # Configuração do workspace Vitest
```

## 📋 Tipos de Testes

### 1. **Testes Unitários**

- **Localização**: Junto ao código (`__tests__/` adjacente)
- **Escopo**: Funções, componentes e classes isoladas
- **Velocidade**: < 100ms por teste
- **Cobertura alvo**: > 80%

### 2. **Testes de Integração**

- **Localização**: `tests/integration/`
- **Escopo**: Interações entre módulos
- **Velocidade**: < 1s por teste
- **Foco**: Service Layer, APIs, Database

### 3. **Testes E2E**

- **Localização**: `tests/e2e/`
- **Escopo**: Fluxos completos de usuário
- **Velocidade**: < 30s por fluxo
- **Framework**: Playwright

### 4. **Testes de Performance**

- **Localização**: `tests/performance/`
- **Escopo**: Carga e stress do sistema
- **Métricas**: Latência, throughput, recursos

## 🔧 Configuração Base

### Vitest Workspace Configuration

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// vitest.workspace.ts
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // Configuração para testes unitários
  {
    test: {
      name: "unit",
      include: ["**/__tests__/**/*.test.ts"],
      exclude: ["**/e2e/**", "**/integration/**"],
      environment: "node",
      setupFiles: ["./tests/utils/setup-files/unit.setup.ts"],
    },
  },
  // Configuração para testes de integração
  {
    test: {
      name: "integration",
      include: ["tests/integration/**/*.test.ts"],
      environment: "node",
      setupFiles: ["./tests/utils/setup-files/integration.setup.ts"],
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  },
  // Configuração para SubApps
  {
    test: {
      name: "subapps",
      include: ["apps/kdx/src/app/**/apps/**/__tests__/**/*.test.ts"],
      environment: "jsdom",
      setupFiles: ["./tests/utils/setup-files/subapp.setup.ts"],
    },
  },
]);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Padrões por Tipo de Código

### 1. **Testes de SubApp**

Ver documentação detalhada: <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[SubApp Testing Guide](./subapp-testing-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/chat.test.ts
import { renderWithProviders } from "@/tests/utils/test-helpers";
import { describe, expect, it, vi } from "vitest";

describe("Chat SubApp", () => {
  describe("Integration", () => {
    it("should communicate with AI Studio via Service Layer", async () => {
      // Mock do Service Layer
      vi.mock("@kdx/api/internal/services/ai-studio.service", () => ({
        AiStudioService: {
          getAvailableModels: vi
            .fn()
            .mockResolvedValue([{ id: "model-1", name: "GPT-4" }]),
        },
      }));

      // Teste de integração
      const { result } = await renderWithProviders(ChatComponent);
      expect(result.models).toHaveLength(1);
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. **Testes de Service Layer**

Ver documentação detalhada: <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Service Layer Testing Guide](./service-layer-testing-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/api/src/__tests__/services/ai-studio.service.test.ts
describe("AiStudioService", () => {
  it("should validate teamId on all operations", async () => {
    await expect(
      AiStudioService.getModelById({
        modelId: "test",
        teamId: "", // Invalid
        requestingApp: chatAppId,
      }),
    ).rejects.toThrow("teamId is required");
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. **Testes de API (tRPC)**

Ver documentação detalhada: <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[API Testing Guide](./api-testing-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/api/src/__tests__/trpc/chat.router.test.ts
import { createInnerTRPCContext } from "@kdx/api";
import { appRouter } from "@kdx/api/root";

describe("Chat Router", () => {
  it("should create message with proper validation", async () => {
    const ctx = createInnerTRPCContext({
      auth: mockAuth,
      headers: new Headers(),
    });

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.app.chat.sendMessage({
        sessionId: "test",
        content: "Hello",
      }),
    ).resolves.toMatchObject({
      id: expect.any(String),
      content: "Hello",
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# .github/workflows/ci.yml
name: CI Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  # Detectar mudanças para otimizar execução
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      subapps: ${{ steps.filter.outputs.subapps }}
      packages: ${{ steps.filter.outputs.packages }}
    steps:
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            subapps:
              - 'apps/kdx/src/app/**/apps/**'
            packages:
              - 'packages/**'

  # Testes unitários (sempre executam)
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        workspace: [unit, subapps, packages]
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-monorepo
      - run: pnpm test:${{ matrix.workspace }}

  # Testes de integração (condicionais)
  integration-tests:
    needs: [detect-changes]
    if: needs.detect-changes.outputs.packages == 'true'
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: kodix_test
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-monorepo
      - run: pnpm test:integration

  # Testes E2E (em staging)
  e2e-tests:
    needs: [unit-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-monorepo
      - run: pnpm test:e2e
```
<!-- /AI-CODE-OPTIMIZATION -->

## 📊 Métricas e Relatórios

### Cobertura de Código

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Dashboard de Métricas

- **Cobertura por SubApp**: Visualização individual
- **Tempo de execução**: Tendências e otimizações
- **Taxa de sucesso**: Identificar testes flaky
- **Dependências**: Mapa de dependências testadas

## 🛠️ Ferramentas e Utilitários

### Test Helpers

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// tests/utils/test-helpers.ts
export const createMockContext = (overrides?: Partial<Context>) => ({
  auth: createMockAuth(),
  db: createMockDb(),
  ...overrides,
})

export const renderWithProviders = (
  component: React.ComponentType,
  options?: RenderOptions
) => {
  const Wrapper = ({ children }) => (
    <TRPCProvider>
      <QueryClientProvider>
        {children}
      </QueryClientProvider>
    </TRPCProvider>
  )

  return render(component, { wrapper: Wrapper, ...options })
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Mock Factory

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// tests/utils/mock-factory.ts
export const mockFactory = {
  user: (overrides?: Partial<User>): User => ({
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    ...overrides,
  }),

  team: (overrides?: Partial<Team>): Team => ({
    id: "team-123",
    name: "Test Team",
    ownerId: "user-123",
    ...overrides,
  }),

  aiModel: (overrides?: Partial<AiModel>): AiModel => ({
    id: "model-123",
    name: "GPT-4",
    providerId: "openai",
    ...overrides,
  }),
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Comandos Rápidos de Teste

### Execução com Um Comando

Similar ao padrão estabelecido com o Chat SubApp, todos os SubApps devem ter comandos simples:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Testar um SubApp específico com um comando
pnpm test:chat          # Executa todos os testes do Chat
pnpm test:ai-studio     # Executa todos os testes do AI Studio
pnpm test:calendar      # Executa todos os testes do Calendar
pnpm test:kodix-care    # Executa todos os testes do Kodix Care

# Comandos gerais
pnpm test              # Executa todos os testes do monorepo
pnpm test:unit         # Apenas testes unitários
pnpm test:integration  # Apenas testes de integração
pnpm test:e2e          # Apenas testes E2E
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Comandos com Opções

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Com cobertura
pnpm test:chat:coverage

# Modo watch
pnpm test:chat:watch

# Interface visual
pnpm test:chat:ui

# Debug
pnpm test:chat:debug
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Exemplo de Implementação no package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:chat": "vitest run packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:chat:coverage": "vitest run --coverage packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:chat:watch": "vitest packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:chat:ui": "vitest --ui packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:ai-studio": "vitest run packages/api/src/trpc/routers/app/aiStudio/__tests__/",
    "test:calendar": "vitest run packages/api/src/trpc/routers/app/calendar/__tests__/",
    "test:kodix-care": "vitest run packages/api/src/trpc/routers/app/kodixCare/__tests__/"
  }
}
```

## 🚦 Estratégias de Execução

### 1. **Desenvolvimento Local**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Testes rápidos durante desenvolvimento
pnpm test:watch         # Watch mode
pnpm test:changed       # Apenas arquivos alterados
pnpm test:related       # Testes relacionados às mudanças

# Por SubApp (recomendado)
pnpm test:chat          # Testa apenas o Chat
pnpm test:ai-studio     # Testa apenas o AI Studio
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. **Pre-commit**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# .husky/pre-commit
#!/bin/sh
pnpm test:staged        # Apenas arquivos staged
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. **Pull Request**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Testes completos mas otimizados
pnpm test:pr            # Unit + Integration relevantes
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 4. **Deploy**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Suite completa
pnpm test:all           # Unit + Integration + E2E
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎉 Caso de Sucesso: Chat SubApp ✅ **100% ALCANÇADO**

**Status**: ✅ **CONQUISTA HISTÓRICA - 100% DE SUCESSO**

O Chat SubApp é nosso modelo de referência para testes bem estruturados:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Comando único executa todos os testes
pnpm test:chat

# Resultado ATUALIZADO:
🔧 BACKEND:
✓ packages/api/src/trpc/routers/app/chat/__tests__/ci-config.test.ts (1)
✓ packages/api/src/trpc/routers/app/chat/__tests__/service-layer.test.ts (7) ✅ CORRIGIDO
✓ packages/api/src/trpc/routers/app/chat/__tests__/streaming.test.ts (9) ✅ CORRIGIDO
✓ packages/api/src/trpc/routers/app/chat/__tests__/chat-integration.test.ts (11) ✅ CORRIGIDO
✓ packages/api/src/trpc/routers/app/chat/__tests__/simple-integration.test.ts (1)

🎨 FRONTEND:
✓ apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/integration/service-layer.test.ts (7)
✓ apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/integration/api.test.ts (11)
✓ apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/components/model-selector.test.tsx (14)
✓ apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/hooks/useChatPreferredModel.test.ts (10)

Test Suites  9 passed (9 total) ✅ 100% SUCCESS
     Tests   ~70 total
  Duration   ~3-5s
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

🎉 **PRIMEIRA VEZ** que o Chat SubApp atinge **100% de sucesso** em todos os testes!

## 📚 Documentação Adicional

- **[Lessons Learned](./lessons-learned.md)** 📚 - **Critical lessons from testing challenges (SAVE TIME!)**
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[SubApp Testing Guide](./subapp-testing-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Guia específico para testes de SubApps
- **[Chat Testing Example](./chat-testing-example.md)** ⭐ - **Exemplo completo de implementação**
- **[SubApp Testing Documentation Pattern](./subapp-testing-documentation-pattern.md)** 📋 - **Padrão para documentar testes por SubApp**
- **[Service Layer Testing](./service-layer-testing-guide.md)** - Testes de Service Layer
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[API Testing Guide](./api-testing-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Testes de endpoints tRPC
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[E2E Testing Guide](./e2e-testing-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Testes end-to-end com Playwright
- **[Performance Testing](./performance-testing-guide.md)** - Testes de carga e stress
- **[Mock Strategies](./mock-strategies.md)** - Estratégias de mocking
- **[CI Optimization](./ci-optimization-guide.md)** - Otimização do pipeline CI

## 🎯 Checklist de Implementação

- [ ] Configurar Vitest workspace
- [ ] Criar estrutura de diretórios de testes
- [ ] Implementar test helpers e mock factory
- [ ] Configurar GitHub Actions
- [ ] Adicionar hooks pre-commit
- [ ] Implementar dashboard de métricas
- [ ] Documentar padrões específicos por tipo
- [ ] Treinar equipe nos novos padrões

---

**🚀 Com esta arquitetura, o Kodix terá um sistema de testes robusto, escalável e confiável!**
