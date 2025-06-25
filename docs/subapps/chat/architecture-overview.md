# Arquitetura Completa - Chat SubApp

## 📋 Estado Atual (Janeiro 2025)

O Chat SubApp implementa uma **arquitetura thread-first moderna** usando React + Next.js no frontend e tRPC + Vercel AI SDK nativo no backend, oferecendo uma experiência de chat em tempo real com streaming inteligente e auto-save.

**Status:** ✅ Sistema 100% funcional pós-migração para thread-first  
**Testes:** 13/13 suites passando  
**Performance:** Otimizada (~200ms primeira mensagem)

## 🏗️ Arquitetura Geral

```mermaid
graph TB
    subgraph "Frontend (React + Next.js)"
        UI[UnifiedChatPage]
        Sidebar[AppSidebar]
        Chat[ChatWindow]
        Thread[ChatThreadProvider]
        Hooks[Custom Hooks]
    end

    subgraph "API Layer (tRPC)"
        Router[Chat Router]
        Handlers[Route Handlers]
        Stream[/api/chat/stream]
    end

    subgraph "Service Layer"
        AiStudio[AI Studio Service]
        ChatService[Chat Service]
        Repos[Repositories]
    end

    subgraph "Data Layer"
        DB[(Database)]
        Models[AI Models]
        Providers[AI Providers]
    end

    UI --> Thread
    Thread --> Hooks
    Hooks --> Router
    Router --> Handlers
    Stream --> AiStudio
    Handlers --> ChatService
    ChatService --> Repos
    Repos --> DB
    AiStudio --> Models
    Models --> Providers
```

## 🎯 Frontend Architecture

### Componente Unificado Principal

```typescript
// UnifiedChatPage - Componente central
export function UnifiedChatPage({ sessionId, locale }: UnifiedChatPageProps) {
  const [selectedSessionId, setSelectedSessionId] = useState(sessionId);
  const [selectedModelId, setSelectedModelId] = useState<string>();

  // Hooks para configurações e modelo preferido
  const { savePreferredModel } = useChatUserConfig();
  const { modelId: preferredModelId } = useChatPreferredModel();

  // Navegação centralizada
  const handleSessionSelect = (sessionId: string | undefined) => {
    setSelectedSessionId(sessionId);
    router.push(sessionId ? `/apps/chat/${sessionId}` : '/apps/chat');
  };

  return (
    <SidebarProvider>
      <AppSidebar
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
      />
      <ChatWindow
        sessionId={selectedSessionId}
        onNewSession={handleSessionSelect}
      />
    </SidebarProvider>
  );
}
```

### Thread-First Architecture

#### ChatThreadProvider

```typescript
// Provider para gerenciamento de threads
export function ChatThreadProvider({ children }: ChatThreadProviderProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>();

  const createThread = useCallback(async (options?: CreateThreadOptions) => {
    // 1. Criar sessão no backend
    const result = await queryClient.fetchMutation(
      trpc.app.chat.createEmptySession.mutationOptions()
    );

    // 2. Criar thread local
    const newThread: Thread = {
      id: result.session.id,
      title: result.session.title,
      messages: [],
      metadata: { messageCount: 0 }
    };

    // 3. Adicionar e ativar
    setThreads(prev => [...prev, newThread]);
    setActiveThreadId(newThread.id);

    return newThread;
  }, [queryClient]);

  return (
    <ThreadContext.Provider value={{
      threads,
      activeThreadId,
      createThread,
      updateThread,
      deleteThread,
      switchToThread
    }}>
      {children}
    </ThreadContext.Provider>
  );
}
```

### useChat Integration

```typescript
// Hook principal para chat com streaming
export function useThreadChat(options?: UseThreadChatOptions) {
  const { activeThread, createThread } = useThreadContext();

  const { messages, input, handleSubmit, append, isLoading } = useChat({
    api: "/api/chat/stream",
    initialMessages: activeThread?.messages || [],
    body: { chatSessionId: activeThread?.id },
    onFinish: async (message) => {
      // Auto-focus e sincronização
      setTimeout(() => inputRef.current?.focus(), 100);
      await syncFromDB();
    },
  });

  return {
    thread: activeThread,
    messages,
    input,
    isLoading,
    handleSubmit,
    append,
    createNewThread,
  };
}
```

### Sistema Híbrido de Mensagens

```typescript
// Gerenciamento híbrido: Thread Context + sessionStorage
class HybridMessageStorage {
  static getPendingMessage(sessionId: string, threadContext: any) {
    // 1. Thread context primeiro
    if (threadContext?.getPendingMessage) {
      const message = threadContext.getPendingMessage();
      if (message?.trim()) {
        return { pendingMessage: message, source: "thread-context" };
      }
    }

    // 2. Fallback para sessionStorage
    const sessionMsg = sessionStorage.getItem(`pending-message-${sessionId}`);
    if (sessionMsg?.trim()) {
      return { pendingMessage: sessionMsg, source: "sessionStorage" };
    }

    return { pendingMessage: null, source: "none" };
  }
}
```

