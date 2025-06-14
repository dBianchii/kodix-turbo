# Documentação do Projeto Kodix

Este diretório contém toda a documentação técnica e funcional do projeto Kodix.

## 🚨 **CRÍTICO - LEIA PRIMEIRO**

### ⚠️ SubApp Architecture

**IMPORTANTE:** Antes de trabalhar com SubApps, leia **obrigatoriamente**:

📖 **[SubApp Architecture](./architecture/subapp-architecture.md)** - **FONTE ÚNICA DE VERDADE**

Este documento consolida **todos os aspectos arquiteturais** dos SubApps:

- 🏗️ **Arquitetura e Padrões** fundamentais
- 🔒 **Isolamento e Comunicação** entre apps (regras críticas)
- ⚙️ **Configurações por Team** (AppTeamConfig)
- 🚀 **Criação de Novos SubApps** (processo completo)

**Problemas críticos documentados** incluem soluções para falhas de contexto (`teamId`, autenticação) que podem quebrar funcionalidades entre apps.

---

## 📋 Estrutura da Documentação

### 🏢 Projeto e Conceitos

- **[Projeto Kodix](./project/)** - Conceitos, visão, objetivos e contexto de negócio do projeto

### 📱 SubApps Principais

- **[SubApps do Kodix](./subapps/)** - Funcionalidades principais da aplicação web (AI Studio, Chat, Calendar, etc.)

### 📲 Aplicações Móveis

- **[Kodix Care - Aplicação Móvel](./apps/care-mobile/)** - Documentação da aplicação móvel (React Native/Expo)

### 🏗️ Arquitetura e Desenvolvimento

- **[Architecture](./architecture/)** - Guias de desenvolvimento, implementação backend/frontend, padrões técnicos
- **🚨 [SubApp Architecture](./architecture/subapp-architecture.md)** - **CRÍTICO:** Arquitetura completa de SubApps

### 🎨 Components e Design System

- **[Components](./components/)** - Design system, componentes de UI e biblioteca de componentes

### 🗄️ Banco de Dados

- **[Database](./database/)** - Documentação de banco de dados MySQL, schemas, migrations e Drizzle ORM

### 📚 Referências e Recursos Externos

- **[References](./references/)** - Documentação de terceiros, APIs externas e materiais de referência

## 🚀 Quick Start

1. **Novo no projeto?**
   - Comece pela [Visão Geral do Projeto](./project/overview.md)
2. **Vai desenvolver uma feature?**
   - Leia o [Setup de Desenvolvimento](./architecture/development-setup.md)
   - Use a [Referência de Scripts](./architecture/scripts-reference.md) 📋 **NOVO!**
   - **🚨 OBRIGATÓRIO:** [SubApp Architecture](./architecture/subapp-architecture.md) se envolver SubApps
3. **Trabalhando com backend?**
   - Consulte o [Guia de Backend](./architecture/backend-guide.md)
4. **Trabalhando com frontend?**
   - Veja o [Guia de Frontend](./architecture/frontend-guide.md)
5. **Trabalhando com banco de dados?**
   - Comece com [Getting Started](./database/getting-started.md) para setup inicial
   - Consulte [Schema Reference](./database/schema-reference.md) para estrutura técnica
   - Use [Development Workflow](./database/development-workflow.md) para workflow diário
6. **Criando um novo SubApp?**
   - Siga o tutorial **[SubApp Architecture](./architecture/subapp-architecture.md)** (seção "Criando Novos SubApps")
7. **Trabalhando com UI/Componentes?**
   - Veja o [Design System](./components/)
8. **Trabalhando com funcionalidades principais?**
   - Veja a [documentação dos SubApps](./subapps/)
9. **Trabalhando com a aplicação móvel?**
   - Consulte a [documentação do Kodix Care](./apps/care-mobile/)

## 📁 Estrutura Completa da Documentação

```
docs/
├── README.md                           # Este arquivo
├── project/                            # 🏢 Conceitos e Visão de Negócio
│   ├── README.md                       # Índice da documentação conceitual
│   └── overview.md                     # Visão geral, objetivos e contexto
├── subapps/                            # 📱 SubApps Principais (Core do Sistema)
│   ├── README.md                       # Índice dos SubApps
│   ├── ai-studio/                      # 🤖 AI Studio (com toda documentação de IA)
│   ├── chat/                           # 💬 Sistema de Chat
│   ├── todo/                           # 📝 Sistema de Tarefas
│   ├── calendar/                       # 📅 Sistema de Calendário
│   ├── cupom/                          # 🎫 Gestão de Cupons
│   └── kodix-care-web/                # 🏥 Kodix Care Web
├── architecture/                       # 🏗️ Arquitetura e Desenvolvimento Técnico
│   ├── README.md                       # Índice da documentação técnica
│   ├── subapp-architecture.md          # 🚨 CRÍTICO: Arquitetura completa de SubApps
│   ├── subapp-inter-dependencies.md    # 🔗 Comunicação entre SubApps (legacy/específico)
│   ├── development-setup.md            # Setup de ambiente e ferramentas
│   ├── coding-standards.md             # Padrões de código e convenções
│   ├── backend-guide.md                # Desenvolvimento backend
│   ├── frontend-guide.md               # Desenvolvimento frontend
│   └── workflows.md                    # Git, CI/CD, deployment
├── components/                         # 🎨 Components e Design System
│   ├── README.md                       # Índice do design system
│   ├── index.md                        # Índice geral de componentes
│   ├── component-examples.md           # Exemplos práticos de componentes
│   └── guia-shadcn-sidebar.md         # Guia específico do Shadcn sidebar
├── database/                           # 🗄️ Banco de Dados MySQL + Drizzle ORM
│   ├── README.md                       # Índice da documentação de database
│   ├── getting-started.md              # Setup do banco MySQL do zero
│   ├── development-workflow.md         # Workflow diário com branches e schema
│   ├── drizzle-studio.md               # Interface visual para explorar dados
│   ├── production-migrations.md        # Deploy seguro de mudanças
│   └── schema-reference.md             # Documentação técnica completa do schema
├── apps/                               # 📲 Aplicações Separadas
│   └── care-mobile/                    # Aplicação móvel
│       ├── README.md                   # Índice da documentação Care
│       └── funcionalidades-kodix-care.md # Funcionalidades do Care
└── references/                         # 📚 Referências e Recursos Externos
    ├── README.md                       # Índice de referências
    └── VercelAI-llms.txt              # Referência de LLMs do Vercel AI
```

## 🎯 Navegação por Funcionalidade

### Para Conceitos e Negócio

- **Visão do produto**: `project/overview.md`
