# AI Assistant Rules Update Process

## 🎯 Purpose

This document provides the **unified manual procedure** for updating all AI assistant rules by completely replacing destination files. The same process applies to all AI assistants.

## 📋 Core Principle

**Complete File Replacement**: Source files are combined to COMPLETELY REPLACE destination files. This is not a sync - it's a total recreation that preserves all content.

## 📁 File Mappings

### Source Files (Edit These)

- `docs/rules-ai/rules/universal-ai-rules.md` - Core rules for ALL assistants
- `docs/rules-ai/rules/gemini-rules.md` - Gemini-specific rules
- `docs/rules-ai/rules/cursor-rules.md` - Cursor-specific rules
- `docs/rules-ai/rules/claude-rules.md` - Claude-specific rules

### Destination Files (Auto-Generated)

- `GEMINI.md` - Gemini CLI configuration
- `.cursor/rules/README.md` - Cursor IDE configuration
- `CLAUDE.md` - Claude Code configuration

---

## 🚀 Unified Update Process

### Step 1: Pre-Update Validation

**Validate ALL source files for purity:**

1. **Universal rules** - Must be tool-agnostic, no specific tool names
2. **Tool-specific rules** - Must contain ONLY that tool's implementation
3. **No cross-contamination** - Cursor rules shouldn't mention Gemini tools, etc.

### Step 2: Update All Assistants

**For each AI assistant, execute the same process:**

```bash
# Pseudo-code for the update loop
for assistant in [Gemini, Cursor, Claude]:
    1. Read universal-ai-rules.md
    2. Read {assistant}-rules.md
    3. Combine content (universal first, then tool-specific)
    4. Remove all metadata blocks (<!-- AI-METADATA -->)
    5. Add separator between sections
    6. Write to destination file
    7. Verify output quality
```

### Step 3: Implementation Details

#### For ALL Assistants:

1. **Open source files**:

   - Copy entire content of `universal-ai-rules.md`
   - Copy entire content of `{tool}-rules.md`

2. **Combine content**:

   - Place universal rules FIRST
   - Add separator: `---`
   - Add tool-specific rules AFTER

3. **Clean content**:

   - Remove ALL `<!-- AI-METADATA -->` blocks
   - Remove duplicate sections
   - Ensure clear structure

4. **Replace destination**:

   - Open destination file
   - DELETE all existing content
   - Paste combined content
   - Update scope metadata

5. **Quality check**:
   - Verify completeness
   - Check for errors
   - Ensure proper formatting

---

## ✅ Quality Checklist

**Apply to ALL updates:**

- [ ] Source files validated for purity
- [ ] Universal rules included completely
- [ ] Tool-specific rules included completely
- [ ] All metadata removed
- [ ] Proper formatting maintained
- [ ] Destination file completely replaced
- [ ] No cross-tool contamination
- [ ] Update timestamp updated

---

## 🔄 Update Scenarios

### Scenario 1: Universal Rules Changed

- Update ALL three destination files (Gemini, Cursor, Claude)

### Scenario 2: Tool-Specific Rules Changed

- Update ONLY that tool's destination file

### Scenario 3: Multiple Changes

- Update each affected destination file using the same process

---

## 🚨 Critical Rules

1. **NEVER** edit destination files directly
2. **NEVER** edit source files
3. **ALWAYS** validate before updating
4. **ALWAYS** completely replace (not merge, delete destination file first)
5. **NEVER** mix tool-specific content between assistants

---

## 📊 Success Metrics

**For ALL assistants:**

- ✅ 100% content purity (no cross-contamination)
- ✅ 100% completeness (all rules included)
- ✅ Clear structure and formatting
- ✅ Proper tool-specific optimizations

---

**Last Updated**: 2025-01-16  
**Version**: 4.0 (Simplified Unified Process)  
**Status**: ✅ Production Ready
