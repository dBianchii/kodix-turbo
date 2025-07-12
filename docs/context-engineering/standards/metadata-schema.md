# Metadata Schema for Kodix Documentation

<!-- AI-METADATA:
category: standard
stack: general
complexity: intermediate
dependencies: [semantic-markers.md]
-->

## 🎯 Quick Summary

Standardized metadata schema for document frontmatter that enables AI tools to understand document properties, relationships, and context at a glance.

## 📋 Overview

Every documentation file in the Kodix project should include a metadata block using HTML comments. This metadata provides essential information for AI tools to understand the document's purpose, complexity, and relationships.

### Why Metadata Matters

- **Quick Context**: AI tools can assess relevance without parsing entire documents
- **Smart Navigation**: Enables intelligent document discovery
- **Token Optimization**: Helps prioritize which documents to include in context
- **Relationship Mapping**: Builds a knowledge graph of the documentation

## 📐 Schema Definition

### Required Fields

```yaml
<!-- AI-METADATA:
category: [type]        # Document category (required)
stack: [technologies]   # Related technologies (required)
complexity: [level]     # Complexity level (required)
dependencies: [list]    # Document dependencies (required, can be empty [])
-->
```

### Optional Fields

```yaml
<!-- AI-METADATA:
# ... required fields ...
version: [version]              # Document version
last-updated: [date]           # Last update date (YYYY-MM-DD)
owner: [team/person]           # Document owner
status: [status]               # Document status
tags: [tag1, tag2]            # Additional tags
related-code: [paths]         # Related code files
examples: [count]             # Number of examples
estimated-time: [minutes]     # Reading time estimate
prerequisites: [list]         # Required knowledge
-->
```

## 🏷️ Field Specifications

### category

Defines the document type:

```yaml
category: architecture      # System design documents
category: subapp           # SubApp documentation
category: service          # Service/API documentation
category: guide            # How-to guides
category: reference        # Reference material
category: standard         # Standards and patterns
category: planning         # Planning documents
category: troubleshooting  # Problem-solving guides
```

### stack

Technologies covered (use array for multiple):

```yaml
stack: general            # Stack-agnostic
stack: nextjs            # Next.js specific
stack: trpc              # tRPC specific
stack: [nextjs, trpc]    # Multiple technologies
stack: [drizzle, mysql]  # Database stack
```

### complexity

Content complexity level:

```yaml
complexity: basic         # Beginner-friendly
complexity: intermediate  # Some experience required
complexity: advanced      # Expert level
complexity: expert        # Deep technical knowledge
```

### dependencies

Other documents that should be read first:

```yaml
dependencies: []                    # No dependencies
dependencies: [auth-guide.md]       # Single dependency
dependencies: [auth.md, setup.md]   # Multiple dependencies
```

### status

Document lifecycle state:

```yaml
status: draft            # Work in progress
status: review           # Under review
status: approved         # Approved and current
status: deprecated       # Outdated
status: archived         # Historical reference
```

## 📝 Complete Examples

### Basic Document

```markdown
# Getting Started with Kodix

<!-- AI-METADATA:
category: guide
stack: general
complexity: basic
dependencies: []
-->

Content...
```

### Complex Architecture Document

```markdown
# SubApp Communication Architecture

<!-- AI-METADATA:
category: architecture
stack: [nextjs, trpc, redis]
complexity: advanced
dependencies: [subapp-architecture.md, event-system.md]
version: 2.1
last-updated: 2025-01-07
owner: architecture-team
status: approved
tags: [communication, events, real-time]
related-code: [packages/api/src/events/, apps/kdx/src/lib/events/]
examples: 5
estimated-time: 15
prerequisites: [typescript, async-programming, pub-sub-patterns]
-->

Content...
```

### SubApp Documentation

```markdown
# AI Studio SubApp

<!-- AI-METADATA:
category: subapp
stack: [nextjs, trpc, zod]
complexity: intermediate
dependencies: [subapp-architecture.md]
owner: ai-team
status: approved
tags: [ai, llm, agents]
estimated-time: 10
-->

Content...
```

## 🔍 Validation Rules

### Required Field Validation

```typescript
interface RequiredMetadata {
  category: Category;
  stack: Stack | Stack[];
  complexity: Complexity;
  dependencies: string[];
}

type Category =
  | "architecture"
  | "subapp"
  | "service"
  | "guide"
  | "reference"
  | "standard"
  | "planning"
  | "troubleshooting";

type Stack =
  | "general"
  | "nextjs"
  | "trpc"
  | "drizzle"
  | "zod"
  | "redis"
  | "mysql";

type Complexity = "basic" | "intermediate" | "advanced" | "expert";
```

### Validation Script

```bash
# Validate metadata in all docs
pnpm validate:metadata

# Validate specific file
pnpm validate:metadata docs/example.md

# Auto-fix common issues
pnpm validate:metadata --fix
```

## 🤖 AI Tool Usage

### How AI Tools Use Metadata

1. **Context Selection**

   ```typescript
   // AI prioritizes documents based on:
   - Matching stack technologies
   - Appropriate complexity level
   - Satisfied dependencies
   - Recent last-updated dates
   ```

2. **Navigation**

   ```typescript
   // AI navigates by:
   - Following dependency chains
   - Grouping by category
   - Filtering by tags
   - Checking prerequisites
   ```

3. **Time Management**
   ```typescript
   // AI manages context window by:
   - Using estimated-time for budgeting
   - Prioritizing by status
   - Including examples when needed
   ```

## 📊 Metadata Analytics

Track metadata quality:

```yaml
Metrics:
  - Coverage: % of files with metadata
  - Completeness: % with all optional fields
  - Freshness: % updated in last 30 days
  - Dependency Health: % with valid deps
  - Complexity Distribution: Basic/Int/Adv/Expert
```

## 🎯 Best Practices

### DO's

- ✅ Keep metadata up-to-date
- ✅ Use consistent category names
- ✅ Validate dependencies exist
- ✅ Update version on significant changes
- ✅ Include estimated reading time

### DON'Ts

- ❌ Don't skip required fields
- ❌ Don't use custom categories
- ❌ Don't list circular dependencies
- ❌ Don't forget to update last-updated
- ❌ Don't overload with tags

## 🔄 Migration Guide

For existing documents without metadata:

1. **Audit**: List all files missing metadata
2. **Prioritize**: Start with most-visited docs
3. **Add Metadata**: Use templates for consistency
4. **Validate**: Run validation scripts
5. **Monitor**: Track coverage metrics

<!-- AI-RELATED: [semantic-markers.md, documentation-patterns.md] -->
<!-- REQUIRED-BY: [all-documentation] -->
<!-- SEE-ALSO: [cross-reference-guide.md, progressive-disclosure.md] -->
