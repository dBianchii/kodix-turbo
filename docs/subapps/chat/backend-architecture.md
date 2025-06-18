# Backend Architecture - Chat SubApp

## ⚙️ Visão Geral

O backend do Chat é construído com tRPC para APIs type-safe e um endpoint HTTP dedicado para streaming. A arquitetura prioriza performance e integração segura com o AI Studio.

## 🏗️ Estrutura de APIs

### Routers tRPC

#### Router Principal (`chat/_router.ts`)

```typescript
export const chatRouter = {
  // Sessões
  buscarSessoes: protectedProcedure.query(),
  criarSessao: protectedProcedure.mutation(),
  atualizarSessao: protectedProcedure.mutation(),
  deletarSessao: protectedProcedure.mutation(),

  // Mensagens
  buscarMensagens: protectedProcedure.query(),
  enviarMensagem: protectedProcedure.mutation(),

  // Auto-criação
  autoCreateSessionWithMessage: protectedProcedure.mutation(),
} satisfies TRPCRouterRecord;
```

### Endpoint de Streaming

- **Rota**: `/api/chat/stream`
- **Método**: POST
- **Autenticação**: Via cookies de sessão
- **Protocolo**: Server-Sent Events (SSE)

## 🗄️ Modelo de Dados

### Tabela `chatSession`

```sql
CREATE TABLE chatSession (
  id VARCHAR(21) PRIMARY KEY,
  title VARCHAR(255),
  teamId VARCHAR(21) NOT NULL,
  userId VARCHAR(21) NOT NULL,
  aiModelId VARCHAR(21),
  aiAgentId VARCHAR(21),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (teamId) REFERENCES team(id),
  FOREIGN KEY (userId) REFERENCES user(id),
  FOREIGN KEY (aiModelId) REFERENCES aiModel(id),
  FOREIGN KEY (aiAgentId) REFERENCES aiAgent(id)
);
```

### Tabela `chatMessage`

```sql
CREATE TABLE chatMessage (
  id VARCHAR(21) PRIMARY KEY,
  chatSessionId VARCHAR(21) NOT NULL,
  senderRole ENUM('user', 'ai', 'system') NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'ok',
  metadata JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (chatSessionId) REFERENCES chatSession(id) ON DELETE CASCADE
);
```

## 🔄 Fluxo de Processamento

### 1. Criação de Sessão

```typescript
// Handler simplificado
export const criarSessaoHandler = async ({ ctx, input }) => {
  const session = await chatRepository.ChatSessionRepository.create({
    title: input.title || "Nova Conversa",
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
    aiModelId: input.modelId,
  });

  return session;
};
```

### 2. Envio de Mensagem

O fluxo de envio envolve múltiplas etapas:

1. **Validação**: Verifica sessão e permissões
2. **Persistência**: Salva mensagem do usuário
3. **Streaming**: Inicia resposta da IA
4. **Finalização**: Salva resposta completa

### 3. Streaming de Resposta

```typescript
// Endpoint de streaming simplificado
export async function POST(request: NextRequest) {
  // 1. Validar sessão e autenticação
  const { chatSessionId, content } = await request.json();
  const session = await ChatService.findSessionById(chatSessionId);

  // 2. Buscar modelo e configurações
  const model = await AiStudioService.getModelById({
    modelId: session.aiModelId,
    teamId: session.teamId,
    requestingApp: chatAppId,
  });

  // 3. Buscar token do provider
  const token = await AiStudioService.getProviderToken({
    providerId: model.providerId,
    teamId: session.teamId,
    requestingApp: chatAppId,
  });

  // 4. Configurar streaming
  const stream = await createStreamingResponse({
    model,
    messages: formattedMessages,
    token: token.token,
  });

  return new Response(stream);
}
```

## 🔐 Segurança e Isolamento

### Isolamento por Team

Todas as queries incluem validação de `teamId`:

```typescript
// Repository sempre filtra por team
export const findByTeam = async (teamId: string) => {
  return db.query.chatSession.findMany({
    where: eq(chatSession.teamId, teamId),
  });
};
```

### Validação de Permissões

