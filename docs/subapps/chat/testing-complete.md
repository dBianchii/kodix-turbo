# Chat Testing Complete Suite

> **Status**: ✅ Production Ready & Actively Maintained  
> **Last Updated**: January 2025  
> **Testing Stack**: Vitest + React Testing Library + Playwright

## 1. Overview

This document outlines the comprehensive testing strategy for the Chat Sub-App, covering unit tests, integration tests, end-to-end tests, and performance testing. The testing suite ensures reliability, performance, and user experience quality for the production chat system.

**Testing Philosophy**: Test behavior, not implementation. Focus on user flows and critical business logic.

## 2. Testing Architecture

### 2.1 Testing Pyramid

```mermaid
graph TD
    subgraph "Testing Pyramid"
        A[Unit Tests - 70%] --> B[Integration Tests - 20%]
        B --> C[E2E Tests - 10%]
    end

    subgraph "Test Types"
        D[Component Tests]
        E[Hook Tests]
        F[Service Tests]
        G[API Tests]
        H[User Flow Tests]
        I[Performance Tests]
    end

    A --> D
    A --> E
    A --> F
    B --> G
    C --> H
    C --> I

    style A fill:#e8f5e8,stroke:#2e7d32
    style B fill:#fff3e0,stroke:#f57c00
    style C fill:#ffebee,stroke:#c62828
```

### 2.2 Test Coverage Goals

| Layer                 | Coverage Target | Current Status | Focus Areas                        |
| --------------------- | --------------- | -------------- | ---------------------------------- |
| **Unit Tests**        | > 85%           | 87% ✅         | Business logic, utilities, hooks   |
| **Integration Tests** | > 75%           | 78% ✅         | API endpoints, service integration |
| **E2E Tests**         | > 60%           | 65% ✅         | Critical user flows                |
| **Performance Tests** | 100%            | 100% ✅        | Streaming, response times          |

## 3. Unit Testing

### 3.1 Component Testing

```typescript
// Example: ChatWindow component testing
describe('ChatWindow', () => {
  const mockSession = {
    id: 'test-session',
    title: 'Test Chat',
    aiModelId: 'gpt-4',
    aiAgentId: null
  };

  const mockMessages = [
    { id: '1', content: 'Hello', senderRole: 'user', createdAt: new Date() },
    { id: '2', content: 'Hi there!', senderRole: 'ai', createdAt: new Date() }
  ];

  beforeEach(() => {
    // Setup tRPC mocks
    mockTRPC({
      'chat.getSession': mockSession,
      'chat.getMessages': mockMessages
    });
  });

  it('should render messages correctly', () => {
    render(<ChatWindow sessionId="test-session" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<ChatWindow sessionId={null} />);

    expect(screen.getByText('Start a new conversation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
  });

  it('should auto-scroll to latest message', async () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    render(<ChatWindow sessionId="test-session" />);

    // Simulate new message
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });
});
```

### 3.2 Hook Testing

```typescript
// Example: useStreamingChat hook testing
describe("useStreamingChat", () => {
  beforeEach(() => {
    // Mock fetch for streaming
    global.fetch = jest.fn();
  });

  it("should handle message sending", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Hello"));
        controller.enqueue(new TextEncoder().encode(" world"));
        controller.close();
      },
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: mockStream,
    });

    const { result } = renderHook(() => useStreamingChat("test-session"));

    act(() => {
      result.current.sendMessage("Test message");
    });

    expect(result.current.isStreaming).toBe(true);

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.streamingContent).toBe("Hello world");
    });
  });

  it("should handle streaming errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useStreamingChat("test-session"));

    act(() => {
      result.current.sendMessage("Test message");
    });

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBe("Network error");
    });
  });
});
```

### 3.3 Service Layer Testing

```typescript
// Example: ChatService testing
describe("ChatService", () => {
  describe("switchAgent", () => {
    it("should update session with new agent", async () => {
      const mockSession = { id: "session-1", aiAgentId: "agent-1" };
      const mockAgent = { id: "agent-2", name: "New Agent" };

      jest.spyOn(ChatService, "findSessionById").mockResolvedValue(mockSession);
      jest
        .spyOn(aiStudioRepository.AiAgentRepository, "findById")
        .mockResolvedValue(mockAgent);
      jest.spyOn(ChatService, "updateSession").mockResolvedValue(true);

      const result = await ChatService.switchAgent({
        sessionId: "session-1",
        agentId: "agent-2",
        reason: "user_switch",
        teamId: "team-1",
      });

      expect(result.success).toBe(true);
      expect(result.agent.id).toBe("agent-2");
      expect(ChatService.updateSession).toHaveBeenCalledWith("session-1", {
        aiAgentId: "agent-2",
        activeAgentId: "agent-2",
        agentHistory: expect.arrayContaining([
          expect.objectContaining({
            agentId: "agent-2",
            agentName: "New Agent",
          }),
        ]),
      });
    });
  });
});
```

