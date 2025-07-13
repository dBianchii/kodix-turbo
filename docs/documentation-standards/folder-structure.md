<!-- AI-METADATA:
category: standards
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Kodix Documentation Folder Structure Standards

> Official standards for organizing and structuring documentation directories in the Kodix platform

## 🎯 Purpose

Define the canonical folder structure for Kodix documentation, ensuring consistency, discoverability, and optimal AI assistant performance across all documentation sections.

## 📁 Root Level Organization

### Canonical Structure
```
/docs/
├── README.md                           # Central documentation hub
├── /core/                              # Core Kodix platform docs
│   ├── README.md
│   ├── /platform-overview/
│   ├── /getting-started/
│   └── /api-reference/
├── /architecture/                      # Technical architecture
│   ├── README.md
│   ├── /standards/                     # Architectural standards
│   ├── /backend/                       # Backend architecture
│   ├── /frontend/                      # Frontend architecture
│   ├── /platform/                      # Platform architecture
│   ├── /infrastructure/                # Infrastructure patterns
│   ├── /subapps/                       # SubApp architecture
│   └── /decisions/                     # Architecture Decision Records
├── /applications/                      # Standalone applications
│   ├── README.md
│   ├── /mobile-apps/                   # Mobile applications
│   │   ├── README.md
│   │   └── /care-mobile/
│   └── /web-apps/                      # Web applications
│       ├── README.md
│       └── /kodix-web/
├── /subapps/                          # Modular platform features
│   ├── README.md
│   ├── /ai-studio/                    # AI Studio SubApp
│   ├── /chat/                         # Chat SubApp
│   ├── /calendar/                     # Calendar SubApp
│   ├── /todo/                         # Todo SubApp
│   ├── /cupom/                        # Cupom SubApp
│   └── /kodix-care-web/               # KodixCare Web SubApp
├── /development/                      # Development resources
│   ├── README.md
│   ├── /setup/                        # Development setup
│   ├── /testing/                      # Testing strategies
│   ├── /debugging/                    # Debugging guides
│   ├── /linting/                      # Code quality tools
│   └── /workflows/                    # Development workflows
├── /infrastructure/                   # Infrastructure documentation
│   ├── README.md
│   ├── /database/                     # Database setup and patterns
│   ├── /deployment/                   # Deployment guides
│   ├── /monitoring/                   # Monitoring and observability
│   └── /security/                     # Security guidelines
├── /ui-design/                        # Design system
│   ├── README.md
│   └── [design system documentation]
├── /context-engineering/              # AI context optimization
│   ├── README.md
│   └── [AI-specific documentation]
├── /ai-assistants/                    # AI development tools
│   ├── README.md
│   └── [AI assistant guides]
├── /documentation-standards/          # Documentation standards (this directory)
│   ├── README.md
│   └── [documentation guidelines]
├── /scripts/                          # Documentation automation
│   ├── README.md
│   └── [validation and maintenance scripts]
└── /legacy/                           # Archived documentation
    ├── README.md
    └── [deprecated docs]
```

## 🏗️ Directory Purpose & Definitions

### Core Platform (`/core/`)
**Purpose**: Central platform documentation including overview, getting started guides, and API references
**Content**: Platform services, core APIs, fundamental concepts
**Audience**: All platform users and developers

### Architecture (`/architecture/`)
**Purpose**: Technical architecture and design documentation
**Content**: System design, patterns, standards, ADRs
**Audience**: Architects, senior developers, technical decision-makers

### Applications vs SubApps

#### Applications (`/applications/`)
- **Definition**: Complete, standalone applications with their own runtime and infrastructure
- **Examples**: Mobile apps (care-mobile), separate web applications
- **Characteristics**: Independent deployment, separate repositories/packages
- **Structure**: Organized by platform (mobile-apps, web-apps)

#### SubApps (`/subapps/`)
- **Definition**: Modular features within the main Kodix web platform
- **Examples**: AI Studio, Chat, Calendar, Todo, Cupom, KodixCare Web
- **Characteristics**: Shared runtime, integrated within main web app, interdependent
- **Structure**: Each SubApp has its own directory with standardized internal structure

### Development (`/development/`)
**Purpose**: Development tools, processes, and workflow documentation
**Content**: Setup guides, testing strategies, debugging tools, code quality
**Audience**: Developers, DevOps engineers