## ⚙️ Backend Architecture

### Streaming Endpoint Nativo

#### Implementação 100% Vercel AI SDK

```typescript
// /api/chat/stream/route.ts - Implementação nativa
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(request: NextRequest) {
  const { chatSessionId, content } = await request.json();

  // 1. Validação e preparação
  const session = await ChatService.findSessionById(chatSessionId);

  // 2. Salvar mensagem do usuário
  await ChatService.createMessage({
    chatSessionId: session.id,
    senderRole: "user",
    content,
    status: "ok",
  });

  // 3. Obter modelo via AI Studio Service
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

  // 4. Criar provider nativo
  const vercelModel = createVercelModel(model, token);

  // 5. 🎯 STREAMING NATIVO
  const result = streamText({
    model: vercelModel,
    messages: formattedMessages,
    temperature: 0.7,
    maxTokens: 4000,

    // ✅ LIFECYCLE CALLBACK NATIVO - Auto-save
    onFinish: async ({ text, usage, finishReason }) => {
      await ChatService.createMessage({
        chatSessionId: session.id,
        senderRole: "ai",
        content: text,
        status: "ok",
        metadata: {
          usage,
          finishReason,
          actualModelUsed: model.name,
          timestamp: new Date().toISOString(),
        },
      });
    },

    // ✅ ERROR HANDLING NATIVO
    onError: (error) => {
      console.error("🔴 [VERCEL_AI_NATIVE] Stream error:", error);
    },
  });

  // 6. Response nativa
  return result.toDataStreamResponse({
    headers: {
      "X-Powered-By": "Vercel-AI-SDK-Native",
    },
  });
}
```

### API Layer (tRPC)

#### Router Principal

```typescript
// Chat Router com todas as operações
export const chatRouter = {
  // Sessões
  listarSessions: protectedProcedure.query(async ({ ctx, input }) => {
    return await ChatService.findSessionsByTeam(ctx.auth.user.activeTeamId);
  }),

  buscarSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ChatService.findSessionById(input.sessionId);
    }),

  // Auto-criação thread-first
  createEmptySession: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        generateTitle: z.boolean().default(false),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ChatService.createEmptySession({
        ...input,
        teamId: ctx.auth.user.activeTeamId,
        userId: ctx.auth.user.id,
      });
    }),

  autoCreateSessionWithMessage: protectedProcedure
    .input(
      z.object({
        firstMessage: z.string(),
        useAgent: z.boolean().default(true),
        generateTitle: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ChatService.autoCreateWithMessage({
        ...input,
        teamId: ctx.auth.user.activeTeamId,
        userId: ctx.auth.user.id,
      });
    }),

  // Mensagens - Endpoint refatorado (Dez 2024)
  getMessages: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        order: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ChatService.getMessagesPaginated({
        ...input,
        teamId: ctx.auth.user.activeTeamId,
      });
    }),
} satisfies TRPCRouterRecord;
```

#### Padrões de Nomenclatura Estabelecidos

O Chat SubApp segue rigorosamente a convenção de nomenclatura em **inglês** para todos os endpoints tRPC:

- ✅ **Inglês**: `getMessages`, `createEmptySession`, `getPreferredModel`
- ❌ **Evitar**: Nomes em português ou com sufixos de teste

**Histórico de Refatoração (Dez 2024):**

- Migração completa de `buscarMensagensTest` → `getMessages`
- 11 componentes/hooks migrados
- Zero breaking changes
- 100% dos testes mantidos funcionais

## 🗄️ Data Layer

### Schema Principal

```sql
-- Sessões de chat
CREATE TABLE chatSession (
  id VARCHAR(21) PRIMARY KEY,
  title VARCHAR(255),
  teamId VARCHAR(21) NOT NULL,
  userId VARCHAR(21) NOT NULL,
  aiModelId VARCHAR(21),
  aiAgentId VARCHAR(21),
  chatFolderId VARCHAR(21),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (teamId) REFERENCES team(id),
  FOREIGN KEY (userId) REFERENCES user(id),
  FOREIGN KEY (aiModelId) REFERENCES aiModel(id)
);

-- Mensagens do chat
CREATE TABLE chatMessage (
  id VARCHAR(21) PRIMARY KEY,
  chatSessionId VARCHAR(21) NOT NULL,
  senderRole ENUM('user', 'ai', 'system') NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'ok',
  metadata JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (chatSessionId) REFERENCES chatSession(id) ON DELETE CASCADE
);
```

## 🔐 Segurança & Isolamento

### Team-based Isolation