```typescript
// Middleware verifica acesso
const validateSessionAccess = async (sessionId, userId, teamId) => {
  const session = await findSessionById(sessionId);

  if (!session || session.teamId !== teamId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Sessão não encontrada",
    });
  }

  return session;
};
```

## 🔗 Integração com AI Studio

### Service Layer

O Chat usa `AiStudioService` para toda comunicação:

```typescript
// Buscar modelos disponíveis
const models = await AiStudioService.getAvailableModels({
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});

// Buscar token do provider
const token = await AiStudioService.getProviderToken({
  providerId: model.providerId,
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```

### Fallback de Modelo

Se a sessão não tem modelo configurado:

1. Busca modelos disponíveis do time
2. Seleciona o primeiro como padrão
3. Atualiza a sessão automaticamente

## 📊 Gestão de Tokens

### Cálculo Inteligente

```typescript
// Estimar tokens de uma mensagem
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 3.5) + 10;
};

// Gerenciar limite de contexto
const manageContext = (messages, maxTokens) => {
  const maxInput = Math.floor(maxTokens * 0.7); // 70% para input

  // Preservar mensagens do sistema
  const systemMessages = messages.filter((m) => m.role === "system");

  // Truncar histórico se necessário
  const conversationMessages = truncateToFit(
    messages.filter((m) => m.role !== "system"),
    maxInput - estimateTokens(systemMessages),
  );

  return [...systemMessages, ...conversationMessages];
};
```

### Limites por Modelo

O sistema obtém limites específicos do AI Studio:

- Limites configurados por modelo no AI Studio
- Fallback para limites padrão se não especificado
- Consulte [Model Configuration](../ai-studio/model-configuration.md) para detalhes

## 🌍 Internacionalização

### System Prompts Multilíngues

```typescript
// Detectar idioma do usuário
const userLocale = detectUserLocale(request);

// Aplicar prompt no idioma correto
const systemPrompt =
  userLocale === "pt-BR"
    ? "Você é um assistente útil e responde sempre em português brasileiro."
    : "You are a helpful assistant and always respond in English.";
```

### Detecção de Idioma

1. Cookie `NEXT_LOCALE`
2. Pathname da URL
3. Header `Accept-Language`
4. Fallback para `pt-BR`

## 🚀 Performance

### Otimizações Implementadas

- **Streaming Real-time**: Resposta aparece progressivamente
- **Paginação**: Mensagens carregadas sob demanda
- **Cache**: Modelos disponíveis são cacheados
- **Índices**: Queries otimizadas com índices apropriados

### Métricas Monitoradas

- Tempo de resposta do primeiro token
- Taxa de sucesso/erro das APIs
- Uso de tokens por sessão
- Latência do streaming

## 🔧 Tratamento de Erros

### Erros Específicos de Provider

```typescript
// Token inválido
if (response.status === 401) {
  throw new Error("Token inválido. Verifique configuração no AI Studio");
}

// Limite excedido
if (response.status === 429) {
  throw new Error("Limite de uso excedido. Verifique sua conta do provider");
}

// Modelo não encontrado
if (response.status === 404) {
  throw new Error(`Modelo não encontrado. Configure no AI Studio`);
}
```

### Recovery Strategies

1. **Modelo não disponível**: Fallback para modelo padrão via AI Studio
2. **Token expirado**: Redirecionar para configuração no AI Studio
3. **Limite excedido**: Sugerir truncar contexto ou trocar modelo

## 📝 Logs e Auditoria

### Logs de Debugging

```typescript
console.log("🔵 [API] POST streaming recebido");
console.log("🟢 [API] Dados recebidos:", { chatSessionId, content });
console.log("🎯 [DEBUG] Usando modelo:", model.name);
console.log("✅ [API] Mensagem salva com metadata");
```

### Metadata de Mensagens

Cada mensagem salva metadata relevante:

```json
{
  "requestedModel": "gpt-4",
  "actualModelUsed": "gpt-4",
  "providerId": "provider_123",
  "providerName": "OpenAI",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 200,
    "totalTokens": 350
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔄 Próximas Melhorias

### Planejadas

- [ ] Suporte a múltiplos agentes
- [ ] Cache de respostas comuns
- [ ] Compressão de histórico
- [ ] Métricas detalhadas de uso
- [ ] Webhooks para integrações