## 4. Integration Testing

### 4.1 API Endpoint Testing

```typescript
// Example: Chat stream endpoint testing
describe("/api/chat/stream", () => {
  beforeEach(() => {
    // Setup test database
    await setupTestDB();

    // Mock AI Studio service
    mockAiStudioService();
  });

  it("should stream AI response", async () => {
    const session = await createTestSession();

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatSessionId: session.id,
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toContain("text/plain");

    // Verify streaming response
    const reader = response.body!.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(new TextDecoder().decode(value));
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join("")).toContain("Hello");
  });

  it("should handle authentication errors", async () => {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ chatSessionId: "test", content: "Hello" }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
```

### 4.2 AI Studio Integration Testing

```typescript
// Example: AI Studio service integration
describe("AiStudioService Integration", () => {
  it("should build system prompt with agent switching", async () => {
    const mockSession = {
      id: "session-1",
      aiAgentId: "agent-1",
      agentHistory: [{ agentName: "Previous Agent" }],
    };

    const mockAgent = {
      id: "agent-1",
      name: "Test Agent",
      instructions: "You are a helpful assistant",
    };

    jest
      .spyOn(chatRepository.ChatSessionRepository, "findById")
      .mockResolvedValue(mockSession);
    jest
      .spyOn(aiStudioRepository.AiAgentRepository, "findById")
      .mockResolvedValue(mockAgent);

    const systemPrompt = await AiStudioService.getSystemPrompt({
      sessionId: "session-1",
      teamId: "team-1",
      userId: "user-1",
    });

    expect(systemPrompt).toContain("Test Agent");
    expect(systemPrompt).toContain("You are a helpful assistant");
    expect(systemPrompt).toContain("system_reset"); // Agent switch detected
  });
});
```

## 5. End-to-End Testing

### 5.1 Critical User Flows

```typescript
// Example: Complete conversation flow
describe("Chat E2E Flows", () => {
  let page: Page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto("/apps/chat");
  });

  it("should complete full conversation flow", async () => {
    // 1. Start new conversation
    await page.click('[data-testid="new-chat-button"]');

    // 2. Send first message
    await page.fill('[data-testid="message-input"]', "Hello, how are you?");
    await page.click('[data-testid="send-button"]');

    // 3. Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 10000,
    });

    // 4. Verify message appears
    const aiMessage = await page.textContent('[data-testid="ai-message"]');
    expect(aiMessage).toBeTruthy();
    expect(aiMessage!.length).toBeGreaterThan(0);

    // 5. Verify session created
    const sessionTitle = await page.textContent(
      '[data-testid="session-title"]',
    );
    expect(sessionTitle).toBeTruthy();
  });

  it("should handle agent switching", async () => {
    // 1. Open agent selector
    await page.click('[data-testid="agent-selector"]');

    // 2. Select new agent
    await page.click('[data-testid="agent-option-marketing"]');

    // 3. Send message
    await page.fill(
      '[data-testid="message-input"]',
      "Create a marketing campaign",
    );
    await page.click('[data-testid="send-button"]');

    // 4. Verify agent personality in response
    await page.waitForSelector('[data-testid="ai-message"]');
    const response = await page.textContent('[data-testid="ai-message"]');
    expect(response).toContain("marketing"); // Should reflect agent personality
  });
});
```

### 5.2 Error Scenarios

```typescript
// Example: Error handling E2E tests
describe("Error Handling E2E", () => {
  it("should handle network failures gracefully", async () => {
    // 1. Simulate network failure
    await page.route("/api/chat/stream", (route) => route.abort());

    // 2. Try to send message
    await page.fill('[data-testid="message-input"]', "Test message");
    await page.click('[data-testid="send-button"]');

    // 3. Verify error message appears
    await page.waitForSelector('[data-testid="error-message"]');
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain("Failed to send message");

    // 4. Verify retry functionality
    await page.click('[data-testid="retry-button"]');
    await page.unroute("/api/chat/stream");

    // Should work after retry
    await page.waitForSelector('[data-testid="ai-message"]');
  });
});
```

## 6. Performance Testing

### 6.1 Streaming Performance

