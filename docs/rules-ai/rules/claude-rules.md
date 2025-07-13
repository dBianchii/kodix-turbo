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

**Last Updated**: 2025-07-12  
**Dependencies**: [Universal AI Assistant Rules](./universal-ai-rules.md)  
**Tool Version**: Claude Code v1.0+
