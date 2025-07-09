# Gemini CLI Rules

This document contains rules and guidelines specific to the Gemini CLI assistant.

---

## Tool Usage

- **`list_directory`**: Use to explore the file system.
- **`read_file`**: Use to read the content of a file.
- **`search_file_content`**: Use to find specific content within files.
- **`glob`**: Use to find files matching a pattern.
- **`replace`**: Use for targeted text replacements.
- **`write_file`**: Use to create new files or overwrite existing ones.
- **`run_shell_command`**: Use to execute shell commands.
- **`save_memory`**: Use to remember facts across sessions.
- **`google_web_search`**: Use to search the web.

---

## File Operations

- For small, targeted changes, prefer `replace` over `write_file`.
- When using `replace`, always read the file first to get the exact `old_string`.
- For creating new files or making large changes, use `write_file`.

---

## Shell Commands

- Use `run_shell_command` to execute project scripts like `pnpm test`, `pnpm lint`, etc.
- Be cautious with commands that modify the file system.

---

## PRP Workflow

- Use `read_file` to read the PRP document.
- Use the available tools to implement the requirements.
- Refer to the universal rules for the PRP process.

---

# Universal AI Assistant Rules

This document contains **shared behavior and context engineering rules** that apply to **all AI assistants** working in the Kodix repository, regardless of the specific platform (Cursor, Claude Code, Gemini CLI, etc.).

These rules focus on **WHAT** needs to be done rather than **HOW** to implement it with specific tools.

---

# 🚨 PRIORITY POLICIES

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
- Prefer `Promise.allSettled` over `Promise.all` to prevent silent failures. Use `Promise.all` only when fast-failing is the explicit desired behavior.
- Validated env vars (NEVER direct `process.env`)
- Organize imports with `import type`
- Database operations need WHERE clause

### Endpoint Naming ⏱ 2024-07-02

ENGLISH only for tRPC endpoints. Patterns: `create*`, `find*`, `update*`, `delete*`.

## 2. Debug & Logging 🔴 HIGHEST

### Debug Protocol ⏱ 2024-07-02

Universal debugging approach (use tool-specific implementations):

1. **Reflect** 5-7 causes → reduce to 1-2
2. **Add logs** for data tracking
3. **Browser analysis** - Use available browser debugging tools
4. **Server logs** - Check backend logs and errors
5. **Deep reflection** - Analyze root causes
6. **More logs if unclear** - Add targeted logging
7. **Remove temp logs** after fix

### Logging Policy ⏱ 2024-07-02

**Mandatory**: Follow `docs/debug/kodix-logs-policy.md`. Register temporary logs in `logs-registry.md`.

### Browser Debugging ⏱ 2024-07-02

**Universal Principle**: Always verify frontend issues with browser tools before backend investigation.

**Implementation**: Use your AI assistant's available browser debugging capabilities (console logs, network analysis, DOM inspection, etc.).

### Model Logging ⏱ 2024-07-02

Model Selector logs working: `selectedModelId="2w0uijcrljpq"` (gpt-4.1-mini). Test selection for update/callback issues using available debugging tools.

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

### File Operations Strategy ⏱ 2024-07-02

**Universal Principle**: Use appropriate editing strategy based on complexity:

- **Simple Changes**: Single file, no dependencies → Use basic file editing
- **Complex Changes**: Large files or complex logic → Use comprehensive editing approach
- **Multi-file Changes**: Cross-package operations → Use systematic multi-file approach

**Implementation**: Use your AI assistant's available file editing capabilities according to these principles.

### User Configuration ⏱ 2024-07-02

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

### Development Environment ⏱ 2024-07-02

The primary command for development is `pnpm dev:kdx`. This command uses Turborepo to coordinate and run both the Next.js application and the required Docker services (like MySQL and Redis) simultaneously.

- **To start everything**: Run `pnpm dev:kdx` from the root.
- **To manage services manually** (for debugging): Use `docker-compose` commands inside `packages/db-dev/`.

Refer to the `docs/architecture/development-setup.md` for more details.

### Database Access ⏱ 2024-07-02

Drizzle Studio: https://local.drizzle.studio

