# AI Assistants Integration

<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->
<!-- AI-METADATA:
category: reference
stack: general
complexity: basic
dependencies: [universal-principles.md]
-->

## 🎯 Quick Summary

Universal context engineering principles and tool-specific setup guides for AI-assisted development in the Kodix monorepo. **All AI assistants must follow the new modular rules structure**.

## 🔍 📋 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->

**Quick Summary**: Key points for rapid AI context understanding.

<!-- /AI-COMPRESS -->

This directory establishes **universal principles** for AI-assisted development that work across all AI tools, while providing minimal tool-specific configuration differences.

### 🚨 Critical First Step

Before implementing any AI assistant, ensure it loads the **[Universal AI Rules](../rules/universal-ai-rules.md)** first. These time-stamped policies override all other rules and must be followed by all AI assistants. Use the **[Validation Checklist](./VALIDATION-CHECKLIST.md)** to verify proper policy loading.

### 🔄 New Modular Rules Structure

**IMPORTANT**: The rules system has been restructured for cross-AI assistant compatibility:

- **[Universal AI Rules](../rules/universal-ai-rules.md)** - Core principles that apply to ALL AI assistants
- **[Assistant-Specific Rules](../rules/)** - Tool-specific implementation details:
  - `cursor-rules.md` - Cursor IDE specific patterns
  - `gemini-rules.md` - Gemini CLI specific patterns
  - `claude-rules.md` - Claude Code specific patterns
  - Additional files for other AI assistants

**Integration Pattern**: Every AI assistant must read Universal Rules first, then apply their specific implementation rules.

### Core Philosophy

> **Universal Context Engineering**: Core knowledge lives in structured `/docs` files - tool-specific differences are minimal configuration only.

This approach ensures:

- **Tool Independence**: Not locked into specific AI assistants
- **Knowledge Preservation**: Context survives tool changes and updates
- **Team Consistency**: Same knowledge base for all team members
- **Future-Proofing**: Ready for new AI tools as they emerge

## 🧠 Universal Principles

### **[Universal AI Assistant Principles](./universal-principles.md)** ⭐ **READ FIRST**

Core principles that apply to ALL AI assistants:

- **Documentation-First Context**: Structured `.md` files provide superior context
- **Context Hierarchy**: How all AI tools prioritize information
- **Progressive Disclosure**: Layered information architecture
- **Cross-Tool Compatibility**: Patterns that work everywhere

### Key Universal Concepts

1. **Memory & Context**: All AI assistants work better with structured documentation
2. **Reference Resolution**: Universal `@file` syntax for linking documents
3. **Semantic Markers**: Consistent markers for AI comprehension
4. **Context Engineering**: Strategies that transcend specific tools

## 🔧 Tool-Specific Configurations

Each AI assistant requires minimal tool-specific setup and follows the modular rules structure:

### Currently Supported

- **[Cursor](./cursor/)** - Memory prioritization and `.mdc` configuration
  - **Rules**: [`docs/rules/cursor-rules.md`](../rules/cursor-rules.md)
- **[Claude Code](./claude-code/)** - VibeCoding with context engineering optimization
  - **Rules**: [`docs/rules/claude-rules.md`](../rules/claude-rules.md)
- **[Gemini CLI](./gemini-cli/)** - Google's development assistant
  - **Rules**: [`docs/rules/gemini-rules.md`](../rules/gemini-rules.md)

### Planned Support

- **Copilot** - GitHub's AI assistant
- **Windsurf** - Alternative AI coding assistant

## 🎯 What Goes Where

### Universal Documentation (`/docs/`)

**All core knowledge belongs here:**

- **[Universal AI Rules](../rules/universal-ai-rules.md)** - Shared behavior for all AI assistants
- Architecture decisions and patterns
- Feature specifications and implementation guides
- Code examples and best practices
- Business logic and project knowledge
- Development workflows and standards

### Tool-Specific (`/docs/ai-assistants/[tool]/` + `/docs/rules/[tool]-rules.md`)

**Only minimal differences:**

- Installation and setup instructions
- Tool-specific configuration files
- Unique features or limitations
- Integration validation steps
- **Tool-specific rule implementations**

