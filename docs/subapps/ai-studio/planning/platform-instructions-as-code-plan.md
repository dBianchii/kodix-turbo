# Plano de Implementação: Instruções da Plataforma como Código

**Data:** 2025-06-28
**Autor:** KodixAgent
**Status:** ✅ Executado
**Escopo:** AI Studio - Backend
**Tipo:** Configuração como Código (Nível 1)
**Documento Pai:** `docs/architecture/configuration-model.md`
**Documentos de Referência Críticos:** `docs/architecture/lessons-learned.md`, `docs/architecture/subapp-architecture.md`

---

## 1. Resumo Executivo

Este plano descreve a implementação segura e faseada das **Instruções da Plataforma (Nível 1)**. O objetivo é estabelecer uma configuração base de instruções de IA diretamente no código-fonte, que servirá como padrão para toda a plataforma.

A execução deste plano resultou em uma infraestrutura de backend robusta e em melhorias significativas nos padrões de teste do projeto, que foram devidamente documentados.

### Objetivos

- ✅ **[Executado]** Criar um arquivo `config.ts` no pacote do AI Studio para armazenar o template de instruções.
- ✅ **[Executado]** Implementar um `PlatformService` no backend para ler o template e substituir as variáveis.
- ✅ **[Executado]** Garantir que o `PromptBuilderService` utilize este serviço para construir a parte base do prompt final.
- ✅ **[Executado]** Manter a implementação 100% no backend, sem componentes de UI.

---

## 2. 🚦 Princípios Orientadores (Pre-flight Check)

Antes de iniciar, os seguintes princípios, baseados em lições aprendidas, são **obrigatórios**:

1.  **Ordem de Modificação de Pacotes:** A modificação de código que atravessa múltiplos pacotes seguirá estritamente a ordem de dependência para evitar erros de tipo em cascata.
2.  **Validação Incremental:** Após modificar cada pacote, o comando `pnpm typecheck` será executado.
3.  **Estrutura de Router tRPC:** Conforme a lição crítica em `docs/architecture/lessons-learned.md`, qualquer novo router ou modificação usará `t.router({...})` para preservar a inferência de tipos.
4.  **Comunicação via Service Layer:** A nova lógica será exposta exclusivamente através do `AiStudioService`, respeitando o isolamento entre SubApps.

---

## 3. Arquitetura da Solução

O fluxo permanece contido no backend, e a implementação seguiu esta arquitetura.

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

1.  **[✅] Criar Arquivo de Configuração:**

    - **Status:** Concluído. O arquivo `packages/api/src/internal/config/ai-studio.config.ts` foi criado conforme o plano.

2.  **[✅] Implementar `PlatformService`:**

    - **Status:** Concluído. O `PlatformService` foi implementado para processar o template e substituir as variáveis.

3.  **[✅] Implementar `PromptBuilderService` (Estrutura Inicial):**

    - **Status:** Concluído. O `PromptBuilderService` foi criado para orquestrar a lógica, com placeholders para futuras camadas de instruções.

4.  **[✅] Integrar no `AiStudioService` e Refatorar o Router:**
    - **Status:** Concluído e Refatorado. Esta etapa foi mais complexa que o previsto e exigiu uma refatoração arquitetural para alinhar o AI Studio com os padrões do Kodix.
    - **Ações Realizadas:**
      1.  **Refatoração dos Sub-Routers:** Todos os sub-routers (`agents.ts`, `models.ts`, etc.) foram corrigidos para usar `t.router({})`, eliminando o antipadrão `satisfies TRPCRouterRecord`.
      2.  **Modularização:** A lógica para `bibliotecas` foi extraída do router principal para seu próprio arquivo (`libraries.ts`).
      3.  **Isolamento dos Procedimentos:** Os procedures avulsos foram isolados em um `aiStudioMainRouter`.
      4.  **Composição Segura:** Todos os routers foram combinados usando `t.mergeRouters()`, conforme a lição aprendida nº 7.
      5.  **Adição do Endpoint:** O novo `getSystemPromptForChat` foi adicionado à nova estrutura segura.

### Fase 2: Testes e Validação

1.  **[✅] Preparar e Validar Ambiente de Teste (Vitest):**

    - **Status:** Concluído. O arquivo `vitest.config.ts` foi corrigido para usar `path.resolve` nos `setupFiles`, conforme a lição aprendida nº 10.

2.  **[✅] Adicionar Teste de Integração de API com `createCaller`:**
    - **Evolução da Estratégia:** A tentativa inicial de criar testes de unidade revelou lacunas na nossa estratégia de teste para endpoints de API.
    - **Ação Executada:** Em vez de testes unitários que não validariam o fluxo completo, foi definido e implementado um novo padrão de **Teste de Integração de API**.
    - **Local:** `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`
    - **Cenários Cobertos:**
      - Validação do fluxo completo desde o `caller` tRPC até o `PlatformService`.
      - Verificação da substituição correta das variáveis do template.
      - Tratamento de casos onde o usuário não é encontrado no banco de dados.
    - **Referência de Padrão:** O teste segue o novo padrão documentado em **[🧪 Padrão de Teste de Integração de API](../../tests/api-integration-testing-pattern.md)**.

---

## 5. Conclusão da Execução

A implementação foi concluída com sucesso. O resultado final não só entregou a funcionalidade planejada, mas também fortaleceu a arquitetura do AI Studio e da nossa suíte de testes.

### O que foi Entregue

- **Backend Completo:** `PlatformService`, `PromptBuilderService` e `AiStudioService` implementados e integrados.
- **Endpoint de API:** Novo endpoint `getSystemPromptForChat` pronto para consumo.
- **Refatoração Arquitetural:** O router do AI Studio foi completamente refatorado para seguir os padrões de `t.router` e `t.mergeRouters`.
- **Teste de Integração:** Um teste robusto usando `createCaller` foi criado, validando a funcionalidade de ponta a ponta.
- **Documentação Aprimorada:** Foram criados e atualizados múltiplos documentos para refletir os novos padrões de teste.

### Alinhamento Arquitetural

- **Service Layer:** A implementação respeita 100% o padrão de Service Layer para comunicação entre domínios.
- **Padrões tRPC:** A refatoração do router alinhou o AI Studio com as lições aprendidas sobre `t.router` e `t.mergeRouters`.
- **Testes:** A estratégia de testes evoluiu para um padrão mais robusto e adequado para a validação de APIs, que agora está documentado.

**Status Final:** A funcionalidade de backend para as Instruções da Plataforma está pronta, validada e alinhada com os mais altos padrões do projeto Kodix.
