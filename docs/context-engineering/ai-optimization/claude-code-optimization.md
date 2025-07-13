<!-- AI-METADATA:
category: ai-optimization
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
ai-tool: claude-code
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Claude Code Optimization Patterns

> Specific optimization strategies for maximizing Claude Code's effectiveness with Kodix development

## 🎯 Purpose

Optimize documentation and context for Claude Code's unique capabilities, including VibeCoding methodology, deep context understanding, and advanced code generation features.

## 🧠 Claude Code-Specific Features

### VibeCoding Optimization

```markdown
When working with Claude Code on Kodix:

**Context Loading Strategy**:
1. Start with high-level architecture context
2. Load specific implementation patterns
3. Include recent code examples
4. Reference existing similar features

**Optimal Context Window Usage**:
- Front-load critical information
- Use hierarchical context structure
- Include code examples early
- Reference patterns, not full implementations

**Example Context Structure**:
\`\`\`
[Architecture Overview - 200 tokens]
[Specific Feature Context - 150 tokens]
[Code Patterns - 300 tokens]
[Task Requirements - 100 tokens]
[Available Space for Generation - remaining]
\`\`\`
```

### Tool Usage Patterns

```markdown
Claude Code Tool Optimization for Kodix:

**File Operations**:
\`\`\`typescript
// Prefer batch operations
// GOOD: Read multiple related files at once
Read: 
  - /src/subapps/calendar/types.ts
  - /src/subapps/calendar/components/CalendarView.tsx
  - /src/subapps/calendar/server/router.ts

// AVOID: Sequential single-file reads
Read: /src/subapps/calendar/types.ts
// ... wait for response ...
Read: /src/subapps/calendar/components/CalendarView.tsx
\`\`\`

**Search Patterns**:
\`\`\`typescript
// Use semantic search effectively
Grep: "pattern: 'createTRPCRouter.*calendar' path: 'packages/api'"
// Returns all calendar-related routers

// Use glob for structure discovery
Glob: "pattern: '**/calendar/**/*.tsx'"
// Finds all calendar React components
\`\`\`

**Edit Strategies**:
\`\`\`typescript
// For multiple related changes, use MultiEdit
MultiEdit: {
  file: "/src/subapps/calendar/types.ts",
  edits: [
    { old: "interface Event", new: "interface CalendarEvent" },
    { old: "type EventList", new: "type CalendarEventList" }
  ]
}
\`\`\`
```

## 📊 Context Optimization Strategies

### Token-Efficient Patterns

```markdown
**1. Use Reference Patterns Instead of Full Code**

Instead of:
\`\`\`typescript
// 500+ tokens of full implementation
export const calendarRouter = createTRPCRouter({
  // ... entire router implementation ...
});
\`\`\`

Use:
\`\`\`typescript
// 50 tokens reference
// See calendar router pattern in:
// packages/api/src/routers/calendar.router.ts
// Key patterns: team isolation, pagination, error handling
\`\`\`

**2. Hierarchical Context Loading**

\`\`\`markdown
## Quick Context
- Working on: Calendar SubApp
- Stack: Next.js 15, tRPC v11, React 19
- Pattern: SubApp architecture

## Detailed Context (if needed)
[Load only when Claude Code requests specific details]
\`\`\`

**3. Smart Code Examples**

\`\`\`typescript
// Pattern example (not full implementation)
const pattern = {
  structure: "createTRPCRouter with procedures",
  authentication: "protectedProcedure",
  validation: "zod schemas",
  teamIsolation: "filter by teamId",
  example: "see user.router.ts",
};
\`\`\`
```

### Context Caching Strategy

```markdown
Claude Code Context Caching for Kodix:

**Persistent Context Files**:
1. Create `.claude-context/` directory in project
2. Store frequently used contexts:
   - architecture-summary.md (200 tokens)
   - common-patterns.md (300 tokens)
   - current-feature.md (100 tokens)

**Dynamic Context Loading**:
\`\`\`typescript
// In .claude-context/current-task.md
Task: Implement event recurring functionality
SubApp: Calendar
Related Files:
- packages/api/src/routers/calendar.router.ts
- apps/web/src/subapps/calendar/types.ts
- packages/db/schema/calendar.ts

Patterns to Follow:
- Use existing date utilities
- Follow event creation pattern
- Implement proper validation
\`\`\`
```

## 🚀 Advanced Claude Code Features

### Multi-File Context Strategy

