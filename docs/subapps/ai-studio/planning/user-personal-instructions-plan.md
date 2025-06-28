# Plano de Implementação: Instruções Pessoais de IA do Usuário

**Data:** 2025-01-28  
**Autor:** KodixAgent  
**Status:** 🟢 Plano v3.1 (Corrigido com Estado Real do Código)
**Escopo:** AI Studio
**Tipo:** Feature de Personalização do Usuário (Nível 3)
**Documento Pai:** `docs/architecture/configuration-model.md`
**Lições Aprendidas:** `docs/subapps/ai-studio/planning/user-instructions-lessons-learned.md`

---

## 🚨 IMPORTANTE: Correções da v3.1

O plano v3.0 continha informações incorretas sobre o que já existia no código. Esta versão foi corrigida após análise completa do código atual:

- ❌ **NÃO EXISTE** o schema `aiStudioUserAppTeamConfigSchema`
- ❌ **NÃO EXISTE** AI Studio em `AppIdsWithUserAppTeamConfig`
- ❌ **NÃO EXISTE** AI Studio nos mapeamentos de `userAppTeamConfigs.ts`
- ✅ **EXISTE** AI Studio em `AppIdsWithConfig` (configurações de time)
- ✅ **EXISTE** `aiStudioConfigSchema` (configurações de time)

---

## 1. Resumo Executivo

Este plano detalha a implementação de uma nova funcionalidade que permite aos usuários finais definir suas próprias **instruções pessoais de IA**. Esta funcionalidade corresponde ao **Nível 3** do modelo de configuração hierárquica do Kodix e será acessível através do **AI Studio**.

### ⚡ Abordagem Correta (v3.1)

1. **Backend**: Criar schema e registrar no sistema de configurações
2. **Frontend**: Criar componente que usa endpoints genéricos existentes
3. **Integração**: Atualizar PromptBuilderService para incluir instruções do usuário

### 🎯 Objetivos

- ✅ Criar e registrar schema de configurações do usuário
- ✅ Adicionar AI Studio aos tipos corretos
- ✅ Criar componente UI no AI Studio
- ✅ Integrar com PromptBuilderService
- ✅ Testar fluxo completo E2E

---

## 2. Arquitetura da Solução

```mermaid
graph TD
    subgraph "Frontend (AI Studio)"
        A[UserInstructionsSection] --> B[Endpoints Genéricos]
    end

    subgraph "Backend (Existente)"
        B --> C[app.getUserAppTeamConfig]
        B --> D[app.saveUserAppTeamConfig]
        C --> E[(userAppTeamConfigs)]
        D --> E
    end

    subgraph "Chat Flow"
        F[/api/chat/stream] --> G[PromptBuilderService]
        G --> H[AppConfigService]
        H --> E
    end

    style A fill:#e3f2fd,stroke:#333
    style B fill:#90caf9,stroke:#333
    style C fill:#81c784,stroke:#333
    style D fill:#81c784,stroke:#333
    style G fill:#fff3e0,stroke:#333
```

---

## 3. Implementação Detalhada

### 3.1 Backend - Criação do Schema (20 minutos)

#### Passo 1: Criar Schema de Configuração do Usuário

```typescript
// packages/shared/src/db.ts
// ⚠️ CRIAR - Adicionar após linha 162 (após aiStudioConfigSchema)

/**
 * @description Schema for validating AI Studio user config
 */
export const aiStudioUserAppTeamConfigSchema = z.object({
  userInstructions: z
    .object({
      content: z
        .string()
        .max(2500, "As instruções não podem exceder 2500 caracteres.")
        .default(""),
      enabled: z.boolean().default(true),
    })
    .default({}),
});
```

#### Passo 2: Atualizar Type de Apps com Configuração de Usuário

```typescript
// packages/shared/src/db.ts
// ⚠️ MODIFICAR - Linha 47-49

export type AppIdsWithUserAppTeamConfig =
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof aiStudioAppId; // ⚠️ ADICIONAR
```

#### Passo 3: Adicionar ao Mapeamento de Schemas

```typescript
// packages/shared/src/db.ts
// ⚠️ MODIFICAR - Linha 164-167

export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [chatAppId]: chatUserAppTeamConfigSchema,
  [aiStudioAppId]: aiStudioUserAppTeamConfigSchema, // ⚠️ ADICIONAR
};
```

#### Passo 4: Registrar no Sistema de Repositórios

```typescript
// packages/db/src/repositories/_zodSchemas/userAppTeamConfigs.ts
// ⚠️ MODIFICAR - Adicionar imports e mapeamentos

import {
  aiStudioAppId,
  aiStudioUserAppTeamConfigSchema, // ⚠️ ADICIONAR
  chatAppId,
  chatUserAppTeamConfigSchema,
  kodixCareAppId,
  kodixCareUserAppTeamConfigSchema,
} from "@kdx/shared";

export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [chatAppId]: chatUserAppTeamConfigSchema,
  [aiStudioAppId]: aiStudioUserAppTeamConfigSchema, // ⚠️ ADICIONAR
};

export const appIdToUserAppTeamConfigSchemaUpdate = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema.deepPartial(),
  [chatAppId]: chatUserAppTeamConfigSchema.deepPartial(),
  [aiStudioAppId]: aiStudioUserAppTeamConfigSchema.deepPartial(), // ⚠️ ADICIONAR
};
```

