<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Architecture Standards

Consolidated standards that govern the technical architecture, coding practices, quality requirements, and naming conventions for the Kodix platform.

## 📁 Standards Documentation

### <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](./architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK --> ⭐
**Core architectural principles and patterns** - The foundation for all technical decisions and system design.

### <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Quality Standards](./quality-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> ⭐
**Testing, linting, and code review standards** - Comprehensive quality assurance requirements including tRPC patterns and ESLint rules.

### [Naming Conventions](./naming-conventions.md) ⭐
**Consistent naming across all code elements** - File names, functions, types, database schemas, and CSS classes.

### Legacy Documents
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Coding Standards](./coding-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Previous coding standards (Portuguese)
- **[ESLint Rules](../../development/linting/kodix-eslint-coding-rules.md)** - Detailed ESLint configuration (Portuguese)

## 🔍 🎯 Standards Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
### Architectural Principles
- **Modularity**: SubApp-based architecture for feature isolation
- **Type Safety**: 100% TypeScript coverage with strict typing
- **Consistency**: Unified patterns across frontend and backend
- **Performance**: Optimized for scale and user experience

### Code Quality Requirements
- Zero tolerance for `any` types
- Comprehensive testing coverage
- ESLint compliance with Kodix rules
- Documentation for all public APIs

### Quality Gates
- All code must pass TypeScript compilation
- ESLint rules must be satisfied
- Tests must pass before deployment
- Code review approval required

## 🚀 Implementation

### For New Projects
1. Review <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](./architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->
2. Follow <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Coding Standards](./coding-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
3. Implement required tooling and validation
4. Establish quality gates in CI/CD

### For Existing Projects
1. Audit current compliance with standards
2. Create improvement plan for gaps
3. Implement standards incrementally
4. Update documentation and tooling

---

**Maintained By**: Architecture Standards Team  
**Last Updated**: 2025-07-12  
**Review Cycle**: Quarterly
