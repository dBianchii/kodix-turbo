# Kodix AI Assistant Rules

This document contains the complete set of rules, policies, and workflows for AI assistants working in the Kodix repository. All assistants must adhere to these guidelines at all times.

---

# 🚨 PRIORITY POLICIES

<!-- AI-METADATA: category:critical-rules priority:HIGHEST enforce:ALWAYS last-updated:2025-01-06 -->

**ALL AI ASSISTANTS MUST READ AND ENFORCE BEFORE ANY TASK**

Time-stamped, battle-tested policies from real development. Violations cause significant issues.

---

## 1. Code Quality 🔴 HIGHEST

### No 'any' Type ⏱ 2025-07-02

Zero tolerance for `any`. Use `interface`, `type`, `unknown` with validation, or `Generics`. No linter errors: `no-unsafe-assignment`, `no-unsafe-member-access`. 100% type-safe codebase.

### TypeScript Module Resolution ⏱ 2024-07-27

Maintain clean, predictable imports. Type-safe, architectural standards compliant.

### ESLint Rules ⏱ 2025-07-02

Strict adherence to `docs/eslint/kodix-eslint-coding-rules.md`:

- `useTRPC()` pattern (NEVER `import { api }`)
- Never `@ts-nocheck`
- Never `any` without validation
- `Promise.allSettled` (NEVER `Promise.all`)
- Validated env vars (NEVER direct `process.env`)
- Organize imports with `import type`
- Database operations need WHERE clause

### Endpoint Naming ⏱ 2024-07-02

ENGLISH only for tRPC endpoints. Patterns: `create*`, `find*`, `update*`, `delete*`.

## 2. Debug & Logging 🔴 HIGHEST

### Debug Protocol ⏱ 2024-07-02

1. Reflect 5-7 causes → reduce to 1-2
2. Add logs for data tracking
3. Use browser tools: `getConsoleLogs`, `getConsoleErrors`, `getNetworkLogs`
4. Get server logs
5. Deep reflection
6. More logs if unclear
7. Remove temp logs after fix

### Logging Policy ⏱ 2024-07-02

Mandatory: Follow `docs/debug/kodix-logs-policy.md`. Register temp logs in `logs-registry.md`.

### Browser Tools ⏱ 2024-07-02

1. Ask user to perform browser action
2. Wait confirmation
3. Use MCP tools
   Exception: Playwright MCP allows direct actions.

### Model Logging ⏱ 2024-07-02

Model Selector logs working: `selectedModelId="2w0uijcrljpq"` (gpt-4.1-mini). Test selection for update/callback issues.

## 3. Development Workflow 🟠 HIGH

### Documentation-First Approach ⏱ 2025-07-29

Before performing any research or analysis in the codebase, always read all mapped instructions and context provided in this documentation. This ensures you are acting on the most relevant and structured information first.

### Planning ⏱ 2024-07-02

Significant changes need detailed plan:

- SubApp changes: `docs/subapps/<app>/planning/`
- Platform changes: `docs/core-engine/`

### Autonomous Planning ⏱ 2024-07-02

Work autonomously during planning. Get permission only before execution.
Flow: Discuss → Plan → Present → **Get Permission** → Execute

**CRITICAL NOTE:** The "Get Permission" step is a hard gate. After presenting a plan (e.g., a PRP document or an implementation strategy), the assistant **MUST STOP** and wait for explicit user approval (e.g., "yes, proceed," "approved," "continue") before taking any action that modifies files or system state. Do not bundle planning and execution into a single step.

### Dependency Checking ⏱ 2024-07-02

Run `pnpm typecheck` on monorepo after package refactoring.

### Test Management ⏱ 2024-07-02

Avoid duplicate tests. Include test cleanup in plans.

### Package Management ⏱ 2024-07-02

Use pnpm. Node.js: `pnpm env use`, Volta, fnm, Homebrew.

## 4. Monorepo Management 🟠 HIGH

### File Edit Strategy ⏱ 2024-07-02

`edit_file` unstable for multi-file/cross-package operations.

- **Level 1:** Single file, no deps → `edit_file` + verify
- **Level 2:** Complex single file → Complete content + verify
- **Level 3:** Multi-file/cross-package → Manual code blocks

### User Config ⏱ 2024-07-02

