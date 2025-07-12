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

```typescript
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

### Command Guidelines

# 🛠️ Terminal Command Guidelines for AI

To ensure commands are auto-executed in Cursor without manual approval, **avoid using compound shell commands** with pipes (`|`), redirections (`>`, `2>&1`), or `&&` in a single line.

Cursor does not automatically approve these chained commands, even in YOLO mode with a command allowlist.

---

## ✅ What to do

**Always prefer breaking complex shell commands into individual simple steps**, like this:

```bash
# Step 1: Run typecheck and save output to a file
pnpm typecheck --filter=@kdx/kdx > output.txt

# Step 2: Filter relevant lines using grep
grep -E "(Found [0-9]+ errors|error TS[0-9]+)" output.txt > filtered.txt

# Step 3: Count the number of matching lines
wc -l < filtered.txt
```

---

## ❌ What NOT to do

Avoid using chained commands like this:

```bash
pnpm typecheck --filter=@kdx/kdx 2>&1 | grep -E "(Found [0-9]+ errors|error TS[0-9]+)" | wc -l
```

Even if `pnpm`, `grep`, and `wc` are in the command allowlist, this compound form **will pause execution and request approval**.

---

## 💡 Tip

If absolutely necessary, consider creating reusable `.sh` scripts and allow those explicitly in your command allowlist.

````

Se quiser, posso também gerar esse arquivo diretamente como download ou te ajudar a incluir isso na pasta `.cursor/rules/`. Deseja?


#### Context Window Management

- **Priority Loading**: `.cursor/rules/README.md` loads first via settings.json
- **Discovery Pattern**: Use `codebase_search` for exploration, `read_file` for details
- **Progressive Disclosure**: Load overview → specific implementation → edge cases

### MCP Browser Tools ⏱ 2024-07-02

#### Console Debugging Workflow

```typescript
// Step-by-step process
1. Ask user to reproduce issue
2. Wait for confirmation
3. mcp_browser-tools_getConsoleErrors()
4. mcp_browser-tools_getConsoleLogs()
5. mcp_browser-tools_getNetworkErrorLogs()
````

#### Debugging Scenarios

**React Component Issues:**

```typescript
getConsoleErrors() → identify component error
getNetworkLogs() → check API calls
takeScreenshot() → visual confirmation
```

**Performance Issues:**

```typescript
getNetworkSuccessLogs() → check request timing
getNetworkErrorLogs() → identify failed requests
takeScreenshot() → UI state verification
```

### Timestamps ⏱ 2024-07-02

**Always use before defining dates:**

```typescript
await mcp_date_time_tools_currentDateTimeAndTimezone();
// Then use the returned date for documentation
```

### Terminal Integration Patterns

```bash
# Common Kodix commands
run_terminal_cmd("pnpm dev:kdx")          # Development
run_terminal_cmd("pnpm typecheck")        # Validation
run_terminal_cmd("pnpm eslint apps/kdx/") # Linting
run_terminal_cmd("cd packages/db-dev && docker-compose up -d") # Database
```

### Memory & Context Tools

```typescript
// Store important findings
update_memory({
  title: "Component Pattern Discovery",
  content: "Button component uses compound pattern with hooks",
});

// Memory automatically available in context
```

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
