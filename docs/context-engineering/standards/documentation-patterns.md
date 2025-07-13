# Kodix Documentation Patterns for Context Engineering
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->
<!-- AI-CONTEXT: Core Documentation Standards -->
<!-- AI-PRIORITY: CRITICAL -->

## 🎯 Quick Summary

This guide defines standard patterns for writing AI-optimized documentation in the Kodix project, ensuring both human readability and machine comprehension.

## 🔍 📋 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Context-engineered documentation follows specific patterns that enable AI tools to understand, navigate, and utilize information effectively. These patterns are designed to work with current tools (Cursor) and scale to future AI assistants.

### Core Principles

1. **Progressive Disclosure**: Information layered from overview to details
2. **Semantic Clarity**: Clear markers for AI parsing
3. **Cross-Reference Rich**: Explicit relationships between concepts
4. **Example-Driven**: Practical examples for every concept
5. **Query-Optimized**: Structured for common AI queries

## 🔧 Documentation Structure Pattern

### Standard Document Template

```markdown
# [Component/Feature Name]

<!-- AI-METADATA:
category: [architecture|subapp|service|guide|reference]
stack: [nextjs|trpc|zod|drizzle|redis|general]
complexity: [basic|intermediate|advanced]
dependencies: [list, of, dependencies]
-->

## 🎯 Quick Summary

[One-line description for AI quick reference]

## 🔍 📋 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
[2-3 paragraph overview with key concepts highlighted]

### Key Concepts

- **Concept 1**: Brief explanation
- **Concept 2**: Brief explanation
- **Concept 3**: Brief explanation

## 🏗️ 🏗️ Architecture

<!-- AI-CONTEXT: Technical Architecture -->

[Technical details, diagrams, and relationships]

## 🔧 Implementation

<!-- AI-CONTEXT: Implementation Guide -->

[Step-by-step implementation details]

## 📋 🧩 Examples

<!-- AI-EXAMPLES: Practical Usage -->

[Code examples with annotations]

## ❓ Common Questions

<!-- AI-FAQ: Frequently Asked Questions -->

[Structured Q&A format]

## 🔗 Related Resources

<!-- AI-RELATED: Cross-references -->

- [Related Doc 1](path/to/doc1.md)
- [Related Doc 2](path/to/doc2.md)
```

## 📊 Semantic Markers Reference

### Priority Markers

```markdown
<!-- AI-PRIORITY: CRITICAL -->   # Must understand for basic operation
<!-- AI-PRIORITY: HIGH -->       # Important for most tasks
<!-- AI-PRIORITY: MEDIUM -->     # Useful for specific scenarios
<!-- AI-PRIORITY: LOW -->        # Edge cases or advanced usage
```

### Context Markers

```markdown
<!-- AI-CONTEXT: Overview -->           # High-level description
<!-- AI-CONTEXT: Implementation -->     # Code-level details
<!-- AI-CONTEXT: Architecture -->       # System design
<!-- AI-CONTEXT: Troubleshooting -->   # Problem-solving
<!-- AI-CONTEXT: Best Practices -->    # Recommended approaches
```

### Relationship Markers

```markdown
<!-- DEPENDS-ON: [auth-system, database] -->
<!-- REQUIRED-BY: [user-dashboard] -->
<!-- CONFLICTS-WITH: [legacy-system] -->
<!-- REPLACES: [old-component] -->
<!-- SEE-ALSO: [similar-pattern] -->
```

## 🎨 Content Patterns

### Pattern 1: Concept Introduction

````markdown
## Concept Name

<!-- AI-CONTEXT: Concept Definition -->

**What it is**: [One sentence definition]

**Why it matters**: [Business/technical value]

**When to use**: [Specific scenarios]

### Example

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Annotated example showing the concept
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->
````

````

### Pattern 2: Step-by-Step Guide
```markdown
## How to [Task Name]

<!-- AI-CONTEXT: Task Guide -->

### Prerequisites
- [ ] Requirement 1
- [ ] Requirement 2

### Steps

1. **Step Name**
   ```bash
   # Command or code
````

Expected result: [What should happen]

2. **Next Step**
   <!-- Continue pattern -->

````

### Pattern 3: Troubleshooting Section
```markdown
## 🔧 Troubleshooting

<!-- AI-CONTEXT: Problem-Solution Pairs -->

### Problem: [Specific Error/Issue]
**Symptoms**:
- Symptom 1
- Symptom 2

**Solution**:
1. Check [specific thing]
2. Try [specific action]
3. If still failing, [escalation]

**Code Example**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Solution implementation
````
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

````

### Pattern 4: API Documentation
```markdown
## 🔗 API: [Function/Endpoint Name]

<!-- AI-CONTEXT: API Reference -->

### Signature
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
function functionName(param1: Type1, param2: Type2): ReturnType
````
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Parameters

| Parameter | Type  | Required | Description  |
| --------- | ----- | -------- | ------------ |
| param1    | Type1 | Yes      | What it does |
| param2    | Type2 | No       | What it does |

### Returns

- **Success**: `ReturnType` - Description
- **Error**: `ErrorType` - When this happens

### Example Usage

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Real-world usage example
const result = await functionName(value1, value2);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

````

## 🔍 Kodix Stack-Specific Patterns

### Next.js Pattern
```markdown
## [Feature] in Next.js

<!-- AI-CONTEXT: Next.js Implementation -->
<!-- AI-STACK: nextjs -->

### App Router Implementation
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// app/path/page.tsx
export default async function Page() {
  // Implementation
}
````
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Key Considerations

- Server vs Client components
- Data fetching strategy
- Performance implications

````

### tRPC Pattern
```markdown
## [Feature] tRPC Endpoint

<!-- AI-CONTEXT: tRPC Implementation -->
<!-- AI-STACK: trpc -->

### Router Definition
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export const featureRouter = router({
  methodName: protectedProcedure
    .input(z.object({
      // Zod schema
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});
````
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Client Usage

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
const { mutate } = api.feature.methodName.useMutation();
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

```

## 📝 Writing Guidelines

### DO's
- ✅ Use semantic HTML comments for AI markers
- ✅ Include practical examples for every concept
- ✅ Link to related documentation explicitly
- ✅ Use consistent emoji indicators (🎯, 📋, 🔧, etc.)
- ✅ Provide both overview and details
- ✅ Include error handling in examples

### DON'Ts
- ❌ Don't assume context from previous sections
- ❌ Don't use ambiguous pronouns (it, this, that)
- ❌ Don't mix concerns in one section
- ❌ Don't skip the quick summary
- ❌ Don't forget relationship markers

## 🚀 Migration Checklist

When updating existing documentation:

1. [ ] Add AI metadata header
2. [ ] Add quick summary section
3. [ ] Structure with standard sections
4. [ ] Add semantic markers
5. [ ] Include code examples
6. [ ] Add relationship markers
7. [ ] Create FAQ section
8. [ ] Validate with AI tool

## 📊 Quality Metrics

Good context-engineered documentation should:
- Be found by AI in < 2 seconds
- Answer 90% of queries without follow-up
- Have clear entry and exit points
- Link to 3-5 related resources
- Include 2-3 practical examples

<!-- AI-RELATED: [semantic-markers.md, metadata-schema.md, progressive-disclosure.md] -->
<!-- REQUIRED-BY: [all-documentation] -->
<!-- SEE-ALSO: [docs/context-engineering/README.md] -->
```
