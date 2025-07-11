# Kodix Project Documentation

<!-- AI-METADATA:
category: reference
stack: general
complexity: basic
dependencies: []
-->

<!-- AI-CONTEXT: Documentation Index -->
<!-- AI-PRIORITY: CRITICAL -->

## 🎯 Quick Summary

Central hub for all Kodix project documentation, providing structured access to technical guides, architecture patterns, and development resources optimized for both human and AI comprehension.

## 📋 Overview

This directory contains all the technical and functional documentation for the Kodix project. The documentation follows **context engineering principles** to ensure optimal understanding by both developers and AI assistants.

### Documentation Philosophy

- **Context-Aware**: Structured for AI tool comprehension
- **Progressive Disclosure**: Information layered from overview to details
- **Cross-Referenced**: Explicit relationships between concepts
- **Stack-Specific**: Tailored to our Next.js/tRPC/Drizzle stack

## 🚨 **CRITICAL - READ FIRST**

<!-- AI-PRIORITY: CRITICAL -->

### ⚠️ SubApp Architecture

**IMPORTANT:** Before working with SubApps, you **must** read:

📖 **[SubApp Architecture](./architecture/subapp-architecture.md)** - **SINGLE SOURCE OF TRUTH**

This document consolidates **all architectural aspects** of SubApps:

- 🏗️ Fundamental **Architecture and Patterns**
- 🔒 **Isolation and Communication** between apps (critical rules)
- ⚙️ **Per-Team Configurations** (AppTeamConfig)
- 🚀 **Creating New SubApps** (complete process)

**Documented critical issues** include solutions for context failures (`teamId`, authentication) that can break functionality between apps.

### ⚠️ NO MOCK DATA POLICY

**CRITICAL:** Do not use mock data in development or production. Always implement real tRPC queries. Explicit authorization is required for any use of mock data.

📖 **Full details:** `docs/rules/kodix-rules.md` - "NO MOCK DATA POLICY" Section

---

## 📋 Documentation Structure

<!-- AI-CONTEXT: Navigation Guide -->

### 🏢 Project and Concepts

- **[Kodix Project](./project/)** - Concepts, vision, goals, and business context of the project

### 📱 Main SubApps

- **[Kodix SubApps](./subapps/)** - Main features of the web application (AI Studio, Chat, Calendar, etc.)
  - **Chat**: AI conversation system ✅ **Recently updated** with token usage badge, auto-focus, and optimized interface

### 📲 Mobile Applications

- **[Kodix Care - Mobile Application](./apps/care-mobile/)** - Documentation for the mobile application (React Native/Expo)

### 🏗️ Architecture and Development

- **[Architecture](./architecture/)** - Development guides, backend/frontend implementation, technical standards
- **[Context Engineering](./context-engineering/)** - 🧠 **NEW!** Guides on how to build and manage AI context.
- **[AI Assistants](./ai-assistants/)** - 🤖 **NEW!** Tool-specific setup for Cursor, Claude Code, Gemini CLI, etc.
- **🚨 [SubApp Architecture](./architecture/subapp-architecture.md)** - **CRITICAL:** Complete SubApp architecture

### 🎨 Components and Design System

- **[Components](./components/)** - Design system, UI components, and component library

### 🗄️ Database

- **[Database](./database/)** - MySQL database documentation, schemas, migrations, and Drizzle ORM

### 📚 References and External Resources

- **[References](./references/)** - Third-party documentation, external APIs, and reference materials

## 🚀 Quick Start

<!-- AI-CONTEXT: Task-Based Navigation -->

1. **New to the project?**
   - Start with the [Project Overview](./project/overview.md)
2. **Developing a feature?**
   - Read the [Development Setup](./architecture/development-setup.md)
   - Use the [Scripts Reference](./architecture/scripts-reference.md) 📋 **NEW!**
   - **🚨 REQUIRED:** [SubApp Architecture](./architecture/subapp-architecture.md) if it involves SubApps
3. **Working on the backend?**
   - Consult the [Backend Guide](./architecture/backend-guide.md)
4. **Working on the frontend?**
   - See the [Frontend Guide](./architecture/frontend-guide.md)
5. **Working with the database?**
   - Start with [Getting Started](./database/getting-started.md) for initial setup
   - Consult [Schema Reference](./database/schema-reference.md) for technical structure
   - Use [Development Workflow](./database/development-workflow.md) for daily workflow
6. **Creating a new SubApp?**
   - Follow the **[SubApp Architecture](./architecture/subapp-architecture.md)** tutorial ("Creating New SubApps" section)