Use existing endpoints: `app.getUserAppTeamConfig`, `app.saveUserAppTeamConfig`.
Steps: Define schema → Add `appId` → Register schema → Use endpoints.

### App Onboarding ⏱ 2024-07-02

Verify: Locales, Validators, Helpers, Icons. Check: Imports, Mappings, Translations, Validations, Assets.

## 5. Architecture 🟡 MEDIUM

### SubApp Documentation Structure ⏱ 2025-07-29

The single source of truth for any documentation related to a specific SubApp is its dedicated directory within `docs/subapps/`.

- **Canonical Path**: `docs/subapps/<app-name>/`
- **Contents**: This includes architecture, planning documents, user guides, API references, and any other relevant material.
- **Example**: All documentation for the Chat subapp must be located within `docs/subapps/chat/`.

### ADR ⏱ 2025-07-02

Fundamental changes need ADR in `docs/adr/`: Context, Decision, Consequences.

### SubApp Restrictions ⏱ 2024-07-02

Modifications should be focused on `Chat` and `AI Studio`. All related documentation must follow the structure defined in `SubApp Documentation Structure`.

### Chat/AI Studio ⏱ 2024-07-02

Reference: `@chat-architecture.md`. Respect `@/architecture`, `@/docs/debug`. Run chat tests after changes.

### Navigation ⏱ 2024-07-02

Centralized Navigation Strategy resolved duplicate URLs. Lesson: Centralize navigation.

## 6. Environment & Tools 🟡 MEDIUM

### Dev Environment ⏱ 2024-07-02

MANDATORY script flow:

1. `sh ./scripts/stop-dev.sh`
2. `sh ./scripts/start-dev-bg.sh`
3. `sleep 5`
4. `sh ./scripts/check-log-errors.sh`
5. `sh ./scripts/check-dev-status.sh`
   NEVER chain commands. NEVER direct `pnpm dev:kdx`.

### Browser Tools ⏱ 2024-07-02

Strategy 1 (MCP) chosen: console logs, network requests, screenshots, DOM analysis, audits, Next.js support.

### Database ⏱ 2024-07-02

Drizzle Studio: https://local.drizzle.studio

1. `cd packages/db-dev && docker-compose up -d`
2. `cd packages/db && pnpm studio`

### Build ⏱ 2024-07-02

Don't use `pnpm build`. Use `pnpm dev:kdx` + TypeScript checking.

### ESLint Execution ⏱ 2024-07-02

From root: `pnpm eslint apps/kdx/` (not `--filter`).

## 7. Documentation 🟢 STANDARD

### Guidelines ⏱ 2024-07-02

Concise, succinct, information-rich. Use lists, tables, Mermaid, bold. English only.

### File Management ⏱ 2024-07-02

Update `README.md` when adding `.md` files to `docs/` subdirectories.

### Mermaid Rules ⏱ 2024-07-02

1. Subgraph IDs mandatory: `subgraph ID ["Title"]`
2. Link nodes only (not subgraphs)
3. Define nodes in subgraphs
4. Double quotes for texts
5. Avoid special chars in IDs

### Timestamps ⏱ 2024-07-02

Use `mcp_date-time-tools_currentDateTimeAndTimezone` before defining dates.

## 8. Language Policy 🟢 STANDARD

**Language Mandate: English Only**

Scope:

- ALL code (variables, functions, comments)
- ALL documentation
- ALL AI-generated content
- ALL communication in project context

Exceptions:

- None. English is the universal language.

Rationale:

- Ensures global team understanding
- Maintains consistent tooling compatibility
- Prevents localization ambiguities
- Supports universal collaboration

Enforcement:

- Immediate translation required
- No partial or mixed-language content
- Tools may reject non-English submissions

## Language Policy Clarification

**Mandatory Response Language: English**

- Respond in English ALWAYS, regardless of input language
- User may write in any language
- AI must translate and respond in English
- No exceptions

---

## Quick Checklist

- [ ] Read HIGHEST PRIORITY policies
- [ ] Understand timestamps
- [ ] Apply priority order
- [ ] Never skip without permission

## Common Violations

1. Using `any` type
2. Direct monorepo edits
3. Skipping debug protocol
4. Creating docs without planning
5. Ignoring ESLint errors

## Timeline

