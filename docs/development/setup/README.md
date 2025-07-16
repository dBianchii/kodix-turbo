<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Development Setup

This section contains documentation for setting up and configuring the development environment for the Kodix platform.

## 🚀 📁 Setup Documentation

### [Development Setup](./../../development/setup/../../development/setup/development-setup.md)
Comprehensive guide for setting up local development environment.

### [Scripts Reference](./scripts-reference.md)
Complete reference of available scripts and commands in the project.

## 🎯 Quick Start

### For New Developers
1. **Prerequisites**: Ensure you have Node.js 22, Docker, and pnpm installed
2. **Clone Repository**: Get the latest codebase from the repository
3. **Environment Setup**: Follow the development setup guide
4. **Run Development**: Use `pnpm dev:kdx` to start the development server

### Essential Commands
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Install dependencies
pnpm install

# Start development server
pnpm dev:kdx

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Development Environment

### Required Tools
- **Node.js 22**: Latest LTS version
- **pnpm**: Package manager for monorepo
- **Docker**: For database and services
- **Git**: Version control

### IDE Setup
- **VS Code**: Recommended with TypeScript and ESLint extensions
- **TypeScript**: Configured for strict mode
- **ESLint**: Code quality and consistency

## 🐳 Docker Environment

### Local Services
- **MySQL**: Primary database
- **Redis**: Caching and sessions
- **Development Server**: Next.js with hot reload

### Docker Commands
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Development Workflow

### Daily Development
1. **Pull Latest**: `git pull origin main`
2. **Install Dependencies**: `pnpm install`
3. **Start Development**: `pnpm dev:kdx`
4. **Make Changes**: Follow coding standards
5. **Test Changes**: Run tests and type checking
6. **Commit**: Use conventional commit messages

### Quality Checks
- **Type Safety**: All code must pass TypeScript strict mode
- **Linting**: ESLint rules must be satisfied
- **Testing**: Tests must pass for all changes
- **Code Review**: All changes require review

---

**Maintained By**: Platform Development Team  
**Last Updated**: 2025-07-12  
**Review Cycle**: Monthly
