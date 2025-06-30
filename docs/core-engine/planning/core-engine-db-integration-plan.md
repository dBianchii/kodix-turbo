# Plano de Implementação: Integração DB do ConfigurationService (v8 - Revisado e Assertivo)

**Data:** 2025-07-02  
**Autor:** KodixAgent  
**Status:** 📝 Proposta Revisada
**Escopo:** Finalizar a implementação do `ConfigurationService` no `@kdx/core-engine`.

**Documentos de Arquitetura Obrigatórios:**

- `docs/architecture/lessons-learned.md` (incluindo as novas lições 13, 14 e 15)
- `docs/architecture/Architecture_Standards.md`
- `docs/debug/kodix-logs-policy.md`

---

## 1. Resumo Executivo

Após uma execução inicial com desafios, este plano foi **revisado para ser mais assertivo e à prova de erros**. Ele incorpora as lições aprendidas sobre configuração de testes, mocking type-safe e análise de logs. A metodologia TDD é mantida, mas com passos de validação muito mais explícitos para garantir uma execução limpa.

O objetivo permanece o mesmo: conectar o `ConfigurationService` ao banco de dados para habilitar a busca de configurações de Time (Nível 2) e Usuário (Nível 3).

### Objetivos

1.  **Preparar o Ambiente de Teste:** Garantir que o pacote `@kdx/core-engine` esteja configurado para testes.
2.  **Provar a Falha (TDD):** Criar um teste de compilação que falhe.
3.  **Corrigir a Resolução de Módulos:** Expor os repositórios do `@kdx/db` de forma segura.
4.  **Reativar a Lógica de Banco de Dados:** Implementar a busca real por configurações.
5.  **Validar com Testes Type-Safe:** Garantir que os testes passem com mocks que respeitam 100% os schemas Zod.
6.  **Auditar o Impacto Sistêmico:** Validar que a mudança não causou efeitos colaterais.
7.  **Garantir a Limpeza:** Assegurar que nenhum artefato de teste seja deixado no código.

---

## 2. 🚦 Princípios Orientadores (Checklist Pré-voo)

- **[✅] (Análise) Lição #12 - Resolução de Módulos:** Análise confirmada.
- **[ ] (Preparação) Lição #13 - Configuração de Testes:** Verificaremos a configuração de teste do pacote antes de começar.
- **[ ] (TDD) Prova de Falha:** O teste que falha continua sendo o primeiro passo de codificação.
- **[ ] (Validação) Lição #6 - Validação Incremental:** `pnpm typecheck --filter` será executado após cada passo.
- **[ ] (Responsabilidade) Lição #14 - Mocks Type-Safe:** A fase de testes agora detalha como criar mocks precisos.
- **[ ] (Análise de Logs) Lição #15 - Erros de Ambiente:** O fluxo de validação final inclui a análise crítica dos logs.
- **[ ] (Contingência) Lição #3 do AI Studio:** O plano de limpeza de cache permanece disponível.
- **[ ] (Validação Final) Lição #9 - Validação em Runtime:** O fluxo completo de `stop -> start -> check-log-errors -> check-status` continua sendo o critério final de sucesso.

---

## 3. Checklist de Implementação Detalhado

### **Fase 0: Preparação e Verificação**

