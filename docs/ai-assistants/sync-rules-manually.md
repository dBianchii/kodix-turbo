<!-- AI-METADATA:
category: guide
stack: universal
complexity: intermediate
dependencies: [universal-ai-rules.md, gemini-rules.md, cursor-rules.md]
-->

# Manually Synchronizing AI Assistant Rules

## 🎯 Purpose

This document provides the official manual procedure for synchronizing the modular AI assistant rules into optimized files for each AI tool. This process ensures assistants have the complete and correct context while maintaining tool-specific optimization.

## 📋 Core Principle: Differentiated Sync Strategies

Different AI assistants have different optimal context patterns. The sync process is tailored to each tool's effectiveness:

- **Gemini CLI**: Full universal + tool-specific combination (comprehensive approach)
- **Cursor**: Focused tool-specific file with universal reference (minimal approach)

### **Source Files (Sources of Truth):**

- **[`docs/rules/universal-ai-rules.md`](../rules/universal-ai-rules.md)**: Core rules for ALL AI assistants.
- **[`docs/rules/gemini-rules.md`](../rules/gemini-rules.md)**: Gemini CLI-specific implementation.
- **[`docs/rules/cursor-rules.md`](../rules/cursor-rules.md)**: Cursor-specific implementation (EXPANDED with concrete examples).

### **Destination Files (Synced Copies):**

- `GEMINI.md` (for Gemini CLI) - **Full combination approach**
- `.cursor/rules/README.md` (for Cursor) - **Focused reference approach**

---

## 🔍 **PRE-SYNC VALIDATION**

Before any sync operation, validate source file purity:

### **Universal Rules Validation** ✅ CRITICAL

**File**: `docs/rules/universal-ai-rules.md`

**Requirements**:

- ✅ Contains only tool-agnostic principles
- ✅ Uses phrases like "Use your AI assistant's available..."
- ✅ No specific tool names (`edit_file`, `search_replace`, `list_directory`, etc.)
- ✅ Focuses on WHAT to do, not HOW to implement it
- ✅ Universal timestamps and principles only

**Validation Checklist**:

- [ ] No Cursor-specific tools mentioned
- [ ] No Gemini-specific tools mentioned
- [ ] Language is tool-agnostic throughout
- [ ] Principles apply to all AI assistants
- [ ] Implementation details are generic

### **Cursor Rules Validation** ✅ CRITICAL

**File**: `docs/rules/cursor-rules.md`

**Requirements**:

- ✅ Contains only Cursor-specific implementations
- ✅ References universal-ai-rules.md (not duplicated content)
- ✅ NO Gemini-specific content (`list_directory`, `search_file_content`, `glob`, etc.)
- ✅ Decision matrices and concrete examples
- ✅ MCP browser tools integration

**Validation Checklist**:

- [ ] Only Cursor tools present (`edit_file`, `search_replace`, `codebase_search`, `run_terminal_cmd`, etc.)
- [ ] No Gemini tools mentioned
- [ ] Universal rules referenced, not duplicated
- [ ] Concrete TypeScript examples included
- [ ] MCP browser tools properly documented

### **Gemini Rules Validation** ✅ CRITICAL

**File**: `docs/rules/gemini-rules.md`

**Requirements**:

- ✅ Contains only Gemini-specific tools
- ✅ No Cursor-specific content
- ✅ Minimal and focused approach
- ✅ Clear tool usage patterns

**Validation Checklist**:

- [ ] Only Gemini tools present (`list_directory`, `search_file_content`, `glob`, etc.)
- [ ] No Cursor tools mentioned
- [ ] Appropriate minimal structure
- [ ] Clear and actionable guidance

---

## 🚀 Manual Synchronization Steps

### **For Gemini CLI (Full Combination)**

Gemini CLI benefits from having all rules in a single comprehensive file.

#### Step 1: Pre-Sync Validation

