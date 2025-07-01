# Plano de Implementação: Tipagem Forte do CoreEngine

**Data:** 2025-07-03
**Autor:** KodixAgent
**Status:** 📝 **Proposta Arquitetural (Pós-v3)**
**Dependência de:** A execução bem-sucedida de [finish-configuration-service-plan.md](./finish-configuration-service-plan.md) é um pré-requisito.

---

## 🎯 Objetivo Arquitetural

Evoluir o `CoreEngine` de um provedor de configurações com um "contrato fraco" (`Promise<any>`) para um sistema totalmente type-safe. O objetivo é fazer com que o `ConfigurationService.get()` retorne um tipo de objeto de configuração específico e conhecido em tempo de compilação, baseado no `appId` fornecido.

Isso eliminará uma classe inteira de possíveis erros em tempo de execução, melhorará drasticamente a experiência de desenvolvimento (DX) e fortalecerá a manutenibilidade do sistema a longo prazo.

---

## 🚦 Justificativa Arquitetural (O Porquê)

A implementação atual, embora funcional, depende de um retorno `Promise<any>`. Isso cria um **contrato fraco** entre o `CoreEngine` e seus consumidores (como o `PromptBuilderService`), resultando em:

1.  **Falta de Type Safety:** O consumidor não tem nenhuma garantia do TypeScript sobre a estrutura do objeto que recebe. Ele precisa "confiar" que `config.teamInstructions` existe, o que é frágil.
2.  **Acoplamento Implícito:** O consumidor precisa conhecer implicitamente a forma do objeto de configuração. Qualquer mudança na estrutura do objeto no banco de dados não gera erros de compilação no consumidor, apenas falhas em tempo de execução.
3.  **Refatoração Difícil:** Renomear ou alterar uma propriedade de configuração exige uma busca manual por todo o código, em vez de deixar o compilador do TypeScript fazer o trabalho pesado.

Mover para um **contrato forte** (tipado) é um passo fundamental para a maturidade da nossa arquitetura de serviços.

---

## ♟️ Plano de Execução

### **Fase 1: Tipagem Forte do Utilitário `deepMerge`**

_Objetivo: Corrigir a fundação. O `deepMerge` é o ponto de partida da perda de tipos._

1.  **[ ] Refatorar a Assinatura do `deepMerge`:**
    - **Arquivo:** `packages/core-engine/src/configuration/utils/deep-merge.ts`
    - **Ação:** Alterar a assinatura da função de `(target: any, source: any): any` para usar genéricos, garantindo que os tipos sejam preservados durante a mesclagem.
    - **Exemplo de Nova Assinatura:**
      ```typescript
      export function deepMerge<T extends object, U extends object>(
        target: T,
        source: U,
      ): T & U {
        // A implementação existente, mas agora com um contrato de tipo forte.
      }
      ```
2.  **[ ] Atualizar Testes do `deepMerge`:**
    - **Arquivo:** `packages/core-engine/src/configuration/utils/deep-merge.test.ts`
    - **Ação:** Ajustar os testes para validar a nova assinatura tipada, garantindo que a inferência de tipo do objeto mesclado está correta.

### **Fase 2: Refatoração do `ConfigurationService.get` para Genéricos**

_Objetivo: Tornar o método principal do serviço totalmente type-safe._

1.  **[ ] Alterar a Assinatura do Método `get`:**

    - **Arquivo:** `packages/core-engine/src/configuration/configuration.service.ts`
    - **Ação:** Modificar o método `get` para que ele aceite um tipo genérico `T` que estende `KodixAppId`. O tipo de retorno será inferido a partir de um mapa de schemas, usando os utilitários do Zod.
    - **Exemplo de Nova Assinatura:**

      ```typescript
      // packages/shared/src/db.ts - (Exemplo de mapa necessário)
      export const appIdToConfigSchemaMap = {
        [aiStudioAppId]: aiStudioConfigSchema,
        [calendarAppId]: calendarConfigSchema,
      };

      // Assinatura Refatorada no ConfigurationService
      async get<T extends keyof typeof appIdToConfigSchemaMap>(params: {
        appId: T;
        teamId: string;
        userId?: string;
      }): Promise<z.infer<typeof appIdToConfigSchemaMap[T]>> {
         // ...lógica existente...
      }
      ```

### **Fase 3: Atualização dos Consumidores e Validação**

_Objetivo: Garantir que os consumidores do serviço se beneficiem da nova tipagem e validar a integração._

1.  **[ ] Refatorar `PromptBuilderService`:**

    - **Arquivo:** `packages/api/src/internal/services/prompt-builder.service.ts`
    - **Ação:** Atualizar a chamada a `CoreEngine.config.get()`. A variável `config` agora será totalmente tipada.
    - **Benefício a Validar:** Remover o "optional chaining" (`?.`) desnecessário, pois o TypeScript agora saberá se uma propriedade como `teamInstructions` existe ou não.
    - **Exemplo de Código Refatorado:**

      ```typescript
      // A constante 'config' agora tem um tipo específico, não 'any'.
      const config = await CoreEngine.config.get({ appId: aiStudioAppId, ... });

      // O TypeScript saberá se a propriedade existe.
      const teamInstructions = config.teamInstructions.content;
      ```

2.  **[ ] Validação Completa de Tipos:**
    - **Comando:** `pnpm typecheck`
    - **Critério de Sucesso:** O projeto inteiro deve compilar sem erros de tipo, provando que o novo contrato forte foi propagado corretamente.

---

## ✅ Critérios de Sucesso

- O método `CoreEngine.config.get()` não retorna mais `Promise<any>`.
- O retorno do `CoreEngine.config.get()` é um tipo específico inferido a partir do `appId`.
- Todos os consumidores do `CoreEngine` (começando pelo `PromptBuilderService`) são atualizados para consumir o novo tipo de retorno.
- O monorepo compila (`pnpm typecheck`) sem erros após a refatoração.
- A funcionalidade do sistema permanece idêntica, mas a robustez arquitetural e a experiência de desenvolvimento são significativamente melhoradas.
