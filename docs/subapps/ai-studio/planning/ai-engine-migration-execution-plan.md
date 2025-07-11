# AI Engine Migration: Strategy & Execution Plan

> **Created**: 2025-07-05  
> **Last Updated**: 2025-01-03  
> **Status**: 📝 **Pending Execution**  
> **Risk**: Medium | **Impact**: High | **Priority**: High

---

## 1. Current Status & Executive Summary

**This migration has not yet been implemented.** The Chat API currently handles all Vercel AI SDK integration directly in its route handlers. This document outlines the approved plan to refactor this architecture by centralizing all AI streaming logic within the `AiStudioService`.

### Current Architecture Analysis

Based on code inspection (January 2025), the current implementation shows:

1. **Chat API (`apps/kdx/src/app/api/chat/stream/route.ts`)**:

   - Directly imports and uses Vercel AI SDK (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`)
   - Creates provider instances inline
   - Handles streaming with `streamText()` from `ai` package
   - Manages the `onFinish` callback for message persistence

2. **AiStudioService (`packages/api/src/internal/services/ai-studio.service.ts`)**:
   - Currently acts as a **data provider** (configuration, models, tokens, prompts)
   - Does NOT handle any streaming or Vercel AI SDK interaction
   - Provides helper methods: `getModelById`, `getProviderToken`, `getSystemPrompt`, etc.

### Migration Goal

Transform `AiStudioService` from a passive data provider into an active **AI Engine** that encapsulates all Vercel AI SDK logic, making the Chat API a simple proxy.

### Success Metrics

- ✅ 100% feature parity with the existing implementation
- ✅ Latency overhead is negligible (< 100ms)
- ✅ All automated tests pass
- ✅ Zero downtime migration
- ✅ Improved testability and maintainability

---

## 2. Architectural Decision

The chosen strategy is to implement the **Centralized Service Facade** pattern. This decision was made after evaluating three potential architectures:

1. **Centralized Service Facade (Chosen)**: `AiStudioService` encapsulates all AI SDK logic. Consuming services (like Chat) delegate calls directly to it. This offers the best balance of effort, risk, and reward.
2. **Smart API Gateway**: A dedicated gateway would route all AI traffic. This offers more flexibility but adds significant infrastructural complexity.
3. **Event-Driven Architecture (EDA)**: Services would communicate asynchronously via a message bus. While highly scalable, the complexity for real-time streaming is currently prohibitive.

The Service Facade pattern achieves our primary decoupling goals with the lowest complexity and is a natural evolution of our current codebase.

---

## 3. Implementation Strategy: When to Migrate?

This refactoring is a planned investment to pay down **Prudent Technical Debt**. It is not an emergency fix. The migration should be prioritized and executed as soon as one of the following triggers is met:

1. **Expansion Trigger (Primary)**: The development of a **second SubApp that requires AI streaming capabilities**. This makes the pain of duplicated logic immediate and justifies the refactoring as the first step for the new project.
2. **Maintenance Cost Trigger**: If the engineering time spent maintaining or debugging the current Chat streaming endpoint exceeds a defined threshold (e.g., >8 hours in a month).
3. **Feature Enhancement Trigger**: When implementing advanced features like streaming function calls, tool use, or multi-modal support that would benefit from centralized handling.

**Action Plan**: This task should remain in the backlog as a high-priority candidate for our "technical debt budget" in each development cycle, to be executed immediately if a trigger is met.

---

## 4. Phased Execution Plan

### Phase 1: Preparation & Analysis (1-2 days)

#### 1.1 Impact and Dependency Analysis

**Goal**: Fully map the scope of the change.

```bash
# Search for all Vercel AI SDK usage
pnpm codebase-search "createOpenAI|createAnthropic|createGoogleGenerativeAI|streamText" --target-directories ["apps/kdx"]
pnpm codebase-search "ai-sdk" --target-directories ["apps/kdx"]

# Map AiStudioService current usage
pnpm codebase-search "AiStudioService" --target-directories ["apps/kdx", "packages/api"]
```

- [ ] Document all current Vercel AI SDK integration points
- [ ] Map current data flows for chat streaming
- [ ] Identify all provider-specific logic (OpenAI, Anthropic, Google)
- [ ] Document critical behaviors to preserve (headers, error handling, metadata)

#### 1.2 Create Regression Tests

**File**: `packages/api/src/services/__tests__/ai-studio-streaming.test.ts`
**Goal**: Capture current behavior to prevent regressions.

```typescript
describe("AI Engine Migration - Regression Tests", () => {
  describe("Stream Response Format", () => {
    test("Should return proper data stream format", async () => {
      /* Test stream chunks, headers, encoding */
    });

    test("Should handle provider-specific models correctly", async () => {
      /* Test OpenAI, Anthropic, Google model creation */
    });
  });

  describe("Error Handling", () => {
    test("Should handle missing tokens gracefully", async () => {
      /* ... */
    });

    test("Should handle invalid models", async () => {
      /* ... */
    });
  });

  describe("Metadata Persistence", () => {
    test("Should save correct metadata onFinish", async () => {
      /* Test usage, model info, timestamps */
    });
  });
});
```

#### 1.3 Configure Feature Flag System

**File**: `packages/shared/src/featureFlags.ts`
**Goal**: Enable safe, gradual rollout.

```typescript
export const AI_ENGINE_MIGRATION_FLAGS = {
  USE_CENTRALIZED_STREAMING: false,
  LOG_MIGRATION_METRICS: true,
  ENABLE_FALLBACK: true,
} as const;
```

---

### Phase 2: Core Implementation (2-3 days)

#### 2.1 Create Provider Factory in AiStudioService

**Location**: `packages/api/src/internal/services/ai-studio.service.ts`
**Goal**: Centralize provider instance creation.

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

private static async createAIProvider(
  model: AiModel,
  token: string
): Promise<{ provider: any, modelName: string }> {
  const providerName = model.provider.name.toLowerCase();
  const modelConfig = model.config as any;
  const modelName = modelConfig?.modelId || modelConfig?.version || model.displayName;

  switch (providerName) {
    case "openai":
      return {
        provider: createOpenAI({
          apiKey: token,
          baseURL: model.provider.baseUrl || undefined,
        })(modelName),
        modelName
      };

    case "anthropic":
      return {
        provider: createAnthropic({
          apiKey: token,
          baseURL: model.provider.baseUrl || undefined,
        })(modelName),
        modelName
      };

    case "google":
      return {
        provider: createGoogleGenerativeAI({
          apiKey: token,
        })(modelName),
        modelName
      };

    default:
      throw new Error(`Provider ${model.provider.name} not supported`);
  }
}
```

#### 2.2 Implement streamChatResponse Method

**Location**: `packages/api/src/internal/services/ai-studio.service.ts`
**Goal**: Encapsulate all streaming logic in a single, reusable service method.

```typescript
import { streamText } from "ai";

interface StreamChatResponseParams {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  sessionId: string;
  userId: string;
  teamId: string;
  modelId?: string; // Optional, will use default if not provided
  temperature?: number;
  maxTokens?: number;
  onMessageSave?: (message: any) => Promise<void>;
  onError?: (error: Error) => void;
}

static async streamChatResponse({
  messages,
  sessionId,
  userId,
  teamId,
  modelId,
  temperature = 0.7,
  maxTokens = 4000,
  onMessageSave,
  onError,
}: StreamChatResponseParams) {
  try {
    // 1. Get or determine model
    let model;
    if (modelId) {
      model = await this.getModelById({ modelId, teamId, requestingApp: chatAppId });
    } else {
      const availableModels = await this.getAvailableModels({ teamId, requestingApp: chatAppId });
      if (availableModels.length === 0) {
        throw new Error("No AI models available");
      }
      model = availableModels[0];
    }

    // 2. Get provider token
    const providerToken = await this.getProviderToken({
      providerId: model.providerId,
      teamId,
      requestingApp: chatAppId,
    });

    // 3. Create provider instance
    const { provider: vercelModel, modelName } = await this.createAIProvider(model, providerToken.token);

    // 4. Get system prompt (includes agent instructions if applicable)
    const systemPrompt = await this.getSystemPrompt({
      teamId,
      userId,
      sessionId,
    });

    // 5. Format messages with system prompt
    const formattedMessages = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;

    // 6. Execute streaming with Vercel AI SDK
    const result = streamText({
      model: vercelModel,
      messages: formattedMessages,
      temperature,
      maxTokens,
      onFinish: async ({ text, usage, finishReason }) => {
        // Build metadata
        const metadata = {
          requestedModel: modelName,
          actualModelUsed: modelName,
          providerId: model.providerId,
          providerName: model.provider.name,
          usage: usage || null,
          finishReason: finishReason || "stop",
          timestamp: new Date().toISOString(),
        };

        // Call the save callback if provided
        if (onMessageSave) {
          await onMessageSave({
            content: text,
            metadata,
          });
        }
      },
      onError: (error) => {
        console.error("[AiStudioService] Stream error:", error);
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      },
    });

    // 7. Return the stream with proper headers
    return result.toDataStreamResponse({
      headers: {
        "Transfer-Encoding": "chunked",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    console.error("[AiStudioService] streamChatResponse error:", error);
    throw error;
  }
}
```

#### 2.3 Unit Tests for New Method

**Goal**: Ensure the new service method is robust, with >90% test coverage.

```typescript
describe("AiStudioService.streamChatResponse", () => {
  test("should create correct provider instances", async () => {
    // Test OpenAI, Anthropic, Google provider creation
  });

  test("should handle missing models gracefully", async () => {
    // Test default model selection
  });

  test("should include system prompts correctly", async () => {
    // Test prompt orchestration
  });

  test("should handle streaming errors", async () => {
    // Test error propagation
  });

  test("should call onMessageSave with correct metadata", async () => {
    // Test callback invocation
  });
});
```

---

### Phase 3: Integration (1-2 days)

#### 3.1 Refactor Chat API Route as a Proxy

**File**: `apps/kdx/src/app/api/chat/stream/route.ts`
**Goal**: Simplify the API route to be a thin proxy delegating to `AiStudioService`.

```typescript
import { AiStudioService } from "@/packages/api/src/internal/services/ai-studio.service";
import { ChatService } from "@/packages/api/src/internal/services/chat.service";

import { auth } from "@kdx/auth";
import { AI_ENGINE_MIGRATION_FLAGS } from "@kdx/shared";

export async function POST(request: NextRequest) {
  try {
    const authSession = await auth();
    if (!authSession?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, activeTeamId: teamId } = authSession.user;
    const body = await request.json();

    const { chatSessionId, messages } = body;
    const lastUserMessage = messages
      ?.filter((m: any) => m.role === "user")
      .pop();
    const content = lastUserMessage?.content;

    if (!chatSessionId || !content) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Verify session exists
    const session = await ChatService.findSessionById(chatSessionId);
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // Save user message
    await ChatService.createMessage({
      chatSessionId: session.id,
      senderRole: "user",
      content,
      status: "ok",
    });

    // Get message history
    const messageHistory = await ChatService.findMessagesBySession({
      chatSessionId: session.id,
      limite: 20,
      offset: 0,
      ordem: "asc",
    });

    // Format messages for AI
    const formattedMessages = messageHistory
      .filter((msg: any) => msg.content?.trim())
      .map((msg: any) => ({
        role: msg.senderRole === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    if (AI_ENGINE_MIGRATION_FLAGS.USE_CENTRALIZED_STREAMING) {
      // NEW: Delegate to AiStudioService
      return AiStudioService.streamChatResponse({
        messages: formattedMessages,
        sessionId: session.id,
        userId,
        teamId,
        modelId: session.aiModelId,
        onMessageSave: async (messageData) => {
          await ChatService.createMessage({
            chatSessionId: session.id,
            senderRole: "ai",
            content: messageData.content,
            status: "ok",
            metadata: messageData.metadata,
          });
        },
      });
    } else {
      // CURRENT: Legacy implementation (to be removed after migration)
      // ... existing code ...
    }
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
```

---

### Phase 4: Activation & Cleanup (1 day)

#### 4.1 Progressive Rollout

1. **Stage 1**: Enable for internal testing team (5% traffic)

   ```typescript
   USE_CENTRALIZED_STREAMING: process.env.NODE_ENV === "development";
   ```

2. **Stage 2**: Enable for beta users (25% traffic)

   ```typescript
   USE_CENTRALIZED_STREAMING: Math.random() < 0.25;
   ```

3. **Stage 3**: Full rollout (100% traffic)
   ```typescript
   USE_CENTRALIZED_STREAMING: true;
   ```

#### 4.2 Full Validation Checklist

- [ ] All automated tests pass
- [ ] Chat functionality works with all providers (OpenAI, Anthropic, Google)
- [ ] Agent switching works correctly
- [ ] System prompts are applied properly
- [ ] Metadata is saved correctly
- [ ] Error handling matches current behavior
- [ ] Performance metrics are within acceptable range
- [ ] No memory leaks in streaming

#### 4.3 Remove Legacy Code

1. Delete the old implementation from Chat API route:
   - Remove Vercel AI SDK imports
   - Remove `getVercelModel` helper function
   - Remove direct `streamText` usage
2. Clean up unused imports and dependencies

3. Remove feature flag system

4. Update package dependencies (remove direct AI SDK deps from `apps/kdx`)

---

### Phase 5: Documentation & Monitoring (1 day)

#### 5.1 Update Documentation

- **`chat-architecture.md`**: Document new simplified flow
- **`ai-studio-architecture.md`**: Add streaming responsibilities
- **`api-reference.md`**: Document new `streamChatResponse` method
- Create ADR: `docs/adr/YYYY-MM-DD-ai-engine-centralization.md`

#### 5.2 Add Monitoring

```typescript
// Add metrics collection
static async streamChatResponse(params) {
  const startTime = Date.now();

  try {
    // ... implementation ...

    // Log success metrics
    console.log("[AI_ENGINE_METRICS]", {
      action: "stream_complete",
      duration: Date.now() - startTime,
      provider: model.provider.name,
      model: modelName,
      tokensUsed: usage?.totalTokens,
    });
  } catch (error) {
    // Log error metrics
    console.error("[AI_ENGINE_METRICS]", {
      action: "stream_error",
      duration: Date.now() - startTime,
      error: error.message,
    });
    throw error;
  }
}
```

---

## 5. Technical Considerations

### Vercel AI SDK Integration Points

The migration must handle all current Vercel AI SDK features:

1. **Provider Creation**: Different initialization for each provider
2. **Model Selection**: Proper model name resolution from config
3. **Streaming Protocol**: Maintain compatibility with `useChat` hook
4. **Error Handling**: Preserve current error messages and codes
5. **Metadata Collection**: Ensure usage stats are captured

### Critical Code Paths to Preserve

1. **Headers for Streaming**:

   ```typescript
   "Transfer-Encoding": "chunked",
   "Connection": "keep-alive",
   "Cache-Control": "no-cache, no-store, must-revalidate",
   "X-Accel-Buffering": "no", // Nginx buffering fix
   ```

2. **Model Name Resolution**:

   ```typescript
   const modelName =
     modelConfig?.modelId || modelConfig?.version || model.displayName;
   ```

3. **System Prompt Orchestration**: Must maintain current hierarchy and agent switching logic

---

## 6. Contingency & Rollback

### Monitoring During Rollout

1. **Error Rate Monitoring**: Alert if errors increase >5%
2. **Latency Monitoring**: Alert if p95 latency increases >100ms
3. **User Feedback**: Monitor support tickets for streaming issues

### Quick Rollback Process

1. Set feature flag to `false`
2. Deploy immediately (no code changes needed)
3. If critical issues persist: `git revert <commit-hash>`

### Rollback Decision Criteria

- Error rate increases >10%
- P95 latency increases >200ms
- Critical functionality broken (agent switching, specific providers)
- Memory usage increases >20%

---

## 7. Definition of Done

The migration is complete when:

1. ✅ `AiStudioService.streamChatResponse` is the sole executor of Vercel AI SDK streaming
2. ✅ The Chat API route contains no direct Vercel AI SDK imports or usage
3. ✅ All existing tests pass without modification
4. ✅ New tests provide >90% coverage of streaming logic
5. ✅ Documentation is updated to reflect new architecture
6. ✅ Legacy code and feature flags are removed
7. ✅ Performance metrics show no degradation
8. ✅ Zero customer-reported issues after 1 week of full rollout

---

## 8. Future Enhancements (Post-Migration)

Once the centralized architecture is in place, these become trivial to implement:

1. **Streaming Function Calls**: Add tool use support centrally
2. **Multi-Modal Support**: Handle images/audio in one place
3. **Response Caching**: Implement at the service layer
4. **A/B Testing**: Easy model comparison with centralized control
5. **Advanced Monitoring**: Detailed metrics and observability
6. **Provider Abstraction**: Add new providers without touching consumers
