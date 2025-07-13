<!-- AI-METADATA:
category: ai-optimization
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
ai-tool: universal
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Universal AI Prompt Patterns

> Cross-platform prompt templates that work effectively across all AI development assistants

## 🎯 Purpose

Provide standardized, tested prompt patterns that deliver consistent results across Claude Code, Cursor, GitHub Copilot, and other AI development tools when working with Kodix.

## 🌟 Core Prompt Principles

### Universal Structure

```markdown
**Effective Prompt Anatomy**:

1. **Context** (What system/stack)
2. **Task** (What to do)
3. **Constraints** (Rules to follow)
4. **Examples** (Reference patterns)
5. **Output Format** (Expected result)

**Template**:
\`\`\`
Context: [Kodix platform, Next.js 15, tRPC v11, React 19]
Task: [Specific implementation request]
Constraints: [No 'any' types, team isolation, i18n required]
Examples: [Reference similar implementation]
Output: [Component/API/Service with tests]
\`\`\`
```

### Token-Optimized Format

```markdown
**Concise Yet Complete**:

❌ Verbose:
"I need you to help me create a new feature for managing user profiles in our Kodix application. This should include all the necessary backend API endpoints using our tRPC setup, the database schema using Drizzle ORM, and the frontend components using React and our Shadcn UI library..."

✅ Optimized:
"Add user profile management to Kodix:
- tRPC endpoints (CRUD)
- Drizzle schema with team isolation
- React components using shadcn/ui
- Follow patterns from user.router.ts"
```

## 📚 Feature Implementation Patterns

### Full-Stack Feature Pattern

```markdown
**Prompt**:
Implement [FEATURE_NAME] for Kodix platform:

Stack: Next.js 15, tRPC v11, React 19, MySQL, Drizzle ORM
SubApp: [TARGET_SUBAPP]

Requirements:
- Database schema with team isolation
- Service layer with business logic
- tRPC router with CRUD operations
- Frontend components with shadcn/ui
- Loading and error states
- i18n for all strings

Follow patterns from: [REFERENCE_FILE]
No 'any' types, include proper validation
```

**Example Usage**:
```markdown
Implement event reminders for Kodix platform:

Stack: Next.js 15, tRPC v11, React 19, MySQL, Drizzle ORM
SubApp: calendar

Requirements:
- Database schema with team isolation
- Service layer with business logic
- tRPC router with CRUD operations
- Frontend components with shadcn/ui
- Loading and error states
- i18n for all strings

Follow patterns from: packages/api/src/routers/event.router.ts
No 'any' types, include proper validation
```

### API Endpoint Pattern

```markdown
**Prompt**:
Create tRPC endpoint for [ACTION] in Kodix:

Router: [ROUTER_NAME]
Input: [FIELD_LIST_WITH_TYPES]
Output: [EXPECTED_RETURN]
Business Rules: [VALIDATIONS]

Include:
- Team isolation check
- Input validation with Zod
- Error handling
- Service layer integration

Reference: [SIMILAR_ENDPOINT]
```

**Example Usage**:
```markdown
Create tRPC endpoint for bulk updating task status in Kodix:

Router: todoRouter
Input: taskIds (string[]), status (enum: pending|completed|archived), teamId
Output: Updated task count and failed IDs
Business Rules: Max 100 tasks, only own team tasks

Include:
- Team isolation check
- Input validation with Zod
- Error handling
- Service layer integration

Reference: packages/api/src/routers/user.router.ts bulkUpdate
```

### Component Creation Pattern

```markdown
**Prompt**:
Create React component for [COMPONENT_PURPOSE]:

Type: [presentation|container|page]
Props: [PROP_LIST]
Features: [INTERACTIVE_FEATURES]
Data: [API_CALLS_NEEDED]

Use:
- shadcn/ui components
- TypeScript (no any)
- i18n for strings
- Loading/error states
- Responsive design

Similar to: [REFERENCE_COMPONENT]
```

**Example Usage**:
```markdown
Create React component for task kanban board:

Type: container
Props: teamId, projectId (optional)
Features: Drag-drop between columns, inline edit, filter
Data: useTasks() hook, updateTaskStatus mutation

Use:
- shadcn/ui components
- TypeScript (no any)
- i18n for strings
- Loading/error states
- Responsive design

Similar to: apps/web/src/subapps/todo/components/TaskList.tsx
```

## 🐛 Debugging Patterns

### Error Investigation Pattern

```markdown
**Prompt**:
Debug [ERROR_DESCRIPTION] in Kodix:

Error: [ERROR_MESSAGE]
Location: [FILE:LINE]
Context: [WHEN_IT_HAPPENS]
Stack: [TECH_STACK_INVOLVED]

Check:
1. Team isolation
2. Type mismatches
3. Missing validation
4. Permission issues

Add logging to trace issue
```

### Performance Optimization Pattern

```markdown
**Prompt**:
Optimize [FEATURE] performance in Kodix:

Issue: [PERFORMANCE_PROBLEM]
Current: [METRICS_OR_BEHAVIOR]
Target: [DESIRED_METRICS]

Consider:
- Database query optimization
- React render optimization
- API response caching
- Bundle size reduction

Maintain functionality and types
```

## 🔄 Refactoring Patterns

### Code Modernization Pattern

```markdown
**Prompt**:
Refactor [CODE_AREA] to modern Kodix patterns:

Current: [OLD_PATTERN_DESCRIPTION]
Target: [NEW_PATTERN]
Files: [AFFECTED_FILES]

Ensure:
- Backward compatibility
- Type safety maintained
- Tests still pass
- Team isolation preserved

Reference new pattern in: [EXAMPLE_FILE]
```

