# Plano de Finalização v7 (Execução Atômica e à Prova de Build)

**Data:** 2025-07-03
**Autor:** KodixAgent
**Status:** 📝 **Plano Final Auditado e Pronto para Execução**
**Dependência de:** `docs/core-engine/planning/core-engine-v1-config-plan.md`
**Visão Futura:** Este plano é o pré-requisito para [strengthen-core-engine-typing-plan.md](./strengthen-core-engine-typing-plan.md).

---

## 🎯 Objetivo

Realizar a refatoração **definitiva** do `ConfigurationService` no `CoreEngine`. Isso inclui: 1) Corrigir a lógica de busca e mesclagem hierárquica; 2) Implementar uma cobertura de testes completa e robusta via TDD; e 3) **Remover métodos obsoletos e redundantes**, resultando em um serviço limpo, minimalista e à prova de falhas.

---

## 🚦 Análise de Risco e Mitigação (Baseado em Lições Aprendidas)

1.  **Risco: Código Obsoleto e Redundante**

    - **Descrição:** O `configuration.service.ts` atual contém métodos como `getTeamLevel()` que duplicam a lógica e violam o Princípio da Responsabilidade Única, criando uma superfície de API confusa e aumentando a dívida técnica.
    - **Mitigação:** A Fase 2 deste plano inclui uma ação explícita para remover todos os métodos públicos exceto o `get()`, garantindo um serviço limpo e focado.

