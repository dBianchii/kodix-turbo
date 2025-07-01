# Plano de Finalização: ConfigurationService v1

**Data:** 2025-07-03
**Autor:** KodixAgent
**Status:** 📝 **Pronto para Execução**
**Dependência de:** `docs/core-engine/planning/core-engine-v1-config-plan.md` (Completa a Fase 4)

---

## 🎯 Objetivo

Tornar o `ConfigurationService` do `CoreEngine` totalmente funcional, implementando a busca e a mesclagem hierárquica das configurações de Nível 2 (Time) e Nível 3 (Usuário) a partir do banco de dados.

---

### **Fase 1: Implementação da Lógica de Busca no Serviço**

1.  **[ ] Habilitar Acesso ao DB e Resolver Imports:**
    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`
    - **Ação:** Descomentar a integração com o `@kdx/db` e garantir que todos os repositórios (`appRepository`, `userAppTeamConfigRepository`) sejam importados corretamente a partir do ponto de entrada do pacote, conforme a **Lição de Arquitetura #12**.
2.  **[ ] Implementar Busca de Configuração de Nível 2 (Time):**
    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`
    - **Ação:** No método `get`, implementar a lógica para buscar as configurações do time (`appTeamConfigs`) usando o `appRepository`.
3.  **[ ] Implementar Busca de Configuração de Nível 3 (Usuário):**
    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`
    - **Ação:** Implementar a lógica para buscar as configurações específicas do usuário (`userAppTeamConfigs`) usando o repositório correspondente.
4.  **[ ] Garantir a Mesclagem Hierárquica Correta:**
    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`
    - **Ação:** Assegurar que a função `deepMerge` é aplicada na ordem de precedência correta: **Nível 3 (Usuário) > Nível 2 (Time) > Nível 1 (Plataforma)**.

### **Fase 2: Validação e Testes (TDD)**

1.  **[ ] Criar Arquivo de Teste:**
    - **Ação:** Criar o arquivo de teste `packages/core-engine/src/configuration/configuration.service.test.ts`, que foi identificado como ausente na auditoria.
2.  **[ ] Escrever Testes de Unidade Robustos:**
    - **Ação:** Adicionar testes de unidade que mockam as chamadas aos repositórios.
    - **Critério de Sucesso:** Validar todos os cenários de mesclagem (apenas N1; N1+N2; N1+N2+N3; N1+N3), seguindo a **Lição de Arquitetura #14** sobre mocks precisos com schemas Zod.
3.  **[ ] Validação Incremental do Pacote:**
    - **Comando:** `pnpm test --filter=@kdx/core-engine` e `pnpm typecheck --filter=@kdx/core-engine`.
    - **Critério de Sucesso:** Todos os testes do pacote `@kdx/core-engine` devem passar e não deve haver erros de tipo.

### **Fase 3: Validação Final e Documentação**

1.  **[ ] Validação Completa do Servidor:**
    - **Comando:** Executar a sequência completa `sh ./scripts/stop-dev.sh && sh ./scripts/start-dev-bg.sh && sleep 5 && sh ./scripts/check-log-errors.sh && sh ./scripts/check-dev-status.sh` para garantir que a mudança não introduziu regressões.
2.  **[ ] Atualizar Documentação:**
    - **Ação 1:** Marcar este plano como `✅ Executado`.
    - **Ação 2:** Atualizar o `docs/core-engine/planning/core-engine-v1-config-plan.md` para marcar a Fase 4 como concluída.
