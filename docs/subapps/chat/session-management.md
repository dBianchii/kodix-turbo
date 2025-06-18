# Session Management - Chat SubApp

## 💬 Visão Geral

O sistema de gerenciamento de sessões do Chat permite organizar conversas em contextos separados, mantendo histórico e configurações independentes.

## 🏗️ Estrutura de Sessões

### Modelo de Dados

```typescript
interface ChatSession {
  id: string; // ID único (nanoid)
  title: string; // Título da conversa
  teamId: string; // ID do time (isolamento)
  userId: string; // Criador da sessão
  aiModelId?: string; // Modelo de IA selecionado
  aiAgentId?: string; // Agente selecionado (futuro)
  createdAt: Date; // Data de criação
  updatedAt: Date; // Última atualização
}
```

### Ciclo de Vida

1. **Criação**: Automática ou manual
2. **Ativa**: Em uso para conversação
3. **Inativa**: Sem uso recente
4. **Arquivada**: Mantida para histórico

## 🚀 Criação de Sessões

### Auto-criação

Quando usuário envia primeira mensagem sem sessão ativa:

```typescript
// Handler autoCreateSessionWithMessage
export const autoCreateSessionWithMessage = async ({ ctx, input }) => {
  // 1. Criar nova sessão
  const session = await ChatSessionRepository.create({
    title: "Nova Conversa",
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
    aiModelId: input.modelId,
  });

  // 2. Criar primeira mensagem
  const message = await ChatMessageRepository.create({
    chatSessionId: session.id,
    senderRole: "user",
    content: input.content,
    status: "ok",
  });

  // 3. Gerar título baseado no conteúdo
  const title = await generateTitle(input.content);
  await ChatSessionRepository.update(session.id, { title });

  return { session, message };
};
```

### Criação Manual

Usuário clica em "Nova Conversa":

```typescript
// Frontend
const createNewSession = async () => {
  const { data } = await createSessionMutation.mutateAsync({
    title: "Nova Conversa",
  });

  setActiveSessionId(data.id);
};
```

## 📋 Listagem e Busca

### Buscar Sessões

```typescript
// Repository
export const findByUser = async (userId: string, teamId: string) => {
  return db.query.chatSession.findMany({
    where: and(eq(chatSession.userId, userId), eq(chatSession.teamId, teamId)),
    orderBy: [desc(chatSession.updatedAt)],
    with: {
      messages: {
        limit: 1,
        orderBy: [desc(chatMessage.createdAt)],
      },
    },
  });
};
```

### Filtros Disponíveis

- **Por data**: Hoje, Últimos 7 dias, Último mês
- **Por modelo**: GPT-4, Claude, etc.
- **Por status**: Ativas, Arquivadas
- **Busca textual**: No título ou conteúdo

## 🔄 Atualização de Sessões

### Mudança de Título

```typescript
// Atualização manual
const updateTitle = async (sessionId: string, newTitle: string) => {
  await updateSessionMutation.mutateAsync({
    id: sessionId,
    title: newTitle,
  });
};

// Geração automática
const generateTitle = async (firstMessage: string) => {
  // Usar IA para gerar título baseado no conteúdo
  const title = await ai.generateTitle(firstMessage);
  return title.slice(0, 100); // Limitar tamanho
};
```

### Mudança de Modelo

```typescript
// Trocar modelo durante conversa
const changeModel = async (sessionId: string, modelId: string) => {
  await updateSessionMutation.mutateAsync({
    id: sessionId,
    aiModelId: modelId,
  });

  // Notificar usuário
  toast.success("Modelo alterado com sucesso");
};
```

## 🗑️ Exclusão e Arquivamento

### Soft Delete (Recomendado)

```typescript
// Marcar como arquivada
const archiveSession = async (sessionId: string) => {
  await updateSessionMutation.mutateAsync({
    id: sessionId,
    status: "archived",
  });
};
```

### Hard Delete

```typescript
// Excluir permanentemente (com confirmação)
const deleteSession = async (sessionId: string) => {
  const confirmed = await confirm("Excluir conversa permanentemente?");

  if (confirmed) {
    await deleteSessionMutation.mutateAsync({ id: sessionId });
  }
};
```

## 💾 Persistência e Cache

### Cache Local

```typescript
// Hook para cache de sessão ativa
export function useActiveSession() {
  const [sessionId, setSessionId] = useLocalStorage("activeSessionId");

  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return { session, setSessionId };
}
```

### Sincronização

```typescript
// Sincronizar mudanças entre abas
window.addEventListener("storage", (e) => {
  if (e.key === "activeSessionId") {
    setActiveSessionId(e.newValue);
  }
});
```

## 🔐 Segurança e Isolamento

### Validação de Acesso

```typescript
// Sempre verificar ownership
const validateAccess = async (sessionId: string, userId: string) => {
  const session = await findById(sessionId);

  if (!session || session.userId !== userId) {
    throw new Error("Acesso negado");
  }

  return session;
};
```

### Isolamento por Team

```typescript
// Queries sempre filtradas por team
const sessions = await db.query.chatSession.findMany({
  where: eq(chatSession.teamId, teamId),
});
```

## 📊 Métricas e Analytics

### Dados Coletados

- **Sessões por usuário**: Quantidade e frequência
- **Duração média**: Tempo de conversação
- **Mensagens por sessão**: Volume de interação
- **Modelos mais usados**: Preferências do time

### Dashboard de Uso

```typescript
// Estatísticas agregadas
const getSessionStats = async (teamId: string) => {
  const stats = await db
    .select({
      totalSessions: count(),
      avgMessages: avg(messagesCount),
      mostUsedModel: sql`MODE(ai_model_id)`,
    })
    .from(chatSession)
    .where(eq(chatSession.teamId, teamId));

  return stats;
};
```

## 🎨 Interface de Gerenciamento

### Lista de Sessões (Sidebar)

```typescript
function SessionList({ sessions, activeId, onSelect }) {
  return (
    <div className="space-y-2">
      {sessions.map(session => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={session.id === activeId}
          onClick={() => onSelect(session.id)}
        />
      ))}
    </div>
  );
}
```

### Item de Sessão

```typescript
function SessionItem({ session, isActive, onClick }) {
  return (
    <div
      className={cn(
        "p-3 rounded cursor-pointer hover:bg-gray-800",
        isActive && "bg-gray-700"
      )}
      onClick={onClick}
    >
      <h3 className="font-medium truncate">{session.title}</h3>
      <p className="text-sm text-gray-400">
        {formatRelativeTime(session.updatedAt)}
      </p>
    </div>
  );
}
```

## 🚀 Otimizações

### Lazy Loading

```typescript
// Carregar sessões sob demanda
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["sessions"],
  queryFn: ({ pageParam = 0 }) => fetchSessions({ offset: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextOffset,
});
```

### Virtualização

```typescript
// Para listas muito grandes
import { VirtualList } from "@tanstack/react-virtual";

function VirtualSessionList({ sessions }) {
  const virtualizer = useVirtualizer({
    count: sessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      {virtualizer.getVirtualItems().map(virtualItem => (
        <SessionItem
          key={sessions[virtualItem.index].id}
          session={sessions[virtualItem.index]}
        />
      ))}
    </div>
  );
}
```

## 🔄 Próximas Melhorias

### Planejadas

- [ ] **Folders**: Organizar sessões em pastas
- [ ] **Tags**: Sistema de etiquetas
- [ ] **Compartilhamento**: Links públicos para sessões
- [ ] **Export**: Baixar conversas em PDF/Markdown
- [ ] **Templates**: Sessões pré-configuradas
