# Chat Testing Guide

## 📖 Visão Geral

Este guia estabelece estratégias e padrões de teste específicos para o **Chat SubApp**, cobrindo testes unitários, integração e end-to-end com foco na experiência do usuário e funcionalidades críticas.

## 🧪 Estratégias de Teste

### **Pirâmide de Testes - Chat**

```
     /\
    /E2E\    <- Fluxos críticos (10%)
   /____\
  /      \
 /Integration\ <- Componentes + APIs (30%)
/__________\
/ Unit Tests \ <- Lógica de negócio (60%)
/____________\
```

### **Cobertura Alvo**

- **Unitários**: 95%+ (hooks, utils, validações)
- **Integração**: 85%+ (componentes, fluxos)
- **E2E**: 70%+ (user journeys críticos)

## 🎯 Testes Unitários

### **Hooks Customizados**

#### **useChatPreferredModel.test.ts**

```typescript
import { renderHook, waitFor } from "@testing-library/react";

import { useChatPreferredModel } from "../_hooks/useChatPreferredModel";

describe("useChatPreferredModel", () => {
  it("should return chat config model as priority", async () => {
    // Arrange
    mockChatConfig.mockReturnValue({ lastSelectedModelId: "gpt-4" });
    mockAiStudioService.getDefaultModel.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useChatPreferredModel());

    // Assert
    await waitFor(() => {
      expect(result.current.modelId).toBe("gpt-4");
      expect(result.current.source).toBe("chat_config");
      expect(result.current.isReady).toBe(true);
    });
  });

  it("should fallback to AI Studio default when no chat config", async () => {
    // Arrange
    mockChatConfig.mockReturnValue({ lastSelectedModelId: null });
    mockAiStudioService.getDefaultModel.mockResolvedValue({
      id: "claude-3",
      isDefault: true,
    });

    // Act
    const { result } = renderHook(() => useChatPreferredModel());

    // Assert
    await waitFor(() => {
      expect(result.current.modelId).toBe("claude-3");
      expect(result.current.source).toBe("ai_studio_default");
    });
  });

  it("should use first available as last fallback", async () => {
    // Arrange
    mockChatConfig.mockReturnValue({ lastSelectedModelId: null });
    mockAiStudioService.getDefaultModel.mockResolvedValue(null);
    mockAiStudioService.getAvailableModels.mockResolvedValue([
      { id: "gemini-pro", name: "Gemini Pro" },
    ]);

    // Act
    const { result } = renderHook(() => useChatPreferredModel());

    // Assert
    await waitFor(() => {
      expect(result.current.modelId).toBe("gemini-pro");
      expect(result.current.source).toBe("first_available");
    });
  });

  it("should handle loading states correctly", () => {
    // Arrange
    mockChatConfig.mockReturnValue({ isLoading: true });

    // Act
    const { result } = renderHook(() => useChatPreferredModel());

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isReady).toBe(false);
    expect(result.current.modelId).toBeNull();
  });
});
```

#### **useAutoCreateSession.test.tsx**

```typescript
import { act, renderHook } from "@testing-library/react";

import { useAutoCreateSession } from "../_hooks/useAutoCreateSession";

describe("useAutoCreateSession", () => {
  const mockOnSessionCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create session and send message successfully", async () => {
    // Arrange
    const mockSession = { id: "session-123", title: "Nova conversa" };
    mockCreateSession.mockResolvedValue(mockSession);
    mockSendMessage.mockResolvedValue({ success: true });

    // Act
    const { result } = renderHook(() =>
      useAutoCreateSession({ onSessionCreated: mockOnSessionCreated }),
    );

    await act(async () => {
      await result.current.createSessionAndSendMessage({
        content: "Olá!",
        modelId: "gpt-4",
        folderId: null,
      });
    });

    // Assert
    expect(mockCreateSession).toHaveBeenCalledWith({
      title: "Nova conversa",
      aiModelId: "gpt-4",
      chatFolderId: null,
    });
    expect(mockSendMessage).toHaveBeenCalledWith({
      sessionId: "session-123",
      content: "Olá!",
      role: "user",
    });
    expect(mockOnSessionCreated).toHaveBeenCalledWith("session-123");
  });

  it("should handle session creation failure", async () => {
    // Arrange
    mockCreateSession.mockRejectedValue(new Error("Network error"));

    // Act & Assert
    const { result } = renderHook(() =>
      useAutoCreateSession({ onSessionCreated: mockOnSessionCreated }),
    );

    await expect(
      result.current.createSessionAndSendMessage({
        content: "Olá!",
        modelId: "gpt-4",
        folderId: null,
      }),
    ).rejects.toThrow("Network error");

    expect(mockOnSessionCreated).not.toHaveBeenCalled();
  });
});
```

