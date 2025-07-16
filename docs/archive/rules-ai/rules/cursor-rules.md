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

# Cursor-Specific Implementation Rules

This document contains Cursor-specific implementation details for the [Universal AI Assistant Rules](./universal-ai-rules.md). **Read the universal rules first**, then use this document for Cursor-specific tools and patterns.

---

## 🔗 Universal Rules Reference

**REQUIRED**: All Cursor users must follow the [Universal AI Assistant Rules](./universal-ai-rules.md) first. This document only adds Cursor-specific implementation details.

---

## 🛠️ Cursor Tool Implementations

### File Operations Strategy ⏱ 2024-07-02

#### edit_file vs search_replace Decision Matrix

| Scenario                   | Tool               | Reason                    | Best Practice              |
| -------------------------- | ------------------ | ------------------------- | -------------------------- |
| Single small change        | `search_replace`   | Precise, less error-prone | Include 3-5 lines context  |
| Multiple changes same file | `edit_file`        | Handles complex edits     | Verify changes after       |
| Files >2500 lines          | `search_replace`   | Better performance        | Use unique context strings |
| Cross-package operations   | Manual code blocks | Avoid tool instability    | Level 3 strategy           |

#### File Edit Levels

- **Level 1:** Single file, no deps → `edit_file` + verify
- **Level 2:** Complex single file → Complete content + verify
- **Level 3:** Multi-file/cross-package → Manual code blocks

### Parallel Tool Call Patterns ⏱ 2024-07-02

#### Information Gathering Examples

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Simultaneous file analysis
parallel_calls([
  read_file("src/components/Button.tsx"),
  read_file("src/hooks/useButton.ts"),
  read_file("tests/Button.test.tsx"),
]);

// Combined search strategies
parallel_calls([
  codebase_search("How is authentication handled?"),
  grep_search("useAuth|AuthContext", "src/"),
  grep_search("login|logout", "src/"),
]);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### Context Window Management

- **Priority Loading**: `.cursor/rules/README.md` loads first via settings.json
- **Discovery Pattern**: Use `codebase_search` for exploration, `read_file` for details
- **Progressive Disclosure**: Load overview → specific implementation → edge cases

### MCP Browser Tools ⏱ 2024-07-02

#### Console Debugging Workflow

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Step-by-step process
1. Ask user to reproduce issue
2. Wait for confirmation
3. mcp_browser-tools_getConsoleErrors()
4. mcp_browser-tools_getConsoleLogs()
5. mcp_browser-tools_getNetworkErrorLogs()
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### Debugging Scenarios

**React Component Issues:**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
getConsoleErrors() → identify component error
getNetworkLogs() → check API calls
takeScreenshot() → visual confirmation
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Performance Issues:**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
getNetworkSuccessLogs() → check request timing
getNetworkErrorLogs() → identify failed requests
takeScreenshot() → UI state verification
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Timestamps ⏱ 2024-07-02

**Always use before defining dates:**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
await mcp_date_time_tools_currentDateTimeAndTimezone();
// Then use the returned date for documentation
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Terminal Integration Patterns

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Common Kodix commands
run_terminal_cmd("pnpm dev:kdx")          # Development
run_terminal_cmd("pnpm typecheck")        # Validation
run_terminal_cmd("pnpm eslint apps/kdx/") # Linting
run_terminal_cmd("cd packages/db-dev && docker-compose up -d") # Database
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Memory & Context Tools

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Store important findings
update_memory({
  title: "Component Pattern Discovery",
  content: "Button component uses compound pattern with hooks",
});

// Memory automatically available in context
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🔧 Cursor-Specific Debugging

### Debug Protocol Implementation

Follow the universal debug protocol using these Cursor-specific tools:

1. **Reflect causes** → Use Cursor's analysis capabilities
2. **Add logs** → Use `edit_file` or `search_replace` for targeted logging
3. **Browser tools** → Use MCP browser tools (`getConsoleLogs`, `getConsoleErrors`, `getNetworkLogs`)
4. **Server logs** → Use `run_terminal_cmd` for backend investigation
5. **Deep reflection** → Use Cursor's reasoning with full context
6. **More logs if unclear** → Use iterative editing approach
7. **Remove temp logs** → Use `search_replace` for cleanup

### Model Logging in Cursor

Model Selector logs working: `selectedModelId="2w0uijcrljpq"` (gpt-4.1-mini). Test selection for update/callback issues using Cursor's debugging tools.

---

## 📋 Cursor Integration Checklist

### Tool Availability Verification

- [ ] `edit_file` and `search_replace` working
- [ ] MCP browser tools configured (`getConsoleLogs`, `getConsoleErrors`, etc.)
- [ ] Terminal integration (`run_terminal_cmd`) available
- [ ] Memory tools (`update_memory`) functional
- [ ] Timestamp tools (`mcp_date-time-tools_currentDateTimeAndTimezone`) working

### Performance Optimization

- [ ] Use parallel tool calls for information gathering
- [ ] Prefer `search_replace` for large files (>2500 lines)
- [ ] Use progressive disclosure for context management
- [ ] Verify changes after `edit_file` operations
- [ ] Clean up temporary logs after debugging

### Context Management

- [ ] Universal rules loaded and understood
- [ ] `.cursor/settings.json` configured correctly
- [ ] File edit strategy understood and applied
- [ ] Browser debugging tools available and tested
- [ ] Command system integrated with PRP workflow

---

## 🎯 Cursor-Specific Best Practices

### File Operations Excellence

- **Small Changes**: Use `search_replace` with sufficient context
- **Complex Edits**: Use `edit_file` with verification step
- **Multi-file Operations**: Use manual code blocks to avoid tool instability
- **Large Files**: Always prefer `search_replace` over `edit_file`

### Debugging Mastery

- **Frontend First**: Always check browser console before server logs
- **MCP Tools**: Leverage browser tools for React/Next.js debugging
- **Terminal Integration**: Use for backend investigation and commands
- **Progressive Analysis**: Start broad, then narrow down to specific issues

### Workflow Optimization

- **Parallel Execution**: Use simultaneous tool calls for efficiency
- **Context Window**: Manage with progressive disclosure patterns
- **Memory Usage**: Store important patterns and discoveries
- **PRP Integration**: Use Cursor's command system for workflow commands

### Error Recovery Patterns

- **Tool Failures**: Fall back to manual code blocks
- **Context Overload**: Use `codebase_search` to refocus
- **Edit Conflicts**: Verify changes and use `search_replace` for corrections
- **Performance Issues**: Switch to more targeted tool usage

---

## 🚀 Advanced Cursor Techniques

### Context Engineering

- Load rules automatically via `.cursor/settings.json`
- Use semantic search for code discovery
- Apply progressive disclosure for large codebases
- Reference universal rules for consistency

### Tool Synergy

- Combine `codebase_search` + `grep_search` for comprehensive analysis
- Use `read_file` after `codebase_search` for detailed investigation
- Apply MCP browser tools during active debugging sessions
- Leverage `run_terminal_cmd` for validation and testing

### Performance Patterns

- Batch file operations when possible
- Use appropriate tool for file size and complexity
- Apply parallel calls for independent operations
- Manage context window with strategic loading

---

**Last Updated**: 2025-01-06  
**Dependencies**: [Universal AI Assistant Rules](./universal-ai-rules.md)  
**Tool Version**: Cursor v0.x+
