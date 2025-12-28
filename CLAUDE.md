# AGENTS.md

## Repository Context

### Repo Snapshot
- `apps/` contains the Next.js apps (`kdx`, `cash`).
- `packages/` is domain-organized (`@kdx/*`, `@kdx/*`, `@cash/*`) with reusable logic and shared tooling.
- `packages/{app}/db` where each app has a sibling `@{app}/db` (i.e. `@cash/db`) package that uses Drizzle ORM.
- `tooling/` contains shared tooling and configurations.

### Environment & Toolchain
- Node (version in `.nvmrc`) and `bun` are required.
- Turborepo (`turbo.json`) orchestrates tasks. Prefer using `bun turbo` over using bun to execute scripts (i.e. `bun turbo tsc` instead of `bun tsc`).
- TypeScript runs in strict mode with project references—leverage existing `tsconfig` presets under `tooling/typescript`.
- React 19 + `shadcn/ui` for the frontend
- Drizzle ORM powers database packages for each app.

## Working in this Repository

### Checking Work

- Use turbo commands via `bun turbo` for all validation commands.
- When validating work, always include `//#check:write` in your turbo commands to ensure the formatting is valid.

#### Useful Commands

Note that `turbo` commands can be combined to run multiple tasks in parallel so instead of separately running `test` and `tsc` you can combine as `bun turbo //#check test tsc` to run all 3 tasks at the same time.

- `bun turbo //#check`: Lints and formats the repository.
- `bun turbo test`: Runs tests.
- `bun turbo tsc`: Runs TypeScript checks.

### Syntax Guidelines

- Use `VoidFunction` instead of `() => void;`.
- Use tabs instead of spaces.

### Agent Workflow

#### 1. Understand The Ask
- Identify the target app or package; skim relevant directories and schemas with `rg` before touching code.

#### 2. Plan The Work
- For multi-step tasks, create a brief plan before editing (the CLI provides a planning tool - use it unless the work is trivial).

#### 3. Execute Safely
- Prefer `rg` to locate code over slower alternatives.
- Respect dirty worktrees: never revert or overwrite user changes you did not author. If unexpected edits appear, stop and ask how to proceed.
- Focus edits on minimal surfaces. Mirror existing patterns and typings; add comments only when logic would be unclear without them.

#### 4. Complete Task
- Validate your work before handoff using scoped `bun turbo` runs (e.g. `bun turbo //#check:write test tsc -F <changed-package1> -F <changed-package2>`) that cover the packages you touched.
- Summarize what changed, list validations, and call out remaining risks or follow-up work in the final response. Include file paths (`path/to/file.ts:42`) when referencing code.
