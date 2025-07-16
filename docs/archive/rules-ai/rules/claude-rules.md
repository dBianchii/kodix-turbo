<!-- AI-METADATA:
category: rules
complexity: comprehensive
updated: 2025-07-15
claude-ready: true
target: claude-code
phase: 4
priority: high
token-optimized: true
audience: claude-code
ai-context-weight: critical
last-ai-review: 2025-07-15
-->

# Claude Code Implementation Rules

This document contains Claude Code-specific implementation details for the Universal AI Assistant Rules above.

---

## 🛠️ Claude Code Tools

### File Operations ⏱ 2025-07-15

| Scenario | Tool | Best Practice |
|----------|------|---------------|
| Single targeted change | `Edit` | Include sufficient context for uniqueness |
| Multiple changes same file | `MultiEdit` | Plan edits to avoid conflicts |
| New file creation | `Write` | Read existing file first if overwriting |
| Large file restructuring | `MultiEdit` | Break into logical edit groups |

### Context Assembly ⏱ 2025-07-15

**Priority Loading**: Universal rules → Architecture → Specific implementation

**Tools**: Use `Read` for analysis, `Glob`/`Grep` for search, `Task` for complex operations

### Debug Protocol ⏱ 2025-07-15

Follow universal debug protocol with Claude Code tools:

1. **Reflect causes** → Use analytical reasoning
2. **Add logs** → Use `Edit`/`MultiEdit` for logging
3. **Browser analysis** → Request console output from user
4. **Server logs** → Use `Bash` for investigation
5. **Remove temp logs** → Use `Edit` with replace_all

### VibeCoding Workflow ⏱ 2025-07-15

1. **Context Assembly**: Load relevant documentation first
2. **Problem Analysis**: Use reasoning to understand requirements
3. **Pattern Discovery**: Search codebase for existing patterns
4. **Implementation**: Use appropriate tools (Edit/MultiEdit/Write)
5. **Validation**: Run tests and quality checks via Bash

### PRP Commands ⏱ 2025-07-15

**`/generate-prp`**: Analyze request → Search patterns → Generate PRP
**`/execute-prp`**: Read PRP → Plan → Implement → Validate

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

# 🗄️ Database Access ⏱ 2025-07-15

**Database Guide**: See `claude-sql.md` for complete database access information including:
- MySQL connection details and credentials
- How to start/check database status
- Direct database access code examples
- Drizzle Studio setup and troubleshooting
- Key table schemas (ai_model, ai_provider)
- Example SQL queries for common tasks

**Quick Start**: Database runs when you execute `pnpm dev:kdx` (Docker Compose)

---

**Scope**: Claude Code Assistant  
**Last Updated**: 2025-07-15  
**Dependencies**: None (this is the foundation)  
**Tool Version**: Claude Code v1.0+