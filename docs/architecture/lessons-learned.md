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

### **6. Prevenção de Erros de TypeScript em Modificações Cross-Package**

- **Lição**: Modificações que afetam múltiplos packages no monorepo requerem uma estratégia específica para evitar erros de tipo persistentes e problemas de compilação em cascata.
- **O Problema**: Durante a implementação de novas features que modificam schemas compartilhados (como `AppIdsWithUserAppTeamConfig`), ocorrem erros de tipo que persistem mesmo após as correções, devido a problemas de cache e ordem de compilação.
- **Sintomas Comuns**:
  - Erro: "Spread types may only be created from object types" em operações de spread
  - TypeScript não reconhece novos valores em union types
  - Imports funcionam no IDE mas falham no build
  - `pnpm typecheck` passa mas `pnpm build` falha
- **Ações Preventivas**:

  1. **Ordem Correta de Implementação e Build**:

     ```bash
     # Ordem obrigatória de modificação e build:
     1. @kdx/shared (schemas e tipos base)
     2. @kdx/validators (validações de input/output)
     3. @kdx/db (repositórios e mapeamentos)
     4. @kdx/api (endpoints tRPC)
     5. Apps (frontend)

     # Comando correto após cada modificação de tipo:
     pnpm build --filter=@kdx/shared --filter=@kdx/validators --filter=@kdx/db
     ```

  2. **Verificação Incremental Obrigatória**:

     ```bash
     # Após CADA modificação de schema/tipo:
     pnpm typecheck
     # Se houver erros, NÃO continue com outras modificações
     ```

  3. **Limpeza de Cache do TypeScript**:

     ```bash
     # Se erros de tipo persistem após correções:
     rm -rf node_modules/.cache
     pnpm install
     pnpm build --filter=@kdx/shared --force
     ```

  4. **Estratégia de Modificação Atômica**:

     - Modifique UM package por vez
     - Faça build do package modificado
     - Verifique types antes de prosseguir
     - Commite incrementalmente (facilita rollback)

  5. **Padrão de Import Correto em tRPC**:

     ```typescript
     // ❌ ERRADO: Import de barril pode causar problemas
     import { protectedProcedure, router } from "../../../trpc";

     // ✅ CORRETO: Imports específicos
     import { protectedProcedure } from "../../../procedures";
     import { t } from "../../../trpc";
     ```

  6. **Validação Final Completa**:
     ```bash
     # Antes de considerar a feature completa:
     pnpm clean && pnpm install && pnpm typecheck && pnpm build
     ```

- **Dica de Ouro**: Se você está modificando tipos que são usados em múltiplos packages, sempre faça um "build graph mental" antes de começar. Pergunte-se: "Quais packages dependem deste tipo?" e compile-os na ordem correta.

### **7. Composição de Routers tRPC com `mergeRouters`**

- **Lição**: A tentativa de combinar múltiplos sub-routers dentro de um único `t.router({ ...routerA, ...routerB })` usando spread syntax (`...`) resulta em erros de tipo complexos (`TS2345: Argument of type '...' is not assignable to parameter of type 'CreateRouterOptions'`).
- **O Problema**: O `t.router()` foi projetado para aceitar um objeto de _procedures_, não de _routers_. A sintaxe de spread funciona para mesclar objetos de procedures, mas falha ao tentar mesclar instâncias de routers completos, pois suas estruturas internas (`_def`) são incompatíveis.
- **Ação Preventiva**: Use a função `t.mergeRouters(...routers)` para combinar múltiplos routers. Se você precisar adicionar procedures avulsos junto com sub-routers, agrupe os procedures avulsos em seu próprio `t.router` e depois mescle tudo.

  ```typescript
  // ❌ ANTES: Causa erro de tipo.
  const finalRouter = t.router({
    ...subRouterA,
    ...subRouterB,
    procedureC: protectedProcedure.query(() => {
      /*...*/
    }),
  });

  // ✅ DEPOIS: Padrão correto e seguro.
  const rootProcedures = t.router({
    procedureC: protectedProcedure.query(() => {
      /*...*/
    }),
  });

  const finalRouter = t.mergeRouters(subRouterA, subRouterB, rootProcedures);
  ```

### **8. O Efeito Cascata de Constantes Globais (App IDs)**

- **Lição**: Adicionar uma nova constante de ID global (ex: um novo `cupomAppId` em `@kdx/shared`) não é uma mudança isolada. É o início de uma cadeia de modificações necessárias em todo o monorepo.
- **O Problema**: A adição de `cupomAppId` causou uma série de erros de compilação em múltiplos pacotes (`@kdx/db`, `@kdx/permissions`, `@kdx/locales`), pois diversos objetos de mapeamento (`appIdToSchemas`, `appIdToPermissionsFactory`, `appIdToName`, etc.) se tornaram incompletos e, portanto, inválidos do ponto de vista do TypeScript.
- **Ação Preventiva**: Ao adicionar uma nova constante de ID que é parte de um tipo `union` (como `KodixAppId`), use a busca global do editor para encontrar **todas** as ocorrências do tipo e dos objetos de mapeamento relacionados (`Record<KodixAppId, ...>`). Atualize cada um deles antes de tentar compilar o projeto. Trate a adição de um ID como uma refatoração em todo o sistema, não como uma mudança em um único arquivo.

