# Plano de Implementação v5 (A Estratégia do Arquiteto)

**Data:** 2025-07-02
**Autor:** KodixAgent
**Status:** 📝 **Plano Detalhado e Resiliente - Pronto para Execução**
**Documentos de Referência:**

- `@ai-studio-architecture.md` (Princípio do SubApp Core)
- `@ai-studio-lessons-learned.md` (Lição #1 - NÃO duplicar lógica de config)
- `@subapp-architecture.md` (Comunicação via Service Layer)
- `@trpc-patterns.md` (Uso de `createAppCaller`)
- `@kodix-logs-policy.md` (Padrões de Logging)
- `@backend-guide.md` (Padrão para criação de novos endpoints)

---

## 🎯 Objetivo Arquitetural

Refatorar a lógica de construção do `systemPrompt` para que o `AiStudioService` atue como um **orquestrador**, consumindo os endpoints genéricos de configuração (`app.getUserAppTeamConfig`, etc.) em vez de acessar os repositórios diretamente. Esta abordagem honra a arquitetura existente, evita a duplicação de lógica e adere estritamente às lições aprendidas sobre a gestão de configurações de SubApps.

---

### **Fase 0: Preparação e Análise de Risco (Pré-voo)**

_Objetivo: Validar todas as premissas e garantir que o ambiente está pronto antes de iniciar a implementação._

1.  **[ ] Auditoria do `tRPC Caller`:**

    - **Ação:** Inspecionar `packages/api/src/trpc/root.ts` e/ou helpers relacionados.
    - **Critério de Sucesso:** Confirmar a existência e a assinatura de `createAppCaller`. Entender qual `context` (`ctx`) é necessário para sua instanciação. Esta é a dependência mais crítica do plano.

2.  **[ ] Auditoria dos Endpoints Genéricos:**

    - **Ação:** Verificar no router `packages/api/src/trpc/routers/app/_router.ts` a existência dos endpoints genéricos `getUserAppTeamConfig` e `getAppTeamConfig`.
    - **Critério de Sucesso:** Confirmar que ambos os endpoints existem. Se o de `getAppTeamConfig` não existir, executar o **Plano de Contingência** abaixo.

3.  **[ ] (Contingência) Criar Endpoint `getAppTeamConfig`:**
    - **Escopo:** Apenas se o passo anterior falhar.
    - **Ação 1 (Validador):** Criar `getAppTeamConfigSchema` em `@kdx/validators`.
    - **Ação 2 (Handler):** Criar o arquivo `getAppTeamConfig.handler.ts` em `packages/api/src/trpc/routers/app/`, seguindo o padrão do `backend-guide.md`. A lógica deve usar o `appRepository.findAppTeamConfigs`.
    - **Ação 3 (Router):** Registrar o novo endpoint no `_router.ts` principal dos apps, usando `t.router()` para preservar os tipos.
    - **Ação 4 (Validação):** Executar `pnpm build --filter=@kdx/api` e `pnpm typecheck` para garantir que a API está saudável antes de continuar.

### **Fase 1: Implementação da Orquestração no `AiStudioService`**

_Objetivo: Implementar a lógica de orquestração no `AiStudioService` para que ele consuma os serviços genéricos corretos, seguindo os padrões de logging e contexto._

1.  **[ ] Refatorar Assinatura do Método:**

    - **Arquivo:** `packages/api/src/internal/services/ai-studio.service.ts`.
    - **Ação:** Implementar ou refatorar a assinatura do método para `getSystemPrompt(ctx: TProtectedProcedureContext, params: { teamId: string; userId: string; })`.
    - **Justificativa:** O método **deve** receber o `ctx` como primeiro argumento para poder instanciar o `appCaller`, corrigindo a falha de design de planos anteriores.

2.  **[ ] Implementar Lógica de Orquestração:**

    - **Ação:** Dentro do `getSystemPrompt`:
      1.  Instanciar o `appCaller` usando o `ctx` recebido.
      2.  Chamar `await appCaller.app.getUserAppTeamConfig(...)` para obter as configurações de Nível 3.
      3.  Chamar `await appCaller.app.getAppTeamConfig(...)` para obter as configurações de Nível 2.
      4.  Obter as configurações de Nível 1 (Plataforma) da fonte interna.
      5.  Aplicar a lógica de `deepMerge` e retornar a string final formatada.
    - **Critério de Sucesso:** O serviço **NÃO** deve mais importar nenhum `Repository` para esta tarefa.

3.  **[ ] Adicionar Logging de Auditoria:**
    - **Ação:** Adicionar um log padronizado no início do método, conforme `@kodix-logs-policy.md`.
    - **Exemplo:** `console.log( `🔄 [AI_STUDIO_SERVICE] getSystemPrompt for team: ${params.teamId}, user: ${params.userId}` );`

### **Fase 2: Expansão e Refatoração de Testes (Lição #14)**

_Objetivo: Garantir que a nova lógica de orquestração é coberta por testes robustos._

1.  **[ ] Adicionar/Atualizar Testes Unitários:**

    - **Ação:** Atualizar os testes do `AiStudioService` para o método `getSystemPrompt`.
    - **Critério de Sucesso:**
      - Os testes devem agora **mockar o `appCaller`** e suas chamadas (`.app.getUserAppTeamConfig`, etc.), em vez de mockar repositórios.
      - Validar os 4 cenários de mesclagem (apenas Nível 1; Nível 1+2; Nível 1+2+3; Nível 3 desabilitado).

2.  **[ ] Validação Incremental:**
    - **Ação:** Executar `pnpm typecheck --filter=@kdx/api` e `pnpm test --filter=@kdx/api`.
    - **Critério de Sucesso:** O pacote `@kdx/api` deve compilar e passar nos testes com a nova lógica.

### **Fase 3: Refatoração do Consumidor e Validação Final**

_Objetivo: Simplificar o endpoint do Chat, garantir o funcionamento de ponta a ponta e limpar a documentação._

1.  **[ ] Refatorar Endpoint do Chat:**

    - **Arquivo:** `apps/kdx/src/app/api/chat/stream/route.ts`.
    - **Ação:** Simplificar o handler para que ele passe seu próprio `ctx` para o serviço: `await AiStudioService.getSystemPrompt(ctx, { teamId, userId })`.

2.  **[ ] Validação Completa do Sistema (Lição #9):**

    - **Ação:** Executar a sequência completa de inicialização: `sh ./scripts/stop-dev.sh && sh ./scripts/start-dev-bg.sh && sleep 5 && sh ./scripts/check-log-errors.sh && sh ./scripts/check-dev-status.sh`.
    - **Critério de Sucesso:** O servidor deve iniciar sem erros e estar `RUNNING`.

3.  **[ ] Teste Funcional e Gerenciamento de Logs:**

    - **Ação:** Se necessário para o teste, adicionar logs de debug com prefixo `[DEBUG_PROMPT_FIX]`.
    - **Registro:** Registrar **qualquer** log de debug temporário no arquivo `docs/debug/logs-registry.md`, conforme a política.
    - **Cleanup:** Após a validação funcional, remover os logs de debug e atualizar o registro.

4.  **[ ] Atualizar Documentação de Arquitetura:**

    - **Ação:** Atualizar os diagramas em `@ai-studio-architecture.md` e `@chat-architecture.md` para refletir o fluxo de orquestração correto (`Chat -> AiStudioService -> AppCaller -> Generic Endpoints -> DB`).

5.  **[ ] Arquivamento:**
    - **Ação:** Marcar este plano como `✅ Executado`.
