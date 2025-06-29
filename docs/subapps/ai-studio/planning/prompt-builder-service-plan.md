# Plano de Implementação: PromptBuilderService

**Data:** 2025-06-28  
**Autor:** KodixAgent  
**Status:** 🟡 Proposta
**Escopo:** AI Studio - Backend
**Tipo:** Orquestração de Lógica
**Documento Pai:** `docs/subapps/ai-studio/ai-studio-architecture.md`

---

## 1. Resumo Executivo

Este plano detalha a criação e implementação do `PromptBuilderService`, um serviço de backend essencial para a infraestrutura de IA do Kodix. A responsabilidade principal deste serviço é **orquestrar a construção do prompt de sistema (`systemPrompt`) final** que será enviado para os modelos de linguagem.

Ele consumirá as instruções de múltiplos níveis hierárquicos (Plataforma, Time, Usuário), aplicará a ordem de precedência correta e as combinará em um único conjunto de diretrizes coesas para a IA.

### Objetivos

- ✅ Criar um `PromptBuilderService` dedicado para a lógica de montagem de prompts.
- ✅ Implementar a ordem de precedência correta: **Usuário > Time > Plataforma**.
- ✅ Consumir os serviços existentes (`PlatformService`, `TeamConfigService`, `UserConfigService`).
- ✅ Garantir que a implementação seja flexível para a adição de futuras fontes de instruções (ex: Agentes).
- ✅ Integrar este serviço ao `AiStudioService` para ser consumido por outros SubApps (como o Chat).

---

## 2. Arquitetura da Solução

O `PromptBuilderService` atua como um maestro, coordenando as saídas de outros serviços especializados. Ele é invocado pelo `AiStudioService` e não tem contato direto com a camada de API.

```mermaid
graph TD
    subgraph "AI Studio Core Logic"
        A[AiStudioService] -->|pede prompt final| B(PromptBuilderService)
        B -->|1. Pega instruções do Usuário| C[UserConfigService]
        B -->|2. Pega instruções do Time| D[TeamConfigService]
        B -->|3. Pega instruções da Plataforma| E[PlatformService]

        C -->|retorna string| B
        D -->|retorna string| B
        E -->|retorna string| B

        B -->|retorna prompt final| A
    end

    subgraph "Data Sources"
        F[(DB: userAppTeamConfigs)]
        G[(DB: appTeamConfigs)]
        H[/.../config/ai-studio.config.ts]
    end

    C --> F
    D --> G
    E --> H

    style B fill:#c8e6c9,stroke:#333
    style A fill:#b39ddb,stroke:#333
```

- **Ponto de Entrada:** `AiStudioService`.
- **Orquestrador:** `PromptBuilderService`.
- **Executores:** `PlatformService`, `TeamConfigService`, `UserConfigService`.

---

## 3. Implementação Detalhada

### 3.1 `PromptBuilderService`

Este serviço conterá a lógica principal de combinação e formatação.

**Exemplo de Implementação (`packages/api/src/internal/services/prompt-builder.service.ts`):**

```typescript
import { PlatformService } from "./platform.service";

// import { TeamConfigService } from "./team-config.service"; // A ser criado
// import { UserConfigService } from "./user-config.service"; // A ser criado

export class PromptBuilderService {
  /**
   * Constrói o prompt de sistema final com base na hierarquia de configurações.
   * A ordem de precedência é: Usuário > Time > Plataforma.
   * Instruções de níveis mais altos (mais específicas) são adicionadas primeiro.
   */
  static async buildFinalSystemPrompt(context: {
    userId: string;
    teamId: string;
  }): Promise<string> {
    const { userId, teamId } = context;
    const instructions: string[] = [];

    // Nível 3: Instruções do Usuário (maior prioridade)
    // const userInstructions = await UserConfigService.getInstructions(userId, teamId);
    // if (userInstructions) instructions.push(userInstructions);

    // Nível 2: Instruções do Time
    // const teamInstructions = await TeamConfigService.getInstructions(teamId);
    // if (teamInstructions) instructions.push(teamInstructions);

    // Nível 1: Instruções da Plataforma (menor prioridade)
    const platformInstructions =
      await PlatformService.buildInstructionsForUser(userId);
    if (platformInstructions) instructions.push(platformInstructions);

    // Filtra strings vazias e combina as instruções com um separador claro.
    return instructions.filter(Boolean).join("\n\n---\n\n");
  }
}
```

_Nota: `TeamConfigService` e `UserConfigService` serão criados em escopos futuros, mas o `PromptBuilderService` já estará preparado para consumi-los._

### 3.2 Integração com `AiStudioService`

O `AiStudioService` usará o `PromptBuilderService` para expor o prompt final.

**Exemplo de Implementação (`packages/api/src/internal/services/ai-studio.service.ts`):**

```typescript
// ... imports
import { PromptBuilderService } from "./prompt-builder.service";

export class AiStudioService extends BaseService {
  // ... outros métodos do AiStudioService

  /**
   * Obtém o prompt de sistema completo e formatado para um usuário.
   * Este método deve ser usado pelo Chat e outros SubApps de IA.
   */
  static async getSystemPromptForChat(context: {
    userId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(context.teamId);
    this.logAccess("getSystemPromptForChat", context);

    return PromptBuilderService.buildFinalSystemPrompt({
      userId: context.userId,
      teamId: context.teamId,
    });
  }
}
```

---

## 4. Estratégia de Concatenação e Formato

Para garantir que o modelo de IA possa distinguir claramente as diferentes fontes de instruções, usaremos um separador robusto.

**Separador:** `\n\n---\n\n` (Nova linha, três hífens, nova linha)

**Exemplo de Saída Final:**

```text
Você é um especialista em análise de dados. Responda sempre com tabelas markdown.

---

Nossa empresa se chama Acme Corp. Nossos principais concorrentes são a Wayne Enterprises e a Stark Industries.

---

Você é um assistente de IA da Kodix. Seu usuário se chama John Doe. Responda sempre em pt-BR.
```

_(Neste exemplo: Instrução do Usuário -> Instrução do Time -> Instrução da Plataforma)_

---

## 5. Checklist de Implementação

### Backend (1-2 dias)

- [ ] Criar o arquivo `packages/api/src/internal/services/prompt-builder.service.ts`.
- [ ] Implementar a classe `PromptBuilderService` com o método `buildFinalSystemPrompt`.
- [ ] Implementar a lógica de concatenação com a ordem de precedência correta.
- [ ] Criar stubs (versões vazias) para `TeamConfigService` e `UserConfigService` se ainda não existirem, para evitar erros de importação.
- [ ] Integrar a chamada ao `PromptBuilderService` dentro do `AiStudioService` através do novo método `getSystemPromptForChat`.
- [ ] Adicionar testes de unidade para o `PromptBuilderService`:
  - [ ] Testar a ordem de precedência.
  - [ ] Testar o caso em que todas as instruções existem.
  - [ ] Testar casos onde uma ou mais fontes de instrução estão ausentes.
  - [ ] Testar o formato do separador na string final.
- [ ] Refatorar o `ChatService` (ou onde for relevante) para chamar `AiStudioService.getSystemPromptForChat` ao iniciar uma nova conversa.

### Frontend

- [ ] Nenhuma tarefa. Esta implementação é 100% backend.
