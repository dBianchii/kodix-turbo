# Kodix - Monorepo Principal

## 📖 Sobre o Projeto

Kodix é uma plataforma de gestão de saúde modular e escalável, desenvolvida como monorepo utilizando [Turborepo](https://turborepo.org). Oferece aplicação web, móvel e diversos módulos integrados para digitalização de processos médicos.

**🎯 Para visão completa do projeto**: [`docs/project/overview.md`](docs/project/overview.md)

## 🗂️ Estrutura Simplificada

```text
📁 Raiz do Projeto
├─ 📱 apps/                  # Aplicações
│  ├─ kdx/                  # 🌐 Web (Next.js 15) - SubApps: AI Studio, Chat, Todo, Calendar, etc.
│  └─ care-expo/            # 📲 Mobile (React Native + Expo)
├─ 📦 packages/             # Packages compartilhados
│  ├─ api/                  # 🔗 tRPC routers
│  ├─ db/                   # 🗄️ Drizzle ORM + MySQL
│  ├─ ui/                   # 🎨 shadcn/ui components
│  └─ ...                   # auth, validators, shared, etc.
├─ 🛠️ tooling/              # ESLint, Prettier, Tailwind, TypeScript
├─ 📚 docs/                 # Documentação completa
└─ 🔧 Configs               # turbo.json, package.json, etc.
```

**🗺️ Para estrutura detalhada**: Veja seção "Estrutura do Projeto" em [`docs/README.md`](docs/README.md)

## 🚀 Quick Start

### ⚡ Setup Rápido

```bash
# Pré-requisitos: Node.js (veja .nvmrc), pnpm
nvm use && npm i -g pnpm

# 1. Instalar e configurar
pnpm i
cp .env.example .env  # Configure suas variáveis

# 2. Iniciar aplicação web
pnpm dev:kdx

# 3. Setup banco de dados
pnpm db:push    # Aplicar schema
pnpm db:seed    # Dados de exemplo
```

### 🧭 Comandos Essenciais

```bash
# 🚀 Desenvolvimento
pnpm dev:kdx        # App web principal
pnpm dev:care       # App móvel
pnpm db:studio      # Interface visual do banco

# 🧹 Manutenção
pnpm lint:fix       # Corrigir linting
pnpm format:fix     # Formatar código
pnpm typecheck      # Verificar tipos

# ⚡ Ferramentas
pnpm trpc:new       # Novo endpoint tRPC
pnpm ui:add         # Novo componente shadcn
pnpm turbo gen init # Novo package @kdx
```

**📖 Para setup completo**: [`docs/architecture/development-setup.md`](docs/architecture/development-setup.md)

## 🔧 **Configuração de Ambiente**

### 📍 **Localização do .env**

- 🗂️ **Arquivo principal**: `.env` fica na **raiz do monorepo** (`/`)
- ⚠️ **Importante**: Scripts em subpastas **não carregam automaticamente** o `.env`
- 📂 **Estrutura**:
  ```
  kodix-turbo/
  ├── .env              ← Arquivo principal aqui
  ├── .env.example      ← Template
  ├── packages/
  │   └── db/
  │       └── scripts/  ← Scripts precisam carregar .env manualmente
  ```

### 🔗 **Variáveis de Banco de Dados**

- ✅ **Correta**: `MYSQL_URL="mysql://user:password@localhost:3306/database"`
- ❌ **Incorreta**: `DATABASE_URL` (não é usada no projeto)

### 🛠️ **Executando Scripts que Dependem do .env**

**Opção 1: Do root do projeto**

```bash
# Execute do diretório raiz para carregar .env automaticamente
cd /path/to/kodix-turbo
npx tsx packages/db/scripts/check-migration-status.ts
```

**Opção 2: Carregando .env explicitamente**

```bash
# Scripts modernos carregam automaticamente via dotenv
cd packages/db
npx tsx scripts/check-migration-status.ts  # Funciona se o script usa dotenv
```

**Opção 3: Com variáveis inline**

```bash
# Para casos específicos
cd packages/db
MYSQL_URL="mysql://..." npx tsx scripts/script-name.ts
```

### 📋 **Exemplo de .env**

```bash
# Database (MySQL)
MYSQL_URL="mysql://root:password@localhost:3306/kodix"

# Outras variáveis...
AUTH_GOOGLE_CLIENT_ID="..."
AUTH_GOOGLE_CLIENT_SECRET="..."
```

## 🧭 Navegação Rápida por Objetivo

### 🆕 **Novo no Projeto?**

1. **Visão Geral**: [`docs/project/overview.md`](docs/project/overview.md)
2. **Setup Desenvolvimento**: [`docs/architecture/development-setup.md`](docs/architecture/development-setup.md)
3. **Índice Completo**: [`docs/README.md`](docs/README.md)

### 💻 **Desenvolvimento**

- **Backend**: [`docs/architecture/backend-guide.md`](docs/architecture/backend-guide.md)
- **Frontend**: [`docs/architecture/frontend-guide.md`](docs/architecture/frontend-guide.md)
- **Banco de Dados**: [`docs/database/`](docs/database/)
- **Design System**: [`docs/components/`](docs/components/)

### 🎯 **Funcionalidades**

- **IA & Chat**: [`docs/subapps/ai-studio/`](docs/subapps/ai-studio/) | [`docs/subapps/chat/`](docs/subapps/chat/)
- **Gestão Clínica**: [`docs/subapps/kodix-care-web/`](docs/subapps/kodix-care-web/) | [`docs/apps/care-mobile/`](docs/apps/care-mobile/)
- **Produtividade**: [`docs/subapps/todo/`](docs/subapps/todo/) | [`docs/subapps/calendar/`](docs/subapps/calendar/)

### 🏗️ **Criar Novos Recursos**

- **SubApp**: [`docs/architecture/subapp-architecture.md`](docs/architecture/subapp-architecture.md)
- **Package**: `pnpm turbo gen init`
- **Endpoint tRPC**: `pnpm trpc:new`
- **Componente UI**: `pnpm ui:add`

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui
- **Backend**: tRPC v11, Drizzle ORM, MySQL, oslo auth
- **Mobile**: React Native, Expo Router, Tamagui
- **Monorepo**: Turborepo, pnpm workspaces
- **Deploy**: Vercel (web), Expo (mobile)

## 📚 Documentação Completa

| Categoria            | Link                                       | Descrição                                |
| -------------------- | ------------------------------------------ | ---------------------------------------- |
| **📖 Índice Geral**  | [`docs/README.md`](docs/README.md)         | Navegação completa da documentação       |
| **🏢 Projeto**       | [`docs/project/`](docs/project/)           | Conceitos, visão e contexto de negócio   |
| **🏗️ Arquitetura**   | [`docs/architecture/`](docs/architecture/) | Setup, desenvolvimento, padrões técnicos |
| **📱 SubApps**       | [`docs/subapps/`](docs/subapps/)           | Funcionalidades específicas              |
| **🎨 Design System** | [`docs/components/`](docs/components/)     | Componentes e UI                         |
| **🗄️ Database**      | [`docs/database/`](docs/database/)         | Schemas e patterns de DB                 |

## 🤝 Contribuindo

1. **Siga os guias**: [`docs/architecture/`](docs/architecture/)
2. **Mantenha docs atualizadas**: [`docs/`](docs/)
3. **Execute antes de commit**: `pnpm lint:fix && pnpm format:fix && pnpm typecheck`

---

💡 **Dica**: Este README é seu ponto de partida. Para informações detalhadas, navegue pela [`documentação completa`](docs/) organizada por temas.

**📜 Referência**: Baseado em [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) (obrigado @juliusmarminge!)

### 🏗️ Arquitetura e Desenvolvimento

- **Architecture**: [`docs/architecture/`](docs/architecture/) - Arquitetura geral, frontend, backend
- **SubApp**: [`docs/architecture/subapp-architecture.md`](docs/architecture/subapp-architecture.md) - Arquitetura completa de SubApps
- **Database**: [`docs/database/`](docs/database/) - MySQL, Drizzle ORM, schemas, migrations
