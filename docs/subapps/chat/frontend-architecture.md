# Frontend Architecture - Chat SubApp

## 📱 Visão Geral

O frontend do Chat foi construído usando React com Next.js App Router, oferecendo uma interface moderna e responsiva para conversação com IA.

## 🏗️ Estrutura de Componentes

### Componentes Principais

#### `ChatWindow`

- **Localização**: `_components/chat-window.tsx`
- **Responsabilidade**: Container principal que gerencia o estado global do chat
- **Características**:
  - Gerencia lista de sessões
  - Controla sessão ativa
  - Coordena comunicação entre sidebar e área de chat

#### `ChatSidebar`

- **Localização**: `_components/chat-sidebar.tsx`
- **Responsabilidade**: Lista de sessões de chat
- **Funcionalidades**:
  - Exibir todas as sessões do usuário
  - Criar nova sessão
  - Buscar sessões
  - Deletar sessões

#### `ChatWindowSession`

- **Localização**: `_components/chat-window-session.tsx`
- **Responsabilidade**: Área principal de conversação
- **Componentes internos**:
  - `ChatHeader`: Título e seletor de modelo
  - `ChatMessages`: Lista de mensagens
  - `ChatInput`: Campo de entrada de texto

#### `Message`

- **Localização**: `_components/message.tsx`
- **Responsabilidade**: Renderização individual de mensagens
- **Variações**:
  - Mensagem do usuário
  - Mensagem da IA (com streaming)
  - Mensagem do sistema

## 🎨 Interface e UX

### Design System

- **Tema**: Dark mode por padrão (`bg-slate-950`)
- **Componentes UI**: Shadcn/ui
- **Ícones**: Lucide React
- **Animações**: Framer Motion para transições suaves

### Layout Responsivo

```tsx
// Layout principal com sidebar colapsável
<div className="flex h-screen">
  {/* Sidebar - oculta em mobile */}
  <div className="hidden w-64 md:flex">
    <ChatSidebar />
  </div>

  {/* Área principal */}
  <div className="flex-1">
    <ChatWindowSession />
  </div>
</div>
```

## 🔄 Gerenciamento de Estado

### Estado Local

- **Sessão Ativa**: Gerenciada no `ChatWindow`
- **Mensagens**: Mantidas no componente de sessão
- **Input**: Controlado localmente no `ChatInput`

### Integração com tRPC

```tsx
// Hook para buscar sessões
const { data: sessions } = useQuery(trpc.app.chat.buscarSessoes.queryOptions());

// Mutation para enviar mensagem
const sendMessage = useMutation(trpc.app.chat.enviarMensagem.mutationOptions());
```

### Streaming de Respostas

O streaming é implementado usando a API nativa de Streams:

```tsx
// Componente simplificado de streaming
function StreamingMessage({ sessionId, content }) {
  const [streamedText, setStreamedText] = useState("");

  useEffect(() => {
    const stream = new EventSource(`/api/chat/stream?sessionId=${sessionId}`);

    stream.onmessage = (event) => {
      setStreamedText((prev) => prev + event.data);
    };

    return () => stream.close();
  }, [sessionId]);

  return <div>{streamedText}</div>;
}
```

## 🎯 Funcionalidades Chave

### Auto-criação de Sessão

- Primeira mensagem cria sessão automaticamente
- Hook `useAutoCreateSession` gerencia o processo
- Título gerado baseado no conteúdo

### Seleção de Modelo

- Dropdown integrado no header
- Consome modelos configurados no AI Studio via Service Layer
- Persiste seleção na sessão
- Fallback para modelo padrão do time

### Histórico de Mensagens

- Carregamento paginado
- Scroll automático para última mensagem
- Preserva contexto completo

## 🔧 Hooks Customizados

### `useAutoCreateSession`

```tsx
// Cria sessão automaticamente na primeira mensagem
const { createSession, isCreating } = useAutoCreateSession();
```

### `useStreamingMessage`

```tsx
// Gerencia streaming de resposta da IA
const { streamedContent, isStreaming } = useStreamingMessage(messageId);
```

### `useModelSelection`

```tsx
// Gerencia seleção e mudança de modelo (via AI Studio)
const { models, selectedModel, selectModel } = useModelSelection(sessionId);
```

## 📊 Performance

### Otimizações Implementadas

- **Virtualização**: Lista de mensagens usa virtualização para grandes conversas
- **Lazy Loading**: Sessões carregadas sob demanda
- **Debounce**: Input com debounce para evitar requisições excessivas
- **Memoização**: Componentes pesados são memoizados

### Code Splitting

```tsx
// Componentes carregados dinamicamente
const ChatWindow = dynamic(() => import("./_components/chat-window"), {
  ssr: false,
});
```

## 🎨 Exemplos de Uso

### Enviando Mensagem

```tsx
function ChatInput({ sessionId }) {
  const [message, setMessage] = useState("");
  const sendMessage = useSendMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage.mutate({
      sessionId,
      content: message,
      useAgent: true,
    });

    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
      />
    </form>
  );
}
```

### Renderizando Mensagem com Streaming

```tsx
function Message({ message, isStreaming }) {
  if (isStreaming) {
    return (
      <div className="flex items-start gap-3">
        <Avatar>AI</Avatar>
        <div className="flex-1">
          <StreamingContent sessionId={message.sessionId} />
          <span className="animate-pulse">▊</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar>{message.senderRole === "user" ? "U" : "AI"}</Avatar>
      <div className="flex-1">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}
```

## 🔗 Integração com Backend

### Endpoints Principais

- `buscarSessoes`: Lista todas as sessões
- `buscarMensagens`: Mensagens de uma sessão
- `enviarMensagem`: Cria mensagem e inicia streaming
- `atualizarSessao`: Atualiza título ou modelo

### Fluxo de Dados

1. **Usuário digita mensagem** → `ChatInput`
2. **Envia via tRPC** → Backend processa
3. **Inicia streaming** → `/api/chat/stream`
4. **Atualiza UI** → Mensagem aparece progressivamente
5. **Salva no banco** → Histórico persistido

## 📱 Responsividade

### Mobile

- Sidebar oculta por padrão
- Botão hambúrguer para abrir
- Input fixo no bottom
- Mensagens ocupam largura total

### Desktop

- Sidebar sempre visível
- Layout em duas colunas
- Atalhos de teclado ativos
- Hover states nos elementos

## 🚀 Próximos Passos

### Melhorias Planejadas

- [ ] Suporte a markdown avançado
- [ ] Upload de arquivos
- [ ] Compartilhamento de conversas
- [ ] Temas customizáveis
- [ ] Atalhos de teclado expandidos