### 3.2 Backend - PromptBuilderService (30 minutos)

```typescript
// packages/api/src/internal/services/prompt-builder.service.ts
// ⚠️ LOCALIZAR e MODIFICAR o método buildPrompt

export class PromptBuilderService {
  async buildPrompt({
    userId,
    teamId,
    modelId,
    agentId,
    userMessage,
  }: BuildPromptParams): Promise<string> {
    // ... código existente ...

    // 3. Buscar instruções do usuário (Nível 3)
    const userConfig = await appRepository.findUserAppTeamConfigs({
      appId: aiStudioAppId,
      userIds: [userId],
      teamIds: [teamId],
    });

    const userInstructions = userConfig[0]?.config?.userInstructions;
    const userInstructionsContent =
      userInstructions?.enabled && userInstructions?.content
        ? userInstructions.content
        : "";

    // 4. Montar prompt final respeitando hierarquia
    const promptParts = [
      platformInstructions, // Nível 1
      teamInstructionsContent, // Nível 2
      userInstructionsContent, // Nível 3 (maior precedência)
      agentPrompt,
    ].filter(Boolean);

    return promptParts.join("\n\n---\n\n");
  }
}
```

### 3.3 Frontend - Componente (20 minutos)

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/sections/user-instructions-section.tsx
// ⚠️ CRIAR - Novo arquivo

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { aiStudioAppId } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import { Textarea } from "@kdx/ui/textarea";

import { useTRPC } from "~/trpc/react";

