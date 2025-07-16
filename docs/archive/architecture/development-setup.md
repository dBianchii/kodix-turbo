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

```bash
nvm use
```

**pnpm**: Package manager

```bash
npm i -g pnpm
```

**Docker**: Para desenvolvimento local

```bash
# Verificar se Docker está instalado
docker --version
docker-compose --version
```

## 🐳 Docker para Desenvolvimento Local

> **💡 IMPORTANTE**: O projeto Kodix usa **Docker** para serviços de desenvolvimento local (MySQL, Redis, etc.). Isto simplifica o setup e evita problemas de configuração.

> **⚠️ CARACTERÍSTICA DO PROJETO**: No Kodix, Docker e servidor Next.js são **executados coordenadamente**. Quando você roda `pnpm dev:kdx`, ambos iniciam juntos e param juntos automaticamente.

### **🔄 Como o Sistema Funciona**

O comando `pnpm dev:kdx` executa **simultaneamente**:

- **Servidor Next.js** (`@kdx/kdx`)
- **Serviços Docker** (`@kdx/db-dev`)

**Por isso que o Docker "só roda quando o servidor roda"** - eles são coordenados pelo Turbo!

```bash
# Este comando inicia AMBOS automaticamente
pnpm dev:kdx
# ↳ Inicia: Next.js + MySQL + Redis

# Quando você para (Ctrl+C), AMBOS param automaticamente
```

### **📋 Opções de Execução**

#### **1. Modo Coordenado (Recomendado para desenvolvimento)**

```bash
# Inicia servidor + Docker juntos
pnpm dev:kdx
# ✅ Tudo sincronizado automaticamente
```

#### **2. Modo Independente (Para debug específico)**

```bash
# Opção A: Só Docker
cd packages/db-dev
docker-compose up -d

# Opção B: Só servidor (depois do Docker)
pnpm dev:kdx
```

### Serviços Docker Disponíveis

O projeto inclui configurações Docker em `packages/db-dev/docker-compose.yml`:

- **MySQL 8.0** - Banco principal na porta `3306`
- **Redis** - Cache (se configurado)
- **Outros serviços** conforme necessário

### Iniciando Serviços Docker

```bash
# Iniciar todos os serviços de desenvolvimento
cd packages/db-dev
docker-compose up -d

# Verificar se os serviços estão rodando
docker-compose ps

# Ver logs dos serviços (se necessário)
docker-compose logs mysql
```

### Verificação Rápida

```bash
# Verificar se MySQL está acessível
mysql -h localhost -u root -ppassword -e "SHOW DATABASES;"

# Ou verificar conexão via script
./scripts/check-server-simple.sh
```

### Parar Serviços Docker

```bash
# Parar serviços (preserva dados)
cd packages/db-dev
docker-compose stop

# Parar e remover containers (limpa tudo)
docker-compose down

# Remover volumes também (CUIDADO: apaga dados!)
docker-compose down -v
```

## ⚠️ Troubleshooting Docker

### Problemas Comuns

**Error: "MySQL connection refused"**

```bash
# 1. Verificar se Docker está rodando
docker ps

# 2. Iniciar serviços se não estiverem rodando
cd packages/db-dev && docker-compose up -d

# 3. Aguardar MySQL inicializar (pode levar alguns segundos)
docker-compose logs mysql | grep "ready for connections"
```

**Error: "Port 3306 already in use"**

```bash
# Verificar que está usando MySQL local em vez do Docker
brew services stop mysql  # macOS
sudo systemctl stop mysql # Linux

# Ou configurar porta diferente no docker-compose.yml
```

**Error: "Database 'kodix' doesn't exist"**

```bash
# Aplicar schema após Docker iniciar
pnpm db:push
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

```bash
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

1. **Check coding standards**: `./coding-standards.md`
2. **Follow implementation guides**: `./backend-guide.md` or `./frontend-guide.md`
3. **Test your changes**: `pnpm test`

### Working with the Monorepo

```bash
# Work on specific package
pnpm --filter @kdx/ui build
pnpm --filter @kdx/api dev

# Run commands across all packages
pnpm build --filter="@kdx/*"

# Lint specific package
pnpm eslint apps/kdx/
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

### Reset Completo (Last Resort)

```bash
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

## 📚 Próximos Passos

Depois do setup inicial:

- **Development Workflow**: Consulte [`./workflows.md`](./workflows.md) para Git e CI/CD
- **Backend Development**: Use [`./backend-guide.md`](./backend-guide.md) para APIs e repositórios
- **Frontend Development**: Consulte [`./frontend-guide.md`](./frontend-guide.md) para componentes e UI
- **Creating SubApps**: Follow [`./subapp-architecture.md`](./subapp-architecture.md) for new modules
- **Coding Standards**: Review [`./coding-standards.md`](./coding-standards.md) for conventions

---

\_For project context and business concepts, see `
