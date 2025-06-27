# 📖 Lições Aprendidas de Arquitetura - Kodix

**Data de Criação:** 2025-01-13  
**Status:** Documento vivo. Adicione novas lições após cada incidente ou descoberta relevante.

## 🎯 Objetivo

Este documento centraliza as **lições críticas aprendidas** durante o desenvolvimento do projeto Kodix. Seu propósito é servir como um guia prático para prevenir a repetição de erros, melhorar a qualidade do código e garantir a estabilidade da arquitetura em todo o monorepo.

A leitura deste documento é **obrigatória** para todos os desenvolvedores.

---

## 📚 Lições Críticas de Implementação

### **1. A Refatoração de Nomes NÃO é Apenas Nominal**

- **Lição**: Ao renomear um endpoint ou função, a validação mais crítica é garantir que o **contrato da API (formato do objeto de retorno)** e a **lógica de consumo no frontend** permaneçam perfeitamente sincronizados. Uma mudança de nome pode mascarar uma mudança na estrutura dos dados.

- **O Problema**: Uma refatoração de `listarSessions` para `findSessions` passou em todos os testes, mas quebrou a UI porque o código do frontend foi alterado para consumir `allSessionsQuery.data` em vez de `allSessionsQuery.data.sessions`.

- **Causa Raiz**: Foco excessivo na mudança de nome, sem a devida atenção a como os dados eram acessados e processados pelo consumidor da API.

- **Ação Preventiva**: Em qualquer refatoração de API, o `git diff` deve ser feito tanto no backend quanto no frontend, focando especificamente em como os dados retornados são processados.

  ```diff
  // O erro não estava no nome, mas em como o dado era usado.
  // O código passou a tratar um objeto de paginação como um array.
  - const sessions = allSessionsQuery.data?.sessions ?? [];
  + const sessions = allSessionsQuery.data ?? []; // Erro introduzido aqui
  ```

### **2. `typecheck` e Testes de Unidade Não Garantem a Integridade da UI**

- **Lição**: Testes de unidade e `pnpm typecheck` são essenciais, mas insuficientes para garantir que a interface do usuário funcione como esperado. Regressões visuais e funcionais podem passar despercebidas.

- **O Problema**: O bug das sessões não aparecendo na tela não foi detectado pela suíte de testes existente, pois não havia um teste que validasse a renderização correta dos elementos na UI.

- **Causa Raiz**: Ausência de testes de integração de UI para fluxos críticos.

- **Ação Preventiva**: Implementar testes de UI (end-to-end ou de integração visual, com Playwright/Cypress) para cenários críticos. Por exemplo: "Dado um mock de API com 5 sessões, a sidebar deve renderizar 5 itens".

### **3. Nunca Confie em Código de Exceção**

- **Lição**: Arquivos que contêm anotações como `@ts-nocheck` ou `eslint-disable` são "red flags" e indicam um problema subjacente. O padrão de código desses arquivos **nunca deve ser copiado** ou usado como referência.

- **O Problema**: Um erro de build foi introduzido ao copiar o padrão `import { trpc }` de um arquivo que já era uma exceção e usava `@ts-nocheck`.

- **Causa Raiz**: Confiar em um padrão de código isolado e problemático em vez de seguir o padrão dominante e validado do projeto (`import { useTRPC }`).

- **Ação Preventiva**: Sempre buscar o padrão de código estabelecido na arquitetura. Na dúvida, verificar a definição original do módulo que está sendo importado para confirmar quais são os exports válidos, em vez de copiar e colar de um arquivo de uso.

### **4. A Hierarquia da Validação de Código**

- **Lição**: Existe uma hierarquia de validação que deve ser seguida para garantir a qualidade. Uma etapa bem-sucedida não garante o sucesso da próxima.

- **O Problema**: Mesmo após corrigir os erros de tipo (Falha 2), o bug funcional (Falha 1) ainda existia. Passar no `typecheck` não significava que a lógica estava correta.

- **Causa Raiz**: Assumir que a ausência de erros de tipo implicava em correção lógica.

- **Ação Preventiva**: Seguir rigorosamente o fluxo de validação em camadas:
  1.  **Validação Estática**: `pnpm typecheck` e `pnpm lint`.
  2.  **Validação Unitária/Integração**: `pnpm test`.
  3.  **Validação Funcional**: Teste manual ou automatizado (E2E) dos fluxos de usuário impactados pela mudança.

### **5. Evitar N+1 Queries em Componentes de Lista**

- **Lição**: Componentes filhos renderizados em um loop (`.map()`) **não devem** ser responsáveis por fazer suas próprias chamadas de API. A responsabilidade de buscar dados deve ser do componente pai, que pode buscar todos os dados necessários de uma só vez e distribuí-los para os filhos via props.

- **O Problema**: As sessões de chat não apareciam dentro de suas respectivas pastas na sidebar. Cada componente `FolderItem` tentava buscar suas próprias sessões usando um endpoint antigo (`listarSessions`), o que falhava e resultava em uma lista vazia.

- **Causa Raiz**: **Lógica de data-fetching duplicada e descentralizada**. Além do bug funcional, essa abordagem criava um grave problema de performance (conhecido como "N+1 query"), onde cada pasta visível na UI disparava uma nova e desnecessária chamada ao banco de dados.

- **Ação Preventiva**: O componente pai (`AppSidebar`) deve ser o único responsável por buscar **todas** as sessões. Ele deve então processar (neste caso, agrupar) esses dados e passar o subconjunto relevante para cada componente filho (`FolderItem`) através de props.

  ```diff
  // ❌ ANTES: O componente filho faz sua própria chamada de API, causando N+1 queries.
  function FolderItem({ folder }) {
    // Cada FolderItem faz uma chamada, resultando em N+1 queries e potenciais bugs.
    const sessionsQuery = useQuery(trpc.app.chat.listarSessions.queryOptions(...));
    const sessions = sessionsQuery.data?.sessions ?? [];
    // ...renderiza as sessões.
  }

  // ✅ DEPOIS: O componente filho é "burro" e apenas recebe os dados via props.
  function FolderItem({ folder, sessions }) { // sessions vêm do pai.
    // ...renderiza as sessões recebidas.
  }

  // No componente pai:
  function AppSidebar() {
    // 1. Uma ÚNICA query para buscar todos os dados.
    const allSessionsQuery = useQuery(trpc.app.chat.findSessions.queryOptions());
    // 2. Os dados são processados (agrupados) uma única vez.
    const groupedSessions = useMemo(() => { /* ...lógica de agrupar... */ }, [allSessionsQuery.data]);

    return folders.map(folder => (
      <FolderItem
        key={folder.id}
        folder={folder}
        sessions={groupedSessions[folder.id] ?? []} // 3. O dado processado é passado como prop.
      />
    ));
  }
  ```

---

Este documento deve ser o primeiro lugar a ser consultado ao encontrar um bug inesperado e o último a ser atualizado após a resolução, garantindo que o conhecimento da equipe evolua constantemente.
