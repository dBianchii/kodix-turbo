# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

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

# Claude Code Implementation Rules

This document contains Claude Code-specific implementation details for the Universal AI Assistant Rules above. **Read the universal rules first**.

---

## 🔗 Universal Rules Reference

**REQUIRED**: Follow the Universal AI Assistant Rules first. This document adds Claude Code-specific implementation details.

---

## 🛠️ Claude Code Tools

### File Operations ⏱ 2025-07-12

| Scenario                   | Tool        | Best Practice                             |
| -------------------------- | ----------- | ----------------------------------------- |
| Single targeted change     | `Edit`      | Include sufficient context for uniqueness |
| Multiple changes same file | `MultiEdit` | Plan edits to avoid conflicts             |
| New file creation          | `Write`     | Read existing file first if overwriting   |
| Large file restructuring   | `MultiEdit` | Break into logical edit groups            |

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

## 🗄️ Database Access

### MySQL Connection Details

**Connection String**: `mysql://root:password@localhost:3306/kodix`

- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `password`
- Database: `kodix`

### Starting Database

The database runs via Docker Compose when you run `pnpm dev:kdx`. To check if MySQL is running:

```bash
docker ps | grep mysql
```

Expected output:

```
kodix-db-mysql-1    Up X minutes    0.0.0.0:3306->3306/tcp, 33060/tcp
```

### Direct Database Access

To query the database directly from a Node.js script:

```javascript
import { config } from "dotenv";
import { createConnection } from "mysql2/promise";

// Load .env
config({ path: ".env" });

// Parse MYSQL_URL
const mysqlUrl = process.env.MYSQL_URL;
const url = new URL(mysqlUrl);

const connection = await createConnection({
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password,
  database: url.pathname.substring(1),
});

// Example query
const [rows] = await connection.execute("SELECT * FROM ai_model LIMIT 5");
console.log(rows);

await connection.end();
```

### Drizzle Studio

- **Port**: `4983`
- **URL**: `https://local.drizzle.studio/`
- **Start command**: `pnpm db:studio`
- **Troubleshooting**: If port conflict, kill existing process: `kill $(lsof -ti:4983)`

### Key Database Tables

#### `ai_model` - AI Models

- `id` - Primary key (nanoid)
- `display_name` - Human readable name
- `universal_model_id` - Unique model identifier (e.g., "gpt-4o")
- `provider_id` - Reference to ai_provider
- `status` - "active" or "archived"
- `config` - JSON field containing complete model data
- `original_config` - Raw JSON string from synced-models.json
- `enabled` - Boolean flag

#### `ai_provider` - AI Providers

- `id` - Primary key (nanoid)
- `name` - Provider name (e.g., "OpenAI", "Anthropic")
- `base_url` - API base URL

### Example Queries

```sql
-- Get all OpenAI models
SELECT universal_model_id,
       JSON_EXTRACT(config, '$.displayName') as display_name,
       JSON_EXTRACT(config, '$.modelFamily') as model_family
FROM ai_model
WHERE universal_model_id LIKE '%gpt%';

-- Get model pricing
SELECT universal_model_id,
       JSON_EXTRACT(config, '$.pricing.input') as input_price,
       JSON_EXTRACT(config, '$.pricing.output') as output_price
FROM ai_model
WHERE JSON_EXTRACT(config, '$.pricing') IS NOT NULL;

-- Get models by capabilities
SELECT universal_model_id,
       JSON_EXTRACT(config, '$.modalities') as modalities,
       JSON_EXTRACT(config, '$.toolsSupported') as tools
FROM ai_model;
```

---

---

# 🚀 Essential Development Commands

## Core Development

```bash
# Start main development server with database
pnpm dev:kdx

# Database management
pnpm db:studio        # Visual database interface at https://local.drizzle.studio/
pnpm db:push          # Push schema changes to database
pnpm db:seed          # Seed database with initial data

# Quality assurance
pnpm typecheck        # Type checking across all packages
pnpm lint            # ESLint across all packages
pnpm lint:fix        # Fix linting issues
pnpm format:fix      # Format code with Prettier
pnpm test            # Run all tests

# Chat SubApp specific testing
pnpm test:chat       # Run complete chat test suite
pnpm test:chat:watch # Watch mode for chat tests
pnpm test:chat:coverage # Chat tests with coverage report

# Create new tRPC endpoint
pnpm trpc:new        # Interactive CLI for creating tRPC routes
```

## Individual Package Development

```bash
# Run specific package in development
pnpm dev:api         # API package only
pnpm dev:care        # Mobile app
pnpm dev:email       # Email templates

# Filter commands to specific packages
pnpm typecheck --filter=@kdx/api     # Typecheck API package
pnpm lint --filter="@kdx/kdx"        # Lint main app
pnpm test --filter="@kdx/db"         # Test database package
```

## Database Operations

```bash
# Database connection check
docker ps | grep mysql
# Expected: kodix-db-mysql-1 Up X minutes 0.0.0.0:3306->3306/tcp

# Fix Drizzle Studio port conflicts
kill $(lsof -ti:4983)
```

---

# 🏗️ Architecture Overview

## Monorepo Structure

**Kodix Turbo** is a TypeScript monorepo using Turborepo with pnpm workspaces:

```
kodix-turbo/
├── apps/
│   ├── kdx/          # Main Next.js web app (primary focus)
│   └── care-expo/    # React Native mobile app
├── packages/
│   ├── api/          # tRPC API routes and services
│   ├── db/           # Database client, schema, repositories
│   ├── auth/         # Authentication with oslo
│   ├── ui/           # shadcn/ui components
│   ├── validators/   # Zod validation schemas
│   └── [8 more packages]
```

## SubApp Architecture

**Core Concept**: Features are organized as independent SubApps that communicate through a Service Layer:

- **AI Studio** - AI model and agent management
- **Chat** - Communication system (depends on AI Studio)
- **Calendar** - Calendar functionality
- **KodixCare** - Medical care management
- **Todo** - Task management
- **Cupom** - Coupon system

**Service Layer Pattern**: SubApps communicate via TypeScript services (not HTTP):

```typescript
// Cross-SubApp communication
await AiStudioService.getModelById({
  modelId,
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```

## tRPC API Structure

```
packages/api/src/trpc/
├── root.ts           # Main router
├── routers/
│   ├── app/          # SubApp-specific routes
│   │   ├── ai-studio/
│   │   ├── chat/
│   │   └── calendar/
│   ├── auth/         # Authentication
│   ├── team/         # Team management
│   └── user/         # User management
```

## Multi-Tenancy & Security

- **All operations scoped by `teamId`** - Mandatory team validation
- **Repository Pattern** - Data access through repositories in `packages/db/src/repositories/`
- **Service Layer** - Cross-SubApp access only through services
- **Permission System** - Role-based access control per team

## Technology Stack

- **Frontend**: Next.js 15.3, React 19.1, TypeScript 5.5, Tailwind CSS v4
- **Backend**: tRPC v11, Drizzle ORM 0.36.3, MySQL
- **Authentication**: oslo auth library
- **AI Integration**: @ai-sdk/anthropic, @ai-sdk/openai, @ai-sdk/xai
- **Testing**: Vitest, Testing Library
- **Build**: Turborepo, pnpm 9.14.2
- **Node**: v22.15.0

---

**Last Updated**: 2025-07-16  
**Scope**: Claude Code Assistant  
**Dependencies**: None (this is the foundation)  
**Tool Version**: Claude Code v1.0+