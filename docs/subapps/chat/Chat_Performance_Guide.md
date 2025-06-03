# Chat Performance Optimization Guide

## 📖 Visão Geral

Este guia apresenta estratégias de otimização de performance específicas para o **Chat SubApp**, incluindo técnicas de caching, lazy loading, virtual scrolling e monitoramento de métricas críticas.

## ⚡ Métricas de Performance

### **Targets de Performance**

| Métrica                      | Target  | Crítico |
| ---------------------------- | ------- | ------- |
| **First Contentful Paint**   | < 1.2s  | < 2.0s  |
| **Time to Interactive**      | < 2.5s  | < 4.0s  |
| **Largest Contentful Paint** | < 2.5s  | < 4.0s  |
| **Cumulative Layout Shift**  | < 0.1   | < 0.25  |
| **First Input Delay**        | < 100ms | < 300ms |

### **Chat-Specific Metrics**

| Funcionalidade          | Target        | Descrição                            |
| ----------------------- | ------------- | ------------------------------------ |
| **Message Render Time** | < 50ms        | Tempo para renderizar nova mensagem  |
| **Streaming Speed**     | 20-30 chars/s | Velocidade do efeito de digitação    |
| **Session Load**        | < 500ms       | Tempo para carregar sessão existente |
| **Model Switch**        | < 200ms       | Tempo para trocar modelo             |

## 🎯 Otimizações Implementadas

### **1. React Query Caching**

#### **Cache Strategy**

```typescript
// Configuração otimizada de cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Chat sessions - cache por 10 minutos
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
    },
  },
});

// Cache específico por tipo de dados
const chatQueries = {
  sessions: {
    staleTime: 10 * 60 * 1000, // Sessions mudam pouco
    gcTime: 30 * 60 * 1000,
  },
  messages: {
    staleTime: 5 * 60 * 1000, // Messages podem ser mais frequentes
    gcTime: 15 * 60 * 1000,
  },
  models: {
    staleTime: 60 * 60 * 1000, // Models raramente mudam
    gcTime: 2 * 60 * 60 * 1000,
  },
};
```

#### **Invalidação Inteligente**

```typescript
// ✅ Invalidação granular - só o necessário
const handleSendMessage = useMutation({
  mutationFn: sendMessage,
  onSuccess: (data, variables) => {
    // Invalida apenas mensagens da sessão específica
    queryClient.invalidateQueries({
      queryKey: ["chat", "messages", variables.sessionId],
    });

    // Não invalida outras sessões ou modelos
    // Atualiza lastActivity da sessão sem invalidar lista completa
    queryClient.setQueryData(["chat", "sessions"], (oldData: ChatSession[]) =>
      oldData?.map((session) =>
        session.id === variables.sessionId
          ? { ...session, lastActivity: new Date() }
          : session,
      ),
    );
  },
});

// ❌ EVITAR - Invalidação ampla demais
queryClient.invalidateQueries(["chat"]); // Invalida TUDO
```

### **2. Component Memoization**

#### **Message Component Optimization**

```typescript
// ✅ Memoização otimizada
const Message = memo(({
  message,
  isNewMessage,
  onTypingComplete
}: MessageProps) => {
  // Só renderiza novamente se props essenciais mudaram
  return (
    <div className="message-container">
      <MessageContent content={message.content} />
      {isNewMessage && (
        <TypingEffect
          text={message.content}
          onComplete={onTypingComplete}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isNewMessage === nextProps.isNewMessage
  );
});

// ✅ Callback memoization
const ChatWindow = ({ sessionId }: ChatWindowProps) => {
  const handleTypingComplete = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isNewMessage: false }
          : msg
      )
    );
  }, []);

  // Evita re-render desnecessário de Message components
  return (
    <div>
      {messages.map(msg => (
        <Message
          key={msg.id}
          message={msg}
          isNewMessage={msg.isNewMessage}
          onTypingComplete={handleTypingComplete}
        />
      ))}
    </div>
  );
};
```

### **3. Virtual Scrolling (Futuro)**

#### **Implementação Planejada**

