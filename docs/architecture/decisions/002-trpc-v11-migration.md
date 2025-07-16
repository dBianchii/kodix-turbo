<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture

complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# ADR-002: tRPC v11 Migration Strategy

## Status

Accepted

**Date**: 2025-07-12  
**Stakeholders**: Backend Team, Frontend Team, API Consumers  
**Review Date**: 2025-10-12

## Context

### Background

The Kodix platform was using an earlier version of tRPC and needed to migrate to tRPC v11 to take advantage of:

- Improved performance and bundle size
- Better TypeScript integration
- Enhanced developer experience
- Modern React Query integration
- Better error handling and validation

### Problem Statement

We needed to establish a migration strategy that would:

- Minimize disruption to ongoing development
- Maintain type safety throughout the migration
- Establish new patterns for web vs mobile API differences
- Implement proper validation tooling and patterns

## Decision

We have adopted tRPC v11 with the following implementation strategy:

### Import Patterns

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->

```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// New standard import pattern
import { useTRPC } from "~/trpc/react";

// Usage pattern
function Component() {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery(
    trpc.user.getAll.queryOptions({
      teamId: "team_123",
    }),
  );
}

// NEVER use direct imports - FORBIDDEN
// ❌ FORBIDDEN: import { api } from "~/trpc/api";
```

<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Web vs Mobile API Differences

- **Web Application**: Full tRPC v11 with React Query integration
- **Mobile Applications**: REST API endpoints generated from tRPC procedures
- **Shared Types**: Common TypeScript types between platforms
- **Validation**: Unified Zod schemas for all platforms

### Validation Tooling

- **Zod Schemas**: All API inputs and outputs validated with Zod
- **Runtime Validation**: tRPC procedures automatically validate inputs
- **Type Generation**: Types automatically inferred from Zod schemas
- **Error Handling**: Standardized error responses across all endpoints

## Options Considered

### Migration Approach Options

#### Option 1: Gradual Migration (Selected)

- **Pros**:
  - Minimal disruption to ongoing development
  - Allows learning and pattern establishment
  - Risk mitigation through incremental changes
  - Parallel development possible
- **Cons**:
  - Longer migration timeline
  - Temporary code complexity
  - Multiple patterns during transition

#### Option 2: Big Bang Migration

- **Pros**:
  - Faster completion
  - No temporary complexity
  - Immediate benefits
- **Cons**:
  - High risk of breaking changes
  - Blocks all development during migration
  - Difficult to test incrementally

#### Option 3: Parallel Implementation

- **Pros**:
  - Zero downtime
  - Safe rollback option
  - Full testing before switch
- **Cons**:
  - Duplicate maintenance effort
  - Code complexity
  - Resource intensive

### Import Pattern Options

#### Option 1: useTRPC Hook Pattern (Selected)

- **Pros**:
  - Consistent with React patterns
  - Easy to mock for testing
  - Clear dependency injection
  - Follows tRPC v11 recommendations
- **Cons**:
  - More verbose than direct imports
  - Additional hook complexity

#### Option 2: Direct API Imports

- **Pros**:
  - Simpler import statements
  - Less boilerplate code
- **Cons**:
  - Harder to mock for testing
  - Less flexible for different contexts
  - Not recommended by tRPC v11

### Validation Strategy Options

#### Option 1: Zod with tRPC Integration (Selected)

- **Pros**:
  - Runtime and compile-time validation
  - Automatic type inference
  - Excellent TypeScript integration
  - Built into tRPC
- **Cons**:
  - Learning curve for team
  - Bundle size impact

#### Option 2: TypeScript Only

- **Pros**:
  - No runtime overhead
  - Simple implementation
- **Cons**:
  - No runtime validation
  - Potential security vulnerabilities
  - Manual type maintenance

## Consequences

### Positive

- **Type Safety**: Complete end-to-end type safety from API to UI
- **Performance**: Improved performance and smaller bundle sizes
- **Developer Experience**: Better development experience with improved tooling
- **Error Handling**: Standardized error handling across all endpoints
- **Validation**: Automatic runtime validation prevents data inconsistencies
- **Testing**: Easier to mock and test API interactions

### Negative

- **Learning Curve**: Team needs to learn new patterns and conventions
- **Migration Effort**: Significant effort required to migrate existing APIs
- **Bundle Size**: Zod validation adds to bundle size
- **Mobile Complexity**: Additional layer for mobile API consumption

### Neutral

- **Code Changes**: Requires updating all existing API usage patterns
- **Documentation**: Need to update all API documentation
- **Tooling**: May require updates to development and testing tools

## Implementation

### Timeline

- **Phase 1** (Week 1-2): Setup new tRPC v11 infrastructure
- **Phase 2** (Week 3-6): Migrate core APIs (auth, user management)
- **Phase 3** (Week 7-10): Migrate SubApp APIs
- **Phase 4** (Week 11-12): Complete migration and cleanup

### Success Criteria

- All API endpoints use tRPC v11 patterns
- 100% type safety from backend to frontend
- Zero runtime validation errors in production
- All tests passing with new patterns
- Developer productivity maintained or improved

### Rollback Plan

- Maintain parallel old API patterns during migration
- Feature flags to switch between old and new patterns
- Gradual rollback possible on per-endpoint basis
- Database changes are backwards compatible

## Monitoring and Review

### Metrics

- API response times and performance
- Bundle size impact measurements
- Developer productivity metrics
- Error rates in production
- Type safety coverage

### Review Schedule

- **Weekly**: During migration phase
- **Monthly**: Post-migration monitoring
- **Next Review**: 2025-10-12

## References

- <!-- AI-LINK: type="related" importance="medium" -->
  <!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
  [tRPC v11 Migration Guide](https://trpc.io/docs/migrate-from-v10-to-v11)
  <!-- /AI-CONTEXT-REF -->
  <!-- /AI-LINK -->
- [React Query Integration](https://trpc.io/docs/client/react/useQuery)
- [Zod Documentation](https://zod.dev/)
- [Migration Planning Discussion](internal-link)
- [Performance Impact Analysis](internal-link)

---

**ADR Author**: Backend Team Lead  
**Review Committee**: Architecture Team, Frontend Team, Mobile Team  
**Implementation Owner**: Backend Team
