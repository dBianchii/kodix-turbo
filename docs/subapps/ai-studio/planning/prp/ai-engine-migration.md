# PRP: AI Engine Migration - Centralize Vercel AI SDK in AiStudioService

<!-- AI-METADATA:
category: prp
feature: ai-engine-migration
complexity: advanced
estimated-effort: 40-60
created: 2025-01-03
-->

## 🎯 Goal

Transform AiStudioService from a passive data provider into an active AI Engine that encapsulates all Vercel AI SDK streaming logic, making the Chat API and future AI-consuming services simple proxies.

## 📋 Context

The current architecture has the Chat API directly handling all Vercel AI SDK integration, including provider instantiation, streaming, and error handling. This creates several issues:

- **Code Duplication**: Every new SubApp that needs AI streaming must duplicate this complex logic
- **Maintenance Burden**: Provider-specific logic scattered across multiple endpoints
- **Testing Complexity**: Difficult to test AI functionality in isolation
- **Limited Reusability**: No central place to add features like caching, monitoring, or A/B testing
- **Inconsistent Error Handling**: Each implementation handles errors differently

This migration addresses these pain points by centralizing all AI streaming logic in the AiStudioService, following the Centralized Service Facade pattern.

## 👥 Users

**Primary Users:**

- **Developers**: Building new AI-powered features in Kodix SubApps
- **DevOps**: Monitoring and debugging AI interactions
- **End Users**: Experiencing consistent AI behavior across all SubApps

**Use Cases:**

- Chat conversations with AI models
- AI-powered document generation
- Code assistance features
- Any future AI streaming needs

**Expected Benefits:**

- Faster feature development (no need to reimplement streaming)
- Consistent error messages and handling
- Centralized monitoring and metrics
- Easy provider switching and A/B testing

## ✅ Acceptance Criteria

- [ ] AiStudioService exposes a `streamChatResponse` method that handles all Vercel AI SDK logic
- [ ] Chat API route contains no direct Vercel AI SDK imports or usage
- [ ] All three providers work correctly: OpenAI, Anthropic, Google
- [ ] Agent switching and system prompts work as before
- [ ] Metadata is saved with same structure as current implementation
- [ ] Streaming headers are preserved for proper real-time response
- [ ] Error handling maintains current user-facing messages
- [ ] Performance overhead is less than 100ms
- [ ] Feature flag system allows gradual rollout
- [ ] All existing Chat tests pass without modification
- [ ] New unit tests cover streaming logic with >90% coverage
- [ ] Zero downtime migration with rollback capability

## 🏗️ Technical Specification

### Architecture

**Service Layer Pattern:**

- AiStudioService becomes the central AI Engine
- Chat API (and future consumers) delegate to AiStudioService
- Maintains SubApp isolation - each app still uses its own appId
- Cross-app communication happens through the Service Layer

**Security Considerations:**

- teamId isolation preserved through existing service methods
- Token encryption remains unchanged
- No new security surface area introduced

### Components

**Frontend Components:**

- No frontend changes required
- Existing `useChat` hook continues to work
- Same streaming protocol maintained

**Backend Components:**

**AiStudioService Enhancements:**

- `createAIProvider()`: Factory method for provider instances
- `streamChatResponse()`: Main streaming orchestrator
- Existing methods remain unchanged

**Chat API Refactoring:**

- Becomes a thin proxy to AiStudioService
- Handles authentication and session validation
- Delegates streaming to service layer

**Database Components:**

- No schema changes required
- Same message storage pattern
- Metadata structure unchanged

### Data Flow

1. User sends message through Chat UI
2. Chat API validates session and saves user message
3. Chat API calls `AiStudioService.streamChatResponse()`
4. AiStudioService:
   - Determines model (from session or default)
   - Fetches provider token
   - Creates provider instance via factory
   - Gets system prompt (with agent instructions)
   - Executes streaming with Vercel AI SDK
5. Stream returns to Chat API with proper headers
6. Client receives real-time stream
7. On completion, message saved with metadata

### Stack Integration

**Next.js 15 (App Router):**

- Route remains at: `app/api/chat/stream/route.ts`
- No changes to routing or middleware
- Server-side streaming preserved

**tRPC v11:**

