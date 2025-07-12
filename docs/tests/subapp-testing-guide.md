# 🧪 SubApp Testing Guide - Kodix

## 📖 Visão Geral

Este guia detalha as **melhores práticas e padrões** para testar SubApps no monorepo Kodix, garantindo que cada aplicação mantenha alta qualidade e funcione corretamente tanto isoladamente quanto integrada ao ecossistema.

## 🎯 Princípios de Testes para SubApps

### 1. **Isolamento de Contexto**

- Cada SubApp deve ser testável independentemente
- Dependências externas devem ser mockadas
- Testes não devem afetar outros SubApps

### 2. **Cobertura Abrangente**

- **Componentes UI**: Renderização e interações
- **Lógica de Negócio**: Handlers e processamento
- **Integração**: Comunicação via Service Layer
- **Configurações**: AppTeamConfig e UserConfig

### 3. **Performance**

- Testes devem executar rapidamente (< 5s total por SubApp)
- Use mocks para evitar operações pesadas
- Paralelize quando possível

### 4. **Comando Único** ⭐ **NOVO PADRÃO**

- Cada SubApp deve ter um comando simples: `pnpm test:[subapp-name]`
- Deve executar todos os testes relevantes do SubApp
- Exemplo de sucesso: `pnpm test:chat` (42 testes em 2.5s)

## 🏗️ Estrutura de Testes por SubApp

```
apps/kdx/src/app/[locale]/(authed)/apps/[subapp]/
├── __tests__/
│   ├── integration/
│   │   ├── service-layer.test.ts    # Testes de integração com outros SubApps
│   │   ├── api.test.ts              # Testes de endpoints tRPC
│   │   └── config.test.ts           # Testes de configuração
│   ├── components/
│   │   ├── main-nav.test.tsx        # Testes de navegação
│   │   ├── sections/                # Testes de seções específicas
│   │   └── forms/                   # Testes de formulários
│   ├── hooks/
│   │   ├── use-config.test.ts       # Testes de hooks customizados
│   │   └── use-data.test.ts         # Testes de data fetching
│   └── utils/
│       └── helpers.test.ts          # Testes de funções utilitárias
├── __mocks__/
│   ├── services.ts                  # Mocks de Service Layer
│   └── data.ts                      # Dados de teste
└── test-utils.ts                    # Utilitários específicos do SubApp
```

## 📋 Tipos de Testes por Camada

### 1. **Testes de Componentes UI**

```typescript
// __tests__/components/main-nav.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MainNav } from '../_components/main-nav'
import { renderWithProviders } from '@/tests/utils/test-helpers'

describe('MainNav - Chat SubApp', () => {
  it('should render all navigation tabs', () => {
    renderWithProviders(<MainNav />)

    expect(screen.getByText('Conversas')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
    expect(screen.getByText('Histórico')).toBeInTheDocument()
  })

  it('should handle tab navigation', async () => {
    const { user } = renderWithProviders(<MainNav />)

    const configTab = screen.getByText('Configurações')
    await user.click(configTab)

    expect(window.location.pathname).toContain('/config')
  })

  it('should show badge for unread messages', () => {
    renderWithProviders(<MainNav unreadCount={5} />)

    const badge = screen.getByText('5')
    expect(badge).toHaveClass('badge-primary')
  })
})
```

### 2. **Testes de Integração com Service Layer**

