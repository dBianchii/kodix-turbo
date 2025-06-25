# Plano de Otimização de Performance - Edição de Sessão no Sidebar

**Data:** Janeiro 2025  
**Status:** ✅ **CONCLUÍDO**
**Localização:** `/docs/subapps/chat/planning/sidebar-performance-optimization-plan.md`  
**Arquitetura de Referência:** [`chat-architecture.md`](../chat-architecture.md)

---

## 🎯 Objetivo

Resolver problemas críticos de performance (`[Violation] 'click' handler took...`) e acessibilidade (`Missing 'Description'`) que ocorrem ao editar uma sessão de chat no `AppSidebar`, garantindo uma experiência de usuário fluida e acessível.

---

## 🚨 Problemas Identificados

1.  **Gargalo de Performance (CRÍTICO):** A função `handleUpdateSession` no `app-sidebar.tsx` dispara duas mutações (`savePreferredModel` e `updateSessionMutation`) seguidas de um `queryClient.invalidateQueries` na lista completa de sessões. Isso causa uma re-renderização em cascata de toda a sidebar, bloqueando a thread principal por até 979ms.
2.  **Aviso de Acessibilidade:** O modal (`Dialog`) de edição de sessão não possui um componente de descrição (`DialogDescription`), o que é prejudicial para a acessibilidade e leitores de tela.

---

## 📋 Plano de Execução

### **ETAPA 1: Correção de Acessibilidade (10min)** - ✅ CONCLUÍDA

- [x] **Ação:** Localizar o `Dialog` de "Edit Session" no arquivo `app-sidebar.tsx`.
- [x] **Ação:** Adicionar um componente `<DialogDescription>` com um texto descritivo, como "Faça alterações na sua sessão aqui. Clique em salvar quando terminar."
- [x] **Validação:** Abrir o modal de edição e verificar se o aviso `Warning: Missing 'Description'` desapareceu do console do navegador.

### **ETAPA 2: Otimização de Performance com Atualização Otimista (30min)** - ✅ CONCLUÍDA

- [x] **Ação:** Modificar o callback `onSuccess` da `updateSessionMutation`.
- [x] **Ação:** Em vez de `queryClient.invalidateQueries(...)`, usar `queryClient.setQueryData(...)` para encontrar e atualizar manualmente a sessão específica dentro do cache da query `listarSessions`.
- [x] **Validação:**
  - Editar o título de uma sessão.
  - O título na sidebar deve ser atualizado instantaneamente.
  - A aba "Network" não deve mostrar uma nova chamada para `listarSessions`.
  - Os logs de `[Violation]` no console devem desaparecer.

### **ETAPA 3: Validação Final com Testes (10min)** - ✅ CONCLUÍDA

- [x] **Ação:** Executar a suíte de testes completa do chat para garantir que as mudanças não introduziram nenhuma regressão.
- [x] **Comando:** `bash apps/kdx/src/app/'[locale]'/'(authed)'/apps/chat/__tests__/run-chat-tests.sh`
- [x] **Validação:** Todos os testes devem passar com sucesso.

### **ETAPA 4: Finalização (5min)** - ✅ CONCLUÍDA

- [x] **Ação:** Após a conclusão bem-sucedida de todas as etapas, atualizar o status deste documento para ✅ **CONCLUÍDO**.

---

## 🚀 Impacto Esperado

- **Performance:** Redução drástica no tempo de resposta ao salvar a edição de uma sessão (de ~1s para <100ms).
- **Experiência do Usuário:** Interface fluida, sem travamentos ou "engasgos".
- **Acessibilidade:** Componente de diálogo alinhado com as melhores práticas de acessibilidade.
- **Qualidade de Código:** Implementação de um padrão de atualização otimista mais eficiente e escalável.
