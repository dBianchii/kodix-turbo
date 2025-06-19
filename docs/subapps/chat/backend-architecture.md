# Backend Architecture - Chat SubApp

## ⚙️ Visão Geral

O backend do Chat é construído com tRPC para APIs type-safe e um endpoint HTTP dedicado para streaming. A arquitetura utiliza exclusivamente o **Vercel AI SDK** como engine de IA, com auto-save integrado e interface ultra-limpa, priorizando performance e integração segura com o AI Studio.

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

### Endpoint de Streaming Único

- **Rota**: `/api/chat/stream`
- **Método**: POST
- **Autenticação**: Via cookies de sessão
- **Protocolo**: Server-Sent Events (SSE)
- **Sistema**: Vercel AI SDK Exclusivo com Auto-Save

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

## 🔄 Fluxo de Processamento Único

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

O fluxo de envio envolve etapas simplificadas:

1. **Validação**: Verifica sessão e permissões
2. **Persistência**: Salva mensagem do usuário
3. **Streaming + Auto-Save**: Vercel AI SDK com salvamento automático
4. **Finalização**: Resposta completa salva automaticamente

### 3. Streaming com Auto-Save Integrado

```typescript
// Endpoint de streaming único e limpo
export async function POST(request: NextRequest) {
  // 1. Validar sessão e autenticação
  const { chatSessionId, content } = await request.json();
  const session = await ChatService.findSessionById(chatSessionId);

  // 2. SISTEMA VERCEL AI SDK (único sistema)
  console.log("🚀 [VERCEL_AI] Usando Vercel AI SDK");

  // Preparar mensagens e modelo
  const formattedMessages = await this.formatMessages(allMessages);
  const model = await this.getModelForSession(session);

  // 3. Criar adapter e processar streaming com auto-save
  const adapter = new VercelAIAdapter();
  const response = await adapter.streamAndSave(
    {
      chatSessionId: session.id,
      content,
      modelId: model.id,
      teamId: session.teamId,
      messages: formattedMessages,
    },
    async (content: string, metadata: any) => {
      // Callback para salvar mensagem da IA automaticamente
      await ChatService.createMessage({
        chatSessionId: session.id,
        senderRole: "ai",
        content,
        status: "ok",
        metadata,
      });
    },
  );

  // 4. Retornar stream com headers identificadores
  return new NextResponse(response.stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Powered-By": "Vercel-AI-SDK", // Identificação única
    },
  });
}
```

## 🔧 Sistema Único: VercelAIAdapter

### VercelAIAdapter (Sistema Único)

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.ts
export class VercelAIAdapter {
  /**
   * 🚀 Streaming simples sem auto-save
   */
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    console.log("🚀 [CHAT] Iniciando stream com Vercel AI SDK");

    // 1. Formatar mensagens para Vercel AI SDK
    const messages = this.formatMessages(params.messages);

    // 2. Obter modelo configurado
    const model = await this.getVercelModel(params.modelId, params.teamId);

    // 3. Executar streamText do Vercel AI SDK
    const result = await streamText({
      model,
      messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
    });

    // 4. Retornar stream no formato esperado
    return this.formatResponse(result);
  }

  /**
   * 🎯 INTERFACE ULTRA-LIMPA: Stream + Auto-Save
   * Método completo que faz streaming E salva automaticamente no banco
   */
  async streamAndSave(
    params: ChatStreamParams,
    saveMessageCallback: (content: string, metadata: any) => Promise<void>,
  ): Promise<ChatStreamResponse> {
    console.log("🚀 [CHAT] Iniciando stream com auto-save");

    // 1. Formatar mensagens para Vercel AI SDK
    const messages = this.formatMessages(params.messages);

    // 2. Obter modelo configurado
    const model = await this.getVercelModel(params.modelId, params.teamId);

    // 3. Executar streamText do Vercel AI SDK
    const result = await streamText({
      model,
      messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
    });

    // 4. Retornar stream com auto-save integrado
    return this.formatResponseWithSave(
      result,
      params.modelId,
      saveMessageCallback,
    );
  }

  /**
   * Mapeia modelos do AI Studio para Vercel AI SDK
   */
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

    // Criar provider baseado no tipo
    const providerName = modelConfig.provider.name.toLowerCase();
    const modelName = (modelConfig.config as any)?.version || modelConfig.name;

    if (providerName === "openai") {
      const openaiProvider = createOpenAI({
        apiKey: providerToken.token,
        baseURL: modelConfig.provider.baseUrl || undefined,
      });
      return openaiProvider(modelName);
    }

    if (providerName === "anthropic") {
      const anthropicProvider = createAnthropic({
        apiKey: providerToken.token,
        baseURL: modelConfig.provider.baseUrl || undefined,
      });
      return anthropicProvider(modelName);
    }

    throw new Error(
      `Provider ${modelConfig.provider.name} não suportado. Suportados: OpenAI, Anthropic.`,
    );
  }

  /**
   * 🎯 Formata resposta COM auto-save integrado
   */
  private formatResponseWithSave(
    vercelResult: any,
    modelId: string,
    saveMessageCallback: (content: string, metadata: any) => Promise<void>,
  ): ChatStreamResponse {
    let accumulatedText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of vercelResult.textStream) {
            // Acumular texto para salvamento posterior
            accumulatedText += chunk;
            // Enviar chunk para o cliente
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } finally {
          // 💾 AUTO-SAVE: Salvar mensagem completa no banco via callback
          if (accumulatedText.trim()) {
            try {
              const messageMetadata = {
                requestedModel: modelId,
                actualModelUsed: vercelResult.response?.modelId || modelId,
                providerId: "vercel-ai-sdk",
                providerName: "Vercel AI SDK",
                usage: vercelResult.usage || null,
                finishReason: vercelResult.finishReason || "stop",
                timestamp: new Date().toISOString(),
              };

              await saveMessageCallback(accumulatedText, messageMetadata);
              console.log("✅ [CHAT] Mensagem da IA salva automaticamente");
            } catch (saveError) {
              console.error("🔴 [CHAT] Erro ao salvar mensagem:", saveError);
            }
          }
          controller.close();
        }
      },
    });

    return {
      stream,
      metadata: {
        model: vercelResult.response?.modelId || "vercel-ai-sdk",
        usage: vercelResult.usage || null,
        finishReason: vercelResult.finishReason || "stop",
      },
    };
  }
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