### Architecture Migration Pattern

```markdown
**Prompt**:
Migrate [FEATURE] to SubApp architecture:

From: [CURRENT_STRUCTURE]
To: Kodix SubApp pattern

Steps:
1. Create SubApp structure
2. Move components and logic
3. Update imports and routing
4. Integrate with core services

Follow structure in: apps/web/src/subapps/calendar/
```

## 🧪 Testing Patterns

### Test Generation Pattern

```markdown
**Prompt**:
Generate tests for [CODE_UNIT] in Kodix:

Type: [unit|integration|e2e]
Framework: [vitest|playwright]
Coverage: [SCENARIOS_TO_TEST]

Include:
- Happy path
- Error cases
- Edge cases
- Team isolation

Follow pattern from: [TEST_EXAMPLE]
```

### Test Fix Pattern

```markdown
**Prompt**:
Fix failing test in [TEST_FILE]:

Error: [TEST_ERROR]
Expected: [EXPECTED_BEHAVIOR]
Actual: [ACTUAL_BEHAVIOR]

Check:
- Mock data accuracy
- Async handling
- State management
- Type definitions

Maintain test intention
```

## 🎨 UI/UX Patterns

### Responsive Design Pattern

```markdown
**Prompt**:
Make [COMPONENT] responsive in Kodix:

Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
Current: [CURRENT_BEHAVIOR]
Requirements: [RESPONSIVE_NEEDS]

Use:
- Tailwind CSS classes
- No custom CSS
- Maintain functionality
- Test all breakpoints

Example: apps/web/src/components/DataTable.tsx
```

### Accessibility Pattern

```markdown
**Prompt**:
Add accessibility to [COMPONENT]:

Requirements:
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

Follow WCAG 2.1 AA standards
Use shadcn/ui accessibility features
Test with screen reader
```

## 🔐 Security Patterns

### Permission Implementation Pattern

```markdown
**Prompt**:
Add permission checks to [FEATURE]:

Permissions needed: [PERMISSION_LIST]
Check locations: [UI|API|SERVICE]
Fallback: [UNAUTHORIZED_BEHAVIOR]

Implement:
- Frontend conditional rendering
- API middleware checks
- Service layer validation

Reference: permission handling in user.router.ts
```

### Data Validation Pattern

```markdown
**Prompt**:
Add validation for [DATA_FLOW]:

Input source: [FORM|API|FILE]
Validation rules: [RULE_LIST]
Error handling: [USER_FEEDBACK]

Use:
- Zod schemas
- Type-safe validation
- Clear error messages
- Sanitization where needed

Pattern from: packages/api/src/schemas/
```

## 📊 Data Management Patterns

### Migration Pattern

```markdown
**Prompt**:
Create database migration for [CHANGE]:

Type: [schema|data|both]
Change: [DESCRIPTION]
Rollback: [ROLLBACK_STRATEGY]

Include:
- Up migration
- Down migration
- Data preservation
- Team isolation maintained

Use Drizzle migration format
```

### Query Optimization Pattern

```markdown
**Prompt**:
Optimize query for [OPERATION]:

Current query: [DESCRIPTION_OR_CODE]
Performance issue: [METRIC]
Data volume: [ROWS/FREQUENCY]

Optimize:
- Add indexes
- Reduce joins
- Implement pagination
- Add caching

Maintain team isolation
```

## 🚀 Advanced Patterns

### Feature Flag Pattern

```markdown
**Prompt**:
Implement feature flag for [FEATURE]:

Flag name: [KEBAB_CASE_NAME]
Default: [enabled|disabled]
Scope: [user|team|global]

Add:
- Configuration schema
- UI toggle (if needed)
- Conditional logic
- Cleanup TODO comments

Reference: feature flag system in config/
```

### Event-Driven Pattern

```markdown
**Prompt**:
Add event emission for [ACTION]:

Event: [EVENT_NAME]
Payload: [DATA_STRUCTURE]
Listeners: [CONSUMING_SUBAPPS]

Implement:
- Event emission in service
- Type-safe event definition
- Listener registration
- Error handling

Follow pattern in: services/event-emitter.ts
```

## 💡 Meta Patterns

### Learning Pattern

```markdown
**Prompt**:
Explain [CONCEPT] in Kodix context:

Concept: [TECHNICAL_CONCEPT]
Current understanding: [MY_LEVEL]
Specific to: [KODIX_AREA]

Show:
- How it's used in Kodix
- Code examples
- Best practices
- Common pitfalls

Keep explanation practical
```

### Code Review Pattern

```markdown
**Prompt**:
Review [CODE/PR] for Kodix standards:

Focus areas:
- Type safety (no any)
- Team isolation
- Error handling
- Performance
- Security

Provide:
- Issues found
- Suggested fixes
- Best practice recommendations

Reference: docs/architecture/coding-standards.md
```

## 🎯 Pattern Selection Guide

### Quick Decision Matrix

| Task Type | Best Pattern | Key Elements |
|-----------|--------------|--------------|
| New Feature | Full-Stack Feature | Stack, requirements, reference |
| Bug Fix | Error Investigation | Error details, context, checks |
| Performance | Optimization | Metrics, targets, constraints |
| UI Work | Component Creation | Props, features, similar components |
| API Work | Endpoint Pattern | Input/output, validation, reference |
| Testing | Test Generation | Type, coverage, patterns |
| Security | Permission Pattern | Checks, locations, fallbacks |

## 🔗 Related Resources

- [Claude Code Optimization](./claude-code-optimization.md)
- [Cursor Integration](./cursor-integration.md)
- [Context Compression](./context-compression.md)

<!-- AI-CONTEXT-BOUNDARY: end -->