### **Utilitários e Validações**

```typescript
// utils/chat-validation.test.ts
describe("Chat Validation Utils", () => {
  describe("validateMessageContent", () => {
    it("should accept valid message content", () => {
      expect(validateMessageContent("Olá, como você está?")).toBe(true);
    });

    it("should reject empty messages", () => {
      expect(validateMessageContent("")).toBe(false);
      expect(validateMessageContent("   ")).toBe(false);
    });

    it("should reject messages exceeding max length", () => {
      const longMessage = "a".repeat(5001);
      expect(validateMessageContent(longMessage)).toBe(false);
    });
  });

  describe("sanitizeSessionTitle", () => {
    it("should remove special characters", () => {
      expect(sanitizeSessionTitle("Conversa #1 @hoje")).toBe("Conversa 1 hoje");
    });

    it("should truncate long titles", () => {
      const longTitle = "a".repeat(101);
      const result = sanitizeSessionTitle(longTitle);
      expect(result).toHaveLength(100);
    });
  });
});
```

## 🧩 Testes de Integração

### **Componentes Principais**

#### **chat-window.test.tsx**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWindow } from '../_components/chat-window';
import { TRPCProvider } from '~/utils/trpc';

const renderChatWindow = (props = {}) => {
  const defaultProps = {
    sessionId: 'session-123',
    selectedModelId: 'gpt-4',
    ...props,
  };

  return render(
    <TRPCProvider>
      <ChatWindow {...defaultProps} />
    </TRPCProvider>
  );
};

