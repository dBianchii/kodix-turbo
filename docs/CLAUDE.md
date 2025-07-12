# Kodix AI Documentation Reference

<!-- AI-METADATA:
category: reference
stack: general
complexity: advanced
dependencies: [all-documentation]
-->

## 🎯 Quick Summary

Central reference for AI assistants working with the Kodix monorepo, providing comprehensive context and navigation guidelines.

## 🚨 PRIORITY READING

**MANDATORY FIRST**: Read **[PRIORITY POLICIES](rules/PRIORITY-POLICIES.md)** before ANY task. These time-stamped policies override all other rules.

## 📋 Project Overview

Kodix is a Next.js monorepo with multiple SubApps, focusing on AI-powered productivity tools.

## 🗂️ Core Documentation References

### Project Architecture

- **Complete Overview**: @docs/README.md
- **Architecture Standards**: @docs/architecture/Architecture_Standards.md
- **Development Workflow**: @docs/architecture/development-workflow.md

### SubApp Specific Documentation

- **Chat SubApp**: @docs/subapps/chat/chat-architecture.md
- **AI Studio**: @docs/subapps/ai-studio/ai-studio-architecture.md
- **Kodix Care**: @docs/apps/care-mobile/README.md

### Technical Standards

- **Coding Rules**: @docs/eslint/kodix-eslint-coding-rules.md
- **Backend Guide**: @docs/architecture/backend-guide.md
- **Frontend Guide**: @docs/architecture/frontend-guide.md

### Development Tools

- **Database Workflow**: @docs/database/development-workflow.md
- **Testing Guidelines**: @docs/tests/README.md
- **Context Engineering**: @docs/context-engineering/README.md

## 🚨 Critical Rules

### Documentation Principles

1. **No Hardcoded Strings**: Always use translations
2. **English Code**: Variables, functions, comments in English
3. **Follow Architecture Guidelines**: @docs/architecture/

### Development Commands

- **Run Project**: `pnpm dev:kdx`
- **Check Server**: `scripts/check-server-simple.sh`

## 🔍 Context Engineering

### Documentation Navigation

- Prefer specific, contextual references
- Use `@file` syntax for precise linking
- Prioritize concise, focused documentation

### AI Assistant Guidelines

- Context is stored in markdown files
- Prefer `.md` over tool-specific configurations
- Always check `/docs` for the most up-to-date information

## 🛠️ Tools and Integrations

### Recommended UI Components

- Always check Shadcn first: https://ui.shadcn.com/

### Code Quality

- Divide long files/functions
- Reflect on scalability after changes
- Suggest improvements proactively

## 📚 Comprehensive References

- **Project Rules**: @docs/rules/kodix-rules.md
- **PRP Workflow**: @docs/rules/kodix-prp-workflow.md
- **Universal Commands**: @docs/context-engineering/commands/
- **Architecture Map**: @docs/README.md

<!-- AI-RELATED: [README.md, architecture/Architecture_Standards.md] -->
<!-- DEPENDS-ON: [all-documentation] -->
<!-- REQUIRED-BY: [ai-tools, development-workflow] -->
<!-- SEE-ALSO: [context-engineering/README.md] -->
