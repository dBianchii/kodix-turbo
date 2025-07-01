# Plano de Implementação: `CoreEngine` v1 (v2 - Pós-Execução)

**Data:** 2025-07-01
**Autor:** KodixAgent
**Status:** 📖 **Histórico (Fases 1-3 Concluídas)**
**Escopo:** Criação do pacote `core-engine` e seu `ConfigurationService`, guiado por lições aprendidas.
**Documentos de Referência:**

- [Roadmap de Padronização de Configurações](../configuration-standardization-roadmap.md)
- [Análise Crítica do Core Engine](../critical-analysis-and-evolution.md)
- [Lições Aprendidas de Arquitetura](../../architecture/lessons-learned.md)

---

## 0. Resumo dos Desvios da Execução

A implementação seguiu o espírito do plano, mas a execução prática revelou desafios que forçaram desvios do plano original:

1.  **Criação do Pacote:** O gerador do Turborepo (`turbo gen`) se mostrou inadequado para automação, forçando a criação manual da estrutura do pacote.
2.  **Lógica do `deepMerge`:** A tipagem estrita inicial do `deepMerge` se provou muito restritiva, sendo substituída por uma abordagem mais flexível (`any`) para acomodar a natureza dinâmica das configurações.
3.  **Integração com DB:** A integração com o banco de dados no `ConfigurationService` foi temporariamente adiada (comentada no código) devido a problemas de resolução de módulos entre pacotes (`@kdx/core-engine` e `@kdx/db`).

O plano abaixo foi atualizado para refletir o que **foi efetivamente executado**.

---

## 0.1. Análise Pós-Execução (Estado Atual)

**Conclusão:** A Fase 3 foi concluída com sucesso, e o `CoreEngine` está sendo consumido pelo `PromptBuilderService`. No entanto, o `ConfigurationService` está **funcionalmente incompleto e é um bloqueador para outras tarefas**.

- **O que funciona:** Retorna a configuração de Nível 1 (Plataforma).
- **O que NÃO funciona:** A busca por configurações de Nível 2 (Time) e Nível 3 (Usuário) no banco de dados está desativada.
- **Próximo Passo:** É mandatório e urgente executar a **Fase 4** para finalizar o serviço e habilitar a funcionalidade completa de configuração hierárquica, desbloqueando o progresso em outras áreas (como a integração de `system-prompt` no Chat).

---

## 1. 🚦 Princípios Orientadores (Baseado em Lições Aprendidas)

Antes de qualquer linha de código, os seguintes princípios são **obrigatórios**:

1.  **Ordem de Dependência (Lição #6):** As modificações seguirão a ordem estrita de dependência do monorepo. Um pacote que será consumido (`core-engine`) deve ser construído e validado _antes_ do pacote que o consome (`api`).
2.  **Validação Incremental (Lição #6):** Após cada passo significativo dentro de um pacote, `pnpm typecheck` e `pnpm test` serão executados para aquele pacote (`--filter`). Nenhum progresso será feito sobre uma base com erros.
3.  **Gestão de Dependências Explícita:** A adição de qualquer nova dependência entre pacotes (ex: `api` dependendo de `core-engine`) será feita explicitamente nos arquivos `package.json` e seguida por um `pnpm install` na raiz para que o workspace seja atualizado.
4.  **Efeito Cascata (Lição #8):** Estamos cientes de que mover arquivos de configuração e criar um novo pacote irá impactar outros pacotes. O plano prevê a ordem correta para gerenciar essa cascata de mudanças.
5.  **Fluxo de Servidor Robusto (Lição #9):** Após a conclusão, a validação final será feita usando o fluxo completo de `stop -> start -> check-logs -> check-status`.

## 2. Checklist de Implementação Detalhado

### **Fase 1: Fundação do Pacote `@kdx/core-engine` (1 dia)**

_Objetivo: Criar um novo pacote funcional e isolado dentro do monorepo._

1.  **[✅] Gerar Estrutura do Pacote:**

    - **Desvio do Plano:** O comando `pnpm exec turbo gen new-package` falhou, pois o gerador se chama `init` e é interativo. A estrutura foi criada manualmente para garantir consistência.
    - **Ação Realizada:**
      - `mkdir -p packages/core-engine/src`
      - Criação manual dos arquivos `package.json`, `tsconfig.json`, `eslint.config.js` baseados em um pacote existente.
    - **Local:** `packages/core-engine`.
    - **Validação:** Arquivos de configuração criados e corretos.

2.  **[✅] Configurar Dependências do Pacote:**

    - **Arquivo:** `packages/core-engine/package.json`.
    - **Ação:** Adicionadas as dependências de workspace e ordenadas alfabeticamente para passar no hook de validação `sherif`.
      ```json
      "dependencies": {
        "@kdx/db": "workspace:*",
        "@kdx/shared": "workspace:*",
        "zod": "catalog:"
      }
      ```
    - **Ação:** Executado `pnpm install` na raiz para lincar as dependências.

3.  **[✅] Implementar a Fachada `CoreEngine`:**
    - **Arquivo:** `packages/core-engine/src/index.ts`.
    - **Ação:** Criar a classe `CoreEngine` com o padrão Singleton. Inicialmente, ela apenas instanciará o (ainda não criado) `ConfigurationService`.
    - **Validação:** Executar `pnpm typecheck --filter=@kdx/core-engine`. Deve passar sem erros.

### **Fase 2: Implementação do `ConfigurationService` Isolado (2 dias)**

_Objetivo: Construir e testar toda a lógica do `ConfigurationService` dentro de seu próprio domínio, sem afetar outros pacotes._

1.  **[✅] Criar Utilitário `deepMerge`:**

    - **Arquivo:** `packages/core-engine/src/configuration/utils/deep-merge.ts`.
    - **Ação:** Implementada a função `deepMerge`.
    - **Desvio do Plano:** A assinatura da função foi alterada de uma abordagem genérica e estrita para `(target: any, source: any): any` para acomodar a mesclagem de objetos de configuração com estruturas diferentes, tornando-a mais pragmática para este caso de uso.
    - **Teste:** Criado `deep-merge.test.ts` e validada a lógica.

2.  **[✅] Centralizar Configuração de Plataforma:**

    - **Ação:** Criar `packages/core-engine/src/configuration/platform-configs/ai-studio.config.ts` e mover o conteúdo do antigo config para lá.
    - **Ação:** Criar `packages/core-engine/src/configuration/platform-configs/index.ts` para exportar um mapa de `appId` para sua respectiva configuração.

3.  **[✅] Implementar `ConfigurationService`:**

    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`.
    - **Desvio do Plano:** A integração com o banco de dados foi temporariamente desabilitada no código devido a problemas de resolução de import do `@kdx/db`. A lógica de busca nos repositórios foi substituída por placeholders.
    - **Ação:** Implementado o método `get(appId, teamId, userId)`. Ele atualmente mescla apenas a configuração de plataforma, com placeholders para as configurações de time e usuário.

4.  **[✅] Testar o `ConfigurationService`:**
    - **Arquivo:** `packages/core-engine/src/configuration/__tests__/configuration.service.test.ts`.
    - **Ação:** Criados testes de unidade robustos.
    - **Desvio do Plano:** Os testes mockam o `CoreEngine.config.get()` em vez de repositórios de banco de dados, alinhando-se ao estado atual da implementação.
    - **Validação:** Executado `pnpm test --filter=@kdx/core-engine`. Todos os testes do novo pacote passaram.

### **Fase 3: Integração e Refatoração do AI Studio (1 dia)**

_Objetivo: Conectar o `AI Studio` ao novo `CoreEngine` e remover o código legado._

1.  **[✅] Declarar Dependência Explícita:**

    - **Arquivo:** `packages/api/package.json`.
    - **Ação:** Adicionar `@kdx/core-engine` como uma dependência de workspace: `"@kdx/core-engine": "workspace:*"`.
    - **Ação:** Executar `pnpm install` na raiz para atualizar o `node_modules`.

2.  **[✅] Refatorar `PromptBuilderService`:**

    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`.
    - **Ação:**
      1.  Remover a chamada ao `PlatformService`.
      2.  Adicionar uma chamada ao `CoreEngine.config.get({ appId: aiStudioAppId, ... })`.
      3.  Ajustar a lógica para extrair as instruções do objeto de configuração mesclado que o `CoreEngine` retorna.

3.  **[✅] Remover Código Obsoleto:**

    - **Ação:** Deletar o arquivo `packages/api/src/internal/services/platform.service.ts`.
    - **Ação:** Deletar o arquivo `packages/api/src/internal/config/ai-studio.config.ts`.

4.  **[✅] Atualizar Teste de Integração do AI Studio:**

    - **Arquivo:** `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`.
    - **Ação:** O teste que valida o endpoint `getSystemPromptForChat` agora mocka a chamada ao `CoreEngine.config.get()` em vez de mockar o DB diretamente.

5.  **[✅] Validação Final:**
    - **Ação:** Executados `pnpm typecheck --filter=@kdx/api --filter=@kdx/core-engine` e `pnpm test --filter=@kdx/api --filter=@kdx/core-engine` para garantir que a integração não quebrou nada nos pacotes envolvidos.
    - **Desvio do Plano:** A validação na raiz do projeto (`pnpm typecheck`) foi pulada pois identificou erros não relacionados em `@kdx/locales`, que estão fora do escopo desta tarefa.

### **Fase 4: Finalização da Integração com DB (Movido para Plano Dedicado)**

**Plano de Execução Desmembrado:** Para manter a clareza e separar o registro histórico do trabalho ativo, a implementação detalhada para finalizar o `ConfigurationService` foi movida para um plano dedicado.

- **👉 [Plano de Finalização do ConfigurationService](./finish-configuration-service-plan.md)**

A conclusão daquele plano é um pré-requisito para marcar o `CoreEngine` v1 como totalmente concluído.

---

Este plano aprimorado é mais detalhado, mitiga os riscos conhecidos do nosso monorepo e nos guiará de forma segura para a implementação da primeira peça do nosso Core Engine.
