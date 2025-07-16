<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: overview

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

# AI Assistant Rules

This directory is the single source of truth for all AI assistant rules in the Kodix repository.

## Structure

- **`universal-ai-rules.md`**: Core rules that apply to ALL AI assistants.
- **`gemini-rules.md`**: Rules specific to the Gemini CLI assistant.
- **`cursor-rules.md`**: Rules specific to the Cursor IDE assistant.
- **`claude-rules.md`**: Rules specific to the Claude Code assistant.

## 💡 Usage

All AI assistants should first load and process `universal-ai-rules.md`, and then their own specific rule file.

## Rule Synchronization

The rules in this directory are **source files** that need to be joined to replace to their respective AI assistant destinations:

- **Gemini CLI**: `GEMINI.md` (repository root)
- **Cursor IDE**: `.cursor/rules/README.md`
- **Claude Code**: `CLAUDE.md` (repository root)

### How to Regenerate Rules for All AI Assistants

For complete synchronization procedures and detailed instructions, see:

**📋 [Rule Synchronization Guide](../ai-assistants/sync-rules.md)**

The sync guide contains:

- Manual synchronization steps for each AI assistant
- Quality validation procedures
- Content purity enforcement protocols
- Sync safety protocols and success metrics

### Quick Reference

- **Source Files**: Edit rules in `docs/rules-ai/rules/` directory
- **Destination Files**: Generated through sync process
- **Sync Documentation**: `docs/rules-ai/ai-assistants/sync-rules.md`
- **Never Edit**: Destination files directly (they get overwritten during sync)

---

**⚠️ Important**: Always edit source files in this directory first, then use the sync process to update destination files. Never edit destination files directly as they will be overwritten during the next sync operation.
