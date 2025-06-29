# Plano de Implementação Robusto: Instruções da Plataforma como Código

**Data:** 2025-06-28
**Autor:** KodixAgent
**Status:** 🟡 Proposta (Versão Revisada)
**Escopo:** AI Studio - Backend
**Tipo:** Configuração como Código (Nível 1)
**Documento Pai:** `docs/architecture/configuration-model.md`
**Documentos de Referência Críticos:** `docs/architecture/lessons-learned.md`, `docs/architecture/subapp-architecture.md`

---

## 1. Resumo Executivo

Este plano descreve a implementação segura e faseada das **Instruções da Plataforma (Nível 1)**. O objetivo é estabelecer uma configuração base de instruções de IA diretamente no código-fonte, que servirá como padrão para toda a plataforma.

Esta versão revisada do plano incorpora as **lições aprendidas** do projeto para mitigar riscos conhecidos, como erros de tipo cross-package e inconsistências de implementação, garantindo uma execução estável e alinhada com a arquitetura.

### Objetivos

- ✅ Criar um arquivo `config.ts` no pacote do AI Studio para armazenar o template de instruções.
- ✅ Implementar um `PlatformService` no backend para ler o template e substituir as variáveis.
- ✅ Garantir que o `PromptBuilderService` utilize este serviço para construir a parte base do prompt final.
- ✅ Manter a implementação 100% no backend, sem componentes de UI.

---

## 2. 🚦 Princípios Orientadores (Pre-flight Check)

Antes de iniciar, os seguintes princípios, baseados em lições aprendidas, são **obrigatórios**:

1.  **Ordem de Modificação de Pacotes:** A modificação de código que atravessa múltiplos pacotes seguirá estritamente a ordem de dependência para evitar erros de tipo em cascata:

    1.  `@kdx/shared` (se necessário para novos tipos)
    2.  `@kdx/validators` (se schemas forem afetados)
    3.  `@kdx/db` (se repositórios ou schemas de DB mudarem)
    4.  `@kdx/api` (implementação de serviços e routers)
    5.  `apps/kdx` (consumo no frontend)

2.  **Validação Incremental:** Após modificar cada pacote, o comando `pnpm typecheck --filter=@kdx/NOME_DO_PACOTE` será executado. Nenhum trabalho prosseguirá para o próximo pacote se houver erros de tipo.

3.  **Estrutura de Router tRPC:** Conforme a lição crítica em `docs/architecture/lessons-learned.md`, qualquer novo router ou modificação usará `t.router({...})` para preservar a inferência de tipos. A utilização de `satisfies TRPCRouterRecord` é proibida.

4.  **Comunicação via Service Layer:** A nova lógica será exposta exclusivamente através do `AiStudioService` e seus serviços internos (`PlatformService`, `PromptBuilderService`), respeitando o isolamento entre SubApps.

---

## 3. Arquitetura da Solução

O fluxo permanece contido no backend, mas a implementação seguirá uma ordem estrita para garantir a estabilidade.

```mermaid
graph TD
    subgraph "Backend Processing"
        A[/api/chat/stream] --> B[PromptBuilderService]
        B --> C{PlatformService}
        C -->|imports| D["ai-studio.config.ts<br/>(em @kdx/api)"]
        C -->|lê dados do usuário| E[(DB: users)]
        C -->|retorna instruções processadas| B
    end

    style D fill:#f3e5f5,stroke:#333
    style C fill:#fff3e0,stroke:#333
```

- **Fonte da Verdade:** O arquivo `packages/api/src/internal/config/ai-studio.config.ts`.
- **Lógica de Negócio:** Centralizada no `PlatformService` e orquestrada pelo `PromptBuilderService`.

---

## 4. Checklist de Implementação Detalhado

### Fase 1: Configuração e Serviços Base (Backend)

#### **Pacote: `@kdx/api`**

1.  **[ ] Criar Arquivo de Configuração:**

    - **Arquivo:** `packages/api/src/internal/config/ai-studio.config.ts`
    - **Conteúdo:** Definir o objeto `aiStudioConfig` com `platformInstructions` e o template. Usar `as const` para imutabilidade.
    - **Validação:** Executar `pnpm typecheck --filter=@kdx/api` para garantir que não há erros de sintaxe.

2.  **[ ] Implementar `PlatformService`:**

    - **Arquivo:** `packages/api/src/internal/services/platform.service.ts`
    - **Conteúdo:**
      - Criar a classe `PlatformService`.
      - Implementar o método estático `buildInstructionsForUser(userId: string)`.
      - A lógica deve:
        - Importar `aiStudioConfig` do novo arquivo de configuração.
        - Ler o template.
        - Buscar os dados do usuário no banco (`db.query.users.findFirst`).
        - Substituir as variáveis dinâmicas (ex: `{{userName}}`, `{{userLanguage}}`).
        - Lidar com o caso de usuário não encontrado (retornar o template com variáveis não substituídas).
    - **Validação:** Executar `pnpm typecheck --filter=@kdx/api` novamente.

