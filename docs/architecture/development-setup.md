# Development Setup Guide

Este guia detalha como configurar o ambiente de desenvolvimento para o projeto Kodix.

## 🏗️ Technology Stack

### Frontend

- **React 19** - UI library
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component system
- **Tamagui** - React Native UI
- **React Hook Form** - Form management
- **Framer Motion** - Animations
- **next-intl** - Internationalization

### Backend

- **tRPC v11** - Type-safe APIs
- **oslo** - Authentication system (formerly lucia-auth)
- **Drizzle ORM** - Database ORM
- **MySQL** - Primary database
- **Vercel AI SDK** - LLM integrations

### Mobile

- **Expo** - React Native framework
- **React Native** - Cross-platform mobile development
- **Expo Router** - Navigation system
- **Tamagui** - Mobile component system

### Infrastructure

- **Turbo** - Monorepo build system
- **PNPM** - Package manager
- **Vercel** - Deployment platform
- **Docker** - Containerization (development)
- **GitHub Actions** - CI/CD

## 🚀 Getting Started

### Prerequisites

**Node.js**: Use the version specified in `.nvmrc`

```bash
nvm use
```

**pnpm**: Package manager

```bash
npm i -g pnpm
```

### Environment Setup

1. **Install dependencies**

   ```bash
   pnpm i
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start main application**

   ```bash
   pnpm dev:kdx
   ```

4. **Setup database**
   ```bash
   pnpm db:push    # Apply schema
   pnpm db:seed    # Add sample data
   ```

### Essential Commands

```bash
# 🚀 Development
pnpm dev:kdx        # Start web app
pnpm dev:care       # Start mobile app
pnpm db:studio      # Database visual interface

# 🧹 Maintenance
pnpm lint:fix       # Fix linting issues
pnpm format:fix     # Format code
pnpm typecheck      # Check types

# ⚡ Tools
pnpm trpc:new       # Generate new tRPC endpoint
pnpm ui:add         # Add shadcn component
pnpm turbo gen init # Create new @kdx package
```

## 🔧 Development Tools Configuration

### VS Code Setup

Recommended extensions:

- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

### Database Tools

- **Drizzle Studio**: `pnpm db:studio` - Visual database management
- **MySQL Workbench**: For advanced database operations
- **TablePlus**: Alternative database client

### Debugging Setup

#### Frontend Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/kdx",
      "runtimeExecutable": "pnpm",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Database Debugging

```bash
# Enable query logging
pnpm db:studio
# Use Drizzle's built-in logging in development
```

## 🏃‍♂️ Quick Development Workflow

### Creating a New Feature

1. **Read project context**: `../project/overview.md`
2. **Check coding standards**: `./coding-standards.md`
3. **Follow implementation guides**: `./backend-guide.md` or `./frontend-guide.md`
4. **Test your changes**: `pnpm test`

### Working with the Monorepo

```bash
# Work on specific package
pnpm --filter @kdx/ui build
pnpm --filter @kdx/api dev

# Run commands across all packages
pnpm build --filter="@kdx/*"
pnpm lint --filter="./apps/*"
```

## 🔍 Troubleshooting

### Common Issues

**Error: "Module not found"**

```bash
# Clear node_modules and reinstall
pnpm clean:workspaces
pnpm i
```

**Error: "Port already in use"**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Error: "Database connection failed"**

```bash
# Check MySQL service
brew services start mysql
# Verify connection string in .env
```

**Error: "tRPC procedure not found"**

```bash
# Regenerate tRPC types
pnpm dev:kdx
# Check router exports
```

### Performance Issues

**Slow development server**

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm dev:kdx
```

**Slow TypeScript checking**

```bash
# Use project references
pnpm typecheck --build
```

## 📚 Próximos Passos

Depois do setup inicial:

- **Development Workflow**: Consulte [`./workflows.md`](./workflows.md) para Git e CI/CD
- **Backend Development**: Use [`./backend-guide.md`](./backend-guide.md) para APIs e repositórios
- **Frontend Development**: Consulte [`./frontend-guide.md`](./frontend-guide.md) para componentes e UI
- **Creating SubApps**: Follow [`./subapp-architecture.md`](./subapp-architecture.md) for new modules
- **Coding Standards**: Review [`./coding-standards.md`](./coding-standards.md) for conventions

---

\_For project context and business concepts, see `
