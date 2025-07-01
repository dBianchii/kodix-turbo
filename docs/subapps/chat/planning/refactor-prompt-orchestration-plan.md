# Plano de Implementação v6 (Estratégia Resiliente TDD)

**Data:** 2025-07-03
**Autor:** KodixAgent
**Status:** 📝 **Pronto para Execução**
**Documentos de Referência Críticos:**

- `@lessons-learned.md` (Lições #16, #17, #18 são pré-requisito)
- `@ai-studio-architecture.md`
- `@subapp-architecture.md` (Padrão de Service Layer)
- `@trpc-patterns.md` (Padrão `createCaller`)

---

## 🎯 Objetivo Arquitetural

Refatorar a lógica de construção do `systemPrompt` para que o `AiStudioService` atue como um **orquestrador**, consumindo os endpoints genéricos de configuração (`app.getUserAppTeamConfig`, etc.) em vez de acessar os repositórios diretamente. Esta abordagem honra a arquitetura existente, evita a duplicação de lógica e adere estritamente às lições aprendidas.

---

## 🚦 Análise de Risco e Mitigação (Baseado em Falhas Anteriores)

1.  **Risco de Tipagem de Contexto (`ctx`)**: A tentativa de chamar um serviço tRPC de uma API Route do Next.js causou erros de tipo complexos.

    - **Mitigação (Lição #16)**: O `ctx` tRPC será reconstruído manualmente DENTRO da API Route (`/api/chat/stream`) usando `auth()` e `createTRPCContext`. O `AiStudioService` continuará recebendo o `ctx` completo, garantindo que o acoplamento permaneça na camada de API, não no serviço.

2.  **Risco de Tipagem em Testes (Vitest)**: O `chatAppId` foi inferido como `string` em vez de seu tipo literal, quebrando os testes.

    - **Mitigação (Lição #17)**: Os testes usarão um type cast explícito (`chatAppId as KodixAppId`) para forçar a tipagem correta e evitar erros do ambiente de teste.

3.  **Risco de Efeito Cascata**: A renomeação de métodos (`getSystemPromptForChat` -> `getSystemPrompt`) causou falhas de compilação em múltiplos locais não previstos.
    - **Mitigação (Lição #18)**: Antes de iniciar a refatoração, será executada uma busca global por `getSystemPromptForChat` e `getTeamInstructions`. Todos os arquivos afetados serão listados e corrigidos como parte da Fase 3.

---

## ♟️ Plano de Execução (TDD)

### **Fase 0: Validação de Premissas (Pré-voo)**

_Objetivo: Garantir que o ambiente e as dependências estão corretos antes de qualquer alteração de código._

1.  **[ ] Auditoria do `tRPC Caller`**:

    - **Ação**: Confirmar que `createCaller` é exportado de `@kdx/api` e que aceita um `ctx` do tipo `TProtectedProcedureContext`.
    - **Comando de Verificação**: Inspecionar `packages/api/src/index.ts` e `packages/api/src/trpc/procedures.ts`.
    - **Critério de Sucesso**: Confirmação de que o padrão é viável.

2.  **[ ] Auditoria do Endpoint Genérico `getConfig`**:
    - **Ação**: Verificar se `ZGetConfigInput` em `packages/validators/src/trpc/app/index.ts` já inclui `aiStudioAppId`.
    - **Critério de Sucesso**: Se não incluir, o primeiro passo da Fase 1 será adicioná-lo.

### **Fase 1: TDD para o `AiStudioService`**

_Objetivo: Escrever os testes ANTES da implementação para guiar a refatoração._

1.  **[ ] Criar Arquivo de Teste**:

    - **Ação**: Criar o arquivo `packages/api/src/internal/services/__tests__/ai-studio.service.test.ts`.
    - **Critério de Sucesso**: O arquivo existe.

2.  **[ ] Escrever Testes para `getSystemPrompt` (Estado Futuro)**:
    - **Ação**: Escrever os 4 cenários de teste (somente plataforma, plataforma+time, todos os 3, nenhum), mas para a nova implementação.
    - **Detalhe Crítico**: Os testes devem mockar as chamadas ao `appCaller` (`getUserAppTeamConfig`, `getConfig`) e ao `CoreEngine.config.get`. Os testes irão falhar inicialmente, o que é o comportamento esperado do TDD.
    - **Comando de Validação**: `pnpm test --filter=@kdx/api` deve rodar e mostrar os testes como falhando.

### **Fase 2: Implementação da Orquestração no `AiStudioService`**

_Objetivo: Fazer os testes passarem refatorando o serviço._

1.  **[ ] Modificar Validador (se necessário)**:

    - **Ação**: Adicionar `aiStudioAppId` ao tipo `AppIdsWithConfig` e ao `ZSaveConfigInput` em `packages/validators/src/trpc/app/index.ts`.
    - **Comando de Validação**: `pnpm typecheck --filter=@kdx/validators`.

2.  **[ ] Consolidar e Refatorar o Serviço**:

    - **Ação 1**: Mover a lógica de `combineInstructions` do antigo `PromptBuilderService` para um método privado dentro do `AiStudioService`.
    - **Ação 2**: Remover os métodos `getSystemPromptForChat` e `getTeamInstructions`.
    - **Ação 3**: Implementar a nova lógica em `getSystemPrompt`, que recebe `ctx` e `params`, cria o `caller`, chama os endpoints genéricos e o Core Engine, e usa `combineInstructions` para gerar o prompt final.
    - **Comando de Validação**: `pnpm test --filter=@kdx/api`.
    - **Critério de Sucesso**: Todos os testes criados na Fase 1 agora devem passar.

3.  **[ ] Remover Código Obsoleto**:
    - **Ação**: Excluir o arquivo `packages/api/src/internal/services/prompt-builder.service.ts`.

### **Fase 3: Refatoração dos Consumidores (Guiado pela Busca Global)**

_Objetivo: Corrigir todos os locais do código que quebram devido à refatoração, usando a lista gerada na análise de risco._

1.  **[ ] Mapear Locais Afetados**:

    - **Comando**: `grep -r "getSystemPromptForChat\|getTeamInstructions" packages/api/ apps/kdx/`.
    - **Ação**: Listar todos os arquivos que precisam de modificação.

2.  **[ ] Refatorar Endpoint do AI Studio Router**:

    - **Arquivo**: `packages/api/src/trpc/routers/app/ai-studio/_router.ts`.
    - **Ação**: Renomear o procedure de `getSystemPromptForChat` para `getSystemPrompt` e ajustar a chamada para `AiStudioService.getSystemPrompt({ ctx, params: ... })`.

3.  **[ ] Refatorar Handlers do Chat**:

    - **Arquivos**: `createEmptySession.handler.ts`, `autoCreateSessionWithMessage.handler.ts`, `enviarMensagem.handler.ts`.
    - **Ação**: Substituir as chamadas a `getTeamInstructions` pela nova chamada a `getSystemPrompt`.

4.  **[ ] Refatorar Testes de Integração**:
    - **Arquivos**: `packages/api/src/trpc/routers/app/chat/__tests__/service-layer.test.ts`, `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`.
    - **Ação**: Atualizar os mocks e as chamadas para usar `getSystemPrompt`.

### **Fase 4: Validação Final e Arquivamento**

1.  **[ ] Validação Completa do Sistema**:

    - **Ação**: Executar a sequência completa `stop -> start -> check-logs -> check-status`.
    - **Critério de Sucesso**: Servidor `RUNNING` sem erros de compilação.

2.  **[ ] Arquivamento**:
    - **Ação**: Marcar este plano como `✅ Executado com Sucesso`.