```typescript
// Para implementar quando sessões tiverem 500+ mensagens
import { FixedSizeList as List } from 'react-window';

const VirtualChatWindow = ({ messages }: Props) => {
  const listRef = useRef<List>(null);

  // Scroll automático para nova mensagem
  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToItem(messages.length - 1);
    }
  }, [messages.length]);

  const renderMessage = useCallback(({ index, style }: ListChildComponentProps) => (
    <div style={style}>
      <Message message={messages[index]} />
    </div>
  ), [messages]);

  return (
    <List
      ref={listRef}
      height={600}
      itemCount={messages.length}
      itemSize={80} // Altura estimada da mensagem
      itemData={messages}
    >
      {renderMessage}
    </List>
  );
};
```

### **4. Lazy Loading Components**

#### **Code Splitting**

```typescript
// ✅ Lazy loading de componentes pesados
const ModelSelector = lazy(() =>
  import('../components/model-selector').then(module => ({
    default: module.ModelSelector
  }))
);

const SessionEditModal = lazy(() =>
  import('../components/session-edit-modal')
);

// ✅ Uso com Suspense
const ChatPage = () => (
  <div>
    <Suspense fallback={<ModelSelectorSkeleton />}>
      <ModelSelector />
    </Suspense>

    <Suspense fallback={<div>Carregando editor...</div>}>
      {showEditModal && <SessionEditModal />}
    </Suspense>
  </div>
);
```

#### **Dynamic Imports**

```typescript
// ✅ Import dinâmico baseado em condições
const loadAdvancedFeatures = async () => {
  if (user.plan === "premium") {
    const { AdvancedChatFeatures } = await import("./advanced-features");
    return AdvancedChatFeatures;
  }
  return null;
};

// ✅ Lazy loading de utilidades pesadas
const processLargeFile = async (file: File) => {
  const { processFile } = await import("./file-processor");
  return processFile(file);
};
```

### **5. Image and Asset Optimization**

```typescript
// ✅ Next.js Image com otimização
import Image from 'next/image';

const Avatar = ({ src, alt }: AvatarProps) => (
  <Image
    src={src}
    alt={alt}
    width={40}
    height={40}
    className="rounded-full"
    priority={false} // Não é critical
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // Base64 pequeno
  />
);

// ✅ Preload de recursos críticos
const preloadCriticalAssets = () => {
  // Preload de fontes importantes
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/fonts/inter-var.woff2';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};
```

## 🎣 Hooks Otimizados

### **useChatPreferredModel Optimization**

```typescript
const useChatPreferredModel = () => {
  // ✅ Cache com duração mais longa para dados estáveis
  const { data: chatConfig } = useChatConfig({
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,
  });

  const { data: defaultModel } = api.aiStudio.getDefaultModel.useQuery(
    undefined,
    {
      enabled: !chatConfig?.lastSelectedModelId,
      staleTime: 60 * 60 * 1000, // 1 hora - raramente muda
      gcTime: 2 * 60 * 60 * 1000,
    },
  );

  // ✅ Memoização do resultado final
  return useMemo(() => {
    if (chatConfig?.lastSelectedModelId) {
      return {
        modelId: chatConfig.lastSelectedModelId,
        source: "chat_config" as const,
        isReady: true,
      };
    }

    if (defaultModel) {
      return {
        modelId: defaultModel.id,
        source: "ai_studio_default" as const,
        isReady: true,
      };
    }

    return {
      modelId: null,
      source: null,
      isReady: false,
    };
  }, [chatConfig?.lastSelectedModelId, defaultModel]);
};
```

### **useAutoCreateSession Debouncing**

