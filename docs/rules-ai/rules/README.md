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

## 🚨 CRITICAL: Rule Replacement Process

**SINGLE SOURCE OF TRUTH**: This directory contains source files that COMPLETELY REPLACE destination AI assistant configuration files.

### 📋 Complete Replacement Process Documentation

**👉 For detailed replacement procedures**: **[`update-rules.md`](./update-rules.md)**

### 🔄 How Rule Replacement Works

1. **Source**: Rules are authored in this `/rules/` directory
2. **Replace**: Using process documented in [`update-rules.md`](./update-rules.md)
3. **Destination**: AI assistant configuration files are COMPLETELY REPLACED:
   - **Cursor IDE**: `.cursor/rules/README.md`
   - **Gemini CLI**: `GEMINI.md` (repository root)  
   - **Claude Code**: `CLAUDE.md` (repository root)
4. **Usage**: AI assistants load and follow these completely replaced rules

### ⚠️ CRITICAL RULES

- ✅ **DO**: Edit source files in this `/rules/` directory
- ❌ **DON'T**: Edit destination files directly (they get COMPLETELY OVERWRITTEN)
- ✅ **DO**: Use [`update-rules.md`](./update-rules.md) replacement process
- ❌ **DON'T**: Skip validation after making changes

**Nothing is Lost**: The replacement process ensures all universal rules and provider-specific rules are preserved during complete file recreation.

---

This directory is the single source of truth for all AI assistant rules in the Kodix repository.

## Structure

- **`universal-ai-rules.md`**: Core rules that apply to ALL AI assistants.
- **`gemini-rules.md`**: Rules specific to the Gemini CLI assistant.
- **`cursor-rules.md`**: Rules specific to the Cursor IDE assistant.
- **`claude-rules.md`**: Rules specific to the Claude Code assistant.
- **`update-rules.md`**: Complete replacement procedures and validation protocols.

## 💡 Usage

All AI assistants should first load and process `universal-ai-rules.md`, and then their own specific rule file.

## Quick Reference

- **Source Files**: Edit rules in this directory
- **Destination Files**: Completely replaced via process in [`update-rules.md`](./update-rules.md)
- **Never Edit**: Destination files directly (they get completely overwritten)