- No new tRPC procedures needed
- Existing procedures used by AiStudioService

**Vercel AI SDK:**

- Version: Latest (ai package)
- Providers: @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google
- Core method: streamText()

**TypeScript:**

- Strict mode compliance required
- Proper typing for all streaming methods
- Generic types for provider flexibility

## 🧪 Testing Requirements

### Unit Tests

**AiStudioService Tests:**

- `createAIProvider()`: Test each provider type creation
- `streamChatResponse()`: Test streaming with mocked providers
- Error handling for missing tokens
- Default model selection logic
- System prompt inclusion

**Provider Factory Tests:**

- OpenAI provider creation with custom baseURL
- Anthropic provider creation
- Google provider creation
- Unknown provider error handling

### Integration Tests

- Full streaming flow with real providers (test environment)
- Message persistence after streaming
- Metadata structure validation
- Error propagation from providers
- Agent switching during conversation

### Regression Tests

- All existing Chat tests must pass
- Streaming format compatibility
- Header preservation
- Error message consistency
- Performance benchmarks

## 🚀 Implementation Plan

### Phase 1: Preparation & Analysis (8 hours)

1. **Dependency Mapping** (2 hours)

   - Document all Vercel AI SDK usage in Chat API
   - Map provider-specific logic
   - Identify critical code paths

2. **Test Creation** (4 hours)

   - Write regression tests for current behavior
   - Create test fixtures for streaming
   - Set up provider mocks

3. **Feature Flag Setup** (2 hours)
   - Add migration flags to shared config
   - Create monitoring hooks
   - Set up metrics collection

### Phase 2: Core Implementation (16 hours)

1. **Provider Factory** (4 hours)

   - Implement `createAIProvider()` method
   - Handle all three provider types
   - Add comprehensive error handling

2. **Stream Response Method** (8 hours)

   - Implement `streamChatResponse()`
   - Integrate with existing service methods
   - Add proper TypeScript types

3. **Unit Testing** (4 hours)
   - Test all new methods
   - Mock provider responses
   - Verify error scenarios

### Phase 3: Integration (8 hours)

1. **Chat API Refactoring** (4 hours)

   - Add feature flag check
   - Implement proxy pattern
   - Preserve existing behavior

2. **Integration Testing** (4 hours)
   - End-to-end streaming tests
   - Performance validation
   - Error scenario testing

### Phase 4: Rollout & Cleanup (8 hours)

1. **Progressive Rollout** (4 hours)

   - Stage 1: Dev environment (1 day)
   - Stage 2: 25% of users (3 days)
   - Stage 3: 100% deployment (1 week)

2. **Legacy Cleanup** (2 hours)

   - Remove old implementation
   - Update dependencies
   - Remove feature flags

3. **Documentation** (2 hours)
   - Update architecture docs
   - Create migration ADR
   - Update API references

## ⚠️ Risks & Mitigations

- **Risk**: Streaming protocol incompatibility
  **Mitigation**: Extensive testing with useChat hook, preserve exact header structure

- **Risk**: Performance degradation from additional service call
  **Mitigation**: Benchmark before/after, optimize service communication, 100ms threshold

- **Risk**: Provider-specific edge cases not handled
  **Mitigation**: Comprehensive provider testing, maintain provider test accounts

- **Risk**: Rollback complexity if issues found
  **Mitigation**: Feature flag system, no database changes, instant rollback capability

- **Risk**: Memory leaks in streaming
  **Mitigation**: Proper stream cleanup, monitor memory usage, load testing

## 📊 Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage > 90% for new code
- [ ] No increase in error rate during rollout
- [ ] P95 latency increase < 100ms
- [ ] Zero customer-reported issues after full rollout
- [ ] No memory leaks detected in 7-day monitoring
- [ ] Successful implementation of one new AI feature using centralized service

## 📚 References

- [AI Engine Migration Execution Plan](../ai-engine-migration-execution-plan.md)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Current Chat Implementation](../../../../../apps/kdx/src/app/api/chat/stream/route.ts)
- [AiStudioService](../../../../../packages/api/src/internal/services/ai-studio.service.ts)
- [Kodix Service Layer Architecture](../../../../architecture/service-layer-pattern.md)
- [SubApp Architecture](../../../../architecture/subapp-architecture.md)
