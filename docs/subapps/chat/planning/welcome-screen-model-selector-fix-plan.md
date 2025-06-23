# 🎯 Plano de Correção - Model Selector Welcome Screen (Janeiro 2025)

**📅 Data:** Janeiro 2025  
**🎯 Objetivo:** Corrigir o problema do model selector na welcome screen que não aplica o modelo selecionado  
**⚙️ Status:** Plano para implementação imediata  
**🔗 Arquitetura:** Thread-first + Service Layer + userAppTeamConfig

## 🚨 **PROBLEMA IDENTIFICADO**

### **Sintoma**

- Model selector na welcome screen não aplica o modelo selecionado para novas sessões
- Sistema sempre usa claude-3-haiku independente da seleção no UI
- Usuário seleciona GPT-4, mas nova sessão é criada com claude-3-haiku

### **Análise da Root Cause**

**🔍 Fluxo Atual (Quebrado):**

```
1. Usuário seleciona modelo no ModelSelector (welcome screen)
2. handleModelSelect() → savePreferredModel() → salva no userAppTeamConfig ✅
3. Usuário digita primeira mensagem
4. useAutoCreateSession → autoCreateSessionWithMessage ❌
5. Backend usa getPreferredModelHelper() que busca do userAppTeamConfig
6. ❌ PROBLEMA: Há um delay/race condition na persistência
```

**🔍 Gap Identificado:**

- O `savePreferredModel()` é assíncrono mas o sistema não aguarda a persistência
- `useAutoCreateSession` busca do userAppTeamConfig que pode não estar atualizado
- Não há passagem explícita do modelo selecionado na UI para o backend

## 🎯 **ESTRATÉGIAS DE CORREÇÃO**

### **ESTRATÉGIA 1: Passagem Explícita do Modelo** ⭐ **RECOMENDADA**

**Abordagem:** Modificar `useAutoCreateSession` para aceitar `aiModelId` como parâmetro explícito.

**✅ Vantagens:**

- Correção cirúrgica e mínima
- Zero race conditions
- Mantém arquitetura thread-first
- Compatível com sistema atual
- Fallback robusto para userAppTeamConfig

**❌ Desvantagens:**

- Pequena mudança na interface do hook

**🔧 Implementação:**

```typescript
// 1. Modificar useAutoCreateSession para aceitar aiModelId
interface CreateSessionInput {
  firstMessage: string;
  aiModelId?: string; // ✅ NOVO
  useAgent?: boolean;
  generateTitle?: boolean;
}

// 2. Modificar EmptyThreadState para passar o modelo
const handleFirstMessage = async (message: string) => {
  await createSessionWithMessage({
    firstMessage: message,
    aiModelId: selectedModelId, // ✅ PASSAR MODELO EXPLÍCITO
  });
};

// 3. Backend usa modelo explícito com fallback
const aiModelId = input.aiModelId || (await getPreferredModelHelper(...)).modelId;
```

### **ESTRATÉGIA 2: Sincronização com Await**

**Abordagem:** Aguardar a persistência do `savePreferredModel` antes de permitir criação de sessão.

**✅ Vantagens:**

- Garante persistência antes da criação
- Não muda interface dos hooks

**❌ Desvantagens:**

- Pode ser mais lento (await)
- Mais complexo (gerenciar loading states)
- Não resolve race conditions no backend

### **ESTRATÉGIA 3: Context Provider para Modelo**

**Abordagem:** Criar ModelContext global para gerenciar estado do modelo.

**✅ Vantagens:**

- Estado global consistente
- Mais robusto para futuras expansões

**❌ Desvantagens:**

- Over-engineering para o problema atual
- Mudança arquitetural mais ampla
- Viola princípio de correção cirúrgica

## 📋 **IMPLEMENTAÇÃO ESTRATÉGIA 1** (Recomendada)

### **FASE 1: Frontend - Hooks (30min)**

#### **1.1 Modificar useAutoCreateSession**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useAutoCreateSession.tsx

interface CreateSessionInput {
  firstMessage: string;
  aiModelId?: string; // ✅ NOVO: Aceitar modelo explícito
  useAgent?: boolean;
  generateTitle?: boolean;
}

