<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: overview

complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Kodix Documentation Hub

Welcome to the Kodix documentation ecosystem - your central resource for understanding, developing, and maintaining the Kodix platform and its applications.

## 🎯 Quick Navigation

### For Developers

- **[Getting Started](./core/getting-started/)** - Set up your development environment
- \*\*<!-- AI-LINK: type="dependency" importance="high" -->
  <!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
  [Architecture](./architecture/)
  <!-- /AI-CONTEXT-REF -->
  <!-- /AI-LINK -->** - System design and technical standards
- **[Development](./development/)** - Development tools, testing, and workflows
- **[SubApps](./subapps/)** - Feature-specific documentation for modular components

### For Platform Users

- **[Core Platform](./core/)** - Platform overview and API reference
- **[Applications](./applications/)** - Standalone applications (mobile, web)
- **[AI Assistants](./rules-ai/)** - AI-powered development tools

### For DevOps & Infrastructure

- **[Infrastructure](./infrastructure/)** - Deployment, monitoring, and security
- **[UI Design](./ui-design/)** - Design system and component catalog

## 📁 Documentation Structure

### Core Platform (`/core/`)

Central platform documentation including overview, getting started guides, and API references.

### Architecture (`/architecture/`)

Technical standards, design patterns, and architectural decisions that govern the entire Kodix ecosystem.

### Applications (`/applications/`)

**Complete, standalone applications** with independent runtime and infrastructure:

- **Mobile Apps**: Native mobile applications (care-mobile)
- **Web Apps**: Separate web applications with independent deployment

### SubApps (`/subapps/`)

**Modular features** within the main Kodix web platform with shared runtime:

- **[AI Studio](./subapps/ai-studio/)** - AI-powered content and automation tools
- **[Chat](./subapps/chat/)** - Real-time communication features
- **[Calendar](./subapps/calendar/)** - Scheduling and calendar management
- **[Todo](./subapps/todo/)** - Task and project management
- **[Cupom](./subapps/cupom/)** - Coupon and discount management
- **[Kodix Care Web](./subapps/kodix-care-web/)** - Healthcare management interface

### Development (`/development/`)

Development tools and workflows:

- **[Setup](./development/setup/)** - Development environment configuration
- **[Testing](./development/testing/)** - Testing strategies and documentation
- **[Debugging](./development/debugging/)** - Debugging tools and procedures
- **[Linting](./development/linting/)** - Code quality and linting standards
- **[Workflows](./development/workflows/)** - Development processes and CI/CD

### Infrastructure (`/infrastructure/`)

Platform infrastructure and operations:

- **[Database](./infrastructure/database/)** - Database management and schemas
- **[Deployment](./infrastructure/deployment/)** - Deployment procedures and environments
- **[Monitoring](./infrastructure/monitoring/)** - System monitoring and observability
- **[Security](./infrastructure/security/)** - Security policies and procedures

### AI Assistants (`/rules-ai/`)

AI-powered development tools and context engineering for enhanced productivity.

### Documentation Standards (`/documentation-standards/`)

**Central standards and guidelines** for creating, maintaining, and evolving documentation:

- **[Writing Rules](./documentation-standards/writing-rules.md)** - Content style and format standards
- **[Folder Structure](./documentation-standards/folder-structure.md)** - Directory organization guidelines
- **[AI Assistant Compatibility](./documentation-standards/ai-assistant-compatibility.md)** - Cross-AI optimization standards
- **[Architecture Documentation](./documentation-standards/core-architecture-docs.md)** - Technical documentation patterns
- **[How to Update Documentation](./documentation-standards/how-to-update-docs.md)** - Maintenance workflows
- **[Script Standards](./documentation-standards/scripts.md)** - Documentation automation and tooling standards

### Context Engineering (`/context-engineering/`)

Advanced documentation strategies and AI-first development methodologies.

### UI Design (`/ui-design/`)

Design system, component catalog, and UI/UX guidelines.

## 🚀 Getting Started

### New Developers

