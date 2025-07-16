<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: reference

complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Claude Code Implementation Rules

This document contains Claude Code-specific implementation details for the [Universal AI Assistant Rules](./universal-ai-rules.md). **Read the universal rules first**.

---

## 🔗 Universal Rules Reference

**REQUIRED**: Follow the [Universal AI Assistant Rules](./universal-ai-rules.md) first. This document adds Claude Code-specific implementation details.

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

x

---

**Last Updated**: 2025-07-12  
**Dependencies**: [Universal AI Assistant Rules](./universal-ai-rules.md)  
**Tool Version**: Claude Code v1.0+