## 📊 Integration Pattern

Every AI assistant follows this universal pattern:

```mermaid
graph TD
    A["AI Assistant"] --> B["Universal AI Rules"]
    B --> C["Tool-Specific Rules"]
    C --> D["Structured Documentation"]
    D --> E["Tool-Specific Config"]
    E --> F["Optimized AI Assistance"]

    style B fill:#4CAF50,stroke:#333,stroke-width:2px
    style C fill:#2196F3,stroke:#333,stroke-width:2px
```

### Standard Setup Process

1. **Read Universal AI Rules**: Load `docs/rules-ai/rules/universal-ai-rules.md`
2. **Apply Tool-Specific Rules**: Load `docs/rules-ai/rules/[tool]-rules.md`
3. **Reference Universal Docs**: Point AI to `/docs` directory
4. **Apply Tool-Specific Config**: Minimal customization
5. **Validate Integration**: Ensure proper context loading

## 🚀 Quick Start

### For New AI Tools

1. **Study Universal Principles**: Read `universal-principles.md`
2. **Create Tool-Specific Rules**: Create `docs/rules-ai/rules/[tool]-rules.md`
3. **Create Tool Directory**: `docs/rules-ai/ai-assistants/[tool-name]/`
4. **Follow Integration Pattern**: Use standard setup template
5. **Document Only Differences**: Avoid duplicating universal knowledge

### For Existing Tools

1. **Validate Universal Compliance**: Check against `universal-ai-rules.md`
2. **Create Tool-Specific Rules**: Extract tool-specific patterns
3. **Remove Duplicated Knowledge**: Keep only tool-specific content
4. **Update References**: Point to universal documentation
5. **Test Cross-Tool Consistency**: Ensure same quality

## 📚 Key Resources

### Universal Documentation

- **[Universal AI Rules](../rules/universal-ai-rules.md)** - **START HERE** - Core rules for all AI assistants
- **[Rules Index](../rules/README.md)** - Complete rules system overview
- **[Universal Principles](./universal-principles.md)** - Core concepts for all AI tools
- **[Sync Rules Manually](./sync-rules.md)** - How to sync rules with AI assistants
- **[VALIDATION CHECKLIST](./VALIDATION-CHECKLIST.md)** - Ensure policies are loaded
- **[Context Engineering](../../context-engineering/)** - Advanced strategies
- **[Documentation Patterns](../../context-engineering/standards/)** - Writing standards

### Kodix-Specific Context

- **[Project Overview](../../README.md)** - Complete project documentation
- \*\*<!-- AI-LINK: type="dependency" importance="high" -->
  <!-- AI-CONTEXT-REF: importance="high" type="architecture" -->

  [Architecture](../../architecture/)
  <!-- /AI-CONTEXT-REF -->
  <!-- /AI-LINK -->** - Technical implementation guides

- **[SubApps](../../subapps/)** - Feature-specific documentation

## 🎯 Best Practices

### For Tool Integration

- **Follow Modular Rules**: Universal rules first, then tool-specific
- **Minimize Tool-Specific Content**: Keep universal knowledge in `/docs`
- **Reference Don't Duplicate**: Link to universal docs instead of copying
- **Focus on Setup**: Emphasize configuration and integration
- **Validate Consistency**: Ensure same quality across tools

### For Universal Documentation

- **Write Tool-Agnostic**: Don't assume specific AI features
- **Structure for AI**: Use semantic markers and clear hierarchy
- **Provide Rich Context**: Include examples and cross-references
- **Maintain Standards**: Follow established patterns

## 🔄 Rules Synchronization

When the universal rules are updated, use the **[Sync Rules Manually](./sync-rules.md)** process to propagate changes to all AI assistants.

**Critical**: The source of truth is now the modular rules system in `docs/rules-ai/rules/`, not a single file.

<!-- AI-RELATED: [universal-principles.md, context-engineering/README.md] -->
<!-- DEPENDS-ON: [universal-principles.md, ../rules/universal-ai-rules.md] -->
<!-- REQUIRED-BY: [all-ai-assistant-tools] -->
<!-- SEE-ALSO: [docs/README.md] -->