export function useAutoCreateSession(options?: UseAutoCreateSessionOptions) {
  // ... código existente ...

  const createSessionWithMessage = async (input: CreateSessionInput) => {
    // Validações existentes...

    console.log("🚀 [CHAT] Criando sessão com modelo:", input.aiModelId);

    try {
      await autoCreateMutation.mutateAsync({
        firstMessage: input.firstMessage,
        aiModelId: input.aiModelId, // ✅ NOVO: Passar modelo explícito
        useAgent: input.useAgent ?? true,
        generateTitle: input.generateTitle ?? true,
      });
    } catch (error) {
      // Error handling...
    }
  };

  // ... resto do código ...
}
```

#### **1.2 Atualizar EmptyThreadState**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/chat-window.tsx

function EmptyThreadState({
  onNewSession,
  selectedModelId, // ✅ NOVO: Receber modelo selecionado
}: {
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string; // ✅ NOVO
}) {
  const { createSessionWithMessage } = useAutoCreateSession({
    onSuccess: onNewSession,
  });

  const handleFirstMessage = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;

      console.log("🚀 [EMPTY_THREAD] Usando modelo:", selectedModelId);

      // ✅ PASSAR MODELO EXPLÍCITO
      await createSessionWithMessage({
        firstMessage: trimmedMessage,
        aiModelId: selectedModelId, // ✅ NOVO
        generateTitle: true,
      });
    },
    [createSessionWithMessage, selectedModelId],
  );

  // ... resto do código ...
}
```

#### **1.3 Atualizar ChatWindow**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/chat-window.tsx

export function ChatWindow({
  sessionId,
  onNewSession,
  selectedModelId, // ✅ NOVO: Receber modelo da UnifiedChatPage
}: {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string; // ✅ NOVO
}) {
  if (!sessionId) {
    return (
      <EmptyThreadState
        onNewSession={onNewSession}
        selectedModelId={selectedModelId} // ✅ PASSAR MODELO
      />
    );
  }

  return (
    <ActiveChatWindow
      sessionId={sessionId}
      onNewSession={onNewSession}
    />
  );
}
```

#### **1.4 Atualizar UnifiedChatPage**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/unified-chat-page.tsx

export function UnifiedChatPage({ sessionId, locale }: UnifiedChatPageProps) {
  // ... código existente ...

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      {/* ... sidebar ... */}

      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatWindow
          sessionId={selectedSessionId}
          onNewSession={handleSessionSelect}
          selectedModelId={selectedModelId} // ✅ PASSAR MODELO SELECIONADO
        />
      </div>
    </SidebarProvider>
  );
}
```

### **FASE 2: Backend - API (20min)**

#### **2.1 Atualizar Validator**

```typescript
// packages/validators/src/trpc/app/chat.ts

export const autoCreateSessionWithMessageSchema = z.object({
  firstMessage: z.string().min(1, "Primeira mensagem é obrigatória"),
  aiModelId: z.string().optional(), // ✅ NOVO: Modelo explícito opcional
  useAgent: z.boolean().default(true),
  generateTitle: z.boolean().default(true),
});
```

#### **2.2 Atualizar Handler**

```typescript
// packages/api/src/trpc/routers/app/chat/autoCreateSessionWithMessage.handler.ts

export async function autoCreateSessionWithMessageHandler({
  input,
  ctx,
}: {
  input: AutoCreateSessionWithMessageInput;
  ctx: TProtectedProcedureContext;
}) {
  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  try {
    // ✅ NOVO: Usar modelo explícito se fornecido
    let aiModelId: string;
    let preferredModel: any;

    if (input.aiModelId) {
      console.log("✅ [AUTO_CREATE] Usando modelo explícito:", input.aiModelId);

      // Validar se o modelo existe e é acessível
      try {
        preferredModel = await AiStudioService.getModelById({
          modelId: input.aiModelId,
          teamId,
          requestingApp: chatAppId,
        });
        aiModelId = input.aiModelId;

        console.log(
          "✅ [AUTO_CREATE] Modelo explícito validado:",
          preferredModel.name,
        );
      } catch (error) {
        console.warn(
          "⚠️ [AUTO_CREATE] Modelo explícito inválido, usando fallback",
        );
        // Fallback para getPreferredModelHelper
        const fallback = await getPreferredModelHelper(
          teamId,
          userId,
          chatAppId,
        );
        preferredModel = fallback.model;
        aiModelId = fallback.modelId;
      }
    } else {
      console.log("🔄 [AUTO_CREATE] Buscando modelo preferido (fallback)");
      // Lógica existente
      const preferredModelResult = await getPreferredModelHelper(
        teamId,
        userId,
        chatAppId,
      );
      preferredModel = preferredModelResult.model;
      aiModelId = preferredModelResult.modelId;
    }

    // ... resto do código existente (geração de título, criação de sessão, etc.)
  } catch (error) {
    // ... error handling ...
  }
}
```

