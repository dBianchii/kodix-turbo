# Plano de Implementação: Instruções Pessoais de IA do Usuário

**Data:** 2025-06-28  
**Autor:** KodixAgent  
**Status:** 🟡 Proposta v2.0
**Escopo:** AI Studio
**Tipo:** Feature de Personalização do Usuário (Nível 3)
**Documento Pai:** `docs/architecture/configuration-model.md`

---

## 1. Resumo Executivo

Este plano detalha a implementação de uma nova funcionalidade que permite aos usuários finais definir suas próprias **instruções pessoais de IA**. Esta funcionalidade corresponde ao **Nível 3** do modelo de configuração hierárquica do Kodix e será acessível através do **AI Studio**, consolidando todas as configurações de IA em um único local.

O objetivo é criar uma seção "Minhas Instruções" dentro do AI Studio, onde o usuário possa inserir um texto que será automaticamente adicionado a todos os seus prompts de IA, permitindo uma personalização profunda.

### Objetivos

- ✅ Criar endpoints tRPC para que o usuário possa salvar e recuperar suas instruções pessoais.
- ✅ Desenvolver um componente de UI (React) para o usuário editar suas instruções.
- ✅ **Integrar este componente em uma nova seção dedicada dentro do AI Studio.**
- ✅ Garantir que o `PromptBuilderService` no backend inclua essas instruções com a precedência correta.

---

## 2. Arquitetura da Solução

```mermaid
graph TD
    subgraph "Frontend (AI Studio SubApp)"
        A[UI: UserInstructionsSection] <-->|tRPC Query/Mutation| B{Endpoints tRPC}
    end

    subgraph "Backend"
        B --> C[AppConfigService]
        C <--> D[(DB: userAppTeamConfigs)]
    end

    subgraph "Chat Flow"
        E[/api/chat/stream] --> F[PromptBuilderService]
        F -->|get user instructions| C
    end

    style A fill:#e3f2fd,stroke:#333
    style B fill:#e0e0e0,stroke:#333
    style C fill:#fff3e0,stroke:#333
    style D fill:#fbe9e7,stroke:#333
```

- **Armazenamento:** As instruções serão salvas na tabela `userAppTeamConfigs`.
- **Validação:** Será usado o schema `aiStudioUserAppTeamConfigSchema` para validar o input.

---

## 3. Implementação Detalhada

### 3.1 Backend - tRPC Endpoints

Adicionaremos os seguintes endpoints ao router do AI Studio.

```typescript
// packages/api/src/trpc/routers/app/aiStudio/_router.ts
import { aiStudioUserAppTeamConfigSchema } from "@kodix/shared"; // Importar o schema

export const aiStudioRouter = t.router({
  // ... outros endpoints existentes ...

  // Endpoint para o usuário buscar suas próprias instruções
  getUserPersonalInstructions: protectedProcedure.query(async ({ ctx }) => {
    const config = await AppConfigService.getUserConfig(
      ctx.auth.user.id,
      ctx.auth.user.activeTeamId,
      aiStudioAppId, // ID do app AI Studio
    );
    // Valida o retorno com o schema para garantir a consistência
    const parsedConfig = aiStudioUserAppTeamConfigSchema.safeParse(config);
    return parsedConfig.success ? parsedConfig.data.userInstructions : null;
  }),

  // Endpoint para o usuário salvar/atualizar suas instruções
  saveUserPersonalInstructions: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .max(2500, "As instruções não podem exceder 2500 caracteres."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await AppConfigService.updateUserConfig(
        ctx.auth.user.id,
        ctx.auth.user.activeTeamId,
        aiStudioAppId,
        {
          // Merge com outras possíveis configurações do usuário para não sobrescrevê-las
          userInstructions: {
            content: input.content,
            enabled: true,
          },
        },
      );
      return { success: true, message: "Instruções salvas com sucesso!" };
    }),
});
```

### 3.2 Backend - Atualização do `PromptBuilderService`

O `PromptBuilderService` será responsável por buscar esta configuração e adicioná-la ao final do array de prompts, garantindo que ela tenha a maior precedência.

```typescript
// packages/api/src/internal/services/prompt-builder.service.ts

// ...
const userConfig = await AppConfigService.getUserConfig(
  userId,
  teamId,
  aiStudioAppId,
);
const userInstructions = userConfig?.userInstructions?.content || "";

// ...
const promptParts = [
  platformInstructions,
  teamInstructions,
  userInstructions, // Nível 3, com maior precedência
  agentSpecificPrompt,
].filter(Boolean);

return promptParts.join("\n\n---\n\n");
```

### 3.3 Frontend - Componente de UI `UserInstructionsSection`

Um novo componente de seção a ser criado dentro do AI Studio.

```tsx
// **NOVO CAMINHO**: apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/sections/user-instructions-section.tsx

"use client";

// ... imports ...

export function UserInstructionsSection() {
  // ... implementação do componente com Card, Textarea e botão Salvar ...
  // A lógica interna do componente (useState, useQuery, useMutation) permanece a mesma.

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Instruções Pessoais de IA</CardTitle>
        <CardDescription>
          Estas instruções são suas e serão aplicadas a todas as interações com
          a IA na plataforma, sobrepondo as instruções da equipe.
        </CardDescription>
      </CardHeader>
      // ... CardContent e CardFooter com Textarea e botão ...
    </Card>
  );
}
```

### 3.4 Frontend - Integração na UI do AI Studio

1.  **Adicionar Navegação no Sidebar:**

    - Editar `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/app-sidebar.tsx`.
    - Adicionar um novo item de menu, por exemplo, "Minhas Instruções", talvez em um novo grupo chamado "Personalização".

2.  **Renderizar a Seção no Conteúdo Principal:**
    - Editar `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/ai-studio-content.tsx`.
    - Adicionar um `case` no `switch` para renderizar o novo componente `UserInstructionsSection` quando o item de menu correspondente for clicado.

---

## 4. Checklist de Implementação

### Backend (1 dia)

- [ ] Atualizar `aiStudioUserAppTeamConfigSchema` em `@kdx/shared`.
- [ ] Implementar os endpoints `getUserPersonalInstructions` e `saveUserPersonalInstructions` no router do AI Studio.
- [ ] Garantir que o `PromptBuilderService` consuma corretamente as instruções do usuário.
- [ ] Adicionar testes de integração para os novos endpoints.

### Frontend (1 dia)

- [ ] Criar o componente `UserInstructionsSection` no caminho correto dentro do AI Studio.
- [ ] **Adicionar um novo item de menu no `AppSidebar` do AI Studio.**
- [ ] **Modificar `AiStudioContent` para renderizar a nova seção.**
- [ ] Adicionar tratamento de estados (loading, error, success) e notificações (toast).

### Teste E2E (4 horas)

- [ ] Testar o fluxo completo: Usuário navega para a nova seção no AI Studio, salva instruções, inicia um chat e verifica se a IA responde de acordo com as instruções fornecidas.