```typescript
// __tests__/integration/service-layer.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiStudioService } from "@kdx/api/internal/services/ai-studio.service";
import { chatAppId } from "@kdx/shared";

// Mock do Service Layer
vi.mock("@kdx/api/internal/services/ai-studio.service", () => ({
  AiStudioService: {
    getAvailableModels: vi.fn(),
    getModelById: vi.fn(),
    getDefaultModel: vi.fn(),
    getProviderToken: vi.fn(),
  },
}));

describe("Chat SubApp - AI Studio Integration", () => {
  const mockTeamId = "team-123";
  const mockUserId = "user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch available models from AI Studio", async () => {
    const mockModels = [
      { id: "gpt-4", name: "GPT-4", enabled: true },
      { id: "claude-3", name: "Claude 3", enabled: true },
    ];

    vi.mocked(AiStudioService.getAvailableModels).mockResolvedValue(mockModels);

    const models = await AiStudioService.getAvailableModels({
      teamId: mockTeamId,
      requestingApp: chatAppId,
    });

    expect(models).toEqual(mockModels);
    expect(AiStudioService.getAvailableModels).toHaveBeenCalledWith({
      teamId: mockTeamId,
      requestingApp: chatAppId,
    });
  });

  it("should handle errors when AI Studio is unavailable", async () => {
    vi.mocked(AiStudioService.getAvailableModels).mockRejectedValue(
      new Error("Service unavailable"),
    );

    await expect(
      AiStudioService.getAvailableModels({
        teamId: mockTeamId,
        requestingApp: chatAppId,
      }),
    ).rejects.toThrow("Service unavailable");
  });

  it("should validate teamId is passed correctly", async () => {
    await AiStudioService.getModelById({
      modelId: "gpt-4",
      teamId: mockTeamId,
      requestingApp: chatAppId,
    });

    expect(AiStudioService.getModelById).toHaveBeenCalledWith(
      expect.objectContaining({
        teamId: mockTeamId,
      }),
    );
  });
});
```

### 3. **Testes de Configuração (AppTeamConfig)**

```typescript
// __tests__/integration/config.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { chatAppId } from "@kdx/shared";
import { useAppTeamConfig, useUserAppTeamConfig } from "@kdx/shared/hooks";

describe("Chat SubApp - Configuration", () => {
  it("should load team configuration", async () => {
    const { result } = renderHook(() => useAppTeamConfig(chatAppId));

    await waitFor(() => {
      expect(result.current.config).toBeDefined();
    });

    expect(result.current.config).toMatchObject({
      defaultModel: expect.any(String),
      streamingEnabled: expect.any(Boolean),
      autoSaveInterval: expect.any(Number),
    });
  });

  it("should save team configuration", async () => {
    const { result } = renderHook(() => useAppTeamConfig(chatAppId));

    await waitFor(() => {
      expect(result.current.saveConfig).toBeDefined();
    });

    const newConfig = {
      defaultModel: "gpt-4",
      streamingEnabled: true,
      autoSaveInterval: 5000,
    };

    await result.current.saveConfig(newConfig);

    expect(result.current.config).toEqual(newConfig);
  });

  it("should handle user-specific configuration", async () => {
    const { result } = renderHook(() => useUserAppTeamConfig(chatAppId));

    await waitFor(() => {
      expect(result.current.config).toBeDefined();
    });

    expect(result.current.config).toMatchObject({
      theme: expect.any(String),
      fontSize: expect.any(Number),
      shortcuts: expect.any(Object),
    });
  });
});
```

### 4. **Testes de API (tRPC Endpoints)**

```typescript
// __tests__/integration/api.test.ts
import { mockFactory } from "@/tests/utils/mock-factory";
import { beforeEach, describe, expect, it } from "vitest";

import { createInnerTRPCContext } from "@kdx/api";
import { appRouter } from "@kdx/api/root";

describe("Chat API Endpoints", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let ctx: ReturnType<typeof createInnerTRPCContext>;

  beforeEach(() => {
    ctx = createInnerTRPCContext({
      auth: {
        user: mockFactory.user({
          id: "user-123",
          activeTeamId: "team-123",
        }),
        session: mockFactory.session(),
      },
      headers: new Headers(),
    });

    caller = appRouter.createCaller(ctx);
  });

  describe("Sessions", () => {
    it("should create a new chat session", async () => {
      const session = await caller.app.chat.createSession({
        title: "Test Session",
        modelId: "gpt-4",
      });

      expect(session).toMatchObject({
        id: expect.any(String),
        title: "Test Session",
        modelId: "gpt-4",
        teamId: "team-123",
        userId: "user-123",
      });
    });

    it("should list user sessions", async () => {
      const sessions = await caller.app.chat.listSessions({
        limit: 10,
        offset: 0,
      });

      expect(sessions).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
        hasMore: expect.any(Boolean),
      });
    });
  });

  describe("Messages", () => {
    it("should send a message", async () => {
      const message = await caller.app.chat.sendMessage({
        sessionId: "session-123",
        content: "Hello, AI!",
      });

      expect(message).toMatchObject({
        id: expect.any(String),
        content: "Hello, AI!",
        role: "user",
        sessionId: "session-123",
      });
    });

    it("should validate message content", async () => {
      await expect(
        caller.app.chat.sendMessage({
          sessionId: "session-123",
          content: "", // Empty content
        }),
      ).rejects.toThrow("Message content cannot be empty");
    });
  });
});
```

