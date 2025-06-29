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
    - **Arquivo:** `packages/api/src/trpc/routers/app/aiStudio/_router.ts` (ou similar)
    - **Ação:** Expor o novo método do `AiStudioService` através de um novo procedure no router do AI Studio, usando `t.router()` para garantir a integridade dos tipos.

### Fase 2: Testes e Validação

1.  **[ ] Adicionar Testes de Unidade para `PlatformService`:**

    - **Local:** `packages/api/src/__tests__/`
    - **Cenários a Cobrir:**
      - Substituição correta de todas as variáveis quando o usuário existe.
      - Retorno do template puro quando o usuário não é encontrado.
      - Retorno de string vazia se `platformInstructions.enabled` for `false`.
      - Comportamento com um template que não possui variáveis.

2.  **[ ] Adicionar Testes de Integração para `PromptBuilderService`:**

    - **Local:** `packages/api/src/__tests__/`
    - **Cenários a Cobrir:**
      - Garantir que ele chama corretamente o `PlatformService`.
      - Verificar se o formato da string final está correto (com separadores, quando as outras camadas forem adicionadas).

3.  **[ ] Teste E2E Manual:**
    - **Fluxo:** Iniciar o chat com um novo usuário.
    - **Verificação:** Adicionar um `console.log` **temporário** e **registrado** no `logs-registry.md` dentro do `stream/route.ts` do chat para exibir o `systemPrompt` recebido do `AiStudioService`. Validar se as instruções da plataforma, com as variáveis do usuário substituídas, estão presentes.
    - **Cleanup:** Remover o log temporário após a validação.

---

## 5. 🔬 Estratégia de Testes Aprimorada

- **Testes de Unidade:** Focados em `PlatformService` para validar a lógica de substituição de variáveis em isolamento.
- **Testes de Integração:** Validar a interação entre `PromptBuilderService` e `PlatformService`, garantindo que o encadeamento de chamadas funcione.
- **Teste E2E:** Um teste manual focado em verificar o resultado final no ponto de consumo mais crítico (o endpoint de stream do chat), usando logs temporários e controlados.

---

## 6. ⚠️ Gerenciamento de Riscos (Baseado em Lições Aprendidas)

- **Risco 1: Erros de Tipo Cross-Package.**

  - **Mitigação:** Seguir estritamente a **Ordem de Modificação de Pacotes** e a **Validação Incremental** descritas nos Princípios Orientadores. Esta implementação está contida principalmente no pacote `@kdx/api`, minimizando este risco específico, mas o princípio é mantido.

- **Risco 2: Quebra da Inferência de Tipos do tRPC.**

  - **Mitigação:** A integração do novo endpoint no router do AI Studio usará `t.router({...})` explicitamente, conforme a lição aprendida em `docs/architecture/lessons-learned.md`.

- **Risco 3: Lógica de Negócio Incorreta (Variáveis não substituídas).**

  - **Mitigação:** A estratégia de testes de unidade focará especificamente nos diferentes cenários de substituição de variáveis e casos de borda (usuário não encontrado).

- **Risco 4: Poluição de Logs.**
  - **Mitigação:** Qualquer log de debug usado no teste E2E será temporário, terá um prefixo padronizado (ex: `[DEBUG_PLATFORM_INSTRUCTIONS]`) e será registrado em `docs/debug/logs-registry.md` com um plano de remoção.

---

## 7. Estimativa de Tempo

- **Backend e Testes de Unidade/Integração:** 1-2 dias (considerando a abordagem cuidadosa e as validações incrementais).
- **Teste E2E e Cleanup:** 2-3 horas.
