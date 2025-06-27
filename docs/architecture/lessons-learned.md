# 📖 Lições Aprendidas de Arquitetura - Kodix

**Data de Criação:** 2025-01-13  
**Status:** Documento vivo. Adicione novas lições após cada incidente ou descoberta relevante.

## 🎯 Objetivo

Este documento centraliza as **lições críticas aprendidas** durante o desenvolvimento do projeto Kodix. Seu propósito é servir como um guia prático para prevenir a repetição de erros, melhorar a qualidade do código e garantir a estabilidade da arquitetura em todo o monorepo.

A leitura deste documento é **obrigatória** para todos os desenvolvedores.

---

## 📚 Lições Críticas de Implementação

### **1. A Causa Raiz de Erros de Tipo em tRPC: Estrutura do Router**

- **Lição**: Erros de inferência de tipo em cascata no frontend (como `Property 'mutate' does not exist` ou `Property 'queryOptions' is undefined`) são quase sempre sintoma de um problema na **estrutura do router no backend**.
- **O Problema**: O cliente tRPC (`useTRPC`) não conseguia inferir os tipos corretos para os procedures do Chat, tratando-os como `any` ou `undefined` e causando mais de 500 erros de "unsafe" no frontend.
- **Causa Raiz**: O `chatRouter` (e outros sub-routers) estava sendo exportado como um objeto TypeScript genérico (`TRPCRouterRecord`) em vez de ser construído com a função `t.router({...})` do tRPC. Isso apagava as informações de tipo detalhadas antes que chegassem ao router principal.
- **Ação Preventiva**: **TODOS** os routers, em todos os níveis, devem ser construídos e exportados usando a função `t.router({...})`. O uso de tipos genéricos como `TRPCRouterRecord` é proibido, pois quebra a inferência de tipos end-to-end.

  ```diff
  // ❌ ANTES: Apaga os tipos detalhados.
  import type { TRPCRouterRecord } from "@trpc/server";
  export const chatRouter: TRPCRouterRecord = { /* ... */ };

  // ✅ DEPOIS: Preserva e propaga os tipos corretamente.
  import { t } from "../../../trpc";
  export const chatRouter = t.router({ /* ... */ });
  ```

### **2. A Refatoração de Nomes NÃO é Apenas Nominal**

- **Lição**: Ao renomear um endpoint, a validação mais crítica é garantir que o **contrato da API (formato do objeto de retorno)** e a **lógica de consumo no frontend** permaneçam perfeitamente sincronizados.
- **O Problema**: Uma refatoração de `listarSessions` para `findSessions` passou nos testes, mas quebrou a UI porque o código do frontend foi alterado para consumir `allSessionsQuery.data` (o objeto de paginação) em vez de `allSessionsQuery.data.sessions` (o array).
- **Ação Preventiva**: Em qualquer refatoração de API, o `git diff` deve ser feito tanto no backend quanto no frontend, focando especificamente em como os dados retornados são processados.

### **3. Testes de UI São Essenciais para Prevenir Regressões Visuais**

- **Lição**: Testes de unidade e `pnpm typecheck` são essenciais, mas insuficientes para garantir que a interface do usuário funcione como esperado.
- **O Problema**: O bug das sessões não aparecendo na tela não foi detectado pela suíte de testes existente.
- **Ação Preventiva**: Implementar testes de UI (end-to-end ou de integração visual) para cenários críticos. Ex: "Dado um mock de API com 5 sessões, a sidebar deve renderizar 5 itens".

### **4. Antipadrão: N+1 Queries em Componentes de Lista**

- **Lição**: Componentes filhos renderizados em um loop (`.map()`) **não devem** fazer suas próprias chamadas de API. A responsabilidade de buscar dados deve ser do componente pai.
- **O Problema**: O `FolderItem` fazia sua própria chamada de API para buscar sessões, causando múltiplas queries desnecessárias e introduzindo bugs.
- **Ação Preventiva**: O componente pai (`AppSidebar`) deve buscar **todos** os dados necessários de uma vez, processá-los (agrupar) e passar os subconjuntos relevantes para os componentes filhos via props.

### **5. Proibição Estrita de `// @ts-nocheck`**

- **Lição**: O comentário `// @ts-nocheck` é um anti-padrão perigoso que esconde problemas reais e leva a erros em tempo de execução.
- **O Problema**: O uso de `@ts-nocheck` em arquivos como `chat-thread-provider.tsx` mascarou dezenas de erros de tipo, que contribuíram para a instabilidade geral.
- **Ação Preventiva**: `// @ts-nocheck` é **estritamente proibido**. O problema de tipo subjacente deve ser sempre investigado e corrigido na sua causa raiz. A regra de linter `@typescript-eslint/ban-ts-comment` deve ser tratada como um erro bloqueante.

---

Este documento deve ser o primeiro lugar a ser consultado ao encontrar um bug inesperado e o último a ser atualizado após a resolução, garantindo que o conhecimento da equipe evolua constantemente.
