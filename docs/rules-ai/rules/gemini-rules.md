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

# Gemini CLI Rules

This document contains rules and guidelines specific to the Gemini CLI assistant.

---

## 💡 Tool Usage

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
