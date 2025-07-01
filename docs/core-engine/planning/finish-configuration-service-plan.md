# Plano de Execução v12: Estratégia Unificada (Contrato + Tipagem Forte + Helper de Merge)

**Data:** 2025-07-03
**Autor:** KodixAgent
**Status:** 📝 **Plano Final Auditável – Aguardando Execução**
**Dependência de:** `docs/core-engine/planning/core-engine-v1-config-plan.md`

**Objetivo Arquitetural:** Entregar em um **único ciclo**:

1.  Tipagem forte completa (`deepMerge<T,U>()`) eliminando `any`.
2.  `ConfigurationService` como provedor de **três objetos crus** (`platformConfig`, `teamConfig`, `userConfig`) – sem merge interno.
3.  Novo utilitário `mergeConfigs<T>()` (genérico, reexporta `deepMerge`) para uso por consumidores.
4.  Refatoração do `PromptBuilderService` para usar `mergeConfigs`, mantendo a ordem de precedência (Plataforma → Team → Usuário).

Esta abordagem unifica os planos `finish-configuration-service-plan.md` (v11) e `strengthen-core-engine-typing-plan.md`, evitando etapas duplicadas e garantindo que toda a cadeia (Core → API) esteja 100% type-safe.

---

## ♟️ Plano de Execução (TDD + Tipagem Forte)

### **Fase 0: Preparação (Sem Mudança)**

_Mantém exatamente os passos da Fase 0 do v11 (git status limpo, script `test` no `@kdx/core-engine`, criação de `__tests__/`)._

**Checklist expandido:**

1.  **[ ] Adicionar script de testes e dependências no `@kdx/core-engine`:**

    - **Arquivo:** `packages/core-engine/package.json`
    - **Ações:**
      1.  Adicionar script `"test": "vitest run"`.
      2.  Adicionar `vitest` e `@vitest/coverage-v8` em `devDependencies`.

2.  **[ ] Verificar existência da pasta de testes:**

    - Criar `packages/core-engine/src/configuration/__tests__/` caso não exista.

3.  **[ ] Grep de baseline para `deepMerge(` no monorepo:**
    ```bash
    grep -R "deepMerge(" --exclude="*.test.ts" packages/ | cat
    ```
    - **Resultado esperado:** Apenas utilitários e testes atuais. Mapear consumidores antes da refatoração.

---

### **Fase 1: Refatoração dos Utilitários de Merge**

1.  **[ ] Tipagem Forte do `deepMerge`:**

    - **Arquivo:** `packages/core-engine/src/configuration/utils/deep-merge.ts`
    - **Ação:** Alterar assinatura para genérica:
      ```ts
      export function deepMerge<T extends object, U extends object>(
        target: T,
        source: U,
      ): T & U {
      ```
    - **Observação:** Atualizar lógica para preservar arrays (spread simples) – manter comportamento atual.
    - **Testes:** Atualizar/expandir `deep-merge.test.ts` para validar inferência de tipos (uso de `expectTypeOf`).

2.  **[ ] Criar Helper `mergeConfigs<T>()`:**
    - **Arquivo:** `packages/core-engine/src/configuration/utils/merge-configs.ts`
    - **Ação:** Implementar função fina que chama `deepMerge` em cascata (parâmetros: `platformConfig, teamConfig, userConfig`).
    - **Export Público:** Reexportar via `packages/core-engine/src/configuration/utils/index.ts` (se existir) **ou** diretamente no `index.ts` do pacote, permitindo consumo externo.
    - **Testes:** Criar `merge-configs.test.ts` cobrindo ordem de precedência e inferência de tipo.
    - **[ ] Atualizar/ criar `index.ts` dentro de `utils/` para reexportar:**
      ```ts
      export * from "./deep-merge";
      export * from "./merge-configs";
      ```

---

### **Fase 2: `ConfigurationService` (Contrato Forte Wrapper)**

1.  **[ ] Remover Métodos Obsoletos:** Excluir `getTeamLevel` e `getPlatformOnly`.
2.  **[ ] Alterar `get()` para Wrapper:**
    - Retornar `Promise<{ platformConfig: TPlatform; teamConfig: TTeam; userConfig: TUser }>`
    - Cada nível buscado individualmente; sem `deepMerge`.
    - **Fail-Fast:** Propagar exceções de DB (remover `try/catch` silencioso).
3.  **[ ] Atualizar Tipos:** Usar `AppIdsWithUserAppTeamConfig` genérico (futuro) – manter `any` ZERO.
4.  **[ ] Tests:** Reescrever `configuration.service.test.ts` para validar novo wrapper.
5.  **[ ] Remover blocos `try/catch` supressores:** Grep por `Failed to fetch.*config` e remover, garantindo estratégia fail-fast.

---

### **Fase 3: Adaptar Consumidores (PromptBuilder & Futuro)**

1.  **[ ] Refatorar `PromptBuilderService`:**
    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`
    - Usar:
      ```ts
      const rawConfig = await CoreEngine.config.get({ ... });
      const finalConfig = mergeConfigs(
        rawConfig.platformConfig,
        rawConfig.teamConfig,
        rawConfig.userConfig,
      );
      ```
    - Remover todo código de spread manual.
2.  **[ ] Ajustar Testes do AI Studio & Chat:** mocks devem refletir novo wrapper + uso do helper.
3.  **[ ] Buscar consumidores residuais de `deepMerge(` fora do Core:**
    - Executar grep novamente após refatoração; se houver ocorrências, criar tarefas de ajuste.

---

### **Fase 4: Validações Globais & Documentação**

Mantém passos da Fase 3 do v11 (typecheck global, scripts de servidor, E2E manual, atualização de diagramas). **Adicional:**

- Marcar `strengthen-core-engine-typing-plan.md` como **obsoleto/absorvido** e adicionar banner no início:
  ```markdown
  > ⚠️ **Este plano foi 100% absorvido por [finish-configuration-service-plan.md](./finish-configuration-service-plan.md#). Nenhuma ação adicional necessária.**
  ```
- Marcar `strengthen-core-engine-typing-plan.md` como **obsoleto/absorvido**. Adicionar nota de redirecionamento.

---

## ✅ Critérios de Sucesso (Atualizados)

- `deepMerge` **genérico** sem `any`; testes comprovando.
- Novo utilitário `mergeConfigs<T>()` disponível para outros packages.
- `ConfigurationService.get()` retorna wrapper tipado; **não** faz merge.
- `PromptBuilderService` usa `mergeConfigs()`; build & testes passam.
- `pnpm typecheck` na raiz retorna **0** erros.
- Documentação de arquitetura atualizada para indicar novo fluxo.

---

> **IMPORTANTE:** Nenhuma linha de código deve ser modificada antes da aprovação explícita deste plano v12.