### 5. **Testes de Hooks Customizados**

```typescript
// __tests__/hooks/use-chat-session.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useChatSession } from '../../_hooks/use-chat-session'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useChatSession Hook', () => {
  it('should load session data', async () => {
    const { result } = renderHook(
      () => useChatSession('session-123'),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.session).toMatchObject({
      id: 'session-123',
      messages: expect.any(Array),
    })
  })

  it('should handle sending messages', async () => {
    const { result } = renderHook(
      () => useChatSession('session-123'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.session).toBeDefined()
    })

    await result.current.sendMessage('Test message')

    expect(result.current.session.messages).toContainEqual(
      expect.objectContaining({
        content: 'Test message',
        role: 'user',
      })
    )
  })
})
```

## 🎭 Estratégias de Mocking

### 1. **Mock de Service Layer**

```typescript
// __mocks__/services.ts
export const mockAiStudioService = {
  getAvailableModels: vi.fn().mockResolvedValue([
    { id: "gpt-4", name: "GPT-4", enabled: true },
    { id: "claude-3", name: "Claude 3", enabled: true },
  ]),

  getModelById: vi.fn().mockImplementation((params) => {
    const models = {
      "gpt-4": { id: "gpt-4", name: "GPT-4", provider: "openai" },
      "claude-3": { id: "claude-3", name: "Claude 3", provider: "anthropic" },
    };
    return Promise.resolve(models[params.modelId] || null);
  }),

  getDefaultModel: vi.fn().mockResolvedValue({
    model: { id: "gpt-4", name: "GPT-4" },
  }),
};

// Aplicar mock globalmente
vi.mock("@kdx/api/internal/services/ai-studio.service", () => ({
  AiStudioService: mockAiStudioService,
}));
```

### 2. **Mock de Dados**

```typescript
// __mocks__/data.ts
export const mockChatSession = {
  id: "session-123",
  title: "Test Conversation",
  modelId: "gpt-4",
  teamId: "team-123",
  userId: "user-123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  messages: [
    {
      id: "msg-1",
      content: "Hello!",
      role: "user",
      createdAt: new Date("2024-01-01T10:00:00"),
    },
    {
      id: "msg-2",
      content: "Hi! How can I help you?",
      role: "assistant",
      createdAt: new Date("2024-01-01T10:00:05"),
    },
  ],
};

export const mockChatConfig = {
  defaultModel: "gpt-4",
  streamingEnabled: true,
  autoSaveInterval: 5000,
  maxTokens: 4000,
  temperature: 0.7,
};
```

## 🚀 Padrões de Performance

### 1. **Lazy Loading de Testes**

```typescript
// Carregue componentes pesados apenas quando necessário
describe('Heavy Component Tests', () => {
  let HeavyComponent: any

  beforeAll(async () => {
    const module = await import('../_components/heavy-component')
    HeavyComponent = module.HeavyComponent
  })

  it('should render', () => {
    render(<HeavyComponent />)
    // ...
  })
})
```

### 2. **Compartilhamento de Setup**

```typescript
// test-utils.ts
export const setupChatTests = () => {
  const user = mockFactory.user();
  const team = mockFactory.team({ ownerId: user.id });
  const session = mockChatSession;

  return { user, team, session };
};

// Uso nos testes
describe("Chat Tests", () => {
  const { user, team, session } = setupChatTests();

  // Reutilize os mesmos dados em múltiplos testes
});
```

## 📊 Métricas de Cobertura

### Metas por Tipo de Código

| Tipo de Código | Cobertura Mínima | Cobertura Ideal |
| -------------- | ---------------- | --------------- |
| Componentes UI | 70%              | 90%             |
| Hooks          | 80%              | 95%             |
| Service Layer  | 90%              | 100%            |
| Utils/Helpers  | 95%              | 100%            |
| API Handlers   | 85%              | 95%             |

