# Plano de Implementação: Instruções da Plataforma como Código

**Data:** 2025-06-28  
**Autor:** KodixAgent  
**Status:** 🟡 Proposta
**Escopo:** AI Studio - Backend
**Tipo:** Configuração como Código (Nível 1)
**Documento Pai:** `docs/architecture/configuration-model.md`

---

## 1. Resumo Executivo

Este plano descreve a implementação das **Instruções da Plataforma (Nível 1)**, conforme o modelo de configuração hierárquica. O objetivo é estabelecer uma configuração base de instruções de IA diretamente no código-fonte, que servirá como padrão para toda a plataforma.

Esta implementação suportará o uso de **variáveis dinâmicas** (ex: `{{userName}}`) no template das instruções, que serão substituídas em tempo real pelo backend. Não haverá interface de usuário para esta funcionalidade.

### Objetivos

- ✅ Criar um arquivo `config.ts` no pacote do AI Studio para armazenar o template de instruções.
- ✅ Implementar um `PlatformService` no backend para ler o template e substituir as variáveis.
- ✅ Garantir que o `PromptBuilderService` utilize este serviço para construir a parte base do prompt final.
- ✅ Manter a implementação 100% no backend, sem componentes de UI.

---

## 2. Arquitetura da Solução

O fluxo é inteiramente contido no backend, iniciado por uma chamada da API do chat.

```mermaid
graph TD
    subgraph "Backend Processing"
        A[/api/chat/stream] --> B[PromptBuilderService]
        B --> C{PlatformService}
        C -->|imports| D[/packages/subapp-ai-studio/src/config.ts]
        C -->|gets user data| E[(DB: users)]
        C -->|returns processed instructions| B
    end

    style D fill:#f3e5f5,stroke:#333
    style C fill:#fff3e0,stroke:#333
```

- **Fonte da Verdade:** O arquivo `packages/subapp-ai-studio/src/config.ts` é a única fonte para o template de instruções da plataforma.
- **Lógica de Negócio:** Centralizada no `PlatformService` e orquestrada pelo `PromptBuilderService`.

---

## 3. Implementação Detalhada

### 3.1 Nível 1: Arquivo de Configuração

Criar o arquivo que conterá as configurações estáticas do AI Studio.

**Exemplo de Implementação (`packages/subapp-ai-studio/src/config.ts`):**

```typescript
// O uso de 'as const' garante imutabilidade e tipos literais precisos.
export const aiStudioConfig = {
  platformInstructions: {
    enabled: true,
    template:
      "Você é um assistente de IA da Kodix. Seu usuário se chama {{userName}}. Responda sempre em {{userLanguage}}.",
  },
  featureFlags: {
    // ... outras flags do subapp
  },
} as const;
```

### 3.2 Backend - Service Layer

O `PlatformService` será responsável por processar o template.

```typescript
// packages/api/src/internal/services/platform.service.ts

import { db } from "@kodix/db";
import { users } from "@kodix/db/schema";
import { aiStudioConfig } from "@kodix/subapp-ai-studio/config";
import { eq } from "drizzle-orm";

export class PlatformService {
  private static getTemplate(): string {
    if (aiStudioConfig.platformInstructions.enabled) {
      return aiStudioConfig.platformInstructions.template;
    }
    return "";
  }

  private static replaceVariables(
    template: string,
    data: Record<string, string>,
  ): string {
    let result = template;
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, data[key] ?? "");
    }
    return result;
  }

  static async buildInstructionsForUser(userId: string): Promise<string> {
    const template = this.getTemplate();
    if (!template) return "";

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) return template; // Retorna template puro se não achar o usuário

    const contextData = {
      userName: user.name ?? "Usuário",
      userEmail: user.email,
      userLanguage: user.language ?? "pt-BR",
      // Adicionar mais variáveis conforme necessário
    };

    return this.replaceVariables(template, contextData);
  }
}
```

---

## 4. Checklist de Implementação

### Backend (1 dia)

- [ ] Criar o arquivo `packages/subapp-ai-studio/src/config.ts`.
- [ ] Implementar o `PlatformService` com a lógica de leitura e substituição de variáveis.
- [ ] Integrar a chamada ao `PlatformService.buildInstructionsForUser` dentro do `PromptBuilderService`.
- [ ] Adicionar testes de unidade para o `PlatformService`, cobrindo a substituição de variáveis e casos de usuário não encontrado.

### Frontend

- [ ] Nenhuma tarefa. Esta implementação não possui interface de usuário.

### Teste E2E (2 horas)

- [ ] Testar o fluxo de chat e verificar (via logs ou debug) se o prompt final enviado à IA contém as instruções da plataforma com as variáveis do usuário corretamente substituídas.
