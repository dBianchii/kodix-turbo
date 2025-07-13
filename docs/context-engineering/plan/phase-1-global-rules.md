# Phase 1: Global Rules Setup

<!-- AI-METADATA:
category: planning
complexity: intermediate
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🎯 Objective

Implement **Phase 1 of the Context Engineering methodology**: Create comprehensive global rules (`CLAUDE.md`) that establish project-wide AI behavior, coding standards, and operational guidelines specific to the Kodix platform.

## 📋 Context Engineering Foundation

Based on the proven Context Engineering methodology, Phase 1 focuses on creating the foundational context layer that all AI assistants will use as their primary guidance system.

### Why Global Rules Matter

> "Context is King" - Context Engineering Core Principle

Global rules provide:
- **Consistent AI Behavior**: Same standards across all AI assistants
- **Project-Specific Context**: Kodix patterns, constraints, and conventions
- **Quality Assurance**: Built-in validation and error prevention
- **Team Alignment**: Shared understanding of development practices

## 🏗️ Implementation Plan

### Task 1.1: Audit Current Rules

**Goal**: Understand existing rule systems and consolidate them effectively.

**Current State Analysis**:
- ✅ `CLAUDE.md` exists with universal AI rules
- ✅ `docs/rules-ai/` contains AI assistant guidelines  
- ✅ ESLint configuration defines code quality standards
- ✅ Architecture patterns documented in `/docs/architecture/`

**Actions**:
- [ ] **Audit CLAUDE.md**: Review current coverage and gaps
- [ ] **Analyze rules-ai**: Identify overlaps and missing elements
- [ ] **Review ESLint rules**: Extract enforceable coding standards
- [ ] **Document architecture patterns**: Identify AI-relevant patterns

### Task 1.2: Create Comprehensive CLAUDE.md

**Goal**: Develop a complete global rules system following Context Engineering principles.

**Template Structure** (based on methodology):

```markdown
# Global AI Rules for Kodix Platform

## Project Awareness & Context
- Always read current project context before starting
- Understand Kodix SubApp architecture and team isolation
- Check current task requirements and success criteria
- Load relevant documentation from /docs directory

## Kodix-Specific Requirements
- **Team Isolation**: Always consider teamId in database operations
- **Internationalization**: No hardcoded strings, use translation keys
- **TypeScript Patterns**: Use `useTRPC()` hook, never `import { api }`
- **Type Safety**: Zero tolerance for `any` type
- **SubApp Architecture**: Maintain isolation between subapps

## Code Structure & Standards
- Limit files to 500 lines maximum for maintainability
- Use consistent naming conventions across the platform
- Prefer relative imports within packages
- Follow established Kodix patterns in existing codebase

## Database & Data Patterns
- All database operations must include WHERE clauses
- Always implement team isolation in queries
- Use Drizzle ORM patterns consistently
- Validate all environment variables before use

## Testing Requirements
- Create comprehensive tests for all new features
- Include unit tests, integration tests, and team isolation tests
- Test edge cases and failure scenarios
- Update tests when business logic changes

## Quality Standards
- ESLint rules must pass without warnings
- TypeScript compilation required with strict mode
- All dependencies must be verified and documented
- Follow service layer patterns for cross-SubApp communication

## Task Management & Documentation
- Mark completed tasks clearly
- Add discovered sub-tasks during development
- Document any blockers or integration issues
- Update relevant documentation for changes

## AI Behavior Rules
- Never assume missing context - ask questions
- Only use verified libraries and packages
- Confirm file paths before referencing or modifying
- Never delete existing code without explicit instruction
- Follow the PRP workflow for complex features

## Validation Gates
### Level 1: Syntax & Style
- Code compiles without errors
- Passes ESLint with Kodix configuration
- Follows established naming conventions

### Level 2: Functionality
- Unit tests pass completely
- Team isolation implemented correctly
- tRPC patterns followed accurately

### Level 3: Integration
- Feature works end-to-end
- Performance meets Kodix standards
- Security requirements satisfied
```

### Task 1.3: Kodix-Specific Enhancements

**Goal**: Adapt global rules to Kodix platform specifics.

**Key Kodix Patterns to Document**:

1. **Team Isolation Pattern**:
```typescript
// Always include team context in queries
const users = await ctx.db.query.users.findMany({
  where: and(
    eq(users.teamId, ctx.session.teamId),
    // other conditions
  ),
});
```

2. **tRPC Usage Pattern**:
```typescript
// ✅ Correct - use useTRPC hook
const trpc = useTRPC();
const { data } = trpc.user.getById.useQuery({ id });

// ❌ Incorrect - never import api directly
import { api } from '~/trpc/server';
```

3. **Internationalization Pattern**:
```typescript
// ✅ Correct - use translation keys
const { t } = useTranslation();
return <span>{t('common.save')}</span>;

// ❌ Incorrect - hardcoded strings
return <span>Save</span>;
```

### Task 1.4: Integration Testing

**Goal**: Ensure global rules work consistently across all AI assistants.

**Testing Scenarios**:
- [ ] **Claude Code**: Test rule loading and adherence
- [ ] **Cursor**: Verify `.cursor/rules` integration
- [ ] **Other AI Assistants**: Test universal compatibility

**Validation Criteria**:
- All AI assistants reference the same core standards
- Kodix-specific patterns consistently applied
- Error prevention works across tools
- Team collaboration maintains quality

## 📊 Success Metrics

### Quantitative Measures
- **Rule Coverage**: 100% of critical Kodix patterns documented
- **AI Compliance**: 95%+ adherence to documented standards
- **Error Reduction**: 50% reduction in common implementation errors
- **Team Consistency**: Same patterns across all AI implementations

### Qualitative Indicators
- Developers report easier AI collaboration
- Reduced time spent on code reviews
- Fewer architecture violations
- Improved code quality consistency

## 🔗 Dependencies

### Prerequisites
- Current CLAUDE.md analysis complete
- Kodix architecture patterns documented
- ESLint configuration stabilized

### Outputs for Next Phase
- Comprehensive CLAUDE.md ready for use
- Kodix pattern library for AI reference
- Validation framework for quality assurance

## 🎯 Deliverables

1. **Enhanced CLAUDE.md**: Complete global rules system
2. **Kodix Pattern Guide**: AI-readable architecture patterns
3. **Validation Framework**: Quality assurance automation
4. **Integration Testing**: Cross-AI assistant compatibility
5. **Documentation**: Implementation guide and examples

**Timeline**: 2 weeks  
**Priority**: High (Foundation for all subsequent phases)  
**Dependencies**: None (can start immediately)

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Next Phase**: [Template System](./phase-2-templates.md)  
**Related**: [Context Engineering Methodology](../standards/context-engineering-methodology.md)