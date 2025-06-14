# AI Studio

## 📖 Visão Geral

O **AI Studio** é um módulo completo para gerenciamento de provedores de IA, modelos, agentes e tokens de API. Construído com arquitetura modular escalável e seguindo as **Kodix AI Coding Rules**.

## 🚀 Início Rápido

### 1. Executar o Projeto

```bash
# Executar todo o monorepo
pnpm dev:kdx
```

### 2. Acessar AI Studio

1. Faça login na aplicação
2. Navegue para `/apps/aiStudio`
3. Configure seus primeiro provedor em **Provedores**
4. Adicione tokens de API em **Tokens**
5. Configure modelos em **Modelos**
6. Crie agentes em **Agentes**

## 🔧 Funcionalidades Principais

### 🏢 Provedores de IA

- **Suporte**: OpenAI, Anthropic, Google, Azure
- **Gestão**: Criar, listar, editar, excluir provedores
- **Configuração**: URLs personalizadas, versões de API

### 🧠 Modelos de IA

- **Organização**: Modelos vinculados a provedores
- **Configuração**: Parâmetros específicos por modelo
- **Controle**: Ativar/desativar modelos por equipe

### 👤 Agentes IA

- **Personalização**: Prompts de sistema customizáveis
- **Configuração**: Modelos específicos por agente
- **Gestão**: Criação e edição de assistentes

### 🔐 Tokens de API

- **Segurança**: Criptografia AES-256-GCM
- **Organização**: Tokens por equipe e provedor
- **Gestão**: Criação, edição e remoção segura

## 📚 Documentação Completa

### **Para Desenvolvedores**

- **[🔧 Guia de Desenvolvimento](./development-guide.md)** - Padrões, estruturas e como desenvolver
- **[📋 Referência da API](./api-reference.md)** - Documentação completa das APIs
- **[🧪 Guia de Testes](./testing-guide.md)** - Estratégias e exemplos de testes

### **Para Setup e Configuração**

- **[⚙️ Configuração Inicial](./configuracao-inicial.md)** - Setup e dados iniciais
- **[🏗️ Detalhes Técnicos](./technical-details.md)** - Implementação específica e detalhes técnicos

## 🔒 Segurança

- **Criptografia AES-256-GCM** para todos os tokens de API
- **Isolamento por equipe** - recursos isolados por `teamId`
- **Validação automática** de acesso em todas as operações

## 🔗 Links Relacionados

- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo
- **[Backend Guide](../../architecture/backend-guide.md)** - Padrões de backend
- **[Coding Standards](../../architecture/coding-standards.md)** - Padrões de código

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🧠 AI Development Guide](./AI_Development_Guide.md)** - Guia específico para desenvolvimento de features de IA
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🗄️ Database Documentation](../../database/)** - Documentação de schemas e migrations
