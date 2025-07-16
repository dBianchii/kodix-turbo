<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
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

# Development Setup Guide

Este guia detalha como configurar o ambiente de desenvolvimento para o projeto Kodix.

> **🚨 ATENÇÃO**: O projeto usa **Docker** para serviços locais (MySQL, Redis). **SEMPRE inicie os serviços Docker antes** de trabalhar no projeto para evitar erros de conexão e perda de tempo em debug.

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

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
nvm use
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**pnpm**: Package manager

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
npm i -g pnpm
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Docker**: Para desenvolvimento local

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar se Docker está instalado
docker --version
docker-compose --version
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🐳 Docker para Desenvolvimento Local

> **💡 IMPORTANTE**: O projeto Kodix usa **Docker** para serviços de desenvolvimento local (MySQL, Redis, etc.). Isto simplifica o setup e evita problemas de configuração.

> **⚠️ CARACTERÍSTICA DO PROJETO**: No Kodix, Docker e servidor Next.js são **executados coordenadamente**. Quando você roda `pnpm dev:kdx`, ambos iniciam juntos e param juntos automaticamente.

### **🔄 Como o Sistema Funciona**

O comando `pnpm dev:kdx` executa **simultaneamente**:

- **Servidor Next.js** (`@kdx/kdx`)
- **Serviços Docker** (`@kdx/db-dev`)

**Por isso que o Docker "só roda quando o servidor roda"** - eles são coordenados pelo Turbo!

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Este comando inicia AMBOS automaticamente
pnpm dev:kdx
# ↳ Inicia: Next.js + MySQL + Redis

# Quando você para (Ctrl+C), AMBOS param automaticamente
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **📋 Opções de Execução**

#### **1. Modo Coordenado (Recomendado para desenvolvimento)**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Inicia servidor + Docker juntos
pnpm dev:kdx
# ✅ Tudo sincronizado automaticamente
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **2. Modo Independente (Para debug específico)**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Opção A: Só Docker
cd packages/db-dev
docker-compose up -d

# Opção B: Só servidor (depois do Docker)
pnpm dev:kdx
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Serviços Docker Disponíveis

O projeto inclui configurações Docker em `packages/db-dev/docker-compose.yml`:

- **MySQL 8.0** - Banco principal na porta `3306`
- **Redis** - Cache (se configurado)
- **Outros serviços** conforme necessário

### Iniciando Serviços Docker

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Iniciar todos os serviços de desenvolvimento
cd packages/db-dev
docker-compose up -d

# Verificar se os serviços estão rodando
docker-compose ps

# Ver logs dos serviços (se necessário)
docker-compose logs mysql
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Verificação Rápida

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar se MySQL está acessível
mysql -h localhost -u root -ppassword -e "SHOW DATABASES;"

# Ou verificar conexão via script
./scripts/check-server-simple.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Parar Serviços Docker

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Parar serviços (preserva dados)
cd packages/db-dev
docker-compose stop

# Parar e remover containers (limpa tudo)
docker-compose down

# Remover volumes também (CUIDADO: apaga dados!)
docker-compose down -v
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 ⚠️ Troubleshooting Docker

### Problemas Comuns

**Error: "MySQL connection refused"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# 1. Verificar se Docker está rodando
docker ps

# 2. Iniciar serviços se não estiverem rodando
cd packages/db-dev && docker-compose up -d

# 3. Aguardar MySQL inicializar (pode levar alguns segundos)
docker-compose logs mysql | grep "ready for connections"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Error: "Port 3306 already in use"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar que está usando MySQL local em vez do Docker
brew services stop mysql  # macOS
sudo systemctl stop mysql # Linux

# Ou configurar porta diferente no docker-compose.yml
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Error: "Database 'kodix' doesn't exist"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Aplicar schema após Docker iniciar
pnpm db:push
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

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

3. **Start Docker services**

   ```bash
   # Iniciar MySQL e outros serviços via Docker
   cd packages/db-dev
   docker-compose up -d
   cd ../..
   ```