### **FASE 3: Validação e Testes (20min)**

#### **3.1 Cenários de Teste**

1. **Teste 1: Modelo Explícito Funciona**

   - Selecionar GPT-4 no ModelSelector
   - Digitar primeira mensagem
   - Verificar que sessão é criada com GPT-4

2. **Teste 2: Fallback para Preferido**

   - Não selecionar modelo (use preferido)
   - Verificar que usa modelo do userAppTeamConfig

3. **Teste 3: Fallback para AI Studio**

   - Modelo explícito inválido
   - Verificar que usa fallback do AI Studio

4. **Teste 4: Persistência Funciona**
   - Selecionar modelo → criar sessão → verificar que savePreferredModel persiste

#### **3.2 Logs de Debug**

```typescript
// Adicionar logs temporários para validar o fluxo:
console.log("🔍 [DEBUG] Fluxo completo:", {
  step: "model_selection",
  selectedModelId,
  source: "ui_selection",
});

console.log("🔍 [DEBUG] Fluxo completo:", {
  step: "session_creation",
  aiModelId: input.aiModelId,
  source: input.aiModelId ? "explicit" : "fallback",
});
```

## 🎯 **BENEFÍCIOS ESPERADOS**

### **Correção Imediata**

- ✅ Model selector funciona 100% das vezes
- ✅ Zero race conditions
- ✅ Feedback visual correto

### **Arquitetura Robusta**

- ✅ Mantém thread-first pattern
- ✅ Compatível com sistema atual
- ✅ Fallback robusto preservado

### **UX Melhorada**

- ✅ Resposta imediata à seleção
- ✅ Consistência entre UI e backend
- ✅ Zero surpresas para o usuário

## 🚨 **ANTIPADRÕES EVITADOS**

### ✅ **Seguindo Lições Críticas**

1. **Correção Cirúrgica**: Apenas modificar interface de hooks, não fluxos fundamentais
2. **Thread-First Preservado**: Manter arquitetura estabelecida
3. **Navegação Centralizada**: Não tocar no sistema de navegação
4. **Fallback Robusto**: Manter getPreferredModelHelper como fallback

### ❌ **O que NÃO fazer**

- Trocar `createEmptySession` por `useAutoCreateSession`
- Mudar fluxo de navegação
- Criar Context Provider desnecessário
- Quebrar sistema de userAppTeamConfig

## 📊 **CRONOGRAMA DE IMPLEMENTAÇÃO**

```
⏱️ FASE 1: Frontend (30min)
  - Modificar useAutoCreateSession (10min)
  - Atualizar EmptyThreadState (10min)
  - Atualizar ChatWindow e UnifiedChatPage (10min)

⏱️ FASE 2: Backend (20min)
  - Atualizar validator (5min)
  - Modificar handler (15min)

⏱️ FASE 3: Validação (20min)
  - Testar cenários principais (15min)
  - Limpar logs de debug (5min)

🎯 TOTAL: 70 minutos
```

## 🔍 **ROLLBACK PLAN**

Se houver problemas:

1. **Frontend**: Remover parâmetro `aiModelId` dos hooks
2. **Backend**: Remover `input.aiModelId` do handler
3. **Validator**: Remover campo opcional do schema
4. **Sistema volta ao estado anterior** (com o problema original)

## 🎉 **RESULTADO ESPERADO**

Após implementação:

- ✅ Model selector na welcome screen funciona 100%
- ✅ Modelo selecionado = modelo usado na sessão
- ✅ Fallback robusto preservado
- ✅ Zero regressões na arquitetura
- ✅ Código limpo e maintível

---

**📝 Status:** Plano completo para correção cirúrgica  
**🎯 Próximos passos:** Implementar Estratégia 1 seguindo as fases  
**⚠️ Criticidade:** MÉDIA - Afeta UX mas sistema funciona com fallback

**📚 Documentos Relacionados:**

- `@architectural-correction-antipatterns.md` - Lições críticas seguidas
- `@architecture-overview.md` - Arquitetura thread-first preservada
- `@model-selector-debugging-plan.md` - Problema de sincronização resolvido