2.  **Risco: Configuração de Teste Incompleta (Lição #13)**

    - **Descrição:** O pacote `@kdx/core-engine` não possui as `devDependencies` (`vitest`) ou o script `test`, impedindo a execução padronizada dos testes.
    - **Mitigação:** A "Fase 0" deste plano é inteiramente dedicada a preparar o ambiente de teste antes de qualquer outra ação.

3.  **Risco: Mocks de Teste Imprecisos (Lição #14)**

    - **Descrição:** Mocks de repositório que não correspondem à estrutura de retorno da API do Drizzle (ex: objeto vs. array de objetos) causarão falhas.
    - **Mitigação:** A Fase 1 exige que os mocks retornem a estrutura correta (`mockResolvedValue([...])`) e que seus dados internos sejam validados com os schemas Zod.

4.  **Risco: Resolução de Módulos (Lição #12 & #20)**

    - **Descrição:** Imports de sub-paths ou a tentativa de consumir um repositório não exportado pelo ponto de entrada do pacote `@kdx/db` quebrará o build.
    - **Mitigação:** A Fase 2 força a ordem correta de operações: primeiro garantir a exportação em `@kdx/db`, **compilar o pacote**, e só então consumir a nova funcionalidade em `@kdx/core-engine`.

5.  **Risco: Erros Silenciosos (Lição #21)**
    - **Descrição:** O uso de `try/catch` no serviço mascara erros críticos de banco de dados.
    - **Mitigação:** A Fase 2 instrui a remoção dos `try/catch`, adotando uma estratégia "fail-fast". O Cenário 5 dos testes valida este comportamento.

---

## ♟️ Plano de Execução (TDD)

### **Fase 0: Preparação do Ambiente de Teste (Pré-voo)**

_Objetivo: Corrigir o ambiente de teste do pacote `@kdx/core-engine` para habilitar o fluxo TDD. Executar esta fase primeiro e na totalidade._

1.  **[ ] Configurar `package.json` para Testes (Lição #13)**

    - **Arquivo:** `packages/core-engine/package.json`
    - **Ação 1:** Adicionar `vitest` e `@vitest/coverage-v8` às `devDependencies`.
    - **Ação 2:** Adicionar o script `"test": "vitest run"` à seção `scripts`.
    - **Ação 3:** Rodar `pnpm install` na raiz do projeto para aplicar as mudanças.

2.  **[ ] Criar Estrutura de Teste**
    - **Ação 1:** Criar o diretório `packages/core-engine/src/configuration/__tests__/`.
    - **Ação 2:** Criar o arquivo de teste `packages/core-engine/src/configuration/__tests__/configuration.service.test.ts`.

### **Fase 1: Escrita dos Testes (Definindo o Contrato)**

_Objetivo: Escrever um conjunto completo de testes **apenas para o método `get()`** que irão, inicialmente, falhar, definindo o comportamento único e esperado do serviço._

1.  **[ ] Escrever Testes de Unidade para `ConfigurationService.get()`**

    - **Arquivo:** `packages/core-engine/src/configuration/__tests__/configuration.service.test.ts`
    - **Ação:** Escrever os cenários de teste, importando `vi` do `vitest`.
    - **Detalhe Crítico (Lição #14):** Mockar `appRepository` e `userAppTeamConfigRepository` para retornar arrays (`mockResolvedValue([...])`).
    - **Cenários a Cobrir:**
      - **[ ] Cenário 1:** Apenas Nível 1 (repositórios retornam `[]`).
      - **[ ] Cenário 2:** Nível 1 + Nível 2 mesclados corretamente.
      - **[ ] Cenário 3:** Nível 1 + Nível 3 mesclados corretamente.
      - **[ ] Cenário 4:** Todos os 3 níveis mesclados, validando a precedência **Nível 3 > Nível 2 > Nível 1**.
      - **[ ] Cenário 5:** O serviço lança um erro se uma das chamadas ao repositório falhar (sem `try/catch`).

2.  **[ ] Validar Testes Falhando**
    - **Comando:** `pnpm test --filter=@kdx/core-engine`
    - **Critério de Sucesso:** Os testes devem rodar e falhar, provando que a lógica atual não atende aos requisitos.

### **Fase 2: Implementação e Limpeza (Fazendo os Testes Passarem)**

_Objetivo: Refatorar o `ConfigurationService` para ter apenas a lógica correta no método `get`, fazendo todos os testes passarem._

1.  **[ ] Expor Repositórios no Ponto de Entrada (Lição #12 & #20)**

    - **Arquivo:** `packages/db/src/repositories/index.ts`
    - **Ação:** Garantir que `userAppTeamConfigRepository` seja exportado (`export * from "./userAppTeamConfigs"`).

2.  **[ ] Compilar o Pacote Provedor (Lição #6)**

    - **Comando:** `pnpm build --filter=@kdx/db`
    - **Ação:** Garantir que o pacote de banco de dados seja compilado com sucesso, disponibilizando os novos exports para o resto do workspace antes do consumo.

3.  **[ ] Refatorar a Lógica de Busca no Serviço**

    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`
    - **Ação 1:** Importar `appRepository` e `userAppTeamConfigRepository` de `@kdx/db`.
    - **Ação 2 (Lição #21):** Remover os blocos `try/catch` do método `get`.
    - **Ação 3:** Corrigir a busca de Nível 3 para usar `userAppTeamConfigRepository.findUserAppTeamConfigs(...)`.
    - **Ação 4:** Garantir que a lógica de `deepMerge` é aplicada na ordem correta.
    - **Ação 5 (Limpeza):** Remover completamente os métodos obsoletos `getTeamLevel()` e `getPlatformOnly()`.

4.  **[ ] Validar Testes Passando**

    - **Comando:** `pnpm test --filter=@kdx/core-engine`
    - **Critério de Sucesso:** Todos os testes criados na Fase 1 agora devem passar.

5.  **[ ] Validação de Tipos**
    - **Comando:** `pnpm typecheck --filter=@kdx/core-engine`
    - **Critério de Sucesso:** O pacote não deve ter nenhum erro de tipo.

### **Fase 3: Validação Final e Documentação**

_Objetivo: Garantir que a mudança não introduziu nenhuma regressão no sistema e atualizar a documentação relevante._

1.  **[ ] Validação Completa do Servidor (Lição #9)**

    - **Comando:** Executar a sequência completa `sh ./scripts/stop-dev.sh && sh ./scripts/start-dev-bg.sh && sleep 5 && sh ./scripts/check-log-errors.sh && sh ./scripts/check-dev-status.sh`.
    - **Critério de Sucesso:** O servidor deve iniciar sem erros e estar no estado `RUNNING`.

2.  **[ ] Atualizar Documentação**
    - **Ação 1:** Marcar este plano (`finish-configuration-service-plan.md`) como `✅ Executado`.
    - **Ação 2:** Atualizar o documento `docs/core-engine/planning/core-engine-v1-config-plan.md` para marcar a Fase 4 como oficialmente concluída.