```typescript
const useAutoCreateSession = ({ onSessionCreated }: Props) => {
  // ✅ Debounce para evitar múltiplas criações
  const debouncedCreateSession = useMemo(
    () =>
      debounce(async (params: CreateSessionParams) => {
        const session = await createSessionMutation.mutateAsync(params);
        onSessionCreated(session.id);
        return session;
      }, 300),
    [createSessionMutation, onSessionCreated],
  );

  const createSessionAndSendMessage = useCallback(
    async (params: SendMessageParams) => {
      // Evita race conditions
      if (createSessionMutation.isPending) {
        return;
      }

      const session = await debouncedCreateSession({
        title: generateTitle(params.content),
        aiModelId: params.modelId,
        chatFolderId: params.folderId,
      });

      // Enviar mensagem imediatamente após criação
      await sendMessageMutation.mutateAsync({
        sessionId: session.id,
        content: params.content,
        role: "user",
      });
    },
    [debouncedCreateSession, sendMessageMutation],
  );

  return { createSessionAndSendMessage };
};
```

## 📊 Bundle Optimization

### **Webpack Analysis**

```bash
# Analisar bundle do Chat
pnpm build
pnpm analyze

# Comando para análise específica
ANALYZE=true pnpm build
```

### **Bundle Splitting Strategy**

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "lucide-react",
    ],
  },

  webpack: (config) => {
    // Split vendors importantes
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,

      // Chunk específico para AI libraries
      aiLibs: {
        test: /[\\/]node_modules[\\/](openai|anthropic|google-ai)[\\/]/,
        name: "ai-libs",
        chunks: "all",
        priority: 20,
      },

      // Chunk para UI components
      uiComponents: {
        test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
        name: "ui-components",
        chunks: "all",
        priority: 15,
      },
    };

    return config;
  },
};
```

## 🔍 Performance Monitoring

### **Core Web Vitals Tracking**

```typescript
// utils/performance-tracker.ts
export const trackChatPerformance = () => {
  // Track custom metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'chat-message-render') {
        // Track message render time
        analytics.track('chat_message_render_time', {
          duration: entry.duration,
          entryType: entry.entryType,
        });
      }
    }
  });

  observer.observe({ entryTypes: ['measure'] });

  // Track streaming speed
  const trackStreamingSpeed = (messageLength: number, duration: number) => {
    const charsPerSecond = messageLength / (duration / 1000);
    analytics.track('chat_streaming_speed', {
      chars_per_second: charsPerSecond,
      message_length: messageLength,
      duration_ms: duration,
    });
  };

  return { trackStreamingSpeed };
};

// Component usage
const Message = ({ content, isNewMessage }: MessageProps) => {
  useEffect(() => {
    if (isNewMessage) {
      performance.mark('message-render-start');
    }
  }, [isNewMessage]);

  const handleTypingComplete = useCallback(() => {
    performance.mark('message-render-end');
    performance.measure(
      'chat-message-render',
      'message-render-start',
      'message-render-end'
    );
  }, []);

  return (
    <TypingEffect
      text={content}
      onComplete={handleTypingComplete}
    />
  );
};
```

### **Real User Monitoring (RUM)**

```typescript
// hooks/usePerformanceMonitoring.ts
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor navigation timing
    const navigationEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    const metrics = {
      dns_lookup:
        navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
      tcp_connect: navigationEntry.connectEnd - navigationEntry.connectStart,
      request_time: navigationEntry.responseEnd - navigationEntry.requestStart,
      dom_interactive:
        navigationEntry.domInteractive - navigationEntry.navigationStart,
      dom_complete:
        navigationEntry.domComplete - navigationEntry.navigationStart,
    };

    // Send to analytics
    analytics.track("chat_page_performance", metrics);

    // Monitor LCP for chat messages
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      analytics.track("chat_lcp", {
        value: lastEntry.startTime,
        url: window.location.pathname,
      });
    });

    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    return () => lcpObserver.disconnect();
  }, []);
};
```

## 🛠️ Development Tools

### **Performance Profiling**

```typescript
// utils/dev-performance.ts
export const profileChatComponent = (componentName: string) => {
  if (process.env.NODE_ENV !== "development") return;

  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`🔍 ${componentName} render time: ${duration.toFixed(2)}ms`);

      if (duration > 16.67) {
        // > 1 frame at 60fps
        console.warn(`⚠️ ${componentName} slow render detected`);
      }
    },
  };
};

