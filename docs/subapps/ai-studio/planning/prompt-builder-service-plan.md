# Plano de Implementação: PromptBuilderService

**Data:** 2025-06-30
**Autor:** KodixAgent
**Status:** 🟡 Proposta
**Escopo:** AI Studio - Backend
**Tipo:** Orquestração de Lógica
**Documentos de Referência:**

- [Roadmap de Padronização de Configurações](../../core-engine/configuration-standardization-roadmap.md)
- [Análise Crítica do Core Engine](../../core-engine/critical-analysis-and-evolution.md)
- [Arquitetura do AI Studio](../ai-studio-architecture.md)

---

## 1. Sumário Executivo

Este plano detalha a criação do `PromptBuilderService`, um serviço de backend que representa o **primeiro passo tangível** na direção da visão descrita no `@configuration-standardization-roadmap.md`.

O objetivo é centralizar a **lógica de negócio** de como os prompts de sistema da IA são construídos, implementando a hierarquia de instruções (Plataforma, Time, Usuário). Esta implementação será feita de forma **pragmática e desacoplada**, prevendo sua futura integração com o `CoreEngine.ConfigurationService` sem a necessidade de retrabalho significativo.

## 2. Contexto Arquitetural e Análise Crítica

A `@critical-analysis-and-evolution.md` aponta corretamente que muitas funcionalidades do "Core Engine" estão hoje dispersas. A criação do `PromptBuilderService` dentro do domínio do AI Studio, mas seguindo os princípios de um serviço de infraestrutura, é um passo deliberado para corrigir isso.

Estamos implementando a **camada de domínio (a "inteligência")** antes da **camada de infraestrutura (o `CoreEngine`)**.

- **O que fazemos agora:** Criamos a lógica que entende o que são "instruções de plataforma" e como elas se combinam.
- **O que o roadmap fará depois:** Criará um serviço genérico (`CoreEngine.ConfigurationService`) para otimizar a _busca_ e o _merge_ desses dados.

Este plano garante que a lógica de negócio do AI Studio permaneça em seu domínio correto, enquanto se prepara para delegar as tarefas de infraestrutura ao `CoreEngine` quando este estiver maduro.

## 3. Arquitetura da Solução

O `PromptBuilderService` funcionará como um orquestrador que consome as diferentes fontes de configuração. Inicialmente, ele consumirá o `PlatformService` (que lê a configuração do arquivo local) e terá placeholders para consumir os futuros serviços de configuração de Time e Usuário.

```mermaid
graph TD
    subgraph "Domínio do AI Studio (Lógica de Negócio)"
        A[AiStudioService] -->|1. Pede prompt| B(PromptBuilderService)
        B -->|2. Pede instruções de plataforma| E[PlatformService]
        B -->|3. (Futuro) Pede config. de Time| D[TeamConfigService]
        B -->|4. (Futuro) Pede config. de Usuário| C[UserConfigService]

        E -->|retorna string| B
        D -->|retorna string| B
        C -->|retorna string| B

        B -->|5. Monta prompt final| A
    end

    subgraph "Fontes de Dados (Abstraídas)"
        F[(Config. de Plataforma)]
        G[(Config. de Time - DB)]
        H[(Config. de Usuário - DB)]
    end

    E --> F
    D --> G
    C --> H

    style B fill:#c8e6c9,stroke:#333
    style A fill:#b39ddb,stroke:#333
```

- **Ponto Chave:** O `PromptBuilderService` **não sabe como** os dados são obtidos; ele apenas confia no contrato dos serviços que consome. Isso permite que, no futuro, a implementação interna do `PlatformService` seja substituída por uma chamada ao `CoreEngine` sem que o `PromptBuilderService` precise mudar.

## 4. Checklist de Implementação Detalhado

### Fase 1: Implementação dos Serviços Base

1.  **[ ] Criar `PlatformService`**

    - **Arquivo:** `packages/api/src/internal/services/platform.service.ts`
    - **Responsabilidade:** Ler o arquivo `ai-studio.config.ts` e substituir as variáveis (`{{userName}}`, etc.) usando dados do usuário buscados no DB.
    - **Nota:** Este serviço é uma implementação _temporária_ da busca de configuração de Nível 1, que será substituída pelo `CoreEngine` no futuro.

2.  **[ ] Criar `PromptBuilderService`**

    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`
    - **Responsabilidade:**
      - Chamar `PlatformService.buildInstructionsForUser()`.
      - Ter placeholders comentados para as chamadas futuras ao `TeamConfigService` e `UserConfigService`.
      - Implementar a lógica de concatenação com o separador `---`, respeitando a ordem de precedência: **Usuário > Time > Plataforma**.

3.  **[ ] Integrar no `AiStudioService`**

    - **Arquivo:** `packages/api/src/internal/services/ai-studio.service.ts`
    - **Ação:** Criar um novo método `getSystemPromptForChat` que simplesmente delega a chamada para `PromptBuilderService.buildFinalSystemPrompt`. Isso mantém o `AiStudioService` como a fachada oficial do domínio.

4.  **[ ] Integrar no Router tRPC**
    - **Arquivo:** `packages/api/src/trpc/routers/app/ai-studio/_router.ts`
    - **Ação:** Expor o novo método `getSystemPromptForChat` através de um novo `protectedProcedure`. Garantir que a estrutura do router siga os padrões de `t.router()` e `t.mergeRouters` para preservar a inferência de tipos.

### Fase 2: Validação e Testes

1.  **[ ] Criar Teste de Integração de API**
    - **Arquivo:** `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`
    - **Padrão:** Seguir o `api-integration-testing-pattern.md`, usando `createCaller` para invocar o novo endpoint.
    - **Cenários a Cobrir:**
      - Validar que o `systemPrompt` retornado contém as variáveis do usuário substituídas corretamente.
      - Validar que, se o usuário não for encontrado no DB, o template original (com as variáveis `{{...}}`) é retornado.
      - Mockar o `PlatformService` para retornar `null` e garantir que o `PromptBuilderService` retorna uma string vazia.
      - Garantir que a chamada falha para usuários não autenticados.

## 5. Alinhamento com o Roadmap de Configuração

Este plano se alinha perfeitamente com o `@configuration-standardization-roadmap.md` por ser uma **implementação vertical e pragmática**.

- **O que Entregamos Agora:** Uma funcionalidade completa e testada (a construção do prompt Nível 1) que agrega valor imediato.
- **Como se Alinha ao Futuro:** Quando o `CoreEngine.ConfigurationService` estiver pronto, a refatoração será mínima:
  1.  O `PlatformService` será removido.
  2.  O `PromptBuilderService` deixará de chamar 3 serviços diferentes e passará a chamar apenas `CoreEngine.config.get()`.
  3.  A lógica de `deepMerge` que hoje não existe (pois só temos 1 nível) será naturalmente absorvida pelo `CoreEngine`.

Essa abordagem evita o "big bang" de ter que construir todo o `CoreEngine` de uma vez, permitindo-nos entregar valor de forma incremental enquanto construímos a fundação para a arquitetura final.
