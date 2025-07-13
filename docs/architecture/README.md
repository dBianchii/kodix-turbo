<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Architecture Documentation

## 🔍 📖 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
This section contains **technical guides** and **development standards** for the Kodix project, organized into specialized areas for comprehensive coverage of platform architecture.

> 🎯 **SINGLE SOURCE OF TRUTH**: For official architectural standards, consult **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](./standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->** - consolidated document with all project standards.

## 🏗️ 🏗️ Architecture Sections

### **📋 <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Standards](./standards/)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->**
Consolidated standards that govern technical architecture, coding practices, and quality requirements.
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](./standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->** - Core architectural principles and patterns
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Coding Standards](./standards/../../development/standards/../../development/standards/coding-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Code quality requirements and style guidelines

### **🌐 [Platform](./platform/)**
High-level platform architecture documentation and system design.
- **[Configuration Model](./platform/configuration-model.md)** - Platform configuration architecture
- **[Internationalization (i18n)](./platform/internationalization-i18n.md)** - Multi-language support patterns

### **⚙️ [Backend](./backend/)**
Comprehensive backend architecture with API design and data management.
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](./backend/../../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Backend development with tRPC and Drizzle
- **[Service Layer Patterns](./backend/service-layer-patterns.md)** - Service architecture patterns
- **[Data Contracts & Boundaries](./backend/data-contracts-and-boundaries.md)** - Type-safety protocols
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[tRPC Migration Guide](./backend/trpc-migration-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - tRPC v11 migration patterns
- **[tRPC Patterns](./backend/trpc-patterns.md)** - tRPC best practices

### **🎨 [Frontend](./frontend/)**
Frontend architecture with React patterns and Next.js implementation.
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Guide](./frontend/../../../architecture/frontend/../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Frontend development with Next.js and React

### **🧩 [SubApps](./subapps/)**
SubApp architecture patterns and modular development guidelines.
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture](./subapps/../../../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - **🚨 SINGLE SOURCE OF TRUTH**
- **[SubApp Inter-Dependencies](./subapps/subapp-inter-dependencies.md)** - Communication patterns
- **[SubApp Configurations System](./subapps/subapp-configurations-system.md)** - Configuration management
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[SubApp Documentation Guide](./subapps/subapp-documentation-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Documentation standards

### **🚀 [Infrastructure](./infrastructure/)**
Infrastructure architecture, deployment patterns, and system operations.

### **📋 [Decisions](./decisions/)**
Architecture Decision Records (ADRs) and historical decision documentation.
- **[Lessons Learned](./decisions/lessons-learned.md)** - Historical lessons and experiences

## 🚀 Workflows by Objective

### **For New Developers**

1. **REQUIRED**: Read <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](./standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->
2. **REQUIRED**: Read <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture](./subapps/../../../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> if working with SubApps
3. Follow [Development Setup](../../development/setup/) for environment configuration
4. Review <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Coding Standards](./standards/../../development/standards/../../development/standards/coding-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> for code patterns

### **For Creating New Features**

1. **REQUIRED**: Read <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture](./subapps/../../../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> if involving SubApps
2. Use <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](./backend/../../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> for APIs and Database
3. Use <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Guide](./frontend/../../../architecture/frontend/../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> for interfaces
4. Follow [Configuration Model](./platform/configuration-model.md) for settings

### **For Database Work**

1. Review database schema patterns in <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](./backend/../../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
2. Follow [Data Contracts & Boundaries](./backend/data-contracts-and-boundaries.md) for type safety
3. Use [tRPC Patterns](./backend/trpc-patterns.md) for API design

### **For Environment Setup**

1. Follow [Development Setup](../../development/setup/) procedures
2. Review [Infrastructure](./infrastructure/) for deployment patterns

## 📋 Quick Reference

| Objective                    | Document                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------- |
| **Environment setup**       | [Development Setup](../../development/setup/) |
| **Work with SubApps**       | <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture](./subapps/../../../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> **🚨 CRITICAL** |
| **Document SubApps**        | <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[SubApp Documentation Guide](./subapps/subapp-documentation-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> **📚 CONSOLIDATED!** |
| **Backend development**     | <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](./backend/../../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> |
| **Frontend development**    | <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Guide](./frontend/../../../architecture/frontend/../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> |
| **Code standards**          | <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Coding Standards](./standards/../../development/standards/../../development/standards/coding-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> |
| **Debug system**            | <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Debug & Logging Standards](../../development/debugging/)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> 🔍 **EASY FILTERING!** |
| **Translation setup**       | [Internationalization](./platform/internationalization-i18n.md) |
| **View available scripts**  | [Scripts Reference](../../development/setup/) |
| **Data contracts**          | [Data Contracts & Boundaries](./backend/data-contracts-and-boundaries.md) **🏛️ CONSTITUTIONAL** |
| **Lint & Type-Checking**    | [Linting & Type-Checking](../../development/linting/) **📜 MANDATORY** |

---

## ⚠️ **Important**

- **SubApp Architecture** is the **single source of truth** for everything related to SubApps
- **Always consult** the documentation before implementing new features
- **Keep** documentation updated when making significant changes

---

**Maintained By**: Architecture Team  
**Last Updated**: 2025-07-12  
**Structure Version**: 2.0 (Phase 2 Complete)
