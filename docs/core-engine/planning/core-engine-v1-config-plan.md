# Plano de Implementação: `CoreEngine` v1 (v2 - Alta Fidelidade)

**Data:** 2025-07-01
**Autor:** KodixAgent
**Status:** 🟡 Proposta
**Escopo:** Criação do pacote `core-engine` e seu `ConfigurationService`, guiado por lições aprendidas.
**Documentos de Referência:**

- [Roadmap de Padronização de Configurações](../configuration-standardization-roadmap.md)
- [Análise Crítica do Core Engine](../critical-analysis-and-evolution.md)
- [Lições Aprendidas de Arquitetura](../../architecture/lessons-learned.md)

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

1.  **[ ] Gerar Estrutura do Pacote:**

    - **Ação:** Usar `pnpm exec turbo gen new-package` para criar a estrutura do pacote `core-engine`.
    - **Local:** `packages/core-engine`.
    - **Validação:** Garantir que `packages/core-engine/package.json` e `packages/core-engine/tsconfig.json` foram criados.

2.  **[ ] Configurar Dependências do Pacote:**

    - **Arquivo:** `packages/core-engine/package.json`.
    - **Ação:** Adicionar as dependências de workspace necessárias para o `ConfigurationService` funcionar.
      ```json
      "dependencies": {
        "@kdx/shared": "workspace:*",
        "@kdx/db": "workspace:*"
      }
      ```
    - **Ação:** Executar `pnpm install` na raiz do projeto para lincar o novo pacote e suas dependências no workspace.

3.  **[ ] Implementar a Fachada `CoreEngine`:**
    - **Arquivo:** `packages/core-engine/src/index.ts`.
    - **Ação:** Criar a classe `CoreEngine` com o padrão Singleton. Inicialmente, ela apenas instanciará o (ainda não criado) `ConfigurationService`.
    - **Validação:** Executar `pnpm typecheck --filter=@kdx/core-engine`. Deve passar sem erros.

### **Fase 2: Implementação do `ConfigurationService` Isolado (2 dias)**

_Objetivo: Construir e testar toda a lógica do `ConfigurationService` dentro de seu próprio domínio, sem afetar outros pacotes._

1.  **[ ] Criar Utilitário `deepMerge`:**

    - **Arquivo:** `packages/core-engine/src/configuration/utils/deep-merge.ts`.
    - **Ação:** Implementar a função `deepMerge` que mescla objetos recursivamente.
    - **Teste:** Criar `deep-merge.test.ts` e validar a lógica com múltiplos cenários de sobreposição.

2.  **[ ] Centralizar Configuração de Plataforma:**

    - **Ação:** Criar `packages/core-engine/src/configuration/platform-configs/ai-studio.config.ts` e mover o conteúdo do antigo config para lá.
    - **Ação:** Criar `packages/core-engine/src/configuration/platform-configs/index.ts` para exportar um mapa de `appId` para sua respectiva configuração.

3.  **[ ] Implementar `ConfigurationService`:**

    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`.
    - **Ação:** Implementar o método `get(appId, teamId, userId)`. Ele irá:
      1.  Importar e usar o registro de configurações de plataforma.
      2.  Importar e usar os repositórios do `@kdx/db` para buscar `appTeamConfig` e `userAppTeamConfig`.
      3.  Usar o utilitário `deepMerge` para combinar os resultados.

4.  **[ ] Testar o `ConfigurationService`:**
    - **Arquivo:** `packages/core-engine/src/configuration/__tests__/configuration.service.test.ts`.
    - **Ação:** Criar testes de unidade robustos, mockando as chamadas aos repositórios do DB, para validar a lógica de busca e `deepMerge`.
    - **Validação:** Executar `pnpm test --filter=@kdx/core-engine`. Todos os testes do novo pacote devem passar.

### **Fase 3: Integração e Refatoração do AI Studio (1 dia)**

_Objetivo: Conectar o `AI Studio` ao novo `CoreEngine` e remover o código legado._

1.  **[ ] Declarar Dependência Explícita:**

    - **Arquivo:** `packages/api/package.json`.
    - **Ação:** Adicionar `@kdx/core-engine` como uma dependência de workspace: `"@kdx/core-engine": "workspace:*"`.
    - **Ação:** Executar `pnpm install` na raiz para atualizar o `node_modules`.

2.  **[ ] Refatorar `PromptBuilderService`:**

    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`.
    - **Ação:**
      1.  Remover a chamada ao `PlatformService`.
      2.  Adicionar uma chamada ao `CoreEngine.config.get({ appId: aiStudioAppId, ... })`.
      3.  Ajustar a lógica para extrair as instruções do objeto de configuração mesclado que o `CoreEngine` retorna.

3.  **[ ] Remover Código Obsoleto:**

    - **Ação:** Deletar o arquivo `packages/api/src/internal/services/platform.service.ts`.
    - **Ação:** Deletar o arquivo `packages/api/src/internal/config/ai-studio.config.ts`.

4.  **[ ] Atualizar Teste de Integração do AI Studio:**

    - **Arquivo:** `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`.
    - **Ação:** O teste que valida o endpoint `getSystemPromptForChat` deve agora mockar a chamada ao `CoreEngine.config.get()` em vez de mockar o DB diretamente.

5.  **[ ] Validação Final:**
    - **Ação:** Executar `pnpm typecheck` e `pnpm test` na **raiz do projeto** para garantir que a integração entre `@kdx/api` e `@kdx/core-engine` não quebrou nada.

## 5. Documentação e Cleanup Final

- [ ] Atualizar o documento `ai-studio-architecture.md` para mostrar que o `AiStudioService` agora consome o `CoreEngine`.
- [ ] Atualizar o `configuration-standardization-roadmap.md` marcando a Fase 1 como concluída.
- [ ] Apagar o plano `@prompt-builder-service-plan.md` original.

Este plano aprimorado é mais detalhado, mitiga os riscos conhecidos do nosso monorepo e nos guiará de forma segura para a implementação da primeira peça do nosso Core Engine.