```markdown
**Efficient Multi-File Operations**:

1. **Batch File Reading**:
   \`\`\`
   "Read all calendar-related files to understand the current implementation"
   Claude Code will:
   - Identify relevant files
   - Read them in parallel
   - Build mental model
   \`\`\`

2. **Cross-Reference Analysis**:
   \`\`\`
   "Find all places where CalendarEvent type is used"
   Claude Code will:
   - Search across codebase
   - Identify dependencies
   - Suggest safe refactoring
   \`\`\`

3. **Pattern Recognition**:
   \`\`\`
   "Implement user management following the pattern used in team management"
   Claude Code will:
   - Analyze team management implementation
   - Extract patterns
   - Apply to user management
   \`\`\`
```

### Code Generation Optimization

```markdown
**Optimized Generation Prompts**:

1. **Feature Implementation**:
   \`\`\`
   Implement recurring events for calendar SubApp:
   - Follow existing event creation pattern
   - Add recurrence rules (daily, weekly, monthly)
   - Include timezone handling
   - Maintain team isolation
   - Use existing date utilities
   \`\`\`

2. **Refactoring**:
   \`\`\`
   Refactor calendar service to use repository pattern:
   - Extract data access to CalendarRepository
   - Keep business logic in CalendarService  
   - Maintain existing public API
   - Update tests accordingly
   \`\`\`

3. **Bug Fixing**:
   \`\`\`
   Fix calendar event timezone issue:
   - Events show wrong time for different timezones
   - Should store in UTC, display in user timezone
   - Check existing timezone handling in user preferences
   \`\`\`
```

## 🔧 Claude Code Workflow Optimization

### Development Flow

```markdown
**Optimal Claude Code Development Workflow**:

1. **Context Setup** (One-time):
   \`\`\`
   Create .claude-context/ with:
   - architecture.md
   - patterns.md
   - conventions.md
   \`\`\`

2. **Task Initiation**:
   \`\`\`
   "I need to implement [feature]. 
   Context: .claude-context/architecture.md
   Similar feature: [reference]"
   \`\`\`

3. **Iterative Development**:
   \`\`\`
   Step 1: "Create the database schema"
   Step 2: "Implement the service layer"
   Step 3: "Create the tRPC endpoints"
   Step 4: "Build the UI components"
   \`\`\`

4. **Validation**:
   \`\`\`
   "Run type checking and linting"
   "Check for team isolation"
   "Verify error handling"
   \`\`\`
```

### Error Recovery Patterns

```markdown
**Claude Code Error Handling**:

1. **Type Errors**:
   \`\`\`
   "Fix the TypeScript error in calendar.router.ts:
   [Error message]
   Use existing type definitions where possible"
   \`\`\`

2. **Runtime Errors**:
   \`\`\`
   "Debug the calendar event creation error:
   - Add logging to trace the issue
   - Check database constraints
   - Verify input validation"
   \`\`\`

3. **Integration Issues**:
   \`\`\`
   "Calendar events not showing in todo list:
   - Check event emission
   - Verify event listener registration
   - Test event data structure"
   \`\`\`
```

## 📈 Performance Tips

### Response Time Optimization

```markdown
**Faster Claude Code Responses**:

1. **Specific Task Framing**:
   ❌ "Implement a calendar feature"
   ✅ "Add recurring event support to calendar SubApp following event.router.ts pattern"

2. **Context Preloading**:
   ❌ Let Claude Code discover all context
   ✅ "Using patterns from user.router.ts and team.service.ts"

3. **Incremental Development**:
   ❌ "Build complete calendar module"
   ✅ "Step 1: Create event recurrence schema"

4. **Clear Success Criteria**:
   ❌ "Make it work well"
   ✅ "Must handle: daily, weekly, monthly recurrence with timezone support"
```

### Context Window Management

```markdown
**Efficient Context Usage**:

1. **Priority Information** (First 20%):
   - Task description
   - Critical patterns
   - Constraints

2. **Reference Information** (Next 30%):
   - Code examples
   - Similar implementations
   - API signatures

3. **Supporting Context** (Next 30%):
   - Architecture overview
   - Conventions
   - Standards

4. **Reserve Space** (Final 20%):
   - For Claude Code's reasoning
   - For generated code
   - For explanations
```

## 🎯 Best Practices Summary

### Do's ✅

1. **Front-load critical context**
2. **Use pattern references over full code**
3. **Batch related operations**
4. **Provide clear success criteria**
5. **Reference existing implementations**
6. **Use semantic search terms**
7. **Structure requests hierarchically**

### Don'ts ❌

1. **Don't include entire file contents unnecessarily**
2. **Don't make sequential single-file operations**
3. **Don't use vague task descriptions**
4. **Don't ignore existing patterns**
5. **Don't skip context setup**
6. **Don't overload single requests**
7. **Don't forget validation steps**

## 🔗 Related Resources

- [Universal Prompt Patterns](./universal-prompt-patterns.md)
- [Cursor Integration](./cursor-integration.md)
- [Context Compression](./context-compression.md)

<!-- AI-CONTEXT-BOUNDARY: end -->