1. Start with **[Core Platform Overview](./core/platform-overview/)**
2. Follow **[Development Setup](./development/setup/)**
3. Review \*\*<!-- AI-LINK: type="dependency" importance="high" -->
   <!-- AI-LINK: type="dependency" importance="high" -->
   <!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
   <!-- AI-CONTEXT-REF: importance="high" type="standards" -->
   [Architecture Standards](./architecture/standards/architecture-standards.md)
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-LINK -->
   <!-- /AI-LINK -->**
4. Explore relevant **[SubApp Documentation](./subapps/)**

### New Contributors

1. Read \*\*<!-- AI-LINK: type="dependency" importance="high" -->
   <!-- AI-LINK: type="dependency" importance="high" -->
   <!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
   <!-- AI-CONTEXT-REF: importance="high" type="standards" -->
   [Architecture Standards](./architecture/standards/architecture-standards.md)
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-LINK -->
   <!-- /AI-LINK -->**
2. Review **[Development Workflows](./development/workflows/)**
3. Understand \*\*<!-- AI-LINK: type="related" importance="medium" -->
   <!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
   [Testing Guidelines](./development/testing/)
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-LINK -->**
4. Follow \*\*<!-- AI-LINK: type="dependency" importance="high" -->
   <!-- AI-CONTEXT-REF: importance="high" type="standards" -->
   [Code Quality Standards](./development/linting/)
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-LINK -->**

### DevOps Engineers

1. Review **[Infrastructure Overview](./infrastructure/)**
2. Study **[Deployment Procedures](./infrastructure/deployment/)**
3. Configure **[Monitoring](./infrastructure/monitoring/)**
4. Implement \*\*<!-- AI-LINK: type="dependency" importance="high" -->
   <!-- AI-CONTEXT-REF: importance="high" type="standards" -->
   [Security Standards](./infrastructure/security/)
   <!-- /AI-CONTEXT-REF -->
   <!-- /AI-LINK -->**

## 🎯 Apps vs SubApps

### Applications

- **Definition**: Complete, standalone applications
- **Characteristics**: Independent deployment, separate repositories/packages
- **Examples**: Mobile apps, separate web applications
- **Location**: `/docs/applications/`

### SubApps

- **Definition**: Modular features within main Kodix platform
- **Characteristics**: Shared runtime, integrated within main web app
- **Examples**: AI Studio, Chat, Calendar, Todo
- **Location**: `/docs/subapps/`

## 📋 Documentation Standards

### Naming Conventions

- **Files**: kebab-case (e.g., `architecture-standards.md`)
- **Folders**: kebab-case (e.g., `ai-studio/`, `getting-started/`)
- **Language**: English for technical documentation

### File Structure

- Every directory must have a `README.md` file
- Use progressive disclosure (overview → details)
- Include clear cross-references and navigation
- Follow established semantic markers for AI comprehension

### Maintenance

- Keep documentation current with code changes
- Review and update quarterly
- Use version control for all changes
- Follow ownership boundaries by team

## 🔗 Key Resources

- \*\*<!-- AI-LINK: type="dependency" importance="high" -->
  <!-- AI-LINK: type="dependency" importance="high" -->
  <!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
  <!-- AI-CONTEXT-REF: importance="high" type="standards" -->
  [Architecture Standards](./architecture/standards/architecture-standards.md)
  <!-- /AI-CONTEXT-REF -->
  <!-- /AI-CONTEXT-REF -->
  <!-- /AI-LINK -->
  <!-- /AI-LINK -->** - Technical foundation
- **[Universal AI Rules](./rules-ai/rules/universal-ai-rules.md)** - AI assistant guidelines
- **[Context Engineering](./context-engineering/)** - Advanced documentation strategies
- **[Development Setup](./development/setup/)** - Getting your environment ready

## 📞 Support & Contribution

- **Issues**: Report documentation issues through the project's issue tracker
- **Contributions**: Follow the development workflow for documentation updates
- **Questions**: Reach out to the respective team owners for each section

---

**Last Updated**: 2025-07-12  
**Maintained By**: Kodix Documentation Team  
**Structure Version**: 2.0 (Phase 1 Complete)