// Usage in components
const ChatWindow = () => {
  const profiler = profileChatComponent("ChatWindow");

  useEffect(() => {
    profiler?.end();
  });

  // ... component logic
};
```

### **Bundle Analysis Commands**

```bash
# Analisar tamanho específico do Chat
npx next-bundle-analyzer

# Ver dependências do Chat
pnpm why react-query
pnpm why @tanstack/react-query

# Verificar duplicações
npx duplicate-package-checker-webpack-plugin

# Performance audit
npx lighthouse http://localhost:3000/apps/chat --output html --output-path ./chat-lighthouse.html
```

## 📈 Optimization Roadmap

### **Fase 1: Implementado ✅**

- [x] React Query caching otimizado
- [x] Component memoization
- [x] Code splitting básico
- [x] Image optimization
- [x] Performance monitoring básico

### **Fase 2: Em Desenvolvimento 🚧**

- [ ] Virtual scrolling para mensagens longas
- [ ] Service Worker para cache offline
- [ ] Preloading inteligente de sessões
- [ ] Streaming otimizado com Web Workers

### **Fase 3: Planejado 📋**

- [ ] Edge caching com Vercel Edge Functions
- [ ] Database query optimization
- [ ] CDN optimization para assets
- [ ] Advanced prefetching strategies

### **Métricas de Sucesso**

| Métrica            | Antes | Meta    | Status |
| ------------------ | ----- | ------- | ------ |
| **Bundle Size**    | 1.2MB | < 800KB | 🚧     |
| **TTI**            | 3.2s  | < 2.5s  | ✅     |
| **Message Render** | 80ms  | < 50ms  | ✅     |
| **Cache Hit Rate** | 65%   | > 85%   | 🚧     |

## 🔧 Troubleshooting Performance

### **Common Issues**

#### **Slow Message Rendering**

```typescript
// ❌ Problema comum
const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  // Re-render toda vez que qualquer mensagem muda
  return (
    <div>
      {messages.map(msg => (
        <Message key={msg.id} message={msg} /> // Sem memoization
      ))}
    </div>
  );
};

// ✅ Solução
const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const memoizedMessages = useMemo(() => messages, [messages]);

  return (
    <div>
      {memoizedMessages.map(msg => (
        <MemoizedMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
};
```

#### **Memory Leaks**

```typescript
// ❌ Memory leak comum
const useTypingEffect = (text: string) => {
  useEffect(() => {
    const interval = setInterval(() => {
      // Atualiza estado sem cleanup
    }, 50);

    // ❌ Não limpa interval
  }, [text]);
};

// ✅ Cleanup correto
const useTypingEffect = (text: string) => {
  useEffect(() => {
    const interval = setInterval(() => {
      // Atualiza estado
    }, 50);

    return () => clearInterval(interval); // ✅ Cleanup
  }, [text]);
};
```

### **Performance Debugging Tools**

```typescript
// Debug queries lentas
const debugSlowQueries = () => {
  if (process.env.NODE_ENV === "development") {
    const originalQuery = queryClient.getQueryCache();

    // Log queries que demoram mais de 1s
    originalQuery.subscribe((event) => {
      if (
        event.type === "updated" &&
        event.query.state.fetchStatus === "fetching"
      ) {
        const start = Date.now();

        event.query.promise?.finally(() => {
          const duration = Date.now() - start;
          if (duration > 1000) {
            console.warn(`🐌 Slow query detected:`, {
              queryKey: event.query.queryKey,
              duration: `${duration}ms`,
            });
          }
        });
      }
    });
  }
};
```

---

## 📚 Recursos Relacionados

- **[Chat Development Guide](./Chat_Development_Guide.md)** - Padrões de desenvolvimento
- **[Performance Best Practices](../../architecture/performance-guide.md)** - Padrões gerais
- **[React Query Performance](https://tanstack.com/query/v4/docs/guides/performance)** - Documentação oficial
- **[Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)** - Guia oficial

---

**📝 Última atualização**: Janeiro 2025 | **⚡ Stack**: Next.js 14 + React Query | **🎯 Target**: < 2.5s TTI