7. **Working with UI/Components?**
   - See the [Design System](./components/)
8. **Working on main features?**
   - See the [SubApps documentation](./subapps/)
9. **Working on the mobile application?**
   - Consult the [Kodix Care documentation](./apps/care-mobile/)

## 📁 Complete Documentation Structure

<!-- AI-CONTEXT: Directory Structure -->

```
docs/
├── README.md                           # This file
├── project/                            # 🏢 Concepts and Business Vision
│   ├── README.md                       # Index of conceptual documentation
│   └── overview.md                     # Overview, goals, and context
├── subapps/                            # 📱 Main SubApps (Core System)
│   ├── README.md                       # SubApps Index
│   ├── ai-studio/                      # 🤖 AI Studio (with all AI documentation)
│   ├── chat/                           # 💬 Chat System ✅ Vercel AI SDK + Optimized UX
│   ├── todo/                           # 📝 Task System
│   ├── calendar/                       # 📅 Calendar System
│   ├── cupom/                          # 🎫 Coupon Management
│   └── kodix-care-web/                 # 🏥 Kodix Care Web
├── architecture/                       # 🏗️ Architecture and Technical Development
│   ├── README.md                       # Index of technical documentation
│   ├── subapp-architecture.md          # 🚨 CRITICAL: Complete SubApp Architecture
│   ├── subapp-inter-dependencies.md    # 🔗 Communication between SubApps (legacy/specific)
│   ├── development-setup.md            # Environment and tools setup
│   ├── coding-standards.md             # Code standards and conventions
│   ├── backend-guide.md                # Backend development
│   ├── frontend-guide.md               # Frontend development
│   └── workflows.md                    # Git, CI/CD, deployment
├── context-engineering/                # 🧠 Context Engineering
│   ├── README.md                       # Guide to building AI context
│   ├── kodix-documentation-upgrade-plan.md  # Strategic upgrade roadmap
│   └── standards/                      # Documentation patterns and guidelines
│       └── documentation-patterns.md   # Core patterns for all docs
├── components/                         # 🎨 Components and Design System
│   ├── README.md                       # Design system index
│   ├── index.md                        # General component index
│   ├── component-examples.md           # Practical component examples
│   └── guia-shadcn-sidebar.md          # Specific Shadcn sidebar guide
├── database/                           # 🗄️ MySQL Database + Drizzle ORM
│   ├── README.md                       # Database documentation index
│   ├── getting-started.md              # MySQL database setup from scratch
│   ├── development-workflow.md         # Daily workflow with branches and schema
│   ├── drizzle-studio.md               # Visual interface for data exploration
│   ├── production-migrations.md        # Safe deployment of changes
│   └── schema-reference.md             # Complete technical schema documentation
├── apps/                               # 📲 Separate Applications
│   └── care-mobile/                    # Mobile application
│       ├── README.md                   # Care documentation index
│       └── funcionalidades-kodix-care.md # Care Features
├── rules/                              # 📐 Priority Policies and Standards
│   ├── PRIORITY-POLICIES.md            # ⚠️ MUST READ FIRST
│   ├── kodix-rules.md                  # Main project rules
│   ├── policies/                       # Detailed priority policies
│   │   ├── code-quality.md             # 🔴 HIGHEST: Zero tolerance for `any`
│   │   ├── debugging-logging.md        # 🔴 HIGHEST: Debug protocols
│   │   ├── development-workflow.md     # 🟠 HIGH: Planning requirements
│   │   ├── monorepo-management.md      # 🟠 HIGH: File edit strategies
│   │   ├── architecture-decisions.md   # 🟡 MEDIUM: ADR requirements
│   │   ├── environment-tools.md        # 🟡 MEDIUM: Dev environment
│   │   └── documentation.md            # 🟢 STANDARD: Doc practices
│   └── README.md                       # Rules documentation hub
└── references/                         # 📚 References and External Resources
    ├── README.md                       # References Index
    └── VercelAI-llms.txt               # Vercel AI LLMs Reference
```

## 🎯 Navigation by Feature

<!-- AI-CONTEXT: Feature-Based Index -->

### For Concepts and Business

- **Product Vision**: `project/overview.md`

<!-- AI-RELATED: [architecture/README.md, subapps/README.md, context-engineering/README.md] -->
<!-- DEPENDS-ON: [] -->
<!-- REQUIRED-BY: [all-documentation] -->
<!-- SEE-ALSO: [docs/rules/kodix-rules.md] -->
