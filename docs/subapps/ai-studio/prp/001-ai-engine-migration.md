# PRP: AI Engine Migration

<!-- AI-METADATA:
category: prp
feature: ai-engine-migration
complexity: advanced
estimated-effort: 48-72 hours
created: 2025-07-05
validation-status: aligned
language: en
-->

## 🔍 **Pre-Implementation Validation**

### Code Alignment Check ✅

- [x] Similar implementations reviewed (Chat API's direct Vercel SDK usage).
- [x] No conflicting patterns identified; this refactoring establishes a new, centralized pattern.
- [x] Architecture boundaries respected by creating a Service Facade.
- [x] Folder paths for involved services and routes validated.

### ESLint Compliance ✅

- [x] `useTRPC()` pattern planned for any potential frontend interactions.
- [x] Explicit typing strategy defined for all new methods and interfaces.
- [x] `Promise.allSettled` usage planned where applicable.
- [x] Validated env usage planned for all credentials.
- [x] No forbidden patterns in plan.

### Mandatory Formatting ✅

- [x] Document written in English only.
- [x] Sequential naming convention followed (`001`).
- [x] Proper numerical sequence identified.

## 🎯 Goal

To refactor the AI streaming architecture by centralizing all Vercel AI SDK logic within the `AiStudioService`, transforming it from a passive data provider into an active **AI Engine** and making consuming APIs like the Chat API simple proxies.

## 📋 Context

The Chat API currently handles all Vercel AI SDK integration directly in its route handlers (`apps/kdx/src/app/api/chat/stream/route.ts`). This includes creating provider instances, handling the streaming process with `streamText()`, and managing callbacks. The `AiStudioService` is merely a passive data provider for configurations. This tight coupling makes it difficult to reuse AI streaming logic in other parts of the application, increases maintenance overhead, and hinders future enhancements like centralized function calling or multi-modal support. This migration will pay down this technical debt by creating a centralized, reusable, and more maintainable AI streaming engine.

## 👥 Users

- **Primary Users**: Backend developers building new features that require AI text streaming. They will consume the simplified `AiStudioService.streamChatResponse` method.
- **Secondary Users**: Frontend developers who will see no change in the API contract of the `/api/chat/stream` endpoint, ensuring zero impact on the `useChat` hook implementation.

## ✅ Acceptance Criteria

- [ ] All Vercel AI SDK streaming logic is executed exclusively by `AiStudioService.streamChatResponse`.
- [ ] The Chat API route at `apps/kdx/src/app/api/chat/stream/route.ts` contains no direct Vercel AI SDK imports or usage.
- [ ] 100% feature parity with the existing implementation is maintained.
- [ ] End-to-end latency overhead is less than 100ms.
- [ ] All existing automated tests pass without modification.
- [ ] New unit tests provide >90% coverage for the new streaming logic in `AiStudioService`.
- [ ] The migration is achieved with zero downtime via a feature-flag-driven rollout.
- [ ] Documentation is updated to reflect the new architecture.
- [ ] Legacy code and feature flags are removed after successful rollout.
- [ ] Performance metrics show no degradation after 1 week of full rollout.
- [ ] **ESLint compliance**: All new code adheres to the rules in `@docs/eslint/kodix-eslint-coding-rules.md`.
- [ ] **Architecture boundaries**: The new service layer design respects data contracts and boundaries as defined in `@docs/architecture/data-contracts-and-boundaries.md`.

## 🏗️ Technical Specification

### Architecture

This migration implements the **Centralized Service Facade** pattern. `AiStudioService` will encapsulate all AI SDK logic, making it the single point of contact for AI streaming. Consuming services, like the Chat API, will delegate calls to this facade, becoming thin proxies. This approach decouples the AI provider logic from the application logic, improving modularity and reusability.

### Components

**Frontend Components:**

- No frontend changes required (API contract preserved)
- Existing `useChat` hook continues to work unchanged
- **ESLint compliant** (no frontend modifications needed)

**Backend Components:**

- `packages/api/src/internal/services/ai-studio.service.ts`: To be enhanced with a `createAIProvider` factory and the core `streamChatResponse` method. It will encapsulate all `ai` and `@ai-sdk/*` package interactions.
- `apps/kdx/src/app/api/chat/stream/route.ts`: To be refactored into a thin proxy that authenticates the user, prepares data, and delegates the streaming call to `AiStudioService`.
- `packages/shared/src/featureFlags.ts`: To be used for a temporary feature flag (`USE_CENTRALIZED_STREAMING`) to enable a safe, gradual rollout.
- **Service layer** communication between Chat API and AiStudioService

**Database Components:**

- No schema changes required
- Existing message persistence via `ChatService`
- **Type-safe** operations maintained through Drizzle ORM

### Data Flow

1. User sends a message via the Chat UI.
2. The `POST /api/chat/stream` route in `apps/kdx` is triggered.
3. The route handler authenticates the user, validates the request, and retrieves the message history via `ChatService`.
4. **If the `USE_CENTRALIZED_STREAMING` feature flag is enabled:**
   a. The route handler calls `AiStudioService.streamChatResponse`, passing messages and context.
   b. `AiStudioService` determines the correct AI model, retrieves the necessary provider token, and constructs the provider instance (`createOpenAI`, etc.).
   c. It calls `streamText` from the `ai` package, handling the entire streaming process.
   d. The `onFinish` callback within the service invokes a callback passed from the API route to persist the final AI message using `ChatService`.
   e. The service returns a `DataStreamResponse` directly to the client.
5. The frontend `useChat` hook consumes the stream and updates the UI.

### Kodix Stack Integration

**Next.js 15 (App Router):**

- API route: `apps/kdx/src/app/api/chat/stream/route.ts` (simplified to proxy)
- No new pages or components required
- Maintains existing streaming response format

**tRPC v11:**

- No new tRPC endpoints required
- Uses existing `ChatService` for message persistence
- **Service layer** communication between AiStudioService and ChatService
- **useTRPC() pattern** maintained where applicable

**Drizzle ORM:**

- Schema in `packages/db/schema/` (no changes needed)
- **Type-safe** message persistence operations
- Metadata storage via existing message schema

**Vercel AI SDK:**

- All interactions with `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, and `ai` centralized within `AiStudioService`
- Provider abstraction handled by service layer
- Streaming protocol preserved for frontend compatibility

## 🧪 Testing Requirements

### Unit Tests

- **File**: `packages/api/src/services/__tests__/ai-studio-streaming.test.ts`
- Test `AiStudioService.streamChatResponse` for robust functionality.
- Cover all provider instances (OpenAI, Anthropic, Google).
- Test graceful error handling for missing models or invalid tokens.
- Verify that system prompts are correctly included.
- Ensure the `onMessageSave` callback is invoked with the correct metadata payload.

### Integration Tests

- Full streaming workflow tests
- Provider integration tests (OpenAI, Anthropic, Google)
- Feature flag behavior tests
- Cross-service communication tests
- Error propagation tests

### Regression Tests

- Create tests that capture the current behavior of the chat streaming endpoint to prevent any regressions in functionality, stream format, or error handling.

### E2E Tests (if critical)

- Complete chat flow with new architecture
- Performance benchmarks and latency testing
- Provider switching scenarios

**Testing Reference**: Follow patterns from `@docs/tests/README.md`.

## 🚀 Implementation Plan

### Phase 1: Preparation & Analysis (8-16 hours)

1. **Validate folder structure** (ensure all paths exist)
2. **Dependency Analysis**: Map all current Vercel AI SDK integration points and data flows
3. **Create Regression Tests**: Write tests to capture current behavior and prevent regressions
4. **Configure Feature Flag**: Set up `USE_CENTRALIZED_STREAMING` in `packages/shared/src/featureFlags.ts`

### Phase 2: Core Implementation (16-24 hours)

1. **Create Provider Factory**: Implement `createAIProvider` in `AiStudioService` to centralize provider creation
2. **Implement `streamChatResponse`**: Build the core streaming method in `AiStudioService` to encapsulate all Vercel AI SDK logic
3. **Write Unit Tests**: Ensure the new service method has >90% test coverage
4. **Add validation logic**: Implement proper error handling and type safety

### Phase 3: Integration (8-16 hours)

1. **Refactor Chat API Route**: Modify the `/api/chat/stream` route to act as a proxy, delegating to `AiStudioService` based on the feature flag
2. **Write Integration Tests**: Test the full workflow and cross-service communication
3. **Performance Testing**: Validate latency requirements are met

### Phase 4: Activation & Cleanup (8 hours)

1. **Progressive Rollout**: Activate the feature flag gradually, from internal teams to beta users, then to full rollout
2. **Full Validation**: Run through the full validation checklist, including performance monitoring
3. **Remove Legacy Code**: Once stable, delete the old implementation from the Chat API route, remove the feature flag, and clean up dependencies
4. \***\*ESLint compliance check**: Ensure all new code follows coding standards

### Phase 5: Documentation & Monitoring (8 hours)

1. **Update Documentation**: Update `chat-architecture.md`, create a new `ai-studio-architecture.md`, and write an ADR for the change
2. **Add Monitoring**: Implement metrics collection within `streamChatResponse` to log duration, provider usage, and errors
3. **Add i18n support**: Ensure no hardcoded strings (if applicable)
4. **Final testing**: Complete E2E tests and performance validation

## ⚠️ Risks & Mitigations

- **Risk**: Increased latency due to an extra service layer call.
  - **Mitigation**: The call is internal and should have negligible overhead. Monitor p95 latency during rollout and ensure it stays below 100ms.
- **Risk**: Breaking changes for the frontend `useChat` hook.
  - **Mitigation**: The API route will return the `DataStreamResponse` directly from the service, preserving the exact same stream format and headers.
- **Risk**: Issues with a specific AI provider.
  - **Mitigation**: Comprehensive regression and unit tests for each provider will minimize this risk.
- **Risk**: **ESLint violations** during development.
  - **Mitigation**: Run `pnpm lint` continuously during development and in CI.
- **Risk**: **Architecture boundaries** violation.
  - **Mitigation**: Code reviews to ensure the Chat API does not retain any SDK logic.
- **Risk**: Multi-tenancy concerns with centralized service.
  - **Mitigation**: Ensure teamId isolation is maintained in all service calls.
- **Risk**: Performance degradation with additional service layer.
  - **Mitigation**: Monitor p95 latency and implement caching if needed.

## 📚 References

- **Architecture**: `@docs/architecture/`
- **ESLint Rules**: `@docs/eslint/kodix-eslint-coding-rules.md`
- **Data Boundaries**: `@docs/architecture/data-contracts-and-boundaries.md`
- **Service Layer**: `@docs/architecture/service-layer-patterns.md`
- **Testing**: `@docs/tests/README.md`
- **Similar features**: Existing `ChatService` and `AiStudioService` patterns
- **Design system**: `@packages/ui/` (not applicable for this backend migration)
- **Source Document**: `@docs/subapps/ai-studio/planning/ai-engine-migration-execution-plan.md`
