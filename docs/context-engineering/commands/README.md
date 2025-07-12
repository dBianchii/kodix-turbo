# Universal AI Assistant Commands

<!-- AI-METADATA:
category: reference
stack: general
complexity: basic
dependencies: []
-->

## 🎯 Quick Summary

Universal command definitions that work across all AI assistants (Cursor, Claude Code, Windsurf, etc.) for the PRP workflow.

## 📋 Overview

This directory contains **universal command instructions** that any AI assistant can interpret and execute. These are not executable scripts, but rather detailed markdown instructions that AI assistants follow.

### Command Philosophy

> **Instructions, not scripts**: Commands are step-by-step instructions for AI assistants, making them tool-agnostic and universally compatible.

## 📝 Available Commands

### `/generate-prp`

**Purpose**: Generate a Product Requirements Prompt from a feature description

**File**: [generate-prp.md](./generate-prp.md)

**Usage**:

```
/generate-prp [feature description or INITIAL.md file]
```

**What it does**:

1. Analyzes feature request
2. Searches codebase for patterns
3. Reviews architecture and standards
4. Generates comprehensive PRP document

### `/execute-prp`

**Purpose**: Execute a PRP to implement the specified feature

**File**: [execute-prp.md](./execute-prp.md)

**Usage**:

```
/execute-prp [path to PRP document]
```

**What it does**:

1. Reads PRP specification
2. Creates implementation plan
3. Implements code following patterns
4. Runs quality checks
5. Ensures acceptance criteria are met

## 🔧 How Commands Work

### For AI Assistants

When an AI assistant sees a command like `/generate-prp`:

1. **Recognizes Command**: Identifies it as a custom command
2. **Reads Instructions**: Opens the corresponding `.md` file
3. **Follows Steps**: Executes each step in the instructions
4. **Uses AI Tools**: Leverages built-in tools (search, edit, etc.)
5. **Provides Feedback**: Reports progress and results

### Universal Compatibility

These commands work because:

- **Markdown Format**: All AI assistants can read markdown
- **Clear Instructions**: Step-by-step guidance is unambiguous
- **Tool Agnostic**: No dependency on specific platforms
- **Self-Contained**: All context is in the instruction file

## 🚀 Integration Guide

### For Cursor

1. Reference commands in `.cursor/rules/README.md`
2. AI reads from `docs/context-engineering/commands/`
3. No special configuration needed

### For Claude Code

1. Commands work natively with slash syntax
2. Reads instructions from this directory
3. No configuration required

### For Other AI Assistants

1. Point AI to this directory
2. Reference specific command files
3. AI interprets and executes

## 📚 Creating New Commands

To add a new universal command:

1. **Create Command File**: `[command-name].md`
2. **Structure**:

   ```markdown
   # [Command Name] Command

   When the user types `/[command-name]` followed by [parameters]:

   ## Step 1: [Action]

   [Detailed instructions]

   ## Step 2: [Action]

   [Detailed instructions]

   ## Step N: [Final Step]

   [Completion instructions]
   ```

3. **Guidelines**:
   - Be explicit and detailed
   - Include error handling
   - Provide progress feedback
   - Show example outputs

## 🎯 Best Practices

### For Command Authors

1. **Clear Steps**: Number and name each step clearly
2. **Explicit Actions**: Tell AI exactly what to do
3. **Error Handling**: Include recovery instructions
4. **Progress Updates**: Show user what's happening
5. **Examples**: Include usage examples

### For Users

1. **Exact Syntax**: Use commands as documented
2. **Provide Context**: Give clear parameters
3. **Review Output**: Check generated results
4. **Iterate**: Adjust and re-run if needed

## 📊 Command Patterns

### Input Parsing

```markdown
## Step 1: Parse Input

Extract [information] from user's input. Accept formats:

1. Direct input: /command [parameters]
2. File reference: /command [file.md]
3. Structured format: Multi-line input
```

### Progress Reporting

```markdown
## Step N: Provide Summary

After completing [action], provide:
✅ [What was done]
📄 [What was created]
📊 [Metrics/Stats]
🚀 [Next steps]
```

### Error Handling

```markdown
If [condition]:

1. [Recovery action]
2. [Alternative approach]
3. [User notification]
```

## 🔗 Related Resources

- [PRP System Guide](../prp/README.md)
- [Universal AI Principles](../../ai-assistants/universal-principles.md)
- [Context Engineering](../README.md)
- [Project Rules](../../rules/)

<!-- AI-RELATED: [../prp/README.md, ../../ai-assistants/universal-principles.md] -->
<!-- DEPENDS-ON: [universal-principles] -->
<!-- REQUIRED-BY: [prp-workflow] -->
<!-- SEE-ALSO: [generate-prp.md, execute-prp.md] -->