1.  **[ ] Inspecionar Configuração de Teste (Lição #13):**
    - Verificar `packages/core-engine/package.json`.
    - Garantir que `vitest` e `@vitest/coverage-v8` existam em `devDependencies`.
    - Garantir que o script `"test": "vitest run"` exista em `scripts`.
    - Se ausente, adicionar e rodar `pnpm install`.
2.  **[✅] Inspecionar Módulos (Lição #12):**
    - `packages/db/src/index.ts` inspecionado.
    - `packages/db/src/repositories/index.ts` inspecionado.

### **Fase 1: Escrever um Teste que Falha (TDD)**

1.  **[ ] Criar Arquivo de Teste:** Criar o arquivo `packages/core-engine/src/configuration/__tests__/tdd-import.test.ts`.
2.  **[ ] Escrever Teste de Falha de Import:** No arquivo, adicionar apenas `import { appRepository } from "@kdx/db";` e um `it` block simples.
3.  **[ ] Validar Falha:** Executar `pnpm typecheck --filter=@kdx/core-engine`. **DEVE FALHAR** com `Cannot find module`.

### **Fase 2: Implementação da Solução**

1.  **[ ] Expor Repositórios no `@kdx/db`:** Adicionar `export * from "./repositories";` ao final de `packages/db/src/index.ts`.
2.  **[ ] Validar Build do `@kdx/db`:** Executar `pnpm build --filter=@kdx/db`. Deve passar.
3.  **[ ] Validar Teste TDD:** Executar `pnpm typecheck --filter=@kdx/core-engine`. O teste `tdd-import.test.ts` **DEVE PASSAR**.
4.  **[ ] Remover Teste TDD:** Excluir o arquivo `tdd-import.test.ts`.
5.  **[ ] Corrigir Lógica no `@kdx/core-engine`:** No `configuration.service.ts`, corrigir o `import` e reativar a lógica de busca no banco, incluindo a correção do tipo do `appId` para `AppIdsWithUserAppTeamConfig`.

### **Fase 3: Validação da Correção e Testes (Assertivo)**

1.  **[ ] Validar Correção de Tipo:** `pnpm typecheck --filter=@kdx/core-engine` **DEVE PASSAR**.
2.  **[ ] Criar Estrutura de Teste de Unidade:** Criar `packages/core-engine/src/configuration/__tests__/configuration.service.test.ts`.
3.  **[ ] Implementar Mocks Type-Safe (Lição #14):**
    - **3.1.** Mockar o módulo `@kdx/db` com `vi.mock`.
    - **3.2.** No arquivo de teste, importar os schemas Zod necessários de `@kdx/shared` (ex: `aiStudioConfigSchema`, `aiStudioUserAppTeamConfigSchema`).
    - **3.3.** Criar objetos de mock para `mockTeamConfig` e `mockUserConfig` que sejam **100% compatíveis** com os schemas importados, incluindo todas as propriedades obrigatórias (ex: `appliesTo`).
    - **3.4.** Configurar as chamadas mockadas (ex: `vi.mocked(appRepository.findAppTeamConfigs).mockResolvedValue(...)`) para retornar a **estrutura de dados completa e correta**, incluindo `teamId` e `userId` se a função original os retornar.
4.  **[ ] Expandir Testes de Unidade:** Com os mocks corretos, escrever os `it` blocks para testar:
    - O merge hierárquico correto (Plataforma -> Time -> Usuário).
    - O tratamento de configurações ausentes (time ou usuário).
    - O tratamento de erros do banco de dados (chamadas rejeitadas).
    - Cenários com e sem `userId` (nível de time vs. nível de usuário).
5.  **[ ] Executar Testes do Pacote:** Executar `pnpm test --filter=@kdx/core-engine`. **DEVE PASSAR**.

### **Fase 4: Auditoria de Impacto Sistêmico**

1.  **[ ] Mapear Consumidores:** Executar `grep -r 'from "@kdx/db"' packages/ apps/` para listar todos os pacotes consumidores.
2.  **[ ] Validar Tipagem de Todos os Consumidores:** Para cada pacote encontrado, executar `pnpm typecheck --filter=<package-name>`.
3.  **[ ] Validação Final em Runtime (Lição #15):**
    - **3.1.** Executar a sequência completa `stop`, `start-bg`, `sleep`, `check-log-errors`.
    - **3.2.** Analisar criticamente a saída de `check-log-errors.sh`. Se houver erros, determinar se são do código modificado (bloqueante) ou de serviços de ambiente (não-bloqueante).
    - **3.3.** Apenas se não houver erros bloqueantes, executar `check-dev-status.sh` para confirmar que a aplicação está `RUNNING`.

### **Fase 5: Cleanup**

1.  **[ ] Remover Logs de Debug:** Garantir que nenhum `console.log` de depuração foi deixado no código.
2.  **[ ] Limpar Arquivos Modificados:** Reverter quaisquer outras alterações indesejadas que possam ter sido feitas durante o processo.

---

## 4. Métricas de Sucesso

- O teste TDD da Fase 1 falha e depois passa na Fase 2.
- A suíte de testes da Fase 3 passa completamente, com mocks type-safe.
- Nenhum pacote no monorepo apresenta novos erros de tipo após a mudança.
- A aplicação (`apps/kdx`) funciona sem regressões na validação final.
- Nenhum log de depuração temporário é deixado para trás.