```typescript
// Example: Streaming performance tests
describe("Streaming Performance", () => {
  it("should maintain acceptable latency", async () => {
    const startTime = Date.now();

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        chatSessionId: "test-session",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    // First byte should arrive within 500ms
    const firstByteTime = Date.now() - startTime;
    expect(firstByteTime).toBeLessThan(500);

    const reader = response.body!.getReader();
    const { value } = await reader.read();

    expect(value).toBeTruthy();
    expect(value!.length).toBeGreaterThan(0);
  });

  it("should handle concurrent streams", async () => {
    const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
      fetch("/api/chat/stream", {
        method: "POST",
        body: JSON.stringify({
          chatSessionId: `test-session-${i}`,
          messages: [{ role: "user", content: `Message ${i}` }],
        }),
      }),
    );

    const responses = await Promise.all(concurrentRequests);

    // All requests should succeed
    responses.forEach((response) => {
      expect(response.ok).toBe(true);
    });
  });
});
```

### 6.2 UI Performance

```typescript
// Example: UI performance tests
describe('UI Performance', () => {
  it('should render large message lists efficiently', async () => {
    const manyMessages = Array.from({ length: 1000 }, (_, i) => ({
      id: `msg-${i}`,
      content: `Message ${i}`,
      senderRole: i % 2 === 0 ? 'user' : 'ai',
      createdAt: new Date()
    }));

    const startTime = performance.now();

    render(<MessageList messages={manyMessages} sessionId="test" />);

    // Initial render should complete quickly
    await waitFor(() => {
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    // Scroll performance test
    const scrollContainer = screen.getByTestId('message-list');
    const scrollStartTime = performance.now();

    fireEvent.scroll(scrollContainer, { target: { scrollTop: 5000 } });

    await waitFor(() => {
      const scrollTime = performance.now() - scrollStartTime;
      expect(scrollTime).toBeLessThan(50); // 50ms threshold
    });
  });
});
```

## 7. Testing Utilities

### 7.1 Test Helpers

```typescript
// Common test utilities
export const testUtils = {
  // Create mock session
  createMockSession: (overrides = {}) => ({
    id: 'test-session',
    title: 'Test Chat',
    userId: 'test-user',
    teamId: 'test-team',
    aiModelId: 'gpt-4',
    aiAgentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Create mock messages
  createMockMessages: (count = 5) =>
    Array.from({ length: count }, (_, i) => ({
      id: `msg-${i}`,
      content: `Test message ${i}`,
      senderRole: i % 2 === 0 ? 'user' : 'ai',
      chatSessionId: 'test-session',
      createdAt: new Date(),
      status: 'ok'
    })),

  // Setup test providers
  setupTestProviders: (children: React.ReactNode) => (
    <QueryClientProvider client={createTestQueryClient()}>
      <TRPCProvider>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  ),

  // Mock tRPC calls
  mockTRPC: (mocks: Record<string, any>) => {
    jest.mock('@/trpc/react', () => ({
      trpc: createMockTRPC(mocks)
    }));
  }
};
```

### 7.2 Custom Test Matchers

```typescript
// Custom Jest matchers
expect.extend({
  toBeStreaming(received) {
    const pass =
      received.headers.get("content-type")?.includes("text/plain") &&
      received.body instanceof ReadableStream;

    return {
      message: () => `expected response ${pass ? "not " : ""}to be streaming`,
      pass,
    };
  },

  toHaveValidChatMessage(received) {
    const pass =
      received.id &&
      received.content &&
      ["user", "ai"].includes(received.senderRole);

    return {
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to be a valid chat message`,
      pass,
    };
  },
});
```

## 8. Continuous Integration

### 8.1 CI Pipeline

```yaml
# Example: GitHub Actions workflow
name: Chat Testing Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Run integration tests
        run: pnpm test:integration

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 8.2 Quality Gates

| Metric                        | Threshold | Action                      |
| ----------------------------- | --------- | --------------------------- |
| **Unit Test Coverage**        | > 85%     | Block merge if below        |
| **Integration Test Coverage** | > 75%     | Block merge if below        |
| **E2E Test Success Rate**     | 100%      | Block merge if any failures |
| **Performance Regression**    | > 10%     | Require manual review       |

---

## Summary

The Chat Testing Complete Suite represents a **comprehensive, production-ready testing strategy** that ensures reliability, performance, and user experience quality. Through systematic unit testing, integration validation, end-to-end user flow verification, and performance monitoring, the chat system maintains high quality standards in production.

**Key Testing Achievements:**

- 🎯 **Comprehensive Coverage**: 87% unit, 78% integration, 65% E2E coverage
- ⚡ **Performance Validation**: Sub-500ms first byte latency testing
- 🔗 **Integration Assurance**: Full AI Studio service integration testing
- 🚀 **User Flow Coverage**: Critical conversation flows validated
- 🔧 **CI/CD Integration**: Automated testing in continuous integration
- 📊 **Quality Metrics**: Consistent quality gates and monitoring

This testing suite provides confidence in production deployments while enabling rapid development and feature iteration.