1. `cd packages/db-dev && docker-compose up -d`
2. `cd packages/db && pnpm studio`

### Build Process ⏱ 2024-07-02

Don't use `pnpm build`. Use `pnpm dev:kdx` + TypeScript checking.

### ESLint Execution ⏱ 2024-07-02

From root: `pnpm eslint apps/kdx/` (not `--filter`).

## 7. Documentation Standards 🟢 STANDARD

### Context Engineering Principles ⏱ 2025-01-06

**All context must live in structured `.md` files**:

- Use semantic markers for AI comprehension
- Follow progressive disclosure patterns
- Maintain cross-tool compatibility
- Structure information hierarchically

### Guidelines ⏱ 2024-07-02

Concise, succinct, information-rich. Use lists, tables, diagrams, bold formatting. English only.

### File Management ⏱ 2024-07-02

Update `README.md` when adding `.md` files to `docs/` subdirectories.

### Diagram Standards ⏱ 2024-07-02

When creating diagrams:

1. Use clear, descriptive labels
2. Follow consistent formatting
3. Include proper node definitions
4. Use double quotes for text
5. Avoid special characters in IDs

### Timestamps ⏱ 2024-07-02

**Universal Principle**: Always get current date/time before defining dates in documentation.

**Implementation**: Use your AI assistant's available date/time tools to ensure accuracy.

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

## 🎯 PRP Workflow Rules

### Universal Commands

This project uses Product Requirements Prompt (PRP) workflow with two universal commands that work in any AI assistant:

#### `/generate-prp` - Generate a Product Requirements Prompt

**Usage**: `/generate-prp [feature description or INITIAL.md file]`

**What it does**:

1. Analyzes your feature request
2. Searches the Kodix codebase for patterns
3. Reviews architecture and standards
4. Generates a comprehensive PRP document

#### `/execute-prp` - Execute a PRP Implementation

**Usage**: `/execute-prp [path to PRP document]`

**What it does**:

1. Reads the PRP specification
2. Creates an implementation plan
3. Implements code following Kodix patterns
4. Runs tests and quality checks
5. Ensures all acceptance criteria are met

### PRP Workflow Process

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

### Implementation Instructions

When you see these commands:

1. **Read the command definition**: Check `docs/context-engineering/commands/[command-name].md`
2. **Follow the instructions**: Each command file contains step-by-step instructions
3. **Execute as if running the command**: Perform all the steps described
4. **Provide feedback**: Show progress and results as specified

### Command Definitions

The actual command logic is defined in:

- `docs/context-engineering/commands/generate-prp.md` - PRP generation logic
- `docs/context-engineering/commands/execute-prp.md` - PRP execution logic

These are **instruction files** for AI assistants, not executable scripts. They work universally across all AI coding assistants.

### PRP Storage Locations

PRPs are stored based on scope:

```
docs/
├── subapps/[name]/prp/     # SubApp features
├── core-service/prp/        # Core service features
├── architecture/prp/        # Architecture patterns
└── apps/[name]/prp/         # App-specific features
```

### Important Kodix Rules for PRPs

1. **No Mock Data**: Always real implementations
2. **i18n Required**: No hardcoded strings ever
3. **Multi-tenancy**: Always consider teamId isolation
4. **Testing**: Comprehensive tests are mandatory
5. **Patterns**: Follow existing Kodix patterns
6. **Quality**: Run all checks (lint, types, tests)

---

## Quick Checklist

- [ ] Read HIGHEST PRIORITY policies
- [ ] Understand timestamps
- [ ] Apply priority order
- [ ] Never skip without permission

## Common Violations

1. Using `any` type
2. Direct monorepo edits without strategy
3. Skipping debug protocol
4. Creating docs without planning
5. Ignoring ESLint errors

## Timeline

- **2024-07-02**: Initial policies
- **2024-07-27**: TypeScript resolution
- **2025-01-06**: Cross-AI assistant compatibility

## Enforcement

Failure results in: task rejection, review failure, delays, technical debt.

**ALL POLICIES MANDATORY UNLESS USER OVERRIDE**

---

**Last Updated**: 2025-01-06  
**Scope**: Gemini CLI Assistant  
**Dependencies**: None (this is the foundation)
