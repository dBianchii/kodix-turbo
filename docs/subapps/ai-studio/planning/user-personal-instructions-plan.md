# Plano de Implementação: Instruções Pessoais de IA do Usuário

**Data:** 2025-06-28  
**Autor:** KodixAgent  
**Status:** 🟡 Proposta
**Escopo:** AI Studio, User Settings
**Tipo:** Feature de Personalização do Usuário (Nível 3)
**Documento Pai:** `docs/architecture/configuration-model.md`

---

## 1. Resumo Executivo

Este plano detalha a implementação de uma nova funcionalidade que permite aos usuários finais definir suas próprias **instruções pessoais de IA**. Esta funcionalidade corresponde ao **Nível 3** do modelo de configuração hierárquica do Kodix.

O objetivo é criar uma seção nas configurações do usuário onde ele possa inserir um texto que será automaticamente adicionado a todos os seus prompts de IA, permitindo uma personalização profunda e uma experiência mais relevante.

### Objetivos

- ✅ Criar endpoints tRPC para que o usuário possa salvar e recuperar suas instruções pessoais.
- ✅ Desenvolver um componente de UI (React) para o usuário editar suas instruções.
- ✅ Integrar este componente na página de configurações do perfil do usuário.
- ✅ Garantir que o `PromptBuilderService` no backend inclua essas instruções com a precedência correta.

---

## 2. Arquitetura da Solução

```mermaid
graph TD
    subgraph "Frontend (User Settings)"
        A[UI: UserInstructionsSettings] <-->|tRPC Query/Mutation| B{Endpoints tRPC}
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

- **Armazenamento:** As instruções serão salvas na tabela `userAppTeamConfigs` dentro da coluna de configuração JSON, conforme já definido na arquitetura.
- **Validação:** Será usado um schema Zod, como `aiStudioUserAppTeamConfigSchema`, para validar o input do usuário.

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

### 3.3 Frontend - Componente de UI `UserInstructionsSettings`

Um novo componente React para ser usado nas configurações do usuário.

```tsx
// apps/kdx/src/app/[locale]/app/settings/_components/user-instructions-settings.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from "@kodix/ui";
import { toast } from "sonner";

import { useTRPC } from "~/trpc/react";

export function UserInstructionsSettings() {
  const trpc = useTRPC();
  const [content, setContent] = useState("");

  const { data: instructions, isLoading } =
    trpc.app.aiStudio.getUserPersonalInstructions.useQuery();

  const mutation = trpc.app.aiStudio.saveUserPersonalInstructions.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (instructions?.content) {
      setContent(instructions.content);
    }
  }, [instructions]);

  const handleSave = () => {
    mutation.mutate({ content });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Instruções Pessoais de IA</CardTitle>
        <CardDescription>
          Estas instruções serão adicionadas a todos os seus chats para
          personalizar as respostas da IA de acordo com suas preferências.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="user-instructions">Suas instruções</Label>
        <Textarea
          id="user-instructions"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ex: Sempre me responda em um tom formal. Gosto de exemplos de código em TypeScript. Resuma textos longos em 3 pontos principais."
          className="min-h-[200px]"
          disabled={isLoading || mutation.isPending}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading || mutation.isPending}>
          {mutation.isPending ? "Salvando..." : "Salvar Minhas Instruções"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 4. Checklist de Implementação

### Backend (1 dia)

- [ ] Atualizar `aiStudioUserAppTeamConfigSchema` em `@kodix/shared` se necessário.
- [ ] Implementar os endpoints `getUserPersonalInstructions` e `saveUserPersonalInstructions` no tRPC.
- [ ] Garantir que o `PromptBuilderService` consuma corretamente as instruções do usuário.
- [ ] Adicionar testes de integração para os novos endpoints.

### Frontend (1 dia)

- [ ] Criar o componente `UserInstructionsSettings`.
- [ ] Integrar o componente na página de configurações do usuário (ex: `/app/settings/profile`).
- [ ] Adicionar tratamento de estados (loading, error, success) e notificações (toast).

### Teste E2E (4 horas)

- [ ] Testar o fluxo completo: Usuário salva instruções -> Inicia um novo chat -> Verifica se a IA responde de acordo com as instruções fornecidas.
