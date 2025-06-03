# Chat API Reference

## 📖 Visão Geral

Esta é a referência das **APIs do Chat SubApp**, descrevendo os recursos disponíveis, casos de uso e como interagir com o sistema de conversação com IA.

## 🎯 Casos de Uso Principais

### **💬 Conversação com IA**

- Enviar mensagens e receber respostas inteligentes
- Suporte a múltiplos provedores (OpenAI, Anthropic, Google, Azure, etc.)
- Conversas em tempo real com streaming visual

### **🗂️ Organização de Conversas**

- Criar e gerenciar sessões de chat
- Organizar conversas em pastas hierárquicas
- Buscar e navegar pelo histórico

### **🤖 Flexibilidade de Modelos**

- Alternar entre diferentes modelos de IA
- Usar agentes personalizados criados no AI Studio
- Configuração inteligente de modelos por team

## 🔄 Fluxos de Trabalho

### **Fluxo de Nova Conversa**

1. Sistema busca modelo preferido (Chat Config → AI Studio → Primeiro Disponível)
2. Usuário envia primeira mensagem
3. Sistema cria sessão automaticamente
4. IA responde usando modelo selecionado
5. Conversa continua com histórico persistente

### **Fluxo de Organização**

1. Usuário cria pastas para categorizar conversas
2. Sessões podem ser movidas entre pastas
3. Títulos e configurações são editáveis
4. Busca permite encontrar conversas rapidamente

## 📂 Recursos Disponíveis

### **💬 Mensagens**

**buscarMensagensTest**

- **Propósito**: Recupera histórico de uma conversa específica
- **Uso**: Carregar mensagens ao abrir uma sessão
- **Funcionalidades**: Paginação, ordenação, filtros

**enviarMensagem**

- **Propósito**: Envia nova mensagem e gera resposta da IA
- **Uso**: Interação principal do chat
- **Funcionalidades**: Streaming, diferentes modelos, metadata

### **📂 Sessões**

**listarSessions**

- **Propósito**: Lista todas as conversas do team
- **Uso**: Sidebar, navegação, busca
- **Funcionalidades**: Filtros por pasta, busca por título, ordenação

**criarSession**

- **Propósito**: Cria nova conversa
- **Uso**: Início de novo chat, templates
- **Funcionalidades**: Configuração de modelo, pasta, agente

**editarSession**

- **Propósito**: Modifica informações da conversa
- **Uso**: Renomear, reorganizar, trocar modelo
- **Funcionalidades**: Título, modelo, pasta, agente

**excluirSession**

- **Propósito**: Remove conversa e todo histórico
- **Uso**: Limpeza, privacidade
- **Funcionalidades**: Remoção completa e irreversível

### **📁 Pastas**

**buscarChatFolders**

- **Propósito**: Lista sistema de organização
- **Uso**: Estrutura de pastas na sidebar
- **Funcionalidades**: Contador de sessões por pasta

**criarChatFolder**

- **Propósito**: Cria nova categoria de organização
- **Uso**: Organizar conversas por tema/projeto
- **Funcionalidades**: Nomes personalizados

**editarChatFolder** / **excluirChatFolder**

- **Propósito**: Gerenciar sistema de organização
- **Uso**: Manutenção da estrutura organizacional
- **Funcionalidades**: Renomear, remover (sessões ficam sem pasta)

### **⚙️ Configuração**

**buscarChatConfig** / **salvarChatConfig**

- **Propósito**: Configurações personalizadas por team
- **Uso**: Preferências de IA, interface, comportamento
- **Funcionalidades**: Modelo padrão, parâmetros de IA, UI preferences

### **🤖 Integração com IA**

**getPreferredModel**

- **Propósito**: Determina melhor modelo usando hierarquia inteligente
- **Uso**: Seleção automática inicial, fallbacks
- **Hierarquia**: Chat Team Config → AI Studio Default → Primeiro Disponível
- **Benefícios**: Preserva escolhas + respeita configurações admin

**getAvailableModels**

- **Propósito**: Lista modelos disponíveis via AI Studio
- **Uso**: Seletor de modelos, validação
- **Funcionalidades**: Modelos ativos, informações de provider

## 🔗 Integrações