- **Streaming Direto**: Vercel AI SDK com otimizações nativas
- **Auto-Save Assíncrono**: Salvamento não bloqueia streaming
- **Gestão Inteligente de Tokens**: Truncamento automático de contexto
- **Índices Otimizados**: Queries otimizadas com índices apropriados
- **Código Limpo**: Sem overhead de sistemas legacy (70% redução)

### Métricas Monitoradas

- Tempo de resposta do primeiro token
- Taxa de sucesso das APIs
- Throughput de streaming
- Uso de tokens por sessão
- Latência do auto-save

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

1. **Vercel AI SDK falha**: Logs detalhados para debugging
2. **Modelo não disponível**: Fallback para modelo padrão via AI Studio
3. **Token expirado**: Redirecionar para configuração no AI Studio
4. **Limite excedido**: Sugerir truncar contexto ou trocar modelo

## 📝 Logs e Auditoria

### Logs do Sistema Único

```typescript
// Vercel AI SDK (único sistema)
console.log("🚀 [VERCEL_AI] Usando Vercel AI SDK");

// Auto-save integrado
console.log("💾 [AUTO-SAVE] Mensagem salva automaticamente");

// Adapter logs
console.log("🔧 [CHAT] Processamento via VercelAIAdapter");
```

### Metadata de Mensagens

Cada mensagem salva metadata relevante:

```json
{
  "requestedModel": "gpt-4",
  "actualModelUsed": "gpt-4",
  "providerId": "vercel-ai-sdk",
  "providerName": "Vercel AI SDK",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 200,
    "totalTokens": 350
  },
  "finishReason": "stop",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔄 Benefícios da Arquitetura Atual

### Técnicos

- ✅ **Código 70% mais limpo** no endpoint principal
- ✅ **Manutenção simplificada** - apenas um caminho de código
- ✅ **Performance otimizada** - sem overhead de compatibilidade
- ✅ **Auto-save integrado** - streaming e persistência unificados
- ✅ **Interface ultra-limpa** - complexidade encapsulada no backend

### Operacionais

- ✅ **Debugging facilitado** - sem lógica condicional
- ✅ **Logs estruturados** - identificação clara do sistema
- ✅ **Monitoramento simplificado** - métricas unificadas
- ✅ **Configuração reduzida** - sem feature flags

### Estratégicos

- ✅ **Futuro-Proof**: Preparado para novos providers via Vercel AI SDK
- ✅ **Escalabilidade**: Arquitetura mais robusta e limpa
- ✅ **Padronização**: Alinhado com melhores práticas modernas
- ✅ **Flexibilidade**: Fácil extensão para novas funcionalidades

## 🎯 Próximas Melhorias

### Planejadas

- [ ] Tool calling para funções avançadas
- [ ] Structured output capabilities
- [ ] Suporte a mais providers via Vercel AI SDK
- [ ] Cache inteligente de respostas
- [ ] Métricas avançadas de performance
- [ ] Integração com agentes do AI Studio
- [ ] Webhooks para integrações

---

**🎉 Backend único e otimizado: Vercel AI SDK exclusivo com auto-save integrado e interface ultra-limpa!**