describe('ChatWindow Integration', () => {
  it('should render messages correctly', async () => {
    // Arrange
    mockMessages.mockReturnValue([
      { id: '1', role: 'user', content: 'Olá!' },
      { id: '2', role: 'ai', content: 'Olá! Como posso ajudar?' },
    ]);

    // Act
    renderChatWindow();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Olá!')).toBeInTheDocument();
      expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument();
    });
  });

  it('should send message and show streaming response', async () => {
    // Arrange
    const mockStreamResponse = 'Esta é uma resposta streaming...';
    mockSendMessage.mockResolvedValue({
      aiMessage: { id: '3', content: mockStreamResponse },
    });

    // Act
    renderChatWindow();

    const input = screen.getByPlaceholderText('Digite sua mensagem...');
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(input, { target: { value: 'Como funciona IA?' } });
    fireEvent.click(sendButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Como funciona IA?')).toBeInTheDocument();
    });

    // Verificar streaming visual
    await waitFor(() => {
      expect(screen.getByText(mockStreamResponse)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle sending errors gracefully', async () => {
    // Arrange
    mockSendMessage.mockRejectedValue(new Error('API Error'));

    // Act
    renderChatWindow();

    const input = screen.getByPlaceholderText('Digite sua mensagem...');
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(input, { target: { value: 'Teste erro' } });
    fireEvent.click(sendButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/erro ao enviar mensagem/i)).toBeInTheDocument();
    });
  });
});
```

#### **model-selector.test.tsx**

```typescript
describe('ModelSelector Integration', () => {
  it('should load and display available models', async () => {
    // Arrange
    mockAvailableModels.mockResolvedValue([
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
      { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' },
    ]);

    // Act
    render(<ModelSelector onModelSelect={jest.fn()} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('GPT-4')).toBeInTheDocument();
      expect(screen.getByText('Claude 3')).toBeInTheDocument();
    });
  });

  it('should filter models by search term', async () => {
    // Arrange
    mockAvailableModels.mockResolvedValue([
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
      { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' },
    ]);

    // Act
    render(<ModelSelector onModelSelect={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Buscar modelos...');
    fireEvent.change(searchInput, { target: { value: 'GPT' } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('GPT-4')).toBeInTheDocument();
      expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
      expect(screen.queryByText('Claude 3')).not.toBeInTheDocument();
    });
  });

  it('should call onModelSelect when model is chosen', async () => {
    // Arrange
    const mockOnSelect = jest.fn();
    mockAvailableModels.mockResolvedValue([
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    ]);

    // Act
    render(<ModelSelector onModelSelect={mockOnSelect} />);

    await waitFor(() => {
      const modelOption = screen.getByText('GPT-4');
      fireEvent.click(modelOption);
    });

    // Assert
    expect(mockOnSelect).toHaveBeenCalledWith('gpt-4');
  });
});
```

### **Fluxos de API**

```typescript
// integration/chat-api-flow.test.ts
describe("Chat API Flow Integration", () => {
  it("should complete full conversation flow", async () => {
    // 1. Criar sessão
    const session = await chatAPI.createSession({
      title: "Teste API",
      aiModelId: "gpt-4",
      teamId: "team-123",
    });

    expect(session.id).toBeDefined();
    expect(session.teamId).toBe("team-123");

    // 2. Enviar mensagem do usuário
    const userMessage = await chatAPI.sendMessage({
      sessionId: session.id,
      content: "Como funciona machine learning?",
      role: "user",
    });

    expect(userMessage.content).toBe("Como funciona machine learning?");

    // 3. Simular resposta da IA
    const aiMessage = await chatAPI.sendMessage({
      sessionId: session.id,
      content: "Machine learning é...",
      role: "ai",
    });

    expect(aiMessage.role).toBe("ai");

    // 4. Buscar mensagens da sessão
    const messages = await chatAPI.getMessages(session.id);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("user");
    expect(messages[1].role).toBe("ai");
  });

  it("should enforce team isolation", async () => {
    // Arrange
    const session1 = await chatAPI.createSession({
      title: "Team A Session",
      teamId: "team-a",
    });

    // Act & Assert
    await expect(
      chatAPI.getMessages(session1.id, { teamId: "team-b" }),
    ).rejects.toThrow("FORBIDDEN");
  });
});
```

## 🎭 Testes End-to-End

### **User Journeys Críticos**

#### **chat-complete-flow.e2e.ts**

```typescript
import { expect, test } from "@playwright/test";

test.describe("Chat Complete Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apps/chat");
    await page.waitForLoadState("networkidle");
  });

  test("should complete full chat conversation", async ({ page }) => {
    // 1. Verificar carregamento da página
    await expect(page.getByText("Chat")).toBeVisible();

    // 2. Verificar que modelo preferido foi carregado
    await expect(page.locator('[data-testid="current-model"]')).toContainText(
      /gpt|claude|gemini/i,
    );

    // 3. Enviar primeira mensagem (cria sessão automaticamente)
    const messageInput = page.getByPlaceholder("Digite sua mensagem...");
    await messageInput.fill("Olá! Como você funciona?");
    await page.getByRole("button", { name: /enviar/i }).click();

    // 4. Verificar que mensagem apareceu
    await expect(page.getByText("Olá! Como você funciona?")).toBeVisible();

    // 5. Aguardar resposta da IA com streaming
    await expect(page.locator('[data-role="ai"]').first()).toBeVisible({
      timeout: 10000,
    });

    // 6. Verificar que sessão foi criada na sidebar
    await expect(page.locator('[data-testid="chat-sessions"]')).toContainText(
      "Nova conversa",
    );

    // 7. Enviar segunda mensagem
    await messageInput.fill("Explique machine learning brevemente");
    await page.getByRole("button", { name: /enviar/i }).click();

    // 8. Verificar segunda resposta
    await expect(
      page.getByText("Explique machine learning brevemente"),
    ).toBeVisible();
    await expect(page.locator('[data-role="ai"]').nth(1)).toBeVisible({
      timeout: 10000,
    });

    // 9. Verificar que temos 4 mensagens no total
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(4);
  });

  test("should handle model switching mid-conversation", async ({ page }) => {
    // 1. Iniciar conversa com modelo padrão
    await page
      .getByPlaceholder("Digite sua mensagem...")
      .fill("Primeira mensagem");
    await page.getByRole("button", { name: /enviar/i }).click();

    // 2. Aguardar resposta
    await expect(page.locator('[data-role="ai"]').first()).toBeVisible({
      timeout: 10000,
    });

    // 3. Trocar modelo
    await page.getByTestId("model-selector").click();
    await page.getByText("Claude 3").click();

    // 4. Enviar nova mensagem com modelo diferente
    await page
      .getByPlaceholder("Digite sua mensagem...")
      .fill("Segunda mensagem");
    await page.getByRole("button", { name: /enviar/i }).click();

    // 5. Verificar que modelo foi atualizado na sessão
    await expect(page.getByTestId("current-model")).toContainText("Claude 3");

    // 6. Verificar segunda resposta
    await expect(page.locator('[data-role="ai"]').nth(1)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should organize conversations with folders", async ({ page }) => {
    // 1. Criar pasta
    await page.getByTestId("create-folder").click();
    await page.getByPlaceholder("Nome da pasta...").fill("Projeto AI");
    await page.getByRole("button", { name: /criar/i }).click();

    // 2. Verificar pasta criada
    await expect(page.getByText("Projeto AI")).toBeVisible();

    // 3. Criar conversa na pasta
    await page.getByText("Projeto AI").click();
    await page
      .getByPlaceholder("Digite sua mensagem...")
      .fill("Mensagem na pasta");
    await page.getByRole("button", { name: /enviar/i }).click();

    // 4. Verificar que sessão foi criada dentro da pasta
    await expect(page.locator('[data-testid="folder-sessions"]')).toContainText(
      "Nova conversa",
    );
  });
});
```

#### **chat-error-handling.e2e.ts**

```typescript
test.describe("Chat Error Handling", () => {
  test("should handle network errors gracefully", async ({ page }) => {
    // Simular offline
    await page.context().setOffline(true);

    await page.goto("/apps/chat");
    await page.getByPlaceholder("Digite sua mensagem...").fill("Teste offline");
    await page.getByRole("button", { name: /enviar/i }).click();

    // Verificar mensagem de erro
    await expect(page.getByText(/erro de conexão/i)).toBeVisible();

    // Restaurar conexão
    await page.context().setOffline(false);

    // Tentar novamente
    await page.getByRole("button", { name: /tentar novamente/i }).click();

    // Verificar que funcionou
    await expect(page.locator('[data-role="ai"]').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle API rate limits", async ({ page }) => {
    // Mock de rate limit
    await page.route("**/api/chat/send-message", async (route) => {
      await route.fulfill({
        status: 429,
        body: JSON.stringify({ error: "Rate limit exceeded" }),
      });
    });

    await page.goto("/apps/chat");
    await page
      .getByPlaceholder("Digite sua mensagem...")
      .fill("Teste rate limit");
    await page.getByRole("button", { name: /enviar/i }).click();

    // Verificar mensagem de rate limit
    await expect(page.getByText(/limite de requisições/i)).toBeVisible();
  });
});
```

## ⚙️ Setup e Configuração

### **Test Environment Setup**

```typescript
// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapping: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/tests/**/*.test.{ts,tsx}",
    "<rootDir>/apps/**/tests/**/*.test.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "apps/kdx/src/app/**/chat/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
};
```

### **Global Test Setup**

```typescript
// tests/setup.ts
import "@testing-library/jest-dom";

