<!-- AI-METADATA:
category: ai-optimization
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Context Compression Techniques

> Advanced strategies for optimizing token usage while maintaining context quality for AI assistants

## 🎯 Purpose

Maximize the efficiency of AI context windows by implementing compression techniques that preserve essential information while reducing token consumption.

## 📊 Token Economics

### Understanding Token Costs

```markdown
**Token Usage Breakdown**:

Typical Context Window Allocation:
- System prompts: ~500 tokens (5%)
- Context/Documentation: ~3000 tokens (30%)
- Code examples: ~2000 tokens (20%)
- Current task: ~500 tokens (5%)
- Available for generation: ~4000 tokens (40%)

**Cost per Section**:
\`\`\`
Full file content: 500-2000 tokens
File summary: 50-100 tokens
Pattern reference: 20-30 tokens
Full function: 100-300 tokens
Function signature: 10-20 tokens
\`\`\`
```

## 🗜️ Compression Strategies

### 1. Hierarchical Summarization

```markdown
**Level 1 - Ultra Compressed** (10 tokens):
"Kodix: Next.js+tRPC+React SubApp platform"

**Level 2 - Compressed** (50 tokens):
"Kodix platform: Next.js 15, tRPC v11, React 19, MySQL, Drizzle ORM.
SubApp architecture, team-based isolation, TypeScript-strict."

**Level 3 - Standard** (150 tokens):
"Kodix development platform:
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind
- Backend: tRPC v11, Drizzle ORM, MySQL 8
- Architecture: SubApp modular design, team multi-tenancy
- Standards: No 'any' types, i18n required, comprehensive error handling"

**Level 4 - Detailed** (300+ tokens):
[Full architecture description with examples]
```

### 2. Pattern References

```markdown
**Instead of Full Code**:
❌ 500 tokens:
\`\`\`typescript
export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      return user;
    }),
  // ... more procedures
});
\`\`\`

✅ 30 tokens:
"tRPC router pattern: see user.router.ts
Key: protectedProcedure, Zod validation, team isolation, error handling"
```

### 3. Smart Code Snippets

```markdown
**Compression Techniques**:

1. **Remove Obvious Imports** (save 30%):
   \`\`\`typescript
   // Instead of showing all imports
   import { ... } from "multiple-sources";
   
   export function Component() {
     // Focus on logic
   }
   \`\`\`

2. **Use Type References** (save 50%):
   \`\`\`typescript
   // Instead of full type definition
   function processUser(user: User): ProcessedUser {
     // Implementation
   }
   \`\`\`

3. **Compress Repetitive Patterns** (save 70%):
   \`\`\`typescript
   // CRUD operations following standard pattern
   const router = createTRPCRouter({
     create: standardCreate(schema),
     read: standardRead(schema),
     update: standardUpdate(schema),
     delete: standardDelete(schema),
   });
   \`\`\`
```

## 🎨 Visual Compression

### Mermaid Diagrams vs Text

```markdown
**Text Description** (100 tokens):
"The system has three layers: the client layer contains Next.js and React components, 
which connect to the API layer with tRPC routers and middleware, which then connects 
to the service layer with business logic, which finally connects to the data layer 
with Drizzle ORM and MySQL database."

**Mermaid Diagram** (40 tokens):
\`\`\`mermaid
graph TD
  Client[Next.js/React] --> API[tRPC]
  API --> Service[Business Logic]
  Service --> Data[Drizzle/MySQL]
\`\`\`
```

### Symbol-Based Summaries

```markdown
**Component Structure** (20 tokens):
📁 components/
├── 🎨 UI (presentation)
├── 📦 containers (logic)
├── 📄 pages (routes)
└── 🛠️ utils (helpers)

**Instead of** (60 tokens):
"The components directory contains UI components for presentation,
container components for business logic, page components for routing,
and utility functions for helper methods."
```

## 🔄 Dynamic Context Loading

### Progressive Disclosure Pattern

```typescript
// Level 1: Minimal Context
interface ContextLevel1 {
  task: "implement user profile"
  stack: "Kodix standard"
}

// Level 2: Add Specifics (on demand)
interface ContextLevel2 extends ContextLevel1 {
  patterns: ["user.router.ts", "UserService"]
  constraints: ["team-isolation", "no-any-types"]
}

// Level 3: Add Examples (if needed)
interface ContextLevel3 extends ContextLevel2 {
  examples: {
    router: "see lines 45-67",
    service: "see lines 23-45",
    component: "see UserCard.tsx"
  }
}
```

### Context Caching Strategy

```markdown
**Persistent Context Files**:

\`\`\`bash
.ai-context/
├── minimal.md      # 50 tokens - always loaded
├── standard.md     # 200 tokens - frequently loaded
├── detailed.md     # 500 tokens - on demand
└── examples.md     # 1000 tokens - rarely loaded
\`\`\`

**Usage Pattern**:
"Using context from .ai-context/minimal.md, implement user search"
"Need more detail? Load .ai-context/standard.md"
```

## 📝 Documentation Compression

### Structured Summaries

