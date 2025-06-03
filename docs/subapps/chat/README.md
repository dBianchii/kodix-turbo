# Chat

## 📖 Visão Geral

O **Chat** é o sistema de conversação com IA do Kodix, oferecendo experiência completa de comunicação em tempo real com múltiplos modelos de linguagem. Construído com streaming visual avançado, gerenciamento de sessões persistentes e integração profunda com o AI Studio, seguindo as **Kodix AI Coding Rules**.

## 🚀 Início Rápido

### 1. Executar o Projeto

```bash
# Executar todo o monorepo
pnpm dev:kdx
```

### 2. Acessar Chat

1. Faça login na aplicação
2. Navegue para `/apps/chat`
3. O sistema carregará automaticamente o modelo preferido do seu team
4. Digite uma mensagem para iniciar uma nova conversa
5. Use o seletor de modelos para trocar entre diferentes IAs
6. Organize conversas em pastas via sidebar

## 🔧 Funcionalidades Principais

### 💬 Sistema de Conversação Avançado

- **Streaming Visual**: Efeito de digitação em tempo real com `useTypingEffect`
- **Múltiplos Provedores**: OpenAI, Anthropic, Google, Azure, Mistral, xAI
- **Sessões Persistentes**: Histórico completo de conversas com metadata
- **Interface ChatGPT-like**: UX familiar e responsiva

### 🤖 Integração Inteligente com IA

- **Seleção Dinâmica**: Interface para escolha entre 21+ modelos
- **Agentes Personalizados**: Uso de agentes criados no AI Studio
- **Hierarquia de Modelos**: Sistema de prioridade automática (Team Config → AI Studio Default → Primeiro Disponível)
- **Fallback Inteligente**: Modelo padrão automático para sessões sem configuração

### 🗂️ Organização e Gerenciamento

- **Pastas Hierárquicas**: Sistema completo de organização de conversas
- **Edição de Sessões**: Alteração de título, modelo, agente e pasta
- **Busca de Modelos**: Pesquisa rápida e filtros no seletor
- **Títulos Inteligentes**: Geração automática baseada no conteúdo

### ⚙️ Configuração por Team

- **Team Configuration**: Configurações isoladas via AppTeamConfig
- **Modelo Persistente**: Último modelo selecionado salvo automaticamente
- **Configurações de IA**: Parâmetros personalizáveis (tokens, temperatura, streaming)
- **Configurações de UX**: Interface adaptável por preferências do team

## 📚 Documentação Completa

### **Para Desenvolvedores**

- **[⚡ Chat Streaming Implementation](./Chat_Streaming_Implementation.md)** - Implementação técnica do streaming visual
- **[📝 Chat Session Edit Feature](./Chat_Session_Edit_Feature.md)** - Sistema completo de edição de sessões
- **[🔧 Chat Development Guide](./Chat_Development_Guide.md)** - Guia completo para desenvolvedores
- **[📋 Chat API Reference](./Chat_API_Reference.md)** - Referência completa dos endpoints backend

### **Para Setup e Configuração**

- **[⚙️ Chat Team Configuration System](./Chat_Team_Config_System.md)** - Sistema de configurações por equipe
- **[🧪 Chat Testing Guide](./Chat_Testing_Guide.md)** - Estratégias de teste específicas

### **Para Planejamento e Roadmap**

- **[🚀 Chat Performance Optimization](./Chat_Performance_Guide.md)** - Otimizações e melhores práticas
- **[📋 Chat Frontend Compliance Plan](./planning/Chat_Frontend_Compliance_Plan.md)** - Roadmap de melhorias UX/UI

## 🔗 Integração com AI Studio

- **Service Layer**: Comunicação via `AiStudioService` seguindo padrões arquiteturais
- **Modelos Dinâmicos**: Busca e utiliza modelos configurados em tempo real
- **Agentes Personalizados**: Integração completa com sistema de agentes
- **Tokens Seguros**: Usa tokens criptografados com validação automática
- **Configurações Sincronizadas**: Respeita configurações de provider e modelo

## 🔒 Segurança e Isolamento

- **Isolamento por Team**: Todas as conversas isoladas por `teamId` com validação rigorosa
- **AppTeamConfig**: Configurações isoladas via sistema oficial do Kodix
- **Streaming Seguro**: Validação de acesso em tempo real durante conversas
- **Criptografia**: Tokens de API com AES-256-GCM via AI Studio
- **Validação de Sessão**: Verificação de ownership em todas as operações

## 🚀 Roadmap / Funcionalidades Futuras

### **Em Desenvolvimento**

- **🔍 Busca Avançada**: Pesquisa full-text em conversas e mensagens
- **✏️ Edição de Mensagens**: Capacidade de editar e reenviar mensagens
- **📋 Duplicação de Sessões**: Templates e clonagem de conversas

### **Planejado**

- **🔄 Streaming Real**: Server-Sent Events direto das APIs de IA
- **📊 Analytics**: Métricas de uso por team, modelo e agente
- **🎨 Temas Personalizáveis**: Dark/Light mode e UI customizável
- **📱 PWA Mobile**: Experiência nativa otimizada para mobile

## 🛠️ Arquitetura Técnica

### **Frontend Stack**

- **React + Next.js 14**: App Router com TypeScript
- **tRPC**: Type-safe APIs com React Query
- **Streaming**: Custom hooks com `useTypingEffect`
- **UI/UX**: Shadcn/UI components com Tailwind CSS

### **Backend Stack**

- **Service Layer**: `AiStudioService` para comunicação entre SubApps
- **Streaming Endpoint**: `/api/chat/stream` para respostas em tempo real
- **Database**: MySQL com Drizzle ORM
- **Team Config**: Sistema AppTeamConfig para isolamento

### **Integrações**

- **AI Providers**: OpenAI, Anthropic, Google, Azure via AI Studio
- **Authentication**: NextAuth.js com validação por team
- **Real-time**: ReadableStream para streaming de respostas
- **Caching**: React Query com invalidação inteligente

## 🔗 Links Relacionados

- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo
- **[SubApp Architecture](../../architecture/subapp-architecture.md)** - Padrões de SubApps
- **[AI Studio Integration](../ai-studio/)** - Documentação da integração com AI Studio
- **[Backend Guide](../../architecture/backend-guide.md)** - Padrões de backend
- **[Frontend Guide](../../architecture/frontend-guide.md)** - Padrões de frontend

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🤖 AI Development Guide](../ai-studio/AI_Development_Guide.md)** - Guia específico para desenvolvimento de features de IA
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🎨 Frontend Development Guide](../../architecture/frontend-guide.md)** - Padrões de desenvolvimento frontend
- **[🗄️ Database Documentation](../../database/)** - Documentação de schemas e migrations
