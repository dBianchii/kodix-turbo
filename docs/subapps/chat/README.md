# Chat SubApp

## 📖 Visão Geral

O **Chat** é o sistema de conversação inteligente do Kodix que permite interações em tempo real com modelos de IA. Consome recursos gerenciados pelo AI Studio para oferecer uma experiência fluida de chat com assistentes artificiais.

## 🚀 Início Rápido

### 1. Executar o Projeto

```bash
# Executar todo o monorepo
pnpm dev:kdx
```

### 2. Configurar AI Studio (Pré-requisito)

⚠️ **Antes de usar o Chat, configure o AI Studio:**

1. Acesse `/apps/aiStudio`
2. Configure provedores e tokens
3. Ative modelos desejados
4. Crie agentes (opcional)

### 3. Acessar o Chat

1. Faça login na aplicação
2. Navegue para `/apps/chat`
3. O sistema criará automaticamente uma nova sessão ao enviar a primeira mensagem
4. Selecione um modelo disponível ou use o padrão do time

## 🔧 Funcionalidades Principais

### Conversação em Tempo Real

- **Streaming de Respostas**: Respostas fluidas com texto aparecendo progressivamente
- **Histórico Persistente**: Todas as conversas são salvas e organizadas por sessão
- **Contexto Mantido**: O chat mantém o contexto completo da conversa
- **Markdown Support**: Renderização de código, listas e formatação

### Gestão de Sessões

- **Múltiplas Conversas**: Organize diferentes tópicos em sessões separadas
- **Títulos Automáticos**: Geração inteligente de títulos baseada no conteúdo
- **Busca e Filtros**: Encontre rapidamente conversas anteriores
- **Auto-criação**: Primeira mensagem cria sessão automaticamente

### Seleção de Modelos

- **Modelos Disponíveis**: Usa modelos configurados no AI Studio
- **Troca Dinâmica**: Mude de modelo durante a conversa
- **Fallback Inteligente**: Seleção automática se modelo não especificado
- **Persistência**: Modelo selecionado é salvo na sessão

### Interface Intuitiva

- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Tema Escuro**: Interface moderna com tema escuro por padrão
- **Atalhos de Teclado**: Navegação rápida e eficiente
- **Sidebar Colapsável**: Lista de sessões sempre acessível

## 📚 Documentação Completa

### **Arquitetura e Implementação**

- **[📱 Frontend Architecture](./frontend-architecture.md)** - Estrutura e componentes da interface
- **[⚙️ Backend Architecture](./backend-architecture.md)** - APIs e processamento server-side
- **[🔄 Streaming Implementation](./streaming-implementation.md)** - Como funciona o streaming em tempo real

### **Funcionalidades Específicas**

- **[💬 Session Management](./session-management.md)** - Sistema de gerenciamento de sessões
- **[💾 Message Persistence](./message-persistence.md)** - Armazenamento e recuperação de mensagens

### **Evolução e Migração**

- **[🚀 Vercel AI SDK Migration](./vercel-ai-sdk-migration.md)** - Estratégia de migração para Vercel AI SDK ✅ **5/6 Subetapas Concluídas**
- **[📋 Subetapas Detalhadas](./vercel-ai-sdk-migration-steps.md)** - Implementação passo a passo
- **[📊 Subetapa 4 Report](./subetapa-4-report.md)** - Relatório da conclusão da integração real
- **[📊 Subetapa 5 Report](./subetapa-5-report.md)** - Relatório da conclusão do monitoramento
- **[📋 Decisão Estratégica](./decisao-estrategica-fallback.md)** - Cancelamento do fallback automático

### **Problemas e Soluções**

- **[⚠️ Known Issues](./known-issues.md)** - Problemas conhecidos e workarounds

## 🔗 Dependência do AI Studio

O Chat **depende completamente** do AI Studio para:

- **Provedores de IA**: OpenAI, Anthropic, Google, etc.
- **Modelos Disponíveis**: Apenas modelos ativos no AI Studio aparecem
- **Tokens de API**: Gerenciados centralmente e criptografados
- **Configurações**: Limites, parâmetros e prioridades
- **Agentes**: Assistentes personalizados (quando disponíveis)

### Service Layer Integration

```typescript
// Exemplo de integração via Service Layer
const models = await AiStudioService.getAvailableModels({
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```

## 🔒 Segurança

- **Isolamento por Sessão**: Cada conversa é isolada por usuário e team
- **Autenticação**: Integrado com o sistema de auth do Kodix
- **Sem Exposição de Tokens**: Tokens de API nunca chegam ao frontend
- **Validação de Acesso**: Verificação de permissões em todas as operações

## 🔗 Links Relacionados

- **[AI Studio](../ai-studio/README.md)** - **PRÉ-REQUISITO** para configurar modelos e tokens
- **[SubApp Architecture](../../architecture/subapp-architecture.md)** - Padrões de SubApps
- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🎨 Frontend Development Guide](../../architecture/frontend-guide.md)** - Padrões de desenvolvimento frontend