```typescript
// Middleware de validação de team
const validateTeamAccess = async (sessionId: string, teamId: string) => {
  const session = await ChatSessionRepository.findById(sessionId);

  if (!session || session.teamId !== teamId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Sessão não encontrada",
    });
  }

  return session;
};
```

## 📊 Performance & Otimizações

### Frontend Optimizations

#### Cache Agressivo de Queries (Padrão Otimizado)

O `useSessionWithMessages` implementa uma estratégia de cache agressiva para minimizar chamadas à API, com `staleTime` de 5 minutos, melhorando significativamente a performance percebida ao navegar entre chats.

```typescript
// Exemplo de configuração em useSessionWithMessages.tsx
const messagesQueryOptions = useMemo(
  () => ({
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }),
  [sessionId],
);
```

#### Memoização Agressiva

```typescript
// Componentes memoizados
export const ModelSelector = memo(function ModelSelector(props) {
  const processedModels = useMemo(() => {
    return availableModels
      .filter(model => model.teamConfig?.enabled)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableModels]);

  const handleSelect = useCallback(async (modelId: string) => {
    await savePreferredModel(modelId);
    queryClient.invalidateQueries(['aiStudio', 'models']);
  }, [savePreferredModel, queryClient]);

  return <ModelSelectorUI />;
});
```

### Backend Optimizations

#### Streaming Nativo

- **Zero Abstração**: `streamText()` direto sem wrappers
- **Auto-save Integrado**: Via lifecycle callbacks nativos
- **Memory Efficient**: Sem buffers intermediários

## 🚨 Lições Críticas para Evolução

### 1. **Navegação Centralizada** 🔴 OBRIGATÓRIO

```typescript
// ✅ SEMPRE um único ponto de controle
const handleSessionSelect = (sessionId: string) => {
  router.push(`/apps/chat/${sessionId}`);
};

// ❌ NUNCA múltiplos router.push() simultâneos
// Causa: URLs inválidas como /apps/apps/chat/sessionId
```

### 2. **Hidratação React** 🔴 CRÍTICO

```typescript
// ✅ Thread context opcional sem quebrar SSR
const threadContext = useThreadContext();
const { switchToThread } = threadContext || {};

// ❌ EVITAR mudanças drásticas em hooks críticos
// Causa: Hydration mismatches
```

### 3. **Multi-Provider Compatibility** 🔴 IMPORTANTE

```typescript
// ✅ useChat - Compatível com qualquer provider
const { messages } = useChat({ api: "/api/chat/stream" });

// ❌ useAssistant - Apenas OpenAI Assistants API
```

## 🎯 Padrões de Qualidade de Código

### Convenções de Nomenclatura

1. **Endpoints tRPC**: Sempre em inglês, camelCase

   - ✅ `getMessages`, `createSession`, `updateModel`
   - ❌ `buscarMensagens`, `criarSessao`, `getMessagesTest`

2. **Campos de Schema**: Inglês consistente

   - ✅ `limit`, `page`, `order`, `teamId`
   - ❌ `limite`, `pagina`, `ordem`, `equipeId`

3. **Componentes React**: PascalCase descritivo
   - ✅ `ChatWindow`, `ModelSelector`, `TokenUsageBadge`
   - ❌ `Chat`, `ModelInfo`, `TokenBadge`

### Melhores Práticas de Implementação

1. **Migração Incremental**: Sempre com aliases temporários

   ```typescript
   // Fase 1: Criar novo schema
   export const getMessagesSchema = z.object({...});
   export const buscarMensagensSchema = getMessagesSchema; // Alias temporário

   // Fase 2: Migrar componentes gradualmente
   // Fase 3: Remover aliases após validação completa
   ```

2. **Validação Contínua**: Testes em cada etapa

   - Baseline antes da migração
   - Testes após cada componente migrado
   - Validação final de integração

3. **Zero Breaking Changes**: Prioridade máxima
   - Manter compatibilidade durante migração
   - Deprecar antes de remover
   - Documentar mudanças claramente

## 🔗 Referências

- **[Histórico de Migração](./planning/migration-history-unified.md)** - Lições aprendidas e padrões validados
- **[Plano de Evolução](./planning/assistant-ui-evolution-plan.md)** - Roadmap SUB-FASES futuras
- **[Testes Completos](./testing-complete.md)** - Suíte de testes e validação

---

**Status:** ✅ **ARQUITETURA COMPLETA OPERACIONAL**

**Características Principais:**

- 🏗️ **Thread-First**: Arquitetura moderna e escalável
- ⚡ **Streaming Nativo**: Vercel AI SDK 100% nativo
- 🔐 **Segurança Enterprise**: Isolamento por team
- 📊 **Performance Otimizada**: Memoização e caching inteligente
- 🎯 **Developer Experience**: Type-safe com tRPC

**Documento otimizado:** Janeiro 2025  
**Redução:** ~65% do tamanho original mantendo informações essenciais
