# Phase 2: Template System

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

Implement **Phase 2 of the Context Engineering methodology**: Develop comprehensive template systems for feature specifications (`INITIAL.md`) and implementation blueprints (PRPs) specifically adapted to Kodix development patterns and architecture.

## 📋 Context Engineering Foundation

Phase 2 builds on the global rules established in Phase 1 by creating standardized templates that guide the feature specification and planning process, ensuring consistent, comprehensive context for AI implementation.

### Template System Benefits

- **Structured Specification**: Consistent feature request format
- **Comprehensive Context**: All necessary information captured
- **Kodix Integration**: Templates reflect platform-specific requirements
- **Quality Assurance**: Built-in validation and completeness checks

## 🏗️ Implementation Plan

### Task 2.1: INITIAL.md Template Development

**Goal**: Create Kodix-specific feature request templates that capture all necessary context.

**Template Structure** (based on Context Engineering methodology):

```markdown
# Kodix Feature Request: [Feature Name]

## FEATURE:
[Detailed description with Kodix-specific considerations]

**Core Requirements**:
- Specific functionality needed
- User interaction patterns within Kodix SubApps
- Performance requirements (team isolation impact)
- Integration points with existing SubApps

**Team Isolation Requirements**:
- How does this feature respect team boundaries?
- What data access patterns are needed?
- Are there cross-team interaction requirements?

## STACK:
**Kodix Technology Stack**:
- Frontend: Next.js 14, React 18, TypeScript
- Backend: tRPC, Drizzle ORM, MySQL
- Styling: Tailwind CSS, shadcn/ui
- State: Zustand, React Query (via tRPC)
- Testing: Vitest, Playwright

**SubApp Context**:
- Which SubApp(s) are affected?
- Does this require service layer integration?
- Are there permission system implications?

## EXAMPLES:
[Reference existing Kodix patterns and implementations]

**Relevant SubApp Patterns**:
- Similar feature in SubApp: `docs/subapps/[name]/`
- Database schema patterns: `packages/db/src/schema/`
- tRPC router patterns: `apps/core/src/server/api/routers/`
- UI component patterns: `packages/ui/src/components/`

**Code Pattern References**:
- Authentication patterns: `[specific file paths]`
- Data validation: `[specific file paths]`
- UI/UX patterns: `[specific file paths]`

## DOCUMENTATION:
[External and internal documentation references]

**Kodix Documentation**:
- Architecture decisions: `docs/architecture/`
- SubApp documentation: `docs/subapps/`
- Development standards: `docs/rules-ai/`

**External Resources**:
- Library documentation: [URLs]
- API specifications: [URLs]
- Design references: [URLs]

## KODIX CONSIDERATIONS:
[Critical Kodix-specific requirements AI must understand]

**Core Requirements**:
- Team isolation implementation strategy
- Internationalization approach (no hardcoded strings)
- Permission system integration
- SubApp boundary respect
- Service layer usage for cross-SubApp communication

**Technical Constraints**:
- Database query patterns (always include teamId)
- tRPC usage patterns (useTRPC() hook only)
- TypeScript requirements (no 'any' types)
- Testing requirements (team isolation scenarios)

**Performance Considerations**:
- Multi-tenancy impact on queries
- Caching strategies with team isolation
- Real-time update requirements
- Mobile responsiveness requirements

## SUCCESS CRITERIA:
[Clear, measurable outcomes for validation]

**Functional Criteria**:
- [ ] Core functionality works as specified
- [ ] Team isolation properly implemented
- [ ] All strings internationalized
- [ ] Performance meets standards

**Technical Criteria**:
- [ ] ESLint passes without warnings
- [ ] TypeScript compilation successful
- [ ] All tests pass (including team isolation tests)
- [ ] tRPC patterns followed correctly

**Integration Criteria**:
- [ ] SubApp boundaries respected
- [ ] Service layer properly utilized
- [ ] Permission system integrated
- [ ] Documentation updated
```

### Task 2.2: PRP Template Development

**Goal**: Create comprehensive PRP templates adapted to Kodix development patterns.

**Enhanced PRP Structure** (building on methodology):