1. **Validate source files** using the checklists above
2. **Ensure content purity** - no cross-contamination
3. **Check universal-ai-rules.md** for true universality

#### Step 2: Prepare the Content

1. Open `docs/rules/universal-ai-rules.md` and copy its entire content.
2. Open `docs/rules/gemini-rules.md` and copy its entire content.
3. Paste the content of `gemini-rules.md` at the **top** of the content from `universal-ai-rules.md`.
4. Add a separator (`---`) between the two sections.

#### Step 3: Optimize the Combined Content

- **Remove Duplicates**: Delete any redundant explanations or rules.
- **Remove Metadata**: Delete all `<!-- AI-METADATA: ... -->` blocks.
- **Remove File Paths**: No explanations about file structure.
- **Ensure Clarity**: Well-structured markdown with clear headings.

#### Step 4: Apply to Destination

1. Open `GEMINI.md`
2. Delete all existing content
3. Paste the combined and optimized content
4. Update the scope metadata to "Gemini CLI Assistant"
5. **Quality Check**: Verify completeness and clarity
6. Save the file

### **For Cursor (Focused Reference)**

Cursor benefits from a focused file that emphasizes tool-specific implementations with clear reference to universal rules.

#### Step 1: Enhanced Source Content Validation

**Critical Validation Steps**:

- ✅ Verify `docs/rules/cursor-rules.md` contains ONLY Cursor-specific content
- ✅ Ensure universal-ai-rules.md reference is present (not duplicated)
- ✅ Confirm NO Gemini-specific content exists
- ✅ Validate decision matrices and concrete examples are included
- ✅ Check MCP browser tools integration is proper

**Content Purity Checklist**:

- [ ] All examples use Cursor tools (`edit_file`, `search_replace`, `codebase_search`, `run_terminal_cmd`)
- [ ] MCP browser tools properly documented (`getConsoleLogs`, `getConsoleErrors`, etc.)
- [ ] No Gemini tools mentioned (`list_directory`, `search_file_content`, `glob`, etc.)
- [ ] TypeScript examples are consistent and correct
- [ ] Universal rules referenced, not duplicated

#### Step 2: Create Focused Structure

Transform the cursor-rules.md content into a focused implementation guide:

**Required Structure**:

```markdown
# Cursor Implementation Guide

**Scope**: Cursor AI Assistant
**Dependencies**: [Universal AI Assistant Rules](../docs/rules/universal-ai-rules.md)

## 🔗 Universal Rules Foundation

[Clear reference to universal rules]

## 🛠️ Cursor Tool Implementations

[Decision matrices and concrete examples]

## 🔧 Cursor-Specific Debugging

[MCP tools implementation with real scenarios]

## 📋 Cursor Integration Checklist

[Actionable verification steps]

## 🎯 Advanced Cursor Techniques

[Context engineering and performance patterns]
```

#### Step 3: Apply to Destination

**Enhanced Sync Process**:

1. Open `.cursor/rules/README.md`
2. **Validate current content** against quality metrics
3. Replace all content with the enhanced cursor-rules.md content
4. **Add clear universal rules reference** at the top
5. **Update scope metadata** to "Cursor AI Assistant"
6. **Quality Assurance Check**:
   - File is 180-220 lines (target range)
   - 95%+ content is Cursor-specific
   - No Gemini-specific content present
   - Decision matrices and examples included
   - MCP browser tools properly documented
7. **Validate no cross-contamination**
8. Save the file

#### Step 4: Post-Sync Quality Verification

**Quality Metrics Validation**:

- ✅ **Cursor Focus**: 95%+ (nearly all content Cursor-specific)
- ✅ **Tool Implementation Depth**: 90%+ (comprehensive tool guidance with examples)
- ✅ **Context Engineering**: 90%+ (proper progressive disclosure)
- ✅ **Actionability**: 95%+ (concrete examples and patterns)
- ✅ **Purity**: 100% (no Gemini-specific content)
- ✅ **File Size Optimization**: 180-220 lines (optimal context window usage)

