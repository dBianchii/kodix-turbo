# Streaming Implementation - Chat SubApp

## 🔄 Visão Geral

O sistema de streaming do Chat permite que respostas da IA apareçam progressivamente, criando uma experiência mais fluida e responsiva.

## 🏗️ Arquitetura do Streaming

### Fluxo Completo

```
Frontend → tRPC (criar mensagem) → Backend → OpenAI API → SSE Stream → Frontend
```

1. **Frontend** envia mensagem via tRPC
2. **Backend** salva mensagem do usuário
3. **Backend** inicia request para API do provider
4. **Provider** retorna stream de tokens
5. **Backend** repassa stream para frontend
6. **Frontend** renderiza tokens progressivamente
7. **Backend** salva mensagem completa ao finalizar

## 📡 Implementação Backend

### Endpoint de Streaming

```typescript
// /api/chat/stream/route.ts
export async function POST(request: NextRequest) {
  // 1. Validar e buscar sessão
  const { chatSessionId, content } = await request.json();
  const session = await ChatService.findSessionById(chatSessionId);

  // 2. Criar mensagem do usuário
  const userMessage = await ChatService.createMessage({
    chatSessionId: session.id,
    senderRole: "user",
    content,
    status: "ok",
  });

  // 3. Configurar streaming com provider
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      stream: true,
    }),
  });

  // 4. Criar ReadableStream para repassar tokens
  const stream = new ReadableStream({
    async start(controller) {
      // ... lógica de streaming
    },
  });

  return new Response(stream);
}
```

### Processamento do Stream

```typescript
const stream = new ReadableStream({
  async start(controller) {
    let receivedText = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Salvar mensagem completa
          await ChatService.createMessage({
            chatSessionId,
            senderRole: "ai",
            content: receivedText,
            status: "ok",
            metadata: { model: modelName },
          });
          break;
        }

        // Processar chunk
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;

            if (delta) {
              receivedText += delta;
              controller.enqueue(new TextEncoder().encode(delta));
            }
          }
        }
      }
    } finally {
      controller.close();
    }
  },
});
```

## 🖥️ Implementação Frontend

### Hook de Streaming

```typescript
// hooks/useStreamingResponse.ts
export function useStreamingResponse(sessionId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  const startStreaming = async (content: string) => {
    setIsStreaming(true);
    setStreamedContent("");

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatSessionId: sessionId, content }),
        credentials: "include",
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setStreamedContent((prev) => prev + chunk);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return { isStreaming, streamedContent, startStreaming };
}
```

### Componente de Mensagem com Streaming

```typescript
function StreamingMessage({ content, isComplete }) {
  return (
    <div className="message ai-message">
      <div className="prose">
        <ReactMarkdown>{content}</ReactMarkdown>
        {!isComplete && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
}
```

## 🎯 Gestão de Estado Durante Streaming

### Estados da Mensagem

1. **Pending**: Mensagem enviada, aguardando resposta
2. **Streaming**: Recebendo tokens progressivamente
3. **Complete**: Streaming finalizado
4. **Error**: Erro durante streaming

### Indicadores Visuais

```typescript
// Diferentes estados visuais
function MessageStatus({ status }) {
  switch (status) {
    case "pending":
      return <Spinner className="animate-spin" />;

    case "streaming":
      return <span className="animate-pulse">▊</span>;

    case "error":
      return <AlertCircle className="text-red-500" />;

    default:
      return null;
  }
}
```

## 🔧 Tratamento de Erros

### Erros Comuns

1. **Conexão Interrompida**

```typescript
reader.read().catch((error) => {
  console.error("Stream interrupted:", error);
  controller.enqueue(
    new TextEncoder().encode("\n\n[Erro: Conexão interrompida]"),
  );
});
```

2. **Token Inválido**

```typescript
if (!response.ok) {
  if (response.status === 401) {
    throw new Error("Token inválido. Configure no AI Studio.");
  }
}
```

3. **Timeout**

```typescript
const timeout = setTimeout(() => {
  reader.cancel();
  controller.error(new Error("Timeout na resposta"));
}, 30000); // 30 segundos
```

## 📊 Otimizações de Performance

### Buffering

```typescript
// Acumular pequenos chunks antes de renderizar
let buffer = "";
let bufferTimeout;

function processChunk(chunk: string) {
  buffer += chunk;

  clearTimeout(bufferTimeout);
  bufferTimeout = setTimeout(() => {
    setStreamedContent((prev) => prev + buffer);
    buffer = "";
  }, 50); // 50ms de debounce
}
```

### Throttling de Renderização

```typescript
// Limitar atualizações da UI
const throttledSetContent = useThrottle((content: string) => {
  setStreamedContent(content);
}, 100); // Máximo 10 updates por segundo
```

## 🌐 Compatibilidade com Providers

### Compatibilidade com Providers

O Chat suporta streaming de múltiplos providers configurados no AI Studio:

- **OpenAI**: Formato SSE padrão
- **Anthropic**: Adaptador específico para Claude
- **Google**: Suporte para Gemini
- **Azure**: Compatível com OpenAI format

Para detalhes sobre configuração de providers, consulte [Provider Management](../ai-studio/provider-management.md).

## 🔐 Segurança

### Validações

1. **Autenticação**: Verificar sessão antes de streaming
2. **Rate Limiting**: Limitar requests por usuário
3. **Sanitização**: Limpar conteúdo antes de renderizar
4. **CORS**: Headers apropriados para SSE

### Headers de Segurança

```typescript
const headers = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  "X-Accel-Buffering": "no", // Desabilitar buffering nginx
  Connection: "keep-alive",
};
```

## 📈 Monitoramento

### Métricas Importantes

- **Time to First Token**: Tempo até primeiro caractere aparecer
- **Tokens per Second**: Velocidade de geração
- **Stream Duration**: Tempo total de streaming
- **Error Rate**: Taxa de falhas no streaming

### Logs de Debug

```typescript
console.log("🔵 [STREAM] Iniciando streaming");
console.log("🟢 [STREAM] Primeiro token recebido");
console.log("✅ [STREAM] Streaming completo:", {
  duration: Date.now() - startTime,
  totalTokens: receivedText.length,
});
```

## 🚀 Melhorias Futuras

### Planejadas

- [ ] **Resumable Streams**: Continuar de onde parou
- [ ] **Compression**: Comprimir stream para economizar banda
- [ ] **Multiplexing**: Múltiplos streams simultâneos
- [ ] **WebSockets**: Migrar para protocolo bidirecional
- [ ] **Edge Functions**: Processar streaming no edge
