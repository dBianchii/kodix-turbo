# Guia de Testes - AI Studio

## 📋 Visão Geral

Este guia cobre as estratégias essenciais de teste para o AI Studio, incluindo configuração e exemplos práticos.

## 🧪 Estrutura de Testes

### Organização dos Arquivos

```
packages/api/src/trpc/routers/app/ai-studio/__tests__/
├── providers.test.ts       # Testes do módulo de provedores
├── models.test.ts         # Testes do módulo de modelos
├── agents.test.ts         # Testes do módulo de agentes
├── tokens.test.ts         # Testes do módulo de tokens
├── integration.test.ts    # Testes de integração
└── helpers/
    ├── setup.ts          # Configuração de testes
    └── mocks.ts          # Mocks e fixtures
```

### Configuração Base

```typescript
// __tests__/helpers/setup.ts
import { createTRPCMsw } from "msw-trpc";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

export const mockTrpc = createTRPCMsw(appRouter);
export const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export const mockUser = {
  id: "user_123",
  activeTeamId: "team_123",
};

export const mockContext = {
  auth: { user: mockUser },
  db: mockDb,
};
```

## 🧩 Padrões de Teste

### Teste Unitário Básico

```typescript
// __tests__/providers.test.ts
import { beforeEach, describe, expect, it } from "vitest";

import { createCaller } from "../_router";
import { mockContext } from "./helpers/setup";

describe("AI Providers Router", () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    caller = createCaller(mockContext);
  });

  describe("createAiProvider", () => {
    it("should create provider successfully", async () => {
      const input = {
        name: "OpenAI Test",
        type: "OPENAI" as const,
        description: "Provider para testes",
      };

      const result = await caller.createAiProvider(input);

      expect(result.success).toBe(true);
      expect(result.provider).toMatchObject({
        name: input.name,
        type: input.type,
        teamId: "team_123",
        enabled: true,
      });
      expect(result.provider.id).toBeDefined();
    });

    it("should validate required fields", async () => {
      await expect(
        caller.createAiProvider({
          name: "",
          type: "OPENAI",
        }),
      ).rejects.toThrow("String must contain at least 1 character(s)");
    });

    it("should maintain team isolation", async () => {
      const otherTeamContext = {
        ...mockContext,
        auth: { user: { ...mockUser, activeTeamId: "other_team" } },
      };
      const otherCaller = createCaller(otherTeamContext);

      await otherCaller.createAiProvider({
        name: "Other Team Provider",
        type: "OPENAI",
      });

      // Verificar isolamento
      const { providers } = await caller.findAiProviders({ limit: 10 });
      expect(providers).not.toContainEqual(
        expect.objectContaining({ name: "Other Team Provider" }),
      );
    });
  });
});
```

### Teste de Integração

```typescript
// __tests__/integration.test.ts
describe("AI Studio Integration", () => {
  it("should handle complete provider workflow", async () => {
    // 1. Criar provedor
    const provider = await caller.createAiProvider({
      name: "Integration Test Provider",
      type: "OPENAI",
    });

    // 2. Criar modelo
    const model = await caller.createAiModel({
      name: "Test Model",
      providerId: provider.provider.id,
    });

    // 3. Criar agente
    const agent = await caller.createAiAgent({
      name: "Test Agent",
      modelId: model.model.id,
      systemPrompt: "You are a test assistant",
    });

    // 4. Verificar criação
    expect(agent.agent.modelId).toBe(model.model.id);
    expect(model.model.providerId).toBe(provider.provider.id);

    // 5. Verificar não pode deletar provedor com dependências
    await expect(
      caller.deleteAiProvider({ id: provider.provider.id }),
    ).rejects.toThrow("Cannot delete provider with associated models");
  });
});
```

## 🔒 Testes de Segurança

### Validação de TeamId

```typescript
describe("Security Tests", () => {
  it("should enforce team isolation", async () => {
    const team1Caller = createCaller(mockContext);
    const team2Caller = createCaller({
      ...mockContext,
      auth: { user: { ...mockUser, activeTeamId: "team2" } },
    });

    // Team 1 cria provedor
    const provider = await team1Caller.createAiProvider({
      name: "Team 1 Provider",
      type: "OPENAI",
    });

    // Team 2 não pode acessar
    await expect(
      team2Caller.updateAiProvider({
        id: provider.provider.id,
        name: "Hacked Name",
      }),
    ).rejects.toThrow("AI provider not found");
  });
});
```

### Testes de Criptografia

```typescript
describe("Token Encryption", () => {
  it("should encrypt and decrypt tokens correctly", async () => {
    const originalToken = "sk-test-token-123";

    const result = await caller.createAiTeamProviderToken({
      providerId: "provider-id",
      token: originalToken,
    });

    expect(result.success).toBe(true);
    expect(result.token.encryptedToken).not.toBe(originalToken);
    expect(result.token.encryptedToken).toContain(":");
  });
});
```

## 🎨 Testes de Frontend

### Componente React

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/__tests__/providers-section.test.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProvidersSection } from "../_components/sections/providers-section";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("ProvidersSection", () => {
  it("should render providers list", () => {
    render(<ProvidersSection />, { wrapper: Wrapper });

    expect(screen.getByText("Provedores")).toBeInTheDocument();
    expect(screen.getByText("Adicionar Provedor")).toBeInTheDocument();
  });

  it("should open create dialog", async () => {
    render(<ProvidersSection />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText("Adicionar Provedor"));

    await waitFor(() => {
      expect(screen.getByText("Criar Novo Provedor")).toBeInTheDocument();
    });
  });
});
```

## 📋 Executando os Testes

### Scripts Essenciais

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ai-studio": "vitest packages/api/src/trpc/routers/app/ai-studio"
  }
}
```

### Comandos

```bash
# Executar todos os testes
pnpm test

# Executar apenas testes do AI Studio
pnpm test:ai-studio

# Executar com watch mode
pnpm test:watch

# Gerar relatório de cobertura
pnpm test:coverage
```

## 📊 Metas de Cobertura

- **Linhas**: > 90%
- **Funções**: > 95%
- **Branches**: > 85%
- **Statements**: > 90%

### Áreas Críticas

1. **Validação de Entrada**: 100% dos schemas Zod
2. **Segurança**: 100% das validações de `teamId`
3. **Criptografia**: 100% das funções de encrypt/decrypt
4. **Error Handling**: 100% dos cenários de erro

### Configuração do Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "html"],
      threshold: {
        lines: 90,
        functions: 95,
        branches: 85,
        statements: 90,
      },
    },
  },
});
```

Este guia garante testes essenciais e confiáveis para o AI Studio, focando em qualidade e simplicidade.
