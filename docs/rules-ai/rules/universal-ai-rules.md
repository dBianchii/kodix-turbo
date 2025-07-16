<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: reference

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

# Universal AI Assistant Rules

This document contains **essential behavior and context engineering rules** that apply to
**all AI assistants** working in the Kodix repository, regardless of platform.

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

## 🏗️ 4. Architecture 🟡 MEDIUM

### SubApp Documentation ⏱ 2025-07-29

Single source of truth for SubApp documentation: `docs/subapps/<app-name>/`

### Architecture Changes ⏱ 2025-07-02

Fundamental changes need ADR in `docs/adr/`: Context, Decision, Consequences.

### Project Focus ⏱ 2024-07-02

Primary development focus: `Chat` and `AI Studio` SubApps.

## 5. Documentation Standards 🟢 STANDARD

### Markdown Linting Compliance ⏱ 2025-01-06

**MANDATORY**: Before creating or modifying any `.md` file, review markdown linting rules:

- **MarkdownLint Rules**: `.markdownlint.json` - Enforces style, structure, and formatting
- **Link Validation**: `.markdown-link-check.json` - Validates all links and references

**Key Requirements**:

- Line length: 120 characters max (excluding code blocks and tables)
- Headers: ATX style (`# ## ###`)
- Lists: 2-space indentation
- Code blocks: Fenced style (```)
- No broken links or invalid references

**Verification**: Use project's markdown linting tools to validate before submitting.

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

**Last Updated**: 2025-07-12  
**Scope**: All AI Assistants  
**Dependencies**: None (this is the foundation)
