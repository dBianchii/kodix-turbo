# Cursor-Specific Memory and Context Features
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->
<!-- AI-METADATA:
category: guide
stack: general
complexity: basic
dependencies: [../universal-principles.md]
assistant: cursor
-->

## 🎯 Quick Summary

Cursor-specific memory features, `.mdc` configuration, and optimization techniques that complement the universal AI assistant principles.

## 🔍 📋 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
This guide covers **only** the features and configurations unique to Cursor. For universal AI assistant principles, see **[Universal AI Assistant Principles](../universal-principles.md)**.

### Cursor-Specific Features

- **`.mdc` Rules System**: Custom behavior configuration
- **Memory Prioritization**: Cursor's specific context assembly
- **Workspace Integration**: VS Code-style integration features
- **Session Persistence**: Cursor's conversation memory

## 🔧 Cursor-Specific Configuration

### 1. `.mdc` Rules File

Create `.cursor/rules` for Cursor-specific behavior:

```markdown
# .cursor/rules

## Project Context

Reference the main documentation at /docs/README.md for complete project context.

## Kodix-Specific Rules

- Always use pnpm for package management
- Follow tRPC patterns in packages/api/src/trpc/
- Use Drizzle ORM for database operations
- Reference docs/architecture/ for implementation patterns

## Code Style

- Use TypeScript strict mode
- No any types without explicit validation
- Use absolute imports with ~/ prefix
- Follow ESLint rules in eslint.config.js
```

### 2. Cursor Memory Features

**Session Persistence**:

- Cursor maintains conversation history across sessions
- Context persists when reopening projects
- Memory integrates with VS Code workspace

**Context Assembly**:

- Cursor scans open files for immediate context
- Prioritizes recently edited files
- Integrates with Git status and changes

### 3. Workspace Integration

**File Navigation**:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Cursor can navigate project structure
@docs/architecture/backend/../../../architecture/backend/backend-guide.md
@packages/api/src/trpc/
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Code Intelligence**:

- TypeScript integration for type awareness
- ESLint integration for code quality
- Git integration for change tracking

## 🚀 Cursor Optimization Tips

### 1. Leverage Cursor's Code Intelligence

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Cursor understands TypeScript relationships
// Reference types and interfaces directly
interface UserConfig {
  // Cursor will suggest based on existing patterns
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Use Cursor's File Context

- Keep relevant files open in tabs
- Cursor uses open files for immediate context
- Close irrelevant files to reduce noise

### 3. Optimize Memory Usage

- Use specific file references: `@docs/specific-file.md`
- Keep documentation current and relevant
- Use `.mdc` rules for project-specific guidance

## 🔄 Integration with Universal Docs

Cursor automatically references:

- **Main Documentation**: `/docs/README.md`
- **Architecture Guides**: `/docs/architecture/`
- **SubApp Documentation**: `/docs/subapps/`
- **Context Engineering**: `/docs/context-engineering/`

### Configuration Example

```markdown
# .cursor/rules

## Universal Documentation Reference

Always reference /docs/ for project context and patterns.

## Cursor-Specific Optimizations

- Use open file context for immediate code assistance
- Leverage TypeScript integration for type safety
- Follow established patterns in codebase
```

## 🎯 Cursor vs Universal Features

| Feature               | Universal    | Cursor-Specific             |
| --------------------- | ------------ | --------------------------- |
| Documentation Context | ✅ All tools | VS Code integration         |
| Memory Persistence    | ✅ All tools | Session-based memory        |
| Code Intelligence     | ✅ All tools | TypeScript deep integration |
| File Navigation       | ✅ All tools | Workspace file tree         |
| Configuration         | ✅ All tools | `.mdc` rules system         |

## 📚 Related Resources

- **[Universal AI Assistant Principles](../universal-principles.md)** - Core concepts
- **[Context Engineering](../../context-engineering/)** - Advanced strategies
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[Kodix Architecture](../../architecture/)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Project patterns

<!-- AI-RELATED: [../universal-principles.md] -->
<!-- DEPENDS-ON: [../universal-principles.md] -->
<!-- REQUIRED-BY: [cursor-integration] -->
<!-- SEE-ALSO: [../../context-engineering/README.md] -->

```

```
