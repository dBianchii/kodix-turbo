# Plano de Refatoração: PromptBuilderService

**Data:** 2025-07-03
**Autor:** KodixAgent
**Status:** 🔴 **BLOQUEADO**
**Documentos de Referência:**

- `@lessons-learned.md` (Arquitetura e AI Studio)
- `@subapp-architecture.md` (Comunicação via Service Layer)
- `@ai-studio-architecture.md` (Papel do Core Engine)
- `@kodix-logs-policy.md` (Padrões de Logging)

---

## 🎯 Objetivo Arquitetural

Refatorar o `PromptBuilderService` para que ele consuma a configuração hierárquica completa (Níveis 1, 2 e 3) do `ConfigurationService` do `CoreEngine`, que deve estar totalmente funcional.

---

### **Fase 1: Pré-requisito - Finalização do `CoreEngine`**

**Status:** 🔴 **BLOQUEADO**
**Ação:** A execução deste plano depende da conclusão do plano a seguir.

- **👉 [Plano de Finalização do ConfigurationService](../../../core-engine/planning/finish-configuration-service-plan.md)**

---

### **Fase 2: Refatoração do `PromptBuilderService`**

_Objetivo: Simplificar o `PromptBuilderService` para que ele consuma a configuração completa e mesclada do `CoreEngine`._

1.  **[ ] Simplificar `buildFinalSystemPrompt`:**
    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`
    - **Ação:**
      1.  Remover os `// TODO` e a lógica separada para cada nível de instrução.
      2.  Fazer uma **única chamada** a `CoreEngine.config.get({ appId, teamId, userId })`.
      3.  Extrair as instruções (`platformInstructions`, `teamInstructions`, `userInstructions`) do objeto de configuração mesclado retornado pelo CoreEngine.
      4.  Manter a função `combineInstructions` para formatar o prompt final.
2.  **[ ] Adicionar Logging de Auditoria Detalhado:**
    - **Ação:** Adicionar logs, seguindo a `@kodix-logs-policy.md`, para indicar claramente quais níveis de configuração foram encontrados e aplicados.
    - **Exemplo:** `[PROMPT_BUILDER] Merged instructions from: Platform, Team.`

### **Fase 3: Validação Integrada e Finalização**

_Objetivo: Garantir que a integração ponta a ponta funciona como esperado e limpar a documentação._

1.  **[ ] Atualizar Teste de Integração do AI Studio:**
    - **Arquivo:** `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`
    - **Ação:** Modificar o teste que valida `getSystemPromptForChat` para mockar a chamada ao `CoreEngine.config.get()`. Testar cenários onde o mock retorna diferentes combinações de configurações para validar a construção do prompt final.
2.  **[ ] Validação Completa do Monorepo:**
    - **Ação:** Executar `pnpm typecheck` na raiz e rodar a sequência completa de inicialização do servidor: `sh ./scripts/stop-dev.sh && sh ./scripts/start-dev-bg.sh && sleep 5 && sh ./scripts/check-log-errors.sh && sh ./scripts/check-dev-status.sh`, conforme a **Lição de Arquitetura #9**.
3.  **[ ] Teste Funcional End-to-End:**
    - **Ação:** No navegador, configurar instruções em diferentes níveis (usuário e time) no AI Studio.
    - **Critério de Sucesso:** Iniciar um novo chat e verificar se o comportamento da IA reflete a combinação correta das instruções.
4.  **[ ] Atualizar Documentação de Arquitetura:**
    - **Ação:**
      1.  Marcar este plano como `✅ Executado`.
      2.  Revisar `@ai-studio-architecture.md` e `@chat-architecture.md` para garantir que os diagramas e descrições refletem o fluxo de dados consolidado através do `CoreEngine`.