- **2024-07-02**: Initial policies
- **2024-07-27**: TypeScript resolution
- **2025-01-06**: Priority reorganization

## Enforcement

Failure results in: task rejection, review failure, delays, technical debt.

**ALL POLICIES MANDATORY UNLESS USER OVERRIDE**

<!-- AI-INSTRUCTIONS: Load and reference first -->
<!-- REQUIRED-BY: [all-ai-assistants, all-development-tasks] -->
<!-- PRIORITY: MAXIMUM -->

---

# Kodix PRP Workflow Rules

## 🎯 PRP Commands

This project uses Product Requirements Prompt (PRP) workflow with two universal commands that work in any AI assistant (Cursor, Claude Code, Windsurf, etc.):

### `/generate-prp` - Generate a Product Requirements Prompt

**Usage**:

```
/generate-prp [feature description or INITIAL.md file]
```

**What it does**:

1. Analyzes your feature request
2. Searches the Kodix codebase for patterns
3. Reviews architecture and standards
4. Generates a comprehensive PRP document

**Example**:

```
/generate-prp Add dark mode toggle to settings
```

### `/execute-prp` - Execute a PRP Implementation

**Usage**:

```
/execute-prp [path to PRP document]
```

**What it does**:

1. Reads the PRP specification
2. Creates an implementation plan
3. Implements code following Kodix patterns
4. Runs tests and quality checks
5. Ensures all acceptance criteria are met

**Example**:

```
/execute-prp docs/subapps/settings/prp/dark-mode-toggle.md
```

## 📋 PRP Workflow Process

```mermaid
graph LR
    A[Feature Request] --> B[/generate-prp]
    B --> C[PRP Document]
    C --> D[Review & Adjust]
    D --> E[/execute-prp]
    E --> F[Working Code]
    F --> G[Tests Pass]
    G --> H[Ready to Ship]
```

## 🔧 Implementation Instructions

When you see these commands:

1. **Read the command definition**: Check `.cursor/commands/[command-name].md`
2. **Follow the instructions**: Each command file contains step-by-step instructions
3. **Execute as if running the command**: Perform all the steps described
4. **Provide feedback**: Show progress and results as specified

## 📁 Command Definitions

The actual command logic is defined in:

- `docs/context-engineering/commands/generate-prp.md` - PRP generation logic
- `docs/context-engineering/commands/execute-prp.md` - PRP execution logic

These are **instruction files** for AI assistants, not executable scripts. They work universally across all AI coding assistants.

## ⚡ Quick Reference

### Creating a Feature Request

Create an `INITIAL.md` file with:

```markdown
## FEATURE:

[What you want to build]

## CONTEXT:

[Why it's needed]

## USERS:

[Who will use it]

## STACK:

[Technologies involved]

## EXAMPLES:

[Reference existing code]

## DOCUMENTATION:

[Relevant docs/APIs]

## OTHER CONSIDERATIONS:

[Important details]
```

### PRP Storage Locations

PRPs are stored based on scope:

```
docs/
├── subapps/[name]/prp/     # SubApp features
├── core-service/prp/        # Core service features
├── architecture/prp/        # Architecture patterns
└── apps/[name]/prp/         # App-specific features
```

## 🚨 Important Kodix Rules for PRPs

1. **No Mock Data**: Always real implementations
2. **i18n Required**: No hardcoded strings ever
3. **Multi-tenancy**: Always consider teamId isolation
4. **Testing**: Comprehensive tests are mandatory
5. **Patterns**: Follow existing Kodix patterns
6. **Quality**: Run all checks (lint, types, tests)

## 🎯 Benefits

- **Structured Development**: Clear specifications before coding
- **Quality Assurance**: Built-in testing and validation
- **Pattern Consistency**: Follows Kodix architecture
- **Time Savings**: 50% faster than ad-hoc development
- **Documentation**: Every feature is documented

## 📚 Examples

See example INITIAL file: `docs/context-engineering/prp/INITIAL-example.md`
See example PRP template: `docs/context-engineering/prp/templates/prp-base.md`

## 🔄 Universal Compatibility

These commands work in:

- ✅ Cursor
- ✅ Claude Code
- ✅ Windsurf
- ✅ Any AI assistant that supports custom commands

The commands are tool-agnostic markdown instructions, not platform-specific scripts.