```markdown
**Original** (200 tokens):
"The user service handles all user-related operations including creating new users,
updating existing users, deleting users, and searching for users. It includes
validation for all inputs, ensures team-based isolation so users can only access
their team's data, handles errors gracefully, and integrates with the event system
to emit events when users are created or updated."

**Compressed** (40 tokens):
"UserService: CRUD operations with:
- Input validation (Zod)
- Team isolation (mandatory)
- Error handling (try-catch)
- Events (create/update)
See: services/user.service.ts"
```

### Bullet Point Optimization

```markdown
**Verbose Bullets** (80 tokens):
- The component must have proper TypeScript types without using any
- All user-facing strings need to use internationalization
- Error states should be handled with user-friendly messages
- Loading states need skeleton screens or spinners

**Optimized Bullets** (30 tokens):
- TypeScript strict (no any)
- i18n required
- Error handling with messages
- Loading states (skeleton/spinner)
```

## 🚀 Advanced Techniques

### Token-Aware Prompting

```typescript
class ContextOptimizer {
  static compressContext(
    fullContext: string, 
    maxTokens: number
  ): string {
    // Priority-based compression
    const priorities = {
      critical: 0.4,    // 40% of tokens
      important: 0.3,   // 30% of tokens
      useful: 0.2,      // 20% of tokens
      optional: 0.1     // 10% of tokens
    };
    
    return this.allocateTokens(fullContext, maxTokens, priorities);
  }
}
```

### Semantic Compression

```markdown
**Original Code Comment** (50 tokens):
// This function takes a user ID and team ID as parameters, queries the database
// to find the user, ensures they belong to the specified team, and returns
// the user data or throws an error if not found or unauthorized

**Semantically Compressed** (15 tokens):
// Get user by ID with team validation. Throws if not found/unauthorized.
```

### Reference-Based Context

```markdown
**Pattern Library References**:

Instead of including patterns:
- AUTH_PATTERN: "See auth.patterns.md#middleware"
- CRUD_PATTERN: "See crud.patterns.md#standard"
- UI_PATTERN: "See ui.patterns.md#forms"

Usage:
"Implement user settings using CRUD_PATTERN and UI_PATTERN"
```

## 📊 Compression Metrics

### Effectiveness Measurements

| Technique | Compression Ratio | Quality Retention |
|-----------|------------------|-------------------|
| Hierarchical Summary | 80% | 95% |
| Pattern References | 90% | 90% |
| Code Snippets | 60% | 85% |
| Visual Diagrams | 70% | 100% |
| Bullet Optimization | 50% | 95% |
| Semantic Compression | 70% | 90% |

### Token Budget Template

```markdown
**10K Token Budget Allocation**:

1. System Instructions: 500 tokens (5%)
2. Core Context: 1000 tokens (10%)
3. Task-Specific Context: 1500 tokens (15%)
4. Examples/Patterns: 1000 tokens (10%)
5. Current Work: 2000 tokens (20%)
6. Generation Space: 4000 tokens (40%)

**Compression Goals**:
- Reduce core context by 50%
- Compress examples by 70%
- Optimize task context by 40%
- Result: 30% more generation space
```

## 🛠️ Implementation Tools

### Context Compression Script

```typescript
// Example compression utility
function compressForAI(content: string): string {
  return content
    // Remove unnecessary whitespace
    .replace(/\s+/g, ' ')
    // Remove obvious comments
    .replace(/\/\/ TODO:.*$/gm, '')
    // Compress import statements
    .replace(/import \{[^}]+\} from .+;/g, 'imports...')
    // Shorten type definitions
    .replace(/interface \w+ \{[^}]+\}/g, (match) => {
      const name = match.match(/interface (\w+)/)?.[1];
      return `interface ${name} { ... }`;
    });
}
```

### Markdown Optimizer

```markdown
**Before** (100 tokens):
## This is a Very Long Section Header That Contains Unnecessary Words

This paragraph explains in great detail what could be said more concisely.
It includes redundant information and verbose explanations that don't add
significant value to understanding the concept.

**After** (30 tokens):
## Section Header

Key points concisely explained with essential information only.
```

## 💡 Best Practices

### Do's ✅

1. **Use reference pointers** instead of full code
2. **Hierarchical context** - start minimal, expand as needed
3. **Compress whitespace** and formatting
4. **Use symbols** and abbreviations consistently
5. **Cache common contexts** for reuse
6. **Prioritize information** by relevance

### Don'ts ❌

1. **Don't over-compress** to the point of ambiguity
2. **Don't remove critical** type information
3. **Don't compress error** messages or warnings
4. **Don't sacrifice clarity** for minor token savings
5. **Don't compress security** or permission contexts

## 📈 Optimization Results

### Real-World Examples

```markdown
**Full Context Approach**: 8,000 tokens
- Complete file contents
- All type definitions
- Full examples
- Detailed explanations
Result: Limited generation space, slow responses

**Optimized Approach**: 3,000 tokens
- File summaries with key patterns
- Type references
- Compressed examples
- Bullet point explanations
Result: 5,000 tokens for generation, faster responses
```

## 🔗 Related Resources

- [Claude Code Optimization](./claude-code-optimization.md)
- [Universal Prompt Patterns](./universal-prompt-patterns.md)
- [Cursor Integration](./cursor-integration.md)

<!-- AI-CONTEXT-BOUNDARY: end -->