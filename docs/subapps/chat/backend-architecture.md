# Backend Architecture - Chat SubApp

## ⚙️ Visão Geral

O backend do Chat é construído com tRPC para APIs type-safe e um endpoint HTTP dedicado para streaming. A arquitetura utiliza um **sistema híbrido** com Vercel AI SDK como engine principal e sistema legacy como fallback, priorizando performance e integração segura com o AI Studio.

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

### Endpoint de Streaming Híbrido

- **Rota**: `/api/chat/stream`
- **Método**: POST
- **Autenticação**: Via cookies de sessão
- **Protocolo**: Server-Sent Events (SSE)
- **Sistema**: Híbrido (Vercel AI SDK + Legacy Fallback)

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

## 🔄 Fluxo de Processamento Híbrido

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
3. **Decisão de Sistema**: Vercel AI SDK ou Legacy
4. **Streaming**: Inicia resposta da IA
5. **Finalização**: Salva resposta completa

### 3. Streaming Híbrido de Resposta

```typescript
// Endpoint de streaming híbrido
export async function POST(request: NextRequest) {
  // 1. Validar sessão e autenticação
  const { chatSessionId, content } = await request.json();
  const session = await ChatService.findSessionById(chatSessionId);

  // 2. DECISÃO DE SISTEMA: Vercel AI SDK vs Legacy
  if (FEATURE_FLAGS.VERCEL_AI_ADAPTER) {
    console.log("🚀 [MIGRATION] Usando Vercel AI SDK via adapter");

    try {
      // 3A. VERCEL AI SDK (Sistema Principal)
      const adapter = new VercelAIAdapter();
      const result = await adapter.streamResponse({
        chatSessionId: session.id,
        content,
        modelId: session.aiModelId,
        teamId: session.teamId,
        messages: formattedMessages,
        temperature: 0.7,
        maxTokens: 4000,
      });

      return new NextResponse(result.stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Powered-By": "Vercel-AI-SDK", // Identificação
        },
      });
    } catch (error) {
      console.error("🔴 [MIGRATION] Erro no Vercel AI SDK, fallback:", error);
      // Continua para sistema legacy automaticamente
    }
  }

  // 3B. SISTEMA LEGACY (Fallback ou quando flag desabilitada)
  console.log("🔄 [LEGACY] Usando sistema atual de streaming");

  // Buscar modelo e configurações via AI Studio
  const model = await AiStudioService.getModelById({
    modelId: session.aiModelId,
    teamId: session.teamId,
    requestingApp: chatAppId,
  });

  const token = await AiStudioService.getProviderToken({
    providerId: model.providerId,
    teamId: session.teamId,
    requestingApp: chatAppId,
  });

  // Configurar streaming direto com provider
  const stream = await createLegacyStreamingResponse({
    model,
    messages: formattedMessages,
    token: token.token,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      // Sem header X-Powered-By (identifica sistema legacy)
    },
  });
}
```

## 🔧 Sistema Híbrido: Vercel AI SDK + Legacy

### VercelAIAdapter (Sistema Principal)

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.ts
export class VercelAIAdapter {
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    // 1. Buscar modelo via AI Studio
    const model = await this.getVercelModel(params.modelId, params.teamId);

    // 2. Executar streaming com Vercel AI SDK
    const result = await streamText({
      model,
      messages: this.adaptInputParams(params).messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
    });

    // 3. Adaptar resposta para formato atual
    return this.adaptResponse(result);
  }

  private async getVercelModel(modelId: string, teamId: string) {
    const modelConfig = await AiStudioService.getModelById({
      modelId,
      teamId,
      requestingApp: chatAppId,
    });

    const providerToken = await AiStudioService.getProviderToken({
      providerId: modelConfig.providerId,
      teamId,
      requestingApp: chatAppId,
    });

    // Suporte a múltiplos providers via Vercel AI SDK
    switch (modelConfig.provider.name.toLowerCase()) {
      case "openai":
        return openai(modelConfig.name, {
          apiKey: providerToken.token,
          baseURL: modelConfig.provider.baseUrl,
        });

      case "anthropic":
        return anthropic(modelConfig.name, {
          apiKey: providerToken.token,
        });

      default:
        throw new Error(`Provider ${modelConfig.provider.name} não suportado`);
    }
  }
}
```

### Sistema Legacy (Fallback)

```typescript
// Sistema legacy mantido como fallback
const createLegacyStreamingResponse = async ({ model, messages, token }) => {
  const apiUrl = `${model.provider.baseUrl}/chat/completions`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.name,
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  return response.body; // Stream direto do provider
};
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

- **Streaming Híbrido**: Vercel AI SDK (principal) + Legacy (fallback)
- **Paginação**: Mensagens carregadas sob demanda
- **Cache**: Modelos disponíveis são cacheados
- **Índices**: Queries otimizadas com índices apropriados
- **Fallback Transparente**: Zero downtime em caso de problemas

### Métricas Monitoradas

- Tempo de resposta do primeiro token
- Taxa de sucesso/erro das APIs
- Taxa de fallback (Vercel AI SDK → Legacy)
- Uso de tokens por sessão
- Latência do streaming por sistema

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

1. **Vercel AI SDK falha**: Fallback automático para sistema legacy
2. **Modelo não disponível**: Fallback para modelo padrão via AI Studio
3. **Token expirado**: Redirecionar para configuração no AI Studio
4. **Limite excedido**: Sugerir truncar contexto ou trocar modelo

## 📝 Logs e Auditoria

### Logs de Sistema Híbrido

```typescript
// Vercel AI SDK ativo
console.log("🚀 [MIGRATION] Usando Vercel AI SDK via adapter");

// Sistema legacy (fallback)
console.log("🔄 [LEGACY] Usando sistema atual de streaming");

// Fallback automático
console.error("🔴 [MIGRATION] Erro no Vercel AI SDK, fallback:", error);
```

### Metadata de Mensagens

Cada mensagem salva metadata relevante:

```json
{
  "requestedModel": "gpt-4",
  "actualModelUsed": "gpt-4",
  "providerId": "vercel-ai-sdk", // ou provider específico
  "providerName": "Vercel AI SDK", // ou "OpenAI", "Anthropic"
  "migration": "subetapa-6", // Identificação do sistema híbrido
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

- [ ] Remoção gradual do sistema legacy
- [ ] Suporte a múltiplos agentes via Vercel AI SDK
- [ ] Tools/Functions integration
- [ ] Structured output capabilities
- [ ] Métricas detalhadas de fallback
- [ ] Cache de respostas comuns
- [ ] Compressão de histórico
- [ ] Webhooks para integrações

---

**🎉 Backend híbrido robusto: Vercel AI SDK como principal + Sistema legacy como fallback confiável!**
