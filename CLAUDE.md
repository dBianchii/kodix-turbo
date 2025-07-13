# Universal AI Assistant Rules

This document contains **essential behavior and context engineering rules** that apply to **all AI assistants** working in the Kodix repository, regardless of the specific platform.

These rules focus on **WHAT** needs to be done rather than **HOW** to implement it with specific tools.

---

# 🚨 CRITICAL POLICIES

**ALL AI ASSISTANTS MUST READ AND ENFORCE BEFORE ANY TASK**

Time-stamped, battle-tested policies from real development. Violations cause significant issues.

---

## 1. Code Quality 🔴 HIGHEST

### No 'any' Type ⏱ 2025-07-02

Zero tolerance for `any`. Use `interface`, `type`, `unknown` with validation, or `Generics`. 100% type-safe codebase.

### ESLint Rules ⏱ 2025-07-02

Strict adherence to `docs/eslint/kodix-eslint-coding-rules.md`:

- `useTRPC()` pattern (NEVER `import { api }`)
- Never `@ts-nocheck`
- Never `any` without validation
- Prefer `Promise.allSettled` over `Promise.all` to prevent silent failures
- Validated env vars (NEVER direct `process.env`)
- Database operations need WHERE clause

### Endpoint Naming ⏱ 2024-07-02

ENGLISH only for tRPC endpoints. Patterns: `create*`, `find*`, `update*`, `delete*`.

## 2. Debug & Logging 🔴 HIGHEST

### Debug Protocol ⏱ 2024-07-02

Universal debugging approach:

1. **Reflect** causes → reduce to 1-2 most likely
2. **Add logs** for data tracking
3. **Browser analysis** - Verify frontend issues first
4. **Server logs** - Check backend logs and errors
5. **Deep reflection** - Analyze root causes
6. **More logs if unclear** - Add targeted logging
7. **Remove temp logs** after fix

### Logging Policy ⏱ 2024-07-02

**Mandatory**: Follow `docs/debug/kodix-logs-policy.md`. Register temporary logs in `logs-registry.md`.

## 3. Development Workflow 🟠 HIGH

### Documentation-First Approach ⏱ 2025-07-29

Read all relevant documentation and context before starting any task. This ensures you act on structured information first.

### Planning & Permission ⏱ 2024-07-02

Significant changes need detailed planning. Work autonomously during planning phase.

Flow: Discuss → Plan → Present → **Get Permission** → Execute

**CRITICAL**: After presenting any plan, **STOP** and wait for explicit user approval before modifying files or system state.

### Quality Assurance ⏱ 2024-07-02

- Run typecheck after package changes
- Avoid duplicate tests
- Include test cleanup in plans

## 4. Architecture 🟡 MEDIUM

### SubApp Documentation ⏱ 2025-07-29

Single source of truth for SubApp documentation: `docs/subapps/<app-name>/`

### Architecture Changes ⏱ 2025-07-02

Fundamental changes need ADR in `docs/adr/`: Context, Decision, Consequences.

### Project Focus ⏱ 2024-07-02

Primary development focus: `Chat` and `AI Studio` SubApps.

## 5. Documentation Standards 🟢 STANDARD

### Context Engineering ⏱ 2025-01-06

All context must live in structured `.md` files:
- Use semantic markers for AI comprehension
- Follow progressive disclosure patterns
- Maintain cross-tool compatibility
- Structure information hierarchically

### Language Policy 🟢 STANDARD

**English Only**: ALL code, documentation, AI-generated content, and communication.

## 6. PRP Workflow 🎯 CORE

### Universal Commands

Product Requirements Prompt (PRP) workflow with two universal commands:

#### `/generate-prp` - Generate a Product Requirements Prompt
Analyzes feature requests, searches codebase patterns, reviews architecture, generates comprehensive PRP.

#### `/execute-prp` - Execute a PRP Implementation
Reads PRP specification, creates implementation plan, implements following Kodix patterns, runs quality checks.

### Implementation Rules
1. **No Mock Data**: Always real implementations
2. **i18n Required**: No hardcoded strings
3. **Multi-tenancy**: Consider teamId isolation
4. **Testing**: Comprehensive tests mandatory
5. **Quality**: Run all checks (lint, types, tests)

---

## 🔒 Enforcement

**ALL POLICIES MANDATORY UNLESS USER OVERRIDE**

Common violations:
1. Using `any` type
2. Skipping debug protocol
3. Ignoring ESLint errors
4. Working without permission gate

Failure results in: task rejection, review failure, technical debt.

---

# Claude Code Implementation Rules

This document contains Claude Code-specific implementation details for the Universal AI Assistant Rules above.

---

## 🛠️ Claude Code Tools

### File Operations ⏱ 2025-07-12

| Scenario | Tool | Best Practice |
|----------|------|---------------|
| Single targeted change | `Edit` | Include sufficient context for uniqueness |
| Multiple changes same file | `MultiEdit` | Plan edits to avoid conflicts |
| New file creation | `Write` | Read existing file first if overwriting |
| Large file restructuring | `MultiEdit` | Break into logical edit groups |

### Context Assembly ⏱ 2025-07-12

**Priority Loading**: Universal rules → Architecture → Specific implementation

**Tools**: Use `Read` for analysis, `Glob`/`Grep` for search, `Task` for complex operations

### Debug Protocol ⏱ 2025-07-12

Follow universal debug protocol with Claude Code tools:

1. **Reflect causes** → Use analytical reasoning
2. **Add logs** → Use `Edit`/`MultiEdit` for logging
3. **Browser analysis** → Request console output from user
4. **Server logs** → Use `Bash` for investigation
5. **Remove temp logs** → Use `Edit` with replace_all

### VibeCoding Workflow ⏱ 2025-07-12

1. **Context Assembly**: Load relevant documentation first
2. **Problem Analysis**: Use reasoning to understand requirements
3. **Pattern Discovery**: Search codebase for existing patterns
4. **Implementation**: Use appropriate tools (Edit/MultiEdit/Write)
5. **Validation**: Run tests and quality checks via Bash

### PRP Commands ⏱ 2025-07-12

**`/generate-prp`**: Analyze request → Search patterns → Generate PRP
**`/execute-prp`**: Read PRP → Plan → Implement → Validate

---

## 🎯 Essential Practices

### Core Workflow
- **Documentation First**: Read relevant docs before implementation
- **Reasoning-Driven**: Use analytical capabilities for problem-solving
- **Pattern-Aware**: Follow existing Kodix patterns
- **Quality-Focused**: Validate throughout development

### Tool Usage
- Use `Edit` for single changes with unique context
- Use `MultiEdit` for multiple related changes
- Use `Read` extensively for understanding patterns
- Use `Bash` for validation and testing

---

**Scope**: Claude Code Assistant  
**Last Updated**: 2025-07-12  
**Dependencies**: None (this is the foundation)  
**Tool Version**: Claude Code v1.0+