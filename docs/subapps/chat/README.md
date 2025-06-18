# Chat SubApp

## 📖 Visão Geral

O **Chat** é o sistema de conversação inteligente do Kodix que permite interações em tempo real com modelos de IA. Utiliza o **Vercel AI SDK** como engine principal, com sistema legacy como fallback, consumindo recursos gerenciados pelo AI Studio.

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
- **Vercel AI SDK**: Sistema moderno de IA como engine principal
- **Sistema Híbrido**: Fallback automático para sistema legacy se necessário
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

### Tecnologia Avançada

- **Vercel AI SDK**: Engine principal com suporte otimizado a múltiplos providers
- **Sistema Híbrido**: Fallback automático para máxima confiabilidade
- **Multi-Provider**: Suporte nativo a OpenAI, Anthropic via Vercel AI SDK
- **Controle Granular**: Feature flag para controle do sistema
- **Monitoramento**: Logs detalhados para observabilidade

## 🎛️ Sistema Híbrido

### Arquitetura Atual

```
Frontend → tRPC → Feature Flag → [Vercel AI SDK | Sistema Legacy] → Response
```

### Controle via Feature Flag

```bash
# Vercel AI SDK (Padrão - Ativo)
ENABLE_VERCEL_AI_ADAPTER=true

# Sistema Legacy (Fallback)
ENABLE_VERCEL_AI_ADAPTER=false
```

### Identificação do Sistema

- **Header HTTP**: `X-Powered-By: Vercel-AI-SDK` (quando Vercel AI ativo)
- **Logs**: `[MIGRATION]` para Vercel AI, `[LEGACY]` para sistema antigo
- **Metadata**: Mensagens marcadas com informação do sistema usado

### Fallback Automático

Em caso de erro no Vercel AI SDK:

1. Sistema detecta a falha
2. Automaticamente usa sistema legacy
3. Logs registram o fallback
4. Usuário não percebe a mudança

## 📚 Documentação Completa

### **Arquitetura e Implementação**

- **[📱 Frontend Architecture](./frontend-architecture.md)** - Estrutura e componentes da interface
- **[⚙️ Backend Architecture](./backend-architecture.md)** - APIs e processamento server-side
- **[🔄 Streaming Implementation](./streaming-implementation.md)** - Como funciona o streaming em tempo real
- **[🚀 Vercel AI Integration](./vercel-ai-integration.md)** - Integração com Vercel AI SDK ✅ **ATIVO**

### **Funcionalidades Específicas**

- **[💬 Session Management](./session-management.md)** - Sistema de gerenciamento de sessões
- **[💾 Message Persistence](./message-persistence.md)** - Armazenamento e recuperação de mensagens

### **Status da Migração**

- **✅ Sistema Híbrido Operacional** - Vercel AI SDK ativo com fallback legacy
- **[📋 Plano de Remoção Legacy](./legacy-removal-plan.md)** - Plano futuro para eliminar sistema antigo
- **[📚 Arquivo Histórico](./archive/)** - Documentos da migração arquivados

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
# Verificar qual sistema está ativo
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"chatSessionId": "SESSION_ID", "content": "test"}' \
  -I | grep "X-Powered-By"

# Se Vercel AI SDK ativo:
# X-Powered-By: Vercel-AI-SDK
```

### Logs Importantes

```bash
# Logs do Vercel AI SDK
grep "\[MIGRATION\]" logs/app.log

# Logs do sistema legacy
grep "\[LEGACY\]" logs/app.log

# Verificar feature flag
grep "VERCEL_AI_ADAPTER" logs/app.log
```

### Problemas Comuns

1. **Feature Flag Desabilitada**

   - Verificar `ENABLE_VERCEL_AI_ADAPTER=true` no `.env`
   - Reiniciar servidor se necessário

2. **Modelo Não Encontrado**

   - Verificar configuração no AI Studio
   - Confirmar que modelo está ativo para o team

3. **Token Inválido**
   - Verificar tokens no AI Studio
   - Confirmar criptografia e descriptografia

## 🔗 Links Relacionados

- **[AI Studio](../ai-studio/README.md)** - **PRÉ-REQUISITO** para configurar modelos e tokens
- **[SubApp Architecture](../../architecture/subapp-architecture.md)** - Padrões de SubApps
- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🎨 Frontend Development Guide](../../architecture/frontend-guide.md)** - Padrões de desenvolvimento frontend

---

**🎉 O Chat SubApp opera com sistema híbrido: Vercel AI SDK como principal + Sistema Legacy como fallback!**