### Infrastructure (`/infrastructure/`)
**Purpose**: Infrastructure setup, deployment, and operations
**Content**: Database setup, deployment guides, monitoring, security
**Audience**: DevOps engineers, platform operators

## 📋 Naming Conventions

### File & Directory Naming
- **Format**: kebab-case only
- **Examples**: 
  - ✅ `user-management.md`
  - ✅ `api-reference.md`
  - ❌ `UserManagement.md`
  - ❌ `API_Reference.md`

### Language Standards
- **Primary Language**: English for all technical documentation
- **File Names**: English only
- **Headers**: English preferred, Portuguese acceptable for user-facing features
- **Code Comments**: English only

### Directory Structure Rules
- **Maximum Depth**: 4 levels recommended
- **README Files**: Required in every directory
- **Consistent Categorization**: Follow established patterns

## 🔧 SubApp Documentation Structure

### Standard SubApp Organization
```
/docs/subapps/{subapp-name}/
├── README.md                    # Overview and introduction
├── /backend/                    # Backend implementation
│   ├── README.md               # Backend architecture overview
│   ├── api-reference.md        # API endpoints documentation
│   ├── database-schema.md      # Database design
│   └── business-logic.md       # Core business rules
├── /frontend/                   # Frontend implementation
│   ├── README.md               # Frontend architecture overview
│   ├── components.md           # Component documentation
│   ├── routing.md              # Route structure
│   └── state-management.md     # State management patterns
└── /prp/                        # Planning and requirements
    ├── README.md               # Planning overview
    ├── requirements.md         # Feature requirements
    └── implementation-plan.md   # Future enhancements
```

### SubApp README Template
```markdown
# {SubApp Name}

> Brief description of SubApp functionality

## 🎯 Purpose
[What this SubApp does and why it exists]

## 🏗️ Architecture
- **Backend**: [Backend patterns and APIs]
- **Frontend**: [Frontend implementation approach]
- **Integration**: [How it integrates with other SubApps]

## 📖 Documentation Sections
- [Backend Documentation](./backend/) - API and business logic
- [Frontend Documentation](./frontend/) - UI components and patterns
- [Planning Documents](./prp/) - Requirements and future plans

## 🚀 Quick Start
[Getting started guide for developers]

## 🔗 Related SubApps
[Links to related/dependent SubApps]
```

## 🚨 Quality Requirements

### Mandatory Elements
- **README.md**: Every directory must have a README
- **Consistent Structure**: Follow established patterns
- **Cross-References**: Proper linking between related documents
- **AI Metadata**: Include AI-METADATA headers for AI optimization

### Validation Rules
- **Zero Broken Links**: All internal links must be valid
- **Naming Consistency**: Follow kebab-case convention
- **Content Standards**: Meet quality and completeness requirements
- **AI Compatibility**: Include proper semantic markup

## 🔄 Migration Guidelines

### Moving Files
1. **Update References**: Update all cross-references before moving
2. **Maintain History**: Preserve git history when possible
3. **Create Redirects**: Document moved files in legacy section if needed
4. **Validate Links**: Run link validation after moves

### Adding New Sections
1. **Follow Patterns**: Use established directory structures
2. **Create README**: Always include comprehensive README
3. **Update Navigation**: Update parent README files
4. **Validate Structure**: Ensure consistency with standards

## 🤖 AI Assistant Optimization

### Directory Structure Benefits
- **Predictable Navigation**: AI assistants can navigate efficiently
- **Consistent Patterns**: Enables pattern recognition and automation
- **Clear Categorization**: Improves content discovery and context
- **Semantic Organization**: Enhances AI understanding of relationships

### Implementation Notes
- Use semantic directory names that convey purpose
- Maintain consistent depth for similar content types
- Include comprehensive cross-referencing
- Follow AI-first markup standards

## 🔗 Related Standards

- [Writing Rules](./writing-rules.md) - Content style and format guidelines
- [AI Assistant Compatibility](./ai-assistant-compatibility.md) - AI optimization standards
- [How to Update Documentation](./how-to-update-docs.md) - Maintenance processes

---

**Last Updated**: 2025-01-12  
**Version**: 1.0 (Standardized from Phase 1-4 implementation)

<!-- AI-CONTEXT-BOUNDARY: end -->