import { vi } from "vitest";

// Mock tRPC
vi.mock("~/utils/trpc", () => ({
  api: {
    app: {
      chat: {
        buscarMensagensTest: { useQuery: vi.fn() },
        enviarMensagem: { useMutation: vi.fn() },
        criarSession: { useMutation: vi.fn() },
        listarSessions: { useQuery: vi.fn() },
      },
    },
  },
}));

// Mock AI Studio Service
vi.mock("~/lib/ai-studio-service", () => ({
  AiStudioService: {
    getModelById: vi.fn(),
    getDefaultModel: vi.fn(),
    getAvailableModels: vi.fn(),
    getProviderToken: vi.fn(),
  },
}));

// Mock Next.js Router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock useTranslations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
```

### **Test Utilities**

```typescript
// tests/utils/chat-test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { TRPCProvider } from '~/utils/trpc';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <TRPCProvider>{children}</TRPCProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock Data Factories
export const createMockSession = (overrides = {}) => ({
  id: 'session-123',
  title: 'Conversa de Teste',
  aiModelId: 'gpt-4',
  teamId: 'team-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'msg-123',
  role: 'user' as const,
  content: 'Mensagem de teste',
  sessionId: 'session-123',
  createdAt: new Date(),
  ...overrides,
});