export function UserInstructionsSection() {
  const trpc = useTRPC();
  const [content, setContent] = useState("");

  // Query usando endpoint genérico
  const { data: config, isLoading } = trpc.app.getUserAppTeamConfig.useQuery({
    appId: aiStudioAppId,
  });

  // Mutation usando endpoint genérico
  const saveMutation = trpc.app.saveUserAppTeamConfig.useMutation({
    onSuccess: () => {
      toast.success("Instruções salvas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  // Sincronizar estado com dados carregados
  useEffect(() => {
    if (config?.userInstructions?.content) {
      setContent(config.userInstructions.content);
    }
  }, [config]);

  const handleSave = () => {
    saveMutation.mutate({
      appId: aiStudioAppId,
      config: {
        userInstructions: {
          content,
          enabled: content.length > 0,
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Instruções Pessoais de IA</CardTitle>
        <CardDescription>
          Defina instruções personalizadas que serão aplicadas em todas as suas
          interações com IA. Estas instruções têm prioridade sobre as instruções
          da equipe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ex: Sempre responda de forma concisa. Prefiro exemplos em TypeScript. Use português brasileiro..."
          className="min-h-[200px]"
          maxLength={2500}
          disabled={isLoading || saveMutation.isPending}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {content.length}/2500 caracteres
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {config?.userInstructions?.enabled === false && content.length > 0
            ? "Instruções desabilitadas"
            : ""}
        </p>
        <Button
          onClick={handleSave}
          disabled={isLoading || saveMutation.isPending}
        >
          {saveMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Salvar Instruções
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 3.4 Frontend - Integração no AI Studio (15 minutos)

#### Passo 1: Verificar/Adicionar na Sidebar

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/app-sidebar.tsx
// ✅ VERIFICAR - Se já existe, não modificar
// ❌ ADICIONAR - Se não existe, adicionar no grupo "Personalização"

const personalSections = [
  {
    id: "user-instructions",
    title: "myInstructions",
    icon: User,
  },
];
```

#### Passo 2: Verificar/Adicionar no Content Switch

```tsx
// apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/ai-studio-content.tsx
// ✅ VERIFICAR - Se já existe, não modificar
// ❌ ADICIONAR - Se não existe, adicionar o case e o import

import { UserInstructionsSection } from "./sections/user-instructions-section";

// ... existing code ...

case "user-instructions":
  return <UserInstructionsSection />;
```

### 3.5 Traduções (5 minutos)

```json
// packages/locales/src/messages/kdx/pt-BR.json
// ⚠️ VERIFICAR E ADICIONAR se não existir

{
  "apps": {
    "aiStudio": {
      "Personalization": {
        "title": "Personalização"
      }
    }
  },
  "myInstructions": "Minhas Instruções"
}

// packages/locales/src/messages/kdx/en.json
// ⚠️ VERIFICAR E ADICIONAR se não existir

{
  "apps": {
    "aiStudio": {
      "Personalization": {
        "title": "Personalization"
      }
    }
  },
  "myInstructions": "My Instructions"
}
```

---

## 4. Checklist de Implementação

### 🔧 Pré-requisitos

- [ ] Fazer backup/commit do estado atual
- [ ] Verificar que servidor está parado

### 📦 Backend (40 min)

- [ ] **CRIAR** schema `aiStudioUserAppTeamConfigSchema` em `@kdx/shared`
- [ ] **ADICIONAR** AI Studio em `AppIdsWithUserAppTeamConfig`
- [ ] **ADICIONAR** ao mapeamento `appIdToUserAppTeamConfigSchema` em `@kdx/shared`
- [ ] **REGISTRAR** em `packages/db/src/repositories/_zodSchemas/userAppTeamConfigs.ts`
- [ ] Executar `pnpm typecheck` no package `shared`
- [ ] Executar `pnpm typecheck` no package `db`
- [ ] Atualizar `PromptBuilderService` para incluir instruções do usuário
- [ ] Executar `pnpm typecheck` no package `api`

### 🎨 Frontend (30 min)

- [ ] **CRIAR** componente `UserInstructionsSection`
- [ ] Verificar imports (usar `useTRPC`, não `api` ou `trpc`)
- [ ] Verificar/adicionar na sidebar
- [ ] Verificar/adicionar no content switch
- [ ] Adicionar traduções PT-BR
- [ ] Adicionar traduções EN

### 🧪 Testes (30 min)

- [ ] Iniciar servidor: `sh ./scripts/start-dev-bg.sh`
- [ ] Verificar status: `sh ./scripts/check-server-simple.sh`
- [ ] Verificar logs de erro: `tail -n 100 dev.log | grep -i error`
- [ ] Testar no navegador:
  - [ ] Navegar para AI Studio
  - [ ] Verificar se "Minhas Instruções" aparece na sidebar
  - [ ] Clicar em "Minhas Instruções"
  - [ ] Digitar texto
  - [ ] Salvar
  - [ ] Recarregar página
  - [ ] Verificar se texto persiste
- [ ] Testar integração com Chat:
  - [ ] Ir para o Chat
  - [ ] Enviar mensagem
  - [ ] Verificar se instruções são aplicadas (pode precisar de debug no PromptBuilderService)

---

## 5. Comandos Úteis

```bash
# Desenvolvimento
sh ./scripts/start-dev-bg.sh    # Iniciar servidor
sh ./scripts/check-dev-status.sh # Status detalhado
sh ./scripts/check-server-simple.sh # Status simples
sh ./scripts/stop-dev.sh         # Parar servidor

# Verificação de tipos
pnpm typecheck                   # Verificar tipos (raiz)
cd packages/shared && pnpm typecheck # Verificar tipos do shared
cd packages/db && pnpm typecheck # Verificar tipos do db
cd packages/api && pnpm typecheck # Verificar tipos da api

# Logs
tail -f dev.log                  # Acompanhar logs
tail -n 100 dev.log | grep -i error # Ver erros recentes
tail -n 100 dev.log | grep -i "prompt" # Debug do PromptBuilderService
```

---

## 6. Possíveis Problemas e Soluções

### Problema 1: Erro de tipos no appRepository

**Sintoma:** `Spread types may only be created from object types`

**Solução:**

```typescript
// Em packages/db/src/repositories/app/appRepository.ts
const schema =
  appIdToUserAppTeamConfigSchema[appId]?.optional() ?? z.object({});
```

### Problema 2: Endpoint não encontrado

**Sintoma:** `Cannot find name 'getUserAppTeamConfig'`

**Solução:**

- Verificar se está usando `trpc.app.getUserAppTeamConfig` (não criar novo endpoint)
- Confirmar que AI Studio foi adicionado em `AppIdsWithUserAppTeamConfig`

### Problema 3: Instruções não aparecem no Chat

**Sintoma:** Chat não usa as instruções salvas

**Solução:**

- Adicionar logs no PromptBuilderService
- Verificar se está buscando por `aiStudioAppId`
- Confirmar que o usuário tem configuração salva

### Problema 4: TypeScript errors após adicionar schemas

**Sintoma:** Erros de tipo em vários arquivos

**Solução:**

- Executar `pnpm typecheck` em cada package na ordem: shared → db → api
- Pode ser necessário reiniciar o TypeScript no VS Code

---

## 7. Definição de Pronto

- [ ] **Schemas criados e registrados** corretamente
- [ ] **Backend compila** sem erros (todos os packages)
- [ ] **Frontend renderiza** sem erros
- [ ] **Usuário consegue salvar** instruções
- [ ] **Instruções persistem** após reload
- [ ] **Instruções são aplicadas** no Chat
- [ ] **Testes manuais** passando
- [ ] **Código revisado** e sem TODOs
- [ ] **Logs limpos** sem erros relacionados

---

## 8. Notas da v3.1

Esta versão corrige as seguintes informações incorretas da v3.0:

1. ❌ Schema não existia → ✅ Instruções para criar
2. ❌ Type não incluía AI Studio → ✅ Instruções para adicionar
3. ❌ Mapeamentos não existiam → ✅ Instruções para registrar
4. ✅ Endpoints genéricos existem e devem ser usados
5. ✅ Estrutura do AI Studio (Sidebar + Content) está correta

**Tempo estimado total:** 1h40min (40min backend + 30min frontend + 30min testes)
