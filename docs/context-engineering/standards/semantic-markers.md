# Semantic Markers Guide for Kodix Documentation

<!-- AI-METADATA:
category: standard
stack: general
complexity: intermediate
dependencies: [documentation-patterns.md]
-->

## 🎯 Quick Summary

Comprehensive guide to semantic markers that enable AI tools to understand document structure, intent, and relationships in the Kodix documentation.

## 📋 Overview

Semantic markers are HTML comments embedded in Markdown documents that provide machine-readable metadata. These markers help AI tools understand context, navigate relationships, and provide better assistance.

### Core Principles

1. **Invisible to Humans**: Markers don't affect rendered documentation
2. **Machine Parseable**: Consistent format for automated processing
3. **Context Rich**: Provide meaningful metadata about content
4. **Standardized**: Follow strict naming conventions

## 🏷️ Marker Categories

### 1. Context Markers

Define the type and purpose of content sections:

```markdown
<!-- AI-CONTEXT: Overview -->              # High-level description
<!-- AI-CONTEXT: Implementation -->        # Code-level details
<!-- AI-CONTEXT: Architecture -->          # System design
<!-- AI-CONTEXT: Troubleshooting -->      # Problem-solving
<!-- AI-CONTEXT: Best Practices -->       # Recommended approaches
<!-- AI-CONTEXT: Configuration -->        # Setup and config
<!-- AI-CONTEXT: Migration -->            # Upgrade paths
<!-- AI-CONTEXT: Security -->             # Security considerations
```

### 2. Priority Markers

Indicate importance for context window management:

```markdown
<!-- AI-PRIORITY: CRITICAL -->    # Must always be included
<!-- AI-PRIORITY: HIGH -->        # Important for most tasks
<!-- AI-PRIORITY: MEDIUM -->      # Useful for specific scenarios
<!-- AI-PRIORITY: LOW -->         # Edge cases or advanced usage
<!-- AI-PRIORITY: OPTIONAL -->    # Include only if space permits
```

### 3. Intent Markers

Clarify the purpose of the content:

```markdown
<!-- AI-INTENT: question -->         # Answering a specific question
<!-- AI-INTENT: task -->            # Completing a specific task
<!-- AI-INTENT: reference -->        # Reference material
<!-- AI-INTENT: troubleshooting --> # Solving problems
<!-- AI-INTENT: learning -->        # Educational content
<!-- AI-INTENT: decision -->        # Making architectural choices
```

### 4. Scope Markers

Define the breadth of impact:

```markdown
<!-- AI-SCOPE: file -->           # Single file impact
<!-- AI-SCOPE: component -->      # Component-level impact
<!-- AI-SCOPE: feature -->        # Feature-level impact
<!-- AI-SCOPE: subapp -->         # SubApp-level impact
<!-- AI-SCOPE: system -->         # System-wide impact
<!-- AI-SCOPE: monorepo -->       # Entire monorepo impact
```

### 5. Relationship Markers

Define connections between documents:

```markdown
<!-- DEPENDS-ON: [auth-system, database-layer] -->
<!-- REQUIRED-BY: [user-dashboard, admin-panel] -->
<!-- CONFLICTS-WITH: [legacy-system] -->
<!-- REPLACES: [old-component] -->
<!-- EXTENDS: [base-pattern] -->
<!-- IMPLEMENTS: [interface-name] -->
<!-- SEE-ALSO: [related-doc1, related-doc2] -->
<!-- PARENT: [parent-doc] -->
<!-- CHILDREN: [child-doc1, child-doc2] -->
```

### 6. Stack Markers

Indicate technology-specific content:

```markdown
<!-- AI-STACK: nextjs -->         # Next.js specific
<!-- AI-STACK: trpc -->          # tRPC specific
<!-- AI-STACK: drizzle -->       # Drizzle ORM specific
<!-- AI-STACK: zod -->           # Zod validation specific
<!-- AI-STACK: redis -->         # Redis specific
<!-- AI-STACK: mysql -->         # MySQL specific
<!-- AI-STACK: general -->       # Stack-agnostic
```