---

## 🔄 Enhanced Sync Mappings

### **For Gemini CLI (Full Combination):**

**Sources (Combined & Validated)**:

1. `docs/rules/gemini-rules.md` (validated pure Gemini)
2. `docs/rules/universal-ai-rules.md` (validated truly universal)

**Validation Requirements**:

- ✅ No Cursor-specific content in sources
- ✅ Universal rules are truly universal
- ✅ Gemini rules are appropriately minimal

**Destination**: `GEMINI.md`
**Expected Output**: ~400-450 lines (comprehensive)

### **For Cursor (Enhanced Focused):**

**Sources (Enhanced & Validated)**:

1. `docs/rules/cursor-rules.md` (validated pure Cursor with enhancements)
2. Reference to `docs/rules/universal-ai-rules.md` (not duplicated)

**Validation Requirements**:

- ✅ Zero Gemini-specific content
- ✅ Comprehensive Cursor tool coverage
- ✅ Decision matrices and examples included
- ✅ MCP browser tools properly documented

**Destination**: `.cursor/rules/README.md`
**Expected Output**: ~180-220 lines (focused and actionable)

---

## 🎯 Enhanced Sync Quality Targets

### **Gemini CLI Quality Metrics:**

- ✅ **Completeness**: 100% (all rules present)
- ✅ **Tool Focus**: 15% (Gemini-specific content)
- ✅ **Context Depth**: 95% (comprehensive coverage)
- ✅ **Purity**: 100% (no Cursor-specific content)

### **Cursor Quality Metrics (Enhanced):**

- ✅ **Cursor Focus**: 95%+ (nearly all content Cursor-specific)
- ✅ **Tool Implementation Depth**: 90%+ (comprehensive tool guidance with examples)
- ✅ **Context Engineering**: 90%+ (proper progressive disclosure)
- ✅ **Actionability**: 95%+ (concrete examples, decision matrices, and patterns)
- ✅ **Purity**: 100% (no Gemini-specific content, only universal + cursor-specific)
- ✅ **File Size Optimization**: 180-220 lines (optimal context window usage)

---

## 🚨 Critical Sync Rules (Enhanced)

### **Universal Rules Integrity** 🔴 CRITICAL

- **NEVER** modify `docs/rules/universal-ai-rules.md` for tool-specific needs
- **ALWAYS** keep universal rules truly universal and tool-agnostic
- **VERIFY** that universal rules don't contain tool-specific assumptions
- **VALIDATE** cross-tool compatibility before any sync operation

### **Content Purity Enforcement** 🔴 CRITICAL

- **Cursor Files**: Must contain ZERO Gemini-specific references
- **Gemini Files**: Must contain ZERO Cursor-specific references
- **Universal Files**: Must contain ZERO tool-specific implementations
- **Cross-Contamination**: Immediate rejection of any mixed content

### **Tool-Specific Enhancement** 🟠 HIGH

- **Cursor**: Enhanced source file with comprehensive implementations and examples
- **Gemini**: Minimal but complete tool-specific guidance
- **Universal**: Principles and policies that apply to all assistants
- **NEVER** cross-contaminate tool-specific logic between assistants

### **Quality Assurance Protocol** 🟠 HIGH

- **Pre-Sync**: Validate all source files for content purity
- **During Sync**: Apply quality metrics continuously
- **Post-Sync**: Verify output against quality targets
- **Maintenance**: Regular validation to prevent drift

### **Maintenance Protocol** 🟡 MEDIUM

- **ALWAYS** edit source files in `docs/rules/` first
- **NEVER** edit destination files directly
- **VALIDATE** sync results against enhanced quality targets
- **TEST** that each assistant loads rules correctly
- **MONITOR** for content drift and cross-contamination

---