### **9. Fluxo de Inicialização Robusto do Servidor**

- **Lição**: Scripts que apenas verificam se uma porta está em uso (`check-dev-status.sh`) são insuficientes e podem levar a loops infinitos se o servidor falhar em compilar.
- **O Problema**: O script `check-dev-status.sh` ficava "preso", aguardando um servidor que nunca iniciaria porque havia um erro de compilação em um pacote dependente que impedia o `pnpm dev:kdx` de concluir.
- **Ação Preventiva**: Adotar um fluxo de inicialização em múltiplos estágios que prioriza a detecção de erros.
  1.  `sh ./scripts/stop-dev.sh` (Garante um ambiente limpo)
  2.  `sh ./scripts/start-dev-bg.sh` (Inicia em segundo plano)
  3.  `sleep 5` (Aguarda a geração de logs)
  4.  `sh ./scripts/check-log-errors.sh` (**Passo crítico: verifica erros de build primeiro**)
  5.  `sh ./scripts/check-dev-status.sh` (Verifica se o servidor está rodando, **somente se não houver erros**)
- **Referência:** Este fluxo agora está documentado em `docs/scripts/README.md`.

### **10. Configuração Robusta de Testes (Vitest) no Monorepo**

- **Lição**: A configuração de testes em um monorepo com Vitest possui particularidades que, se não tratadas corretamente, levam a erros de inicialização.
- **O Problema 1**: Erro `Cannot find module ...` com caminhos duplicados (ex: `packages/api/packages/api/...`).
  - **Causa Raiz**: `vitest.config.ts` na raiz do projeto usava caminhos relativos para `setupFiles`. O Vitest resolve esses caminhos a partir do diretório do pacote em teste, não da raiz, duplicando o caminho.
  - **Ação Preventiva**: Sempre use caminhos absolutos para `setupFiles` na configuração raiz do Vitest.
    ```typescript
    // vitest.config.ts
    import path from "path";
    // ...
    setupFiles: [
      path.resolve(__dirname, "./packages/api/src/test-setup.ts"),
    ],
    ```
- **O Problema 2**: Erro `ReferenceError: Cannot access '...' before initialization` ao usar `vi.mock`.
  - **Causa Raiz**: `vi.mock` é "içado" (hoisted) para o topo do arquivo durante a compilação, sendo executado antes da declaração de outras variáveis no escopo do módulo. Se a fábrica do mock (`() => ({...})`) referencia uma variável declarada depois, ela ainda não foi inicializada.
  - **Ação Preventiva**: Sempre declare as variáveis ou constantes que serão usadas dentro de uma fábrica de `vi.mock` **antes** da chamada ao `vi.mock`.

### **11. Estrutura de Pacotes vs. Automação e Hooks de Validação**

- **Lição**: A criação manual ou automatizada de pacotes deve ser consistente com os hooks de validação do projeto (ex: `sherif` para ordenação de `package.json`).
- **O Problema**: Ao criar o pacote `@kdx/core-engine` manualmente, o `pnpm install` falhou com um erro do `sherif` porque as dependências no `package.json` não estavam em ordem alfabética.
- **Ação Preventiva**: Ao criar um novo pacote, garanta que todas as chaves nos arquivos de configuração, especialmente as `dependencies` e `devDependencies` no `package.json`, sigam a ordem alfabética exigida pelos linters do projeto. Isso se aplica tanto a geradores de código (`turbo gen`) quanto à criação manual.

### **12. Resolução de Módulos em Workspace (Imports de Sub-path)**

- **Lição**: Imports de sub-paths de pacotes do workspace (ex: `from "@kdx/db/repositories"`) são um anti-padrão perigoso. Eles podem funcionar no editor (devido à inteligência do VSCode), mas falham durante o build do TypeScript ou com o Turborepo.
- **O Problema**: A tentativa de importar o `appRepository` de `@kdx/db/repositories` dentro do novo pacote `@kdx/core-engine` falhou, pois a configuração de `moduleResolution: "Bundler"` espera que os imports apontem apenas para o ponto de entrada definido no `exports` do `package.json` do pacote alvo.
- **Ação Preventiva**: **TODOS** os imports entre pacotes do workspace **DEVEM** apontar para o ponto de entrada principal (ex: `from "@kdx/db"`). Para que isso funcione, o pacote alvo (`@kdx/db` neste caso) deve exportar explicitamente os membros desejados (como `appRepository`) em seu `index.ts` principal.

---

Este documento deve ser o primeiro lugar a ser consultado ao encontrar um bug inesperado e o último a ser atualizado após a resolução, garantindo que o conhecimento da equipe evolua constantemente.