### 7. State Markers

Track document lifecycle:

```markdown
<!-- AI-STATE: draft -->          # Work in progress
<!-- AI-STATE: review -->         # Under review
<!-- AI-STATE: approved -->       # Approved and current
<!-- AI-STATE: deprecated -->     # Outdated, see alternative
<!-- AI-STATE: archived -->       # Historical reference only
```

### 8. Confidence Markers

Indicate reliability of information:

```markdown
<!-- AI-CONFIDENCE: verified -->      # Tested and confirmed
<!-- AI-CONFIDENCE: experimental -->  # Working but may change
<!-- AI-CONFIDENCE: theoretical -->   # Proposed but not implemented
<!-- AI-CONFIDENCE: deprecated -->    # No longer recommended
```

## 🔧 Advanced Markers

### Interactive Markers

For AI-assisted workflows:

```markdown
<!-- AI-INTERACTIVE: guided-workflow -->
<!-- AI-CHECKPOINTS: [setup, config, test, deploy] -->
<!-- AI-PREREQUISITES: [node-installed, auth-configured] -->
<!-- AI-VALIDATION: [lint-passes, tests-pass, build-succeeds] -->
```

### Example Markers

For code examples:

```markdown
<!-- AI-EXAMPLE: basic-usage -->
<!-- AI-EXAMPLE: advanced-pattern -->
<!-- AI-EXAMPLE: error-handling -->
<!-- AI-EXAMPLE: real-world -->
```

### Performance Markers

For optimization guidance:

```markdown
<!-- AI-PERFORMANCE: critical-path -->
<!-- AI-PERFORMANCE: optimization-opportunity -->
<!-- AI-PERFORMANCE: benchmark-available -->
```

## 📝 Usage Guidelines

### Marker Placement

1. **Document Level**: Place at the top after the title
2. **Section Level**: Place immediately after section headings
3. **Code Blocks**: Place before code blocks
4. **Inline**: Use sparingly for specific callouts

### Example Document Structure

````markdown
# Component Name

<!-- AI-METADATA:
category: architecture
stack: nextjs
complexity: intermediate
dependencies: [auth, database]
-->

<!-- AI-CONTEXT: Overview -->
<!-- AI-PRIORITY: HIGH -->

## Overview

Brief description...

<!-- AI-CONTEXT: Implementation -->
<!-- AI-INTENT: task -->

## Implementation

### Step 1: Setup

<!-- AI-CHECKPOINTS: setup -->
<!-- AI-STACK: nextjs -->

Implementation details...

<!-- AI-EXAMPLE: basic-usage -->

```typescript
// Code example
```
````

<!-- DEPENDS-ON: [auth-system] -->
<!-- SEE-ALSO: [advanced-patterns.md] -->

````

## 🎯 Best Practices

### DO's

- ✅ Use markers consistently across all documents
- ✅ Keep markers concise and meaningful
- ✅ Update markers when content changes
- ✅ Use multiple markers when appropriate
- ✅ Validate marker syntax with linters

### DON'Ts

- ❌ Don't overuse markers (quality over quantity)
- ❌ Don't create custom markers without documentation
- ❌ Don't use markers in place of good content
- ❌ Don't forget to update relationship markers
- ❌ Don't mix marker formats

## 🔍 Validation

### Linting Rules

```javascript
// .eslintrc.js for markdown
module.exports = {
  rules: {
    'kodix/valid-ai-markers': 'error',
    'kodix/required-metadata': 'error',
    'kodix/marker-format': 'error',
  }
};
````

### Validation Script

```bash
# Validate all documentation markers
pnpm validate:docs:markers

# Validate specific file
pnpm validate:docs:markers docs/architecture/example.md
```

## 📊 Marker Analytics

Track marker usage for optimization:

- Most used markers
- Missing required markers
- Orphaned relationships
- Outdated state markers

<!-- AI-RELATED: [documentation-patterns.md, metadata-schema.md, cross-reference-guide.md] -->
<!-- REQUIRED-BY: [all-documentation] -->
<!-- SEE-ALSO: [progressive-disclosure.md] -->
