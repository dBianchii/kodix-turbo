<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: automation
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Execute PRP Command

When the user types `/execute-prp` followed by a PRP file path:

## Step 1: Load and Parse PRP

Read the specified PRP document and extract all sections:

```
- Goal and acceptance criteria
- Technical specifications
- Implementation plan phases
- Testing requirements
- Stack integration details
```

## Step 2: Create Implementation Plan

Using the TodoWrite tool, create a structured task list:

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Example task structure
{
  todos: [
    {
      id: "setup-1",
      content: "Create directory structure for [feature]",
      status: "pending",
      dependencies: [],
    },
    {
      id: "setup-2",
      content: "Set up routing in app/[subapp]/[feature]",
      status: "pending",
      dependencies: ["setup-1"],
    },
    // ... more tasks based on PRP phases
  ];
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## Step 3: Execute Implementation

For each task in the plan:

### 3.1 Start Task

Mark the current task as "in_progress" and announce what you're working on.

### 3.2 Implement Code

Based on the task requirements:

1. **Create/Edit Files**: Use appropriate tools to create or modify files
2. **Follow Patterns**: Reference existing Kodix patterns for consistency
3. **Apply Standards**: Ensure code follows Kodix standards

### 3.3 Validate Implementation

After each code change, run appropriate checks:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Linting
pnpm eslint [files]

# Type checking
pnpm typecheck

# Tests (if applicable)
pnpm test [test-files]
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3.4 Fix Issues

If validation fails:

1. Read the error messages carefully
2. Apply fixes to resolve issues
3. Re-run validation
4. Iterate until all checks pass

### 3.5 Complete Task

Mark the task as "completed" and move to the next one.

## Step 4: Quality Assurance

After implementing all tasks:

### 4.1 Run Full Validation

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Full linting
pnpm eslint

# Full type check
pnpm typecheck

# Run all tests
pnpm test
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 4.2 Verify Acceptance Criteria

Check each acceptance criterion from the PRP:

```
<!-- AI-PROGRESS: completed="true" verified="true" -->
✅ User can [action] - Verified in [component/file]
<!-- AI-PROGRESS: completed="true" verified="true" -->
✅ System [behavior] - Implemented in [service/handler]
<!-- AI-PROGRESS: completed="true" verified="true" -->
✅ Data is [state] - Confirmed in [test/validation]
```

### 4.3 Documentation Check

Ensure all code is properly documented:

- Components have JSDoc comments
- Complex logic is explained
- README updated if needed

## Step 5: Final Report

Provide a comprehensive summary:

```
📊 PRP Execution Complete: [Feature Name]

<!-- AI-PROGRESS: completed="true" verified="true" -->
✅ Implementation Summary:
- Files created: [count]
- Files modified: [count]
- Tests written: [count]
- All checks passing: Yes/No

📁 Key Files:
- Frontend: [list main components]
- Backend: [list main endpoints]
- Tests: [list test files]

<!-- AI-PROGRESS: completed="true" verified="true" -->
✅ Acceptance Criteria Met:
- [✓] Criterion 1
- [✓] Criterion 2
- [✓] Criterion 3

🧪 Quality Metrics:
- Linting: ✅ Passing
- TypeScript: ✅ No errors
- Tests: ✅ All passing
- Build: ✅ Successful

🚀 Next Steps:
1. Manual testing in development
2. Review implementation
3. Create PR when ready
```

## Implementation Guidelines

### Code Quality Standards

- **No Any Types**: Use proper TypeScript types
- **No Hardcoded Strings**: Use i18n for all user-facing text
- **Multi-tenancy**: Always include teamId in queries
- **Error Handling**: Comprehensive error handling with proper messages
- **Loading States**: Always show loading states for async operations

### Kodix-Specific Patterns

- **tRPC Endpoints**: Follow existing patterns in `packages/api/src/trpc/`
- **Database**: Use Drizzle ORM patterns from `packages/db/`
- **UI Components**: Use Shadcn/ui from `packages/ui/`
- **State Management**: Use Zustand following existing stores
- **Routing**: Follow Next.js App Router conventions

### Testing Requirements

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test feature workflows
- **E2E Tests**: For critical user journeys
- **Coverage**: Aim for >80% coverage

## Error Recovery

If implementation gets stuck:

1. **Identify the Issue**: Read error messages carefully
2. **Search for Examples**: Look for similar implementations in codebase
3. **Consult Documentation**: Check Kodix docs for guidance
4. **Iterative Fixes**: Make small changes and test
5. **Ask for Help**: If truly stuck, ask user for clarification

## Important Notes

- **Follow the PRP**: Don't deviate from specifications
- **Quality First**: Better to do it right than fast
- **Test Everything**: Don't skip testing
- **Document Well**: Future developers will thank you
- **Stay Consistent**: Follow existing patterns