## 🔄 Enhanced Sync Scenarios

### **Scenario 1: Universal Rules Updated**

**What changed**: `docs/rules/universal-ai-rules.md`

**Actions Required**:

- ✅ **Validate** universal rules remain truly universal
- ✅ **Sync Gemini** (full combination with validation)
- ✅ **Verify Cursor reference** is still valid (no sync needed unless structure changed)
- ✅ **Quality check** both destinations

### **Scenario 2: Cursor Rules Updated**

**What changed**: `docs/rules/cursor-rules.md`

**Actions Required**:

- ✅ **Validate** cursor rules contain only Cursor-specific content
- ✅ **Sync Cursor** (focused reference with enhanced validation)
- ✅ **Quality check** against all metrics
- ✅ **Verify** no impact on Gemini sync

### **Scenario 3: Gemini Rules Updated**

**What changed**: `docs/rules/gemini-rules.md`

**Actions Required**:

- ✅ **Validate** gemini rules contain only Gemini-specific content
- ✅ **Sync Gemini** (full combination with validation)
- ✅ **Quality check** against completeness metrics
- ✅ **Verify** no impact on Cursor sync

### **Scenario 4: Content Purity Issue Detected**

**What changed**: Cross-contamination found

**Actions Required**:

- 🔴 **IMMEDIATE**: Stop all sync operations
- 🔴 **INVESTIGATE**: Identify contamination source
- 🔴 **CLEAN**: Remove contaminated content
- 🔴 **VALIDATE**: Ensure purity before resuming
- 🔴 **RE-SYNC**: All affected destinations

---

## 🛡️ **SYNC SAFETY PROTOCOLS**

### **Pre-Sync Safety Checks** ✅ MANDATORY

1. **Backup current destination files**
2. **Validate all source files** for content purity
3. **Check universal rules** for true universality
4. **Verify tool-specific files** contain only appropriate content
5. **Confirm no cross-contamination** exists

### **During-Sync Monitoring** ✅ MANDATORY

1. **Apply quality metrics** continuously
2. **Monitor content purity** during transformation
3. **Validate structural integrity** of outputs
4. **Check for proper references** and links
5. **Ensure target file sizes** are appropriate

### **Post-Sync Validation** ✅ MANDATORY

1. **Quality metrics verification** against targets
2. **Content purity confirmation**
3. **Structural integrity check**
4. **Cross-reference validation**
5. **Performance impact assessment**

---

## 📊 **SYNC SUCCESS METRICS**

### **Overall Sync Quality** 🎯 TARGET: 95%+

**Gemini Sync Success**:

- ✅ Completeness: 100%
- ✅ Purity: 100% (no Cursor content)
- ✅ Clarity: 95%+
- ✅ Usability: 95%+

**Cursor Sync Success**:

- ✅ Focus: 95%+ (Cursor-specific)
- ✅ Purity: 100% (no Gemini content)
- ✅ Actionability: 95%+
- ✅ Size Optimization: 180-220 lines

**Universal Rules Integrity**:

- ✅ Tool-Agnostic: 100%
- ✅ Cross-Tool Compatibility: 100%
- ✅ Principle Clarity: 95%+

---

## 🎯 **CONCLUSION**

This enhanced sync process ensures:

1. **Perfect Content Purity**: Zero cross-contamination between AI tools
2. **Optimal Performance**: Each assistant gets exactly what it needs
3. **Quality Assurance**: Comprehensive validation at every step
4. **Maintainability**: Clear protocols for ongoing sync operations
5. **Scalability**: Framework can support additional AI assistants

**Success Criteria**: When both destinations achieve 95%+ quality metrics with 100% content purity, the sync is successful and ready for production use.

---

**Last Updated**: 2025-01-06  
**Version**: 2.0 (Enhanced with Quality Assurance)  
**Sync Status**: Ready for Enhanced Operations  
**Quality Target**: 95%+ across all metrics
