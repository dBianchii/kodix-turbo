# Chat SubApp

## 📖 Visão Geral

O **Chat** é o sistema de conversação inteligente do Kodix que permite interações em tempo real com modelos de IA. Utiliza exclusivamente o **Vercel AI SDK** como engine de IA, consumindo recursos gerenciados pelo AI Studio de forma moderna e otimizada.

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
- **Vercel AI SDK**: Sistema moderno de IA como engine única
- **Auto-Save Inteligente**: Mensagens salvas automaticamente durante o streaming
- **Histórico Persistente**: Todas as conversas são salvas e organizadas por sessão
- **Contexto Mantido**: O chat mantém o contexto completo da conversa
- **Markdown Support**: Renderização de código, listas e formatação
- **Auto-Focus Inteligente**: Cursor retorna automaticamente ao input após streaming
- **Token Usage Visibility**: Badge interativo mostrando uso de tokens em tempo real

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
- **Token Usage Badge**: Popover detalhado com informações de consumo de tokens
- **Interface Limpa**: Título "Chat" removido para design mais minimalista
- **Auto-Focus**: Input focado automaticamente após resposta da IA

### Tecnologia Avançada

- **Vercel AI SDK**: Engine única com suporte otimizado a múltiplos providers
- **Multi-Provider**: Suporte nativo a OpenAI, Anthropic via Vercel AI SDK
- **Stream + Auto-Save**: Streaming e persistência integrados
- **Monitoramento**: Logs detalhados para observabilidade
- **Interface Ultra-Limpa**: Complexidade encapsulada no backend

## 🏗️ Arquitetura Atual

### Sistema 100% Nativo

```
Frontend → tRPC → Vercel AI SDK (Native) → Provider APIs → Auto-Save (onFinish)
```

### Identificação do Sistema

- **Header HTTP**: `X-Powered-By: Vercel-AI-SDK-Native`
- **Logs**: `🚀 [VERCEL_AI_NATIVE]` para todas as operações
- **Metadata**: Mensagens marcadas com `providerId: "vercel-ai-sdk-native"`

### Fluxo de Processamento

1. **Requisição** chega no endpoint `/api/chat/stream`
2. **streamText()** nativo do Vercel AI SDK
3. **Streaming** via `toDataStreamResponse()` padrão
4. **Auto-Save** via callback `onFinish` nativo
5. **Error Handling** via callback `onError` nativo

## 📚 Documentação Completa

### **Arquitetura e Implementação**

- **[📱 Frontend Architecture](./frontend-architecture.md)** - Estrutura e componentes da interface
- **[⚙️ Backend Architecture](./backend-architecture.md)** - APIs e processamento server-side
- **[🔄 Streaming Implementation](./streaming-implementation.md)** - Como funciona o streaming em tempo real
- **[🚀 Vercel AI Integration](./vercel-ai-integration.md)** - Integração com Vercel AI SDK ✅ **ÚNICO SISTEMA**

### **Funcionalidades Específicas**

- **[💬 Session Management](./session-management.md)** - Sistema de gerenciamento de sessões
- **[🔄 Session & Message Flow](./session-message-flow.md)** - **NOVO**: Arquitetura de fluxo de sessões e mensagens
- **[💾 Message Persistence](./message-persistence.md)** - Armazenamento e recuperação de mensagens
- **[🌍 Translation Keys](./translation-keys.md)** - Chaves de tradução e suporte multilíngue

### **Histórico da Migração**

- **✅ Sistema Legacy Completamente Removido** - Migração 100% concluída
- **[📚 Arquivo Histórico](./archive/)** - Documentos da migração arquivados
  - **[📋 Plano de Remoção Legacy](./archive/legacy-removal-plan.md)** - Documentação da remoção executada
  - **[🔄 Migração Vercel AI SDK](./archive/vercel-ai-migration.md)** - Histórico da implementação
  - **[📊 Decisões Estratégicas](./archive/decisao-estrategica-fallback.md)** - Contexto das decisões

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

## 🔍 Debugging e Troubleshooting

### Verificação de Status

```bash
# Verificar se o sistema está usando Vercel AI SDK
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"chatSessionId": "SESSION_ID", "content": "test"}' \
  -I | grep "X-Powered-By"

# Resposta esperada:
# X-Powered-By: Vercel-AI-SDK
```

### Logs Importantes

```bash
# Logs do Vercel AI SDK (único sistema)
grep "🚀 \[VERCEL_AI\]" logs/app.log

# Logs do auto-save
grep "💾 AUTO-SAVE" logs/app.log

# Logs do adapter
grep "\[CHAT\]" logs/app.log
```

### Problemas Comuns

1. **Modelo Não Encontrado**

   - Verificar configuração no AI Studio
   - Confirmar que modelo está ativo para o team

2. **Token Inválido**

   - Verificar tokens no AI Studio
   - Confirmar criptografia e descriptografia

3. **Erro de Provider**

   - Verificar se provider é suportado (OpenAI, Anthropic)
   - Confirmar configuração no AI Studio

4. **Streaming Interrompido**

   - Verificar conexão de rede
   - Consultar logs do VercelAIAdapter

5. **Token Usage Badge Não Aparece**

   - Verificar se as traduções estão disponíveis
   - Confirmar chaves `tokenUsage.*` em `locales/kdx/[pt-BR|en].json`

6. **Auto-focus Não Funciona**
   - Verificar se input ref está corretamente configurado
   - Confirmar que streaming completou sem mudança de sessão

## 💡 Implementação Técnica

### Native Vercel AI SDK

100% implementação nativa com lifecycle callbacks:

```typescript
// Native streamText with built-in callbacks
const result = streamText({
  model: vercelModel,
  messages: formattedMessages,
  temperature: 0.7,
  maxTokens: 4000,
  // ✅ Native onFinish callback for auto-save
  onFinish: async ({ text, usage, finishReason }) => {
    await ChatService.createMessage({
      chatSessionId: session.id,
      senderRole: "ai",
      content: text,
      status: "ok",
      metadata: {
        usage,
        finishReason,
        migrationStatus: "native-implementation",
      },
    });
  },
  // ✅ Native onError callback
  onError: (error) => {
    console.error("Stream error:", error);
  },
});

// Native response format
return result.toDataStreamResponse();
```

### Benefícios da Migração Nativa

- **100% Compatibilidade** - Segue todos os padrões oficiais do Vercel AI SDK
- **Performance Máxima** - Sem camadas de abstração customizadas
- **Lifecycle Callbacks Nativos** - `onFinish` e `onError` integrados
- **Observabilidade Completa** - Token usage e métricas nativas
- **Future-Proof** - Compatível com todas as features futuras do SDK
- **Error Handling Robusto** - Tratamento de erros padrão do SDK
- **Response Format Nativo** - `toDataStreamResponse()` oficial

## 🚀 Performance

### Otimizações Implementadas

- **Streaming Direto**: Vercel AI SDK com otimizações nativas
- **Auto-Save Assíncrono**: Salvamento não bloqueia streaming
- **Gestão Inteligente de Tokens**: Truncamento automático de contexto
- **Índices Otimizados**: Queries de banco de dados otimizadas
- **Código Limpo**: Sem overhead de sistemas legacy

### Métricas Monitoradas

- Tempo de resposta do primeiro token
- Taxa de sucesso das APIs
- Throughput de streaming
- Uso de tokens por sessão
- Latência do auto-save

## 🔧 Desenvolvimento

### Estrutura de Arquivos

```
apps/kdx/src/app/api/chat/
├── stream/route.ts              # ✅ MIGRADO: 100% native Vercel AI SDK
├── monitoring/route.ts          # Monitoramento do sistema
└── route.ts                     # Endpoint básico

packages/api/src/internal/
├── adapters/
│   └── vercel-ai-adapter.ts     # ⚠️ LEGACY: Para remoção (não mais usado)
├── services/
│   ├── chat.service.ts          # Service layer do Chat
│   └── ai-studio.service.ts     # Integração com AI Studio
└── types/
    └── ai/
        └── vercel-adapter.types.ts  # ⚠️ LEGACY: Para remoção

Chat Components (apps/kdx/src/app/[locale]/(authed)/apps/chat/):
├── _components/
│   ├── token-usage-badge.tsx    # ✅ NOVO: Badge com Popover de token usage
│   ├── chat-window.tsx          # ✅ UPDATED: Auto-focus implementado
│   └── chat-window-session.tsx  # ✅ UPDATED: Auto-focus implementado
├── [sessionId]/page.tsx         # ✅ UPDATED: Interface limpa sem título
└── page.tsx                     # Página principal

Locales (packages/locales/src/messages/kdx/):
├── pt-BR.json                   # ✅ UPDATED: Novas chaves tokenUsage.*
└── en.json                      # ✅ UPDATED: Novas chaves tokenUsage.*

Documentação (docs/subapps/chat/):
└── vercel-ai-standards-migration-plan.md  # ✅ NOVO: Plano futuro de padronização
```

### Comandos Úteis

```bash
# Executar servidor de desenvolvimento
pnpm dev:kdx

# Testar endpoint de monitoramento
curl http://localhost:3000/api/chat/monitoring?action=status

# Verificar logs em tempo real
tail -f logs/app.log | grep "VERCEL_AI"

# Executar testes do adapter
pnpm test packages/api/src/internal/adapters/
```

## 🔗 Links Relacionados

- **[AI Studio](../ai-studio/README.md)** - **PRÉ-REQUISITO** para configurar modelos e tokens
- **[SubApp Architecture](../../architecture/subapp-architecture.md)** - Padrões de SubApps
- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🎨 Frontend Development Guide](../../architecture/frontend-guide.md)** - Padrões de desenvolvimento frontend

## 🎯 Próximos Passos

### Melhorias Planejadas

- [ ] Suporte a mais providers via Vercel AI SDK
- [ ] Tool calling para funções avançadas
- [ ] Structured output para respostas formatadas
- [ ] Streaming de imagens e arquivos
- [ ] Cache inteligente de respostas
- [ ] Métricas avançadas de performance

### Expansões Futuras

- [ ] Integração com agentes do AI Studio
- [ ] Suporte a conversas em grupo
- [ ] Compartilhamento de conversas
- [ ] Templates de prompts
- [ ] Análise de sentimentos
- [ ] Resumos automáticos de conversas

---

**🎉 O Chat SubApp agora opera com 100% padrões nativos do Vercel AI SDK!**

**📊 Benefícios da Migração Completa:**

- ✅ **100% Compatibilidade Nativa** - Implementação oficial do Vercel AI SDK
- ✅ **Lifecycle Callbacks Integrados** - `onFinish` e `onError` nativos
- ✅ **Response Format Padrão** - `toDataStreamResponse()` oficial
- ✅ **Performance Máxima** - Sem overhead de adaptadores customizados
- ✅ **Future-Proof** - Compatível com todas as features futuras
- ✅ **Observabilidade Completa** - Token usage e métricas nativas
- ✅ **Error Handling Robusto** - Tratamento de erros padrão do SDK