3.  **[ ] Implementar `PromptBuilderService` (Estrutura Inicial):**

    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`
    - **Conteúdo:**
      - Criar a classe `PromptBuilderService`.
      - Implementar o método `buildFinalSystemPrompt`, que por enquanto apenas chamará `PlatformService.buildInstructionsForUser`.
      - Deixar o código preparado com comentários para futuramente incluir `TeamConfigService` e `UserConfigService`.
    - **Validação:** Executar `pnpm typecheck --filter=@kdx/api`.

4.  **[ ] Integrar no `AiStudioService` e no Router:**
    - **Arquivo:** `packages/api/src/internal/services/ai-studio.service.ts`
    - **Ação:** Adicionar o método `getSystemPromptForChat` que chama o `PromptBuilderService`.
    - **Arquivo:** `packages/api/src/trpc/routers/app/aiStudio/_router.ts`
    - **Ação Detalhada (Prevenção de Erros de Tipo):**
      - **1. Análise:** Verifique se o `aiStudioRouter` existente já combina sub-routers (ex: `...aiAgentsRouter`).
      - **2. Isolar Procedimentos:** Se houver uma mistura de sub-routers e procedures avulsos, crie um novo router (`const aiStudioRootRouter = t.router({...})`) contendo apenas os procedures avulsos e o novo `getSystemPromptForChat`.
      - **3. Mesclar Routers:** Use `t.mergeRouters(aiStudioRootRouter, aiAgentsRouter, ...)` para combinar todos os routers de forma segura.
      - **4. Proibição:** Não use spread syntax (`...`) para combinar routers dentro de `t.router({})`. Consulte a lição em `docs/architecture/lessons-learned.md`.
    - **Validação:** `pnpm typecheck --filter=@kdx/api`.

### Fase 2: Testes e Validação

1.  **[ ] Preparar e Validar Ambiente de Teste (Vitest):**

    - **Ação:** Antes de escrever os testes, garanta que o ambiente está configurado corretamente.
    - **Checklist de Prevenção:**
      - **Caminhos Absolutos:** Verifique se `vitest.config.ts` usa `path.resolve(__dirname, ...)` para os `setupFiles`.
      - **Hoisting do `vi.mock`:** Ao mockar, declare quaisquer variáveis usadas pela fábrica de mock **antes** da chamada `vi.mock`.

2.  **[ ] Adicionar Testes de Unidade para `PlatformService`:**

    - **Local:** `packages/api/src/__tests__/platform.service.test.ts`
    - **Cenários a Cobrir:**
      - Substituição correta de todas as variáveis quando o usuário existe.
      - Retorno do template puro quando o usuário não é encontrado.
      - Retorno de string vazia se `platformInstructions.enabled` for `false`.
      - Comportamento com um template que não possui variáveis.
    - **Nota sobre Mocks Mutáveis:** Se um teste precisar modificar um valor de configuração mockado (ex: `enabled: false`), use uma variável `let` mutável para definir o objeto do mock fora da fábrica `vi.mock` para evitar erros de "propriedade somente leitura".

3.  **[ ] Adicionar Testes de Integração para `PromptBuilderService`:**
    - **Local:** `packages/api/src/__tests__/`
    - **Cenários a Cobrir:**
      - Garantir que ele chama corretamente o `PlatformService`.
      - Verificar se o formato da string final está correto (com separadores, quando as outras camadas forem adicionadas).
    - **Verificação:** Adicionar um `console.log` **temporário** e **registrado** no `docs/debug/logs-registry.md` dentro do `stream/route.ts` do chat para exibir o `systemPrompt`. Validar se as instruções da plataforma, com as variáveis do usuário substituídas, estão presentes. O log deve ser enviado para o arquivo `dev`, não `dev.log`.
    - **Guia de Troubleshooting (Se o servidor não iniciar):**
      - **Sintoma:** Erro `EADDRINUSE` ou `Failed to connect to daemon`.
      - **Causa:** Daemon do Turborepo em estado inconsistente.
      - **Solução:**
        1. `sh ./scripts/stop-dev.sh`
        2. `pnpm dlx turbo daemon stop`
        3. `sh ./scripts/start-dev-bg.sh`
        4. `sh ./scripts/check-dev-status.sh` para confirmar que está `RUNNING`.
      - **Cleanup:** Remover o log temporário após a validação.

---

## 5. 🔬 Estratégia de Testes Aprimorada

- **Testes de Unidade:** Focados em `PlatformService`