### **AI Studio Service Layer**

- **Comunicação**: Via Service Layer (não HTTP direto)
- **Recursos**: Modelos, agentes, tokens, configurações
- **Isolamento**: Mantém separação entre SubApps
- **Benefícios**: Performance, type safety, manutenibilidade

### **Team Configuration System**

- **Escopo**: Configurações isoladas por team
- **Persistência**: Sistema AppTeamConfig oficial
- **Flexibilidade**: Parâmetros de IA e interface configuráveis

## 🔒 Segurança e Isolamento

### **Isolamento por Team**

- Todas as operações validam `teamId` automaticamente
- Conversas, pastas e configurações são isoladas
- Validação de ownership em todas as operações

### **Autenticação**

- NextAuth.js com sessões seguras
- Middleware automático de autenticação
- Headers obrigatórios em todas as chamadas

### **Rate Limiting**

- Limites específicos por tipo de operação
- Proteção contra spam e abuso
- Retry logic recomendado para clientes

## 📊 Exemplos de Uso

### **Iniciar Nova Conversa**

```typescript
// 1. Sistema busca modelo preferido
const preferredModel = await api.app.chat.getPreferredModel.query();

// 2. Usuário envia primeira mensagem (cria sessão automaticamente)
const result = await api.app.chat.enviarMensagem.mutate({
  content: "Como funciona machine learning?",
  // Sistema detecta que não há sessão e cria uma
});

// 3. Nova sessão criada e mensagem enviada
// 4. Usuário é redirecionado para /chat/[sessionId]
```

### **Organizar Conversas**

```typescript
// 1. Criar pasta para organização
const folder = await api.app.chat.criarChatFolder.mutate({
  name: "Projetos de IA",
});

// 2. Mover sessão para pasta
await api.app.chat.editarSession.mutate({
  sessionId: "abc123",
  dados: { chatFolderId: folder.id },
});

// 3. Buscar conversas da pasta
const sessions = await api.app.chat.listarSessions.query({
  chatFolderId: folder.id,
});
```

### **Trocar Modelo Durante Conversa**

```typescript
// 1. Listar modelos disponíveis
const models = await api.app.chat.getAvailableModels.query();

// 2. Editar sessão com novo modelo
await api.app.chat.editarSession.mutate({
  sessionId: "abc123",
  dados: { aiModelId: "gpt-4" },
});

// 3. Próximas mensagens usarão novo modelo
// 4. Modelo salvo automaticamente nas configurações do team
```

## 🎯 Benefícios da Arquitetura

### **🧠 Inteligência**

- Hierarquia de modelos preserva escolhas do usuário
- Fallbacks garantem funcionamento mesmo com configurações incompletas
- Integração transparente com AI Studio

### **🚀 Performance**

- Cache inteligente reduz chamadas desnecessárias
- Service Layer elimina overhead de HTTP entre SubApps
- Queries otimizadas com paginação e filtros

### **🔒 Segurança**

- Isolamento rigoroso por team em todas as operações
- Validação automática de acesso e ownership
- Tokens criptografados com AES-256-GCM

### **📈 Escalabilidade**

- Arquitetura modular facilita manutenção
- Service Layer permite evolução independente dos SubApps
- Rate limiting protege contra abuso

## 🔧 Ferramentas de Desenvolvimento

### **Frontend**

- Hooks customizados para casos de uso comuns
- Cache automático com React Query
- Invalidação inteligente após mutations

### **Testing**

- Mocks completos para desenvolvimento
- Postman collection para testes manuais
- Estratégias de teste específicas documentadas

### **Monitoring**

- Logs estruturados para debugging
- Métricas de performance e uso
- Error tracking com contexto detalhado

---

## 📚 Recursos Relacionados

- **[Chat Development Guide](./Chat_Development_Guide.md)** - Padrões técnicos de desenvolvimento
- **[Chat Testing Guide](./Chat_Testing_Guide.md)** - Estratégias de teste
- **[Chat Performance Guide](./Chat_Performance_Guide.md)** - Otimizações e melhores práticas

---

**📝 Última atualização**: Janeiro 2025 | **🎯 Foco**: Casos de uso e visão geral | **👥 Audiência**: Desenvolvedores e stakeholders