### Comando para Verificar Cobertura

```bash
# Cobertura específica do SubApp
pnpm test:coverage --filter="apps/kdx/src/app/**/apps/chat/**"

# Relatório detalhado
pnpm test:coverage:report
```

## 🔍 Debugging de Testes

### 1. **Modo Interativo**

```bash
# Debug com UI do Vitest
pnpm test:ui --filter="chat"

# Debug específico
pnpm test:debug apps/kdx/src/app/**/apps/chat/__tests__/integration/service-layer.test.ts
```

### 2. **Logs Detalhados**

```typescript
// Ative logs durante testes
describe("Debug Test", () => {
  beforeAll(() => {
    vi.spyOn(console, "log").mockImplementation((...args) => {
      process.stdout.write(`[TEST LOG]: ${args.join(" ")}\n`);
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
```

## 🚀 Configuração de Comandos Rápidos

### Adicionar ao package.json

Todo SubApp deve ter comandos padronizados no `package.json` raiz:

```json
{
  "scripts": {
    // Comando principal (obrigatório)
    "test:[subapp]": "vitest run packages/api/src/trpc/routers/app/[subapp]/__tests__/",

    // Comandos opcionais mas recomendados
    "test:[subapp]:coverage": "vitest run --coverage packages/api/src/trpc/routers/app/[subapp]/__tests__/",
    "test:[subapp]:watch": "vitest packages/api/src/trpc/routers/app/[subapp]/__tests__/",
    "test:[subapp]:ui": "vitest --ui packages/api/src/trpc/routers/app/[subapp]/__tests__/"
  }
}
```

### Exemplo Real do Chat

```json
{
  "scripts": {
    "test:chat": "vitest run packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:chat:coverage": "vitest run --coverage packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:chat:watch": "vitest packages/api/src/trpc/routers/app/chat/__tests__/",
    "test:chat:ui": "vitest --ui packages/api/src/trpc/routers/app/chat/__tests__/"
  }
}
```

### Script de Execução (Opcional)

Para relatórios mais detalhados, crie um script bash:

```bash
#!/bin/bash
# scripts/test-[subapp].sh

echo "🧪 Executando testes do [SubApp Name]..."
echo "=================================="

pnpm vitest run packages/api/src/trpc/routers/app/[subapp]/__tests__/ --reporter=verbose

echo ""
echo "✅ Testes concluídos!"
echo ""
echo "Para mais opções:"
echo "  pnpm test:[subapp]:coverage  # Com cobertura"
echo "  pnpm test:[subapp]:watch     # Modo watch"
echo "  pnpm test:[subapp]:ui        # Interface visual"
```

## ✅ Checklist de Testes para SubApp

- [ ] **Estrutura de Testes**

  - [ ] Diretório `__tests__` criado
  - [ ] Subdiretórios organizados por tipo
  - [ ] Arquivos de mock configurados

- [ ] **Comandos Configurados** ⭐ **NOVO**

  - [ ] `test:[subapp]` adicionado ao package.json
  - [ ] Comando testado e funcionando
  - [ ] Opcional: comandos de coverage, watch e ui

- [ ] **Cobertura de Componentes**

  - [ ] Navegação principal testada
  - [ ] Formulários com validação
  - [ ] Estados de loading/error
  - [ ] Responsividade

- [ ] **Integração**

  - [ ] Service Layer mockado
  - [ ] Comunicação cross-app testada
  - [ ] Configurações (team/user)
  - [ ] Permissões validadas

- [ ] **API/tRPC**

  - [ ] Endpoints CRUD testados
  - [ ] Validações de input
  - [ ] Tratamento de erros
  - [ ] Autenticação/autorização

- [ ] **Performance**

  - [ ] Testes executam < 5s
  - [ ] Sem dependências externas
  - [ ] Mocks otimizados

- [ ] **Documentação**
  - [ ] README com instruções
  - [ ] Exemplos de uso
  - [ ] Troubleshooting comum
  - [ ] Comando de teste documentado

---

**🎯 Seguindo este guia, cada SubApp terá testes robustos, confiáveis e mantíveis!**