export const createMockModel = (overrides = {}) => ({
  id: 'gpt-4',
  name: 'GPT-4',
  provider: 'OpenAI',
  isActive: true,
  isDefault: false,
  ...overrides,
});
```

## 📊 CI/CD Integration

### **GitHub Actions Workflow**

```yaml
# .github/workflows/chat-tests.yml
name: Chat Tests

on:
  pull_request:
    paths:
      - "apps/kdx/src/app/**/chat/**"
      - "tests/chat/**"

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:chat:unit

      - name: Run integration tests
        run: pnpm test:chat:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: chat

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: |
          pnpm install
          pnpm playwright install

      - name: Start dev server
        run: pnpm dev:kdx &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: pnpm test:chat:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🚀 Ferramentas e Scripts

### **Package.json Scripts**

```json
{
  "scripts": {
    "test:chat": "jest --projects tests/chat",
    "test:chat:unit": "jest --projects tests/chat/unit",
    "test:chat:integration": "jest --projects tests/chat/integration",
    "test:chat:e2e": "playwright test tests/chat/e2e",
    "test:chat:watch": "jest --projects tests/chat --watch",
    "test:chat:coverage": "jest --projects tests/chat --coverage",
    "test:chat:debug": "node --inspect-brk node_modules/.bin/jest --projects tests/chat --runInBand"
  }
}
```

### **Performance Testing**

```typescript
// tests/performance/chat-performance.test.ts
import { performance } from 'perf_hooks';

describe('Chat Performance', () => {
  it('should render chat window under 100ms', async () => {
    const start = performance.now();

    render(<ChatWindow sessionId="test" selectedModelId="gpt-4" />);
    await screen.findByTestId('chat-messages');

    const end = performance.now();
    const renderTime = end - start;

    expect(renderTime).toBeLessThan(100);
  });

  it('should handle 100+ messages without performance degradation', async () => {
    const manyMessages = Array.from({ length: 100 }, (_, i) =>
      createMockMessage({ id: `msg-${i}`, content: `Mensagem ${i}` })
    );

    mockMessages.mockReturnValue(manyMessages);

    const start = performance.now();
    render(<ChatWindow sessionId="test" selectedModelId="gpt-4" />);
    await screen.findByTestId('chat-messages');
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(500); // 500ms para 100 mensagens
  });
});
```

---

## 📚 Recursos Relacionados

- **[Chat Development Guide](./Chat_Development_Guide.md)** - Padrões de desenvolvimento
- **[Testing Best Practices](../../architecture/testing-guide.md)** - Padrões gerais de teste
- **[Jest Configuration](../../testing/jest.config.js)** - Configuração de teste
- **[Playwright Setup](../../testing/playwright.config.ts)** - Configuração E2E

---

**📝 Última atualização**: Janeiro 2025 | **🧪 Stack**: Jest + RTL + Playwright | **🎯 Cobertura**: 95%+ target