```markdown
# PRP: [Feature Name]

## Name and Description
**Feature**: [Concise name aligned with Kodix conventions]
**SubApp**: [Primary SubApp affected]
**Description**: [One-sentence feature summary]

## Purpose
[Business value within Kodix platform context]

## Core Principles
- Context is King
- Team Isolation First
- Validation Loops
- Kodix Pattern Adherence
- Progressive Success

## Goal
[Specific, measurable outcome aligned with Kodix objectives]

## Kodix Context Assessment

### Current SubApp Architecture
```
kodix-turbo/
├── apps/
│   ├── core/              # Core SubApp
│   └── [affected-subapp]/ # Target SubApp
├── packages/
│   ├── db/                # Database schemas
│   ├── ui/                # Shared components
│   └── api/               # Service layer
```

### Team Isolation Strategy
[How this feature maintains team data separation]

### Service Layer Integration
[How feature uses service layer for cross-SubApp communication]

## All Needed Context

### Kodix Documentation References
- SubApp architecture: `docs/subapps/[relevant]/`
- Database patterns: `packages/db/src/schema/`
- Service layer: `packages/api/src/`
- UI patterns: `packages/ui/src/`

### Known Kodix Gotchas
- **Team Isolation**: All queries must include teamId filtering
- **tRPC Patterns**: Never import api directly, always use useTRPC()
- **Type Safety**: Zero tolerance for 'any' types
- **Internationalization**: All user-facing strings must use translation keys

## Implementation Blueprint

### Database Schema Changes
```sql
-- Define any new tables or schema modifications
-- Always include teamId for isolation
CREATE TABLE feature_table (
  id VARCHAR(255) PRIMARY KEY,
  teamId VARCHAR(255) NOT NULL,
  -- other fields
  INDEX idx_team_id (teamId)
);
```

### tRPC Router Implementation
```typescript
// Define tRPC endpoints following Kodix patterns
export const featureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createFeatureSchema)
    .mutation(async ({ input, ctx }) => {
      // Always include team isolation
      return await ctx.db.insert(features).values({
        ...input,
        teamId: ctx.session.teamId,
      });
    }),
});
```

### UI Component Structure
```typescript
// Define component patterns following Kodix standards
export function FeatureComponent() {
  const { t } = useTranslation();
  const trpc = useTRPC();
  
  // Implementation following Kodix patterns
}
```

## Kodix Validation Gates

### Level 1: Kodix Standards
- ESLint passes with Kodix configuration
- TypeScript compiles with strict mode
- Team isolation implemented in all queries
- No hardcoded strings (i18n compliance)

### Level 2: Functional Testing
- Unit tests cover all business logic
- Team isolation tests pass
- tRPC endpoints work correctly
- UI components render properly

### Level 3: Integration Testing
- Feature works end-to-end
- Service layer integration successful
- Performance meets Kodix standards
- Multi-team scenarios tested

## Anti-Patterns to Avoid (Kodix-Specific)
- Direct database access without team filtering
- Importing tRPC api instead of using useTRPC()
- Using 'any' types in TypeScript
- Hardcoded strings in UI components
- Breaking SubApp isolation boundaries
- Missing permission checks

## Confidence Score
**[Score]/10** - Based on completeness of Kodix context and implementation clarity
```

### Task 2.3: Template Validation System

**Goal**: Create automated validation for template completeness and quality.

**Validation Criteria**:
- [ ] All required sections completed
- [ ] Kodix-specific considerations addressed
- [ ] Code examples follow established patterns
- [ ] Success criteria are measurable
- [ ] Team isolation strategy defined

### Task 2.4: Template Integration

**Goal**: Integrate templates with existing PRP workflow system.

**Integration Points**:
- Update `/generate-prp` command to use new templates
- Ensure templates work with existing `/execute-prp` workflow
- Create template selection based on SubApp and feature type
- Provide guided template completion assistance

## 📊 Success Metrics

### Template Adoption
- **Usage Rate**: 90%+ of new features use templates
- **Completeness**: 95%+ of template sections completed
- **Quality Improvement**: 60% reduction in specification ambiguity

### Development Efficiency  
- **Faster Specification**: 50% reduction in feature specification time
- **Better AI Understanding**: 80% improvement in first-attempt success
- **Reduced Iterations**: 40% fewer clarification rounds needed

## 🔗 Dependencies

### Prerequisites
- Phase 1: Global Rules Setup completed
- CLAUDE.md operational with Kodix patterns
- Existing PRP workflow understood

### Outputs for Next Phase
- Standardized INITIAL.md templates ready
- Comprehensive PRP templates operational
- Template validation system functional
- Integration with PRP workflow complete

## 🎯 Deliverables

1. **INITIAL.md Templates**: Kodix-specific feature request templates
2. **PRP Templates**: Enhanced implementation blueprint templates
3. **Validation System**: Automated template completeness checking
4. **Integration Guide**: How to use templates with existing workflow
5. **Example Library**: Completed templates for common feature types

**Timeline**: 2 weeks  
**Priority**: High (Critical for consistent AI development)  
**Dependencies**: Phase 1 completion

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Previous Phase**: [Global Rules Setup](./phase-1-global-rules.md)  
**Next Phase**: [Pattern Documentation](./phase-3-patterns.md)  
**Related**: [Context Engineering Methodology](../standards/context-engineering-methodology.md)