4. **Setup database**

   ```bash
   pnpm db:push    # Apply schema
   pnpm db:seed    # Add sample data
   ```

5. **Start main application**

   ```bash
   pnpm dev:kdx
   ```

### Essential Commands

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# 🐳 Docker Services (IMPORTANTE: Executar primeiro!)
cd packages/db-dev
docker-compose up -d         # Start all services
docker-compose ps            # Check service status
docker-compose logs mysql    # View MySQL logs
docker-compose stop          # Stop services
docker-compose down          # Stop and remove containers

# 🚀 Development
pnpm dev:kdx        # Start web app
pnpm dev:care       # Start mobile app
pnpm db:studio      # Database visual interface

# 🗄️ Database
pnpm db:push        # Apply schema changes
pnpm db:seed        # Populate with test data

# 🧹 Maintenance
pnpm lint:fix       # Fix linting issues
pnpm format:fix     # Format code
pnpm typecheck      # Check types
pnpm check:trpc     # Check tRPC patterns

# ⚡ Tools
pnpm trpc:new       # Generate new tRPC endpoint
pnpm turbo gen init # Create new @kdx package
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

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

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Enable query logging
pnpm db:studio
# Use Drizzle's built-in logging in development
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🏃‍♂️ Quick Development Workflow

### Creating a New Feature

1. **Check coding standards**: `./../../development/standards/coding-standards.md`
2. **Follow implementation guides**: <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> or <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Guide](../../architecture/frontend/../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
3. **Test your changes**: `pnpm test`

### Working with the Monorepo

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Work on specific package
pnpm --filter @kdx/ui build
pnpm --filter @kdx/api dev

# Run commands across all packages
pnpm build --filter="@kdx/*"

# Lint specific package
pnpm eslint apps/kdx/
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 🔍 Troubleshooting

### Common Issues

**Error: "Module not found"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Clear node_modules and reinstall
pnpm clean:workspaces
pnpm i
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Error: "Port already in use"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Error: "Database connection failed"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# 1. PRIMEIRO: Verificar se serviços Docker estão rodando
cd packages/db-dev && docker-compose ps

# 2. Se não estiverem rodando, iniciar:
docker-compose up -d

# 3. Aguardar MySQL estar pronto
docker-compose logs mysql | tail -20

# 4. Verificar variáveis de ambiente
grep MYSQL_URL .env

# 5. Testar conexão direta
mysql -h localhost -u root -ppassword -e "SHOW DATABASES;"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Error: "tRPC procedure not found"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Regenerate tRPC types
pnpm dev:kdx
# Check router exports
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Performance Issues

**Slow development server**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm dev:kdx
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Slow TypeScript checking**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Use project references
pnpm typecheck --build
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Reset Completo (Last Resort)

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ⚠️ CUIDADO: Reset completo do ambiente de desenvolvimento

# 1. Parar serviços Docker
cd packages/db-dev
docker-compose down -v  # Remove containers E volumes (apaga dados!)

# 2. Limpar dependências
cd ../..
pnpm clean:workspaces
rm -rf node_modules
rm pnpm-lock.yaml

# 3. Reinstalar dependências
pnpm i

# 4. Reiniciar Docker e banco
cd packages/db-dev
docker-compose up -d
cd ../..

# 5. Aguardar MySQL estar pronto
sleep 10

# 6. Aplicar schema e seed
pnpm db:push
pnpm db:seed

# 7. Verificar se tudo está funcionando
pnpm dev:kdx
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📚 Próximos Passos

Depois do setup inicial:

- **Development Workflow**: Consulte [`./../../development/setup/workflows.md`](./../../development/setup/workflows.md) para Git e CI/CD
- **Backend Development**: Use <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> para APIs e repositórios
- **Frontend Development**: Consulte <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Guide](../../architecture/frontend/../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> para componentes e UI
- **Creating SubApps**: Follow <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[`./../../../architecture/subapps/subapp-architecture.md`](./../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> for new modules
- **Coding Standards**: Review <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[`./../../development/standards/coding-standards.md`](./../../development/standards/coding-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> for conventions

---

\_For project context and business concepts, see `
