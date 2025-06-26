# Plano de Ação: Correção do Bug no Modal "Editar Chat"

- **Data:** 2025-07-26
- **Status:** Planejado
- **Responsável:** Agente Kodix
- **Issue Relacionada:** O modal "Editar Chat" não salva as alterações (em particular, a seleção do modelo).

---

## 1. Resumo do Problema

Ao tentar editar uma sessão de chat através do modal "Editar Chat", qualquer alteração feita, especialmente a mudança do modelo de IA, não é salva ao clicar no botão "Atualizar". A operação falha silenciosamente, sem exibir mensagens de erro no console ou na interface do usuário.

## 2. Análise da Causa Raiz

A investigação do código-fonte em `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/app-sidebar.tsx` revelou uma inconsistência crítica na implementação da mutação tRPC responsável por atualizar a sessão.

- **Causa Principal:** A mutação `updateSessionMutation` está definida usando uma sintaxe (`{ mutationFn: ... }`) que se desvia do padrão arquitetural do projeto. O padrão correto, utilizado em todas as outras mutações do arquivo e documentado em `docs/architecture/trpc-patterns.md`, é o uso do helper `.mutationOptions({})`.

Essa implementação incorreta faz com que os callbacks `onSuccess` e `onError` não sejam disparados adequadamente, explicando por que a UI não atualiza e por que nenhum erro é exibido.

## 3. Estratégia Escolhida

A estratégia adotada é a **Estratégia 1: Correção Direta e Padronização**.

Esta abordagem foca em resolver a causa raiz do problema, alinhando o código com os padrões arquiteturais estabelecidos, o que garante a correção do bug e melhora a manutenibilidade do código.

## 4. Plano de Ação Detalhado

O plano será executado no seguinte arquivo:

- `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/app-sidebar.tsx`

### Etapa 1: Padronizar a `updateSessionMutation`

Vou refatorar a definição da `updateSessionMutation` para utilizar o padrão `.mutationOptions({})`, conforme o exemplo abaixo:

```typescript
// De:
const updateSessionMutation = useMutation({
  mutationFn: trpc.app.chat.atualizarSession.mutate,
  onSuccess: (updatedData) => {
    /* ... */
  },
  onError: (error: any) => {
    /* ... */
  },
});

// Para:
const updateSessionMutation = useMutation(
  trpc.app.chat.atualizarSession.mutationOptions({
    onSuccess: (updatedData) => {
      /* Lógica de sucesso aqui */
    },
    onError: (error: any) => {
      /* Lógica de erro aqui */
    },
  }),
);
```

### Etapa 2: Otimizar o Callback `onSuccess`

Para uma melhor experiência do usuário e alinhamento com as melhores práticas do projeto (documentadas em `docs/subapps/chat/chat-architecture.md`), vou substituir a invalidação completa da query por uma atualização otimista e cirúrgica do cache local usando `queryClient.setQueryData`.

```typescript
// Lógica a ser implementada no onSuccess:
onSuccess: (updatedData) => {
  // Atualiza o cache da lista de sessões de forma otimista
  queryClient.setQueryData(
    trpc.app.chat.listarSessions.queryKey,
    (oldData: { sessions: any[] } | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        sessions: oldData.sessions.map((session) =>
          session.id === updatedData.id
            ? { ...session, ...updatedData } // Garante a mescla completa dos dados
            : session
        ),
      };
    }
  );

  // Invalida a query específica da sessão para garantir dados frescos na próxima visita
  queryClient.invalidateQueries(
    trpc.app.chat.buscarSession.pathFilter({ id: updatedData.id })
  );

  toast.success(t("apps.chat.sessions.updated"));
  setShowEditSession(false);
  setEditingSession(null);
},
```

### Etapa 3: Validação e Testes

Após a implementação, realizarei os seguintes testes manuais para garantir que o bug foi corrigido e nenhuma regressão foi introduzida:

1.  Abrir o modal "Editar Chat" para uma sessão existente.
2.  Alterar o título, a pasta e, mais importante, o modelo de IA.
3.  Clicar em "Atualizar".
4.  **Verificar:**
    - A notificação de sucesso ("Sessão atualizada com sucesso") deve aparecer.
    - O modal deve fechar.
    - O título da sessão na sidebar deve ser atualizado instantaneamente.
5.  Reabrir o modal para a mesma sessão e verificar se as alterações (título, pasta e modelo) foram persistidas corretamente.
6.  Recarregar a página e confirmar que as alterações ainda estão salvas.

## 5. Próximos Passos

1.  Executar as etapas do plano de ação.
2.  Após a validação bem-sucedida, marcar esta tarefa como concluída.

---
