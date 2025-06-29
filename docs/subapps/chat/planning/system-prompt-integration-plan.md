# Plano de Implementação: Integração do System Prompt Centralizado no Chat

**Data:** 2025-06-30
**Autor:** KodixAgent
**Status:** 🟡 Proposta
**Escopo:** Integração Backend (AI Studio ↔ Chat)
**Documentos de Referência Críticos:**

- `docs/subapps/chat/chat-architecture.md`
- `docs/subapps/ai-studio/ai-studio-architecture.md`
- `docs/architecture/subapp-architecture.md`
- `docs/debug/kodix-logs-policy.md`
- `docs/subapps/chat/testing-complete.md`

---

### 1. Resumo Executivo

Este plano detalha o processo para finalizar a integração iniciada no `@platform-instructions-as-code-plan.md`. O objetivo é fazer com que o **SubApp de Chat** consuma o novo endpoint `getSystemPromptForChat` do `AiStudioService`.

Isso centralizará a lógica de construção de prompts no AI Studio, alinhando-se à nossa arquitetura de "SubApp Core", simplificará o código do Chat e garantirá que as instruções da plataforma (e futuramente, de time e usuário) sejam consistentemente aplicadas em todas as conversas.

### 2. 🚦 Princípios Orientadores (Pre-flight Check)

Antes de qualquer modificação, os seguintes princípios, baseados na arquitetura Kodix, são obrigatórios:

1.  **Comunicação via Service Layer:** A interação entre o Chat e o AI Studio ocorrerá **exclusivamente** através do `AiStudioService`, conforme definido em `subapp-architecture.md`. Não haverá acesso direto a repositórios ou lógica interna.
2.  **Política de Logs:** Qualquer `console.log` adicionado para verificação será temporário, seguirá os padrões de prefixo de `kodix-logs-policy.md` (ex: `[DEBUG_PROMPT]`), e será registrado em `logs-registry.md` com um plano de remoção.
3.  **Testes de Regressão:** Após a implementação, a suíte de testes completa do Chat (`pnpm test:chat`) será executada para garantir que nenhuma funcionalidade existente foi quebrada, conforme o guia `testing-complete.md`.
4.  **Mudança Isolada:** A modificação será contida ao endpoint de streaming do Chat, minimizando o risco de efeitos colaterais.

### 3. Arquitetura da Solução

O fluxo de dados será modificado para injetar o `systemPrompt` centralizado no início do processo de streaming.

```mermaid
graph TD
    subgraph "Frontend"
        A[Chat UI]
    end

    subgraph "Backend"
        B[/api/chat/stream]
        C(AiStudioService)
        D{PromptBuilderService}
        E[Vercel AI SDK - streamText]
        F[(Database)]
    end

    A --> B
    B -- 1. Chama --> C
    C -- 2. Orquestra --> D
    D -- 3. Retorna System Prompt --> C
    C -- 4. Retorna System Prompt --> B
    B -- 5. Prepara mensagens com prompt --> E
    E --> F
```

- **Ponto de Entrada:** A requisição do frontend chega em `/api/chat/stream`.
- **Ponto de Integração:** O handler do `stream` chamará `AiStudioService.getSystemPromptForChat` para obter as instruções base.
- **Ponto de Execução:** O prompt retornado será inserido como a primeira mensagem `role: "system"` no array enviado ao `streamText` do Vercel AI SDK.

### 4. Checklist de Implementação Detalhado

#### Fase 1: Implementação no Backend do Chat

##### **Passo 1.1: Refatorar o Endpoint de Streaming do Chat**

- **Arquivo Alvo:** `apps/kdx/src/app/api/chat/stream/route.ts`
- **Ações Detalhadas:**

  1.  **Localizar** a seção do código que atualmente define o `systemPrompt` de forma manual (com base no idioma do usuário).
  2.  **Remover** completamente essa lógica de `if/else` para o `systemPrompt` e a detecção de `userLocale` para este fim.
  3.  **Adicionar** uma nova chamada assíncrona para o `AiStudioService` no início do processamento do handler:
      ```typescript
      const systemPromptResult = await AiStudioService.getSystemPromptForChat({
        userId: session.userId,
        teamId: session.teamId,
        requestingApp: chatAppId,
      });
      const systemPrompt = systemPromptResult.prompt;
      ```
  4.  **Modificar** a construção do array `formattedMessages` para inserir o `systemPrompt` como a primeira mensagem, somente se ele não for vazio:

      ```typescript
      const formattedMessages: {
        role: "user" | "assistant" | "system";
        content: string;
      }[] = [];

      if (systemPrompt && systemPrompt.trim().length > 0) {
        formattedMessages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // ... (lógica existente para adicionar as outras mensagens do histórico)
      ```

- **Validação:** Executar `pnpm typecheck --filter=kdx` para garantir que não há erros de tipo.

#### Fase 2: Verificação e Validação

##### **Passo 2.1: Adicionar Log de Verificação Temporário**

- **Objetivo:** Confirmar que o prompt correto, com as variáveis substituídas, está sendo recebido antes de ser enviado para a IA.
- **Ação:**
  1.  Imediatamente após a chamada ao `AiStudioService`, adicionar um `console.log` padronizado:
      ```typescript
      console.log(
        `[DEBUG_SYSTEM_PROMPT] Prompt para a sessão ${session.id}:`,
        systemPrompt,
      );
      ```
  2.  Registrar este log no arquivo `docs/debug/logs-registry.md`, definindo seu propósito e um plano de remoção.

##### **Passo 2.2: Executar um Teste Manual Controlado**

1.  Garantir que o servidor esteja rodando (`sh ./scripts/check-dev-status.sh`).
2.  Acessar o SubApp de Chat na aplicação.
3.  Enviar uma nova mensagem para iniciar uma sessão.
4.  Monitorar o console do servidor (ou o arquivo `dev.log`) e procurar pelo log com o prefixo `[DEBUG_SYSTEM_PROMPT]`.
5.  **Verificar** se o conteúdo do log corresponde ao template definido em `ai-studio.config.ts` e se as variáveis como `{{userName}}` e `{{teamName}}` foram corretamente substituídas.

#### Fase 3: Testes de Regressão e Cleanup

##### **Passo 3.1: Executar a Suíte de Testes Completa do Chat**

- **Objetivo:** Garantir que a alteração no fluxo de prompt não introduziu nenhuma regressão nas funcionalidades existentes do Chat.
- **Comando:**
  ```bash
  pnpm test:chat
  ```
- **Resultado Esperado:** Todos os testes devem passar com sucesso.

##### **Passo 3.2: Remover Log Temporário**

- Após a validação bem-sucedida (manual e automatizada):
  1.  Remover a linha do `console.log` adicionada no **Passo 2.1** do arquivo `apps/kdx/src/app/api/chat/stream/route.ts`.
  2.  Atualizar o status do log em `docs/debug/logs-registry.md` para "🟢 Removido".

### 5. Plano de Rollback

A alteração é altamente localizada e de baixo risco. Se qualquer problema inesperado surgir durante os testes, o rollback é simples:

1.  Executar `git checkout -- apps/kdx/src/app/api/chat/stream/route.ts` para reverter as mudanças no arquivo.
2.  Reiniciar o servidor.

---
