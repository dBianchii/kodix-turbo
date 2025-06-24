# Plano de Refatoração: buscarMensagensTest → getMessages

**Data:** Janeiro 2025  
**Status:** Estratégia 1 - Refatoração Completa (Arquitetural)  
**Localização:** `/docs/debug/chat-endpoint-refactoring-plan.md`  
**Política:** [Política Consolidada de Debug e Logs](./kodix-logs-policy.md)  
**Padrão:** [Nomenclatura em Inglês para Endpoints](../architecture/Architecture_Standards.md)

---

## 🎯 Objetivo

Refatorar completamente o endpoint `buscarMensagensTest` para `getMessages`, seguindo padrões arquiteturais do Kodix e eliminando código legado de teste esquecido no sistema.

---

## 🚨 Análise do Problema

### **❌ Estado Atual (Problemático)**

```typescript
// ❌ VIOLAÇÃO ARQUITETURAL
buscarMensagensTest: protectedProcedure
  .input(buscarChatMessagesSchema)
  .query(async ({ input, ctx }) => {
    // Implementação correta, mas nome incorreto
  });
```

**Problemas Identificados:**

1. **Nome em português** - Viola padrão arquitetural inglês
2. **Sufixo "Test"** - Indica código de debug esquecido
3. **Schema duplicado** - `buscarChatMessagesSchema` vs `buscarMensagensSchema`
4. **Queries duplicadas** - Logs mostram múltiplas execuções simultâneas
5. **Inconsistência** - Outros endpoints seguem padrão inglês

### **✅ Estado Desejado (Conformidade)**

```typescript
// ✅ PADRÃO CORRETO
getMessages: protectedProcedure
  .input(getMessagesSchema)
  .query(async ({ input, ctx }) => {
    // Mesma implementação, nome arquiteturalmente correto
  });
```

---

## 📋 Plano de Execução (5 Etapas)

### **ETAPA 1: Preparação e Validação (20min)**

#### **1.1 Análise de Impacto**

- [ ] Mapear TODAS as chamadas de `buscarMensagensTest`
- [ ] Identificar componentes dependentes
- [ ] Verificar testes que usam o endpoint
- [ ] Documentar pontos de mudança necessários

#### **1.2 Backup e Segurança**

- [ ] Criar branch específica: `refactor/buscar-mensagens-test-to-get-messages`
- [ ] Documentar estado atual dos testes
- [ ] Verificar que todos os testes passam antes da mudança

**🧪 Comandos de Análise:**

```bash
# Mapear todas as ocorrências
grep -r "buscarMensagensTest" apps/kdx/src/
grep -r "buscarMensagensTest" packages/

# Verificar testes atuais
pnpm test:chat

# Verificar tipos gerados
grep -r "buscarMensagensTest" node_modules/.pnpm/
```

### **ETAPA 2: Criação do Novo Schema (15min)**

#### **2.1 Schema Unificado em Inglês**

```typescript
// packages/validators/src/trpc/app/chat.ts

// ✅ NOVO - Schema unificado em inglês
export const getMessagesSchema = z.object({
  chatSessionId: z.string().min(1, "Session ID is required"),
  limit: z.number().min(1).max(100).default(50),
  page: z.number().min(1).default(1),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
```

#### **2.2 Deprecar Schemas Antigos**

```typescript
// ❌ DEPRECATED - Manter temporariamente para migração
export const buscarChatMessagesSchema = getMessagesSchema; // Alias temporário
export const buscarMensagensSchema = getMessagesSchema; // Alias temporário

// Tipos deprecated
export type BuscarChatMessagesInput = GetMessagesInput;
export type BuscarMensagensInput = GetMessagesInput;
```

**🧪 Teste da Etapa 2:**

```bash
# Verificar que schemas compilam
pnpm typecheck

# Verificar que aliases funcionam
pnpm test packages/validators/
```

### **ETAPA 3: Implementação do Novo Endpoint (25min)**

#### **3.1 Criar Endpoint getMessages**

```typescript
// packages/api/src/trpc/routers/app/chat/_router.ts

getMessages: protectedProcedure
  .input(getMessagesSchema)
  .query(async ({ input, ctx }) => {
    try {
      // Verificar se a sessão existe e pertence ao usuário/team
      const session = await chatRepository.ChatSessionRepository.findById(
        input.chatSessionId,
      );
      if (!session || session.teamId !== ctx.auth.user.activeTeamId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found",
        });
      }

      const { limit, page, order } = input;
      const offset = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        chatRepository.ChatMessageRepository.findBySession({
          chatSessionId: input.chatSessionId,
          limite: limit, // Manter compatibilidade com repository
          offset,
          ordem: order, // Manter compatibilidade com repository
        }),
        chatRepository.ChatMessageRepository.countBySession(
          input.chatSessionId,
        ),
      ]);

      return {
        messages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error("🔴 [CHAT_API] Error fetching messages:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching messages",
        cause: error,
      });
    }
  }),
```

#### **3.2 Manter Endpoint Legacy Temporariamente**

```typescript
// ❌ DEPRECATED - Manter por compatibilidade temporária
buscarMensagensTest: protectedProcedure
  .input(buscarChatMessagesSchema)
  .query(async ({ input, ctx }) => {
    console.warn("⚠️ [CHAT_API] buscarMensagensTest is deprecated, use getMessages instead");

    // Redirecionar para novo endpoint
    return this.getMessages.query({ input, ctx });
  }),
```

**🧪 Teste da Etapa 3:**

```bash
# Verificar que novo endpoint funciona
curl -X POST http://localhost:3000/api/trpc/app.chat.getMessages \
  -H "Content-Type: application/json" \
  -d '{"chatSessionId": "test-session-id"}'

# Verificar que endpoint legacy ainda funciona
curl -X POST http://localhost:3000/api/trpc/app.chat.buscarMensagensTest \
  -H "Content-Type: application/json" \
  -d '{"chatSessionId": "test-session-id"}'
```

### **ETAPA 4: Migração do Frontend (30min)**

#### **4.1 Atualizar Componentes Principais**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/unified-chat-page.tsx

// ❌ ANTES
trpc.app.chat.buscarMensagensTest.queryOptions(

// ✅ DEPOIS
trpc.app.chat.getMessages.queryOptions(
```

#### **4.2 Atualizar Hooks**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useSessionWithMessages.tsx

// ❌ ANTES
trpc.app.chat.buscarMensagensTest.queryOptions(

// ✅ DEPOIS
trpc.app.chat.getMessages.queryOptions(
```

#### **4.3 Atualizar Providers**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_providers/chat-thread-provider.tsx

// ❌ ANTES
"buscarMensagensTest",
trpc.app.chat.buscarMensagensTest.query({

// ✅ DEPOIS
"getMessages",
trpc.app.chat.getMessages.query({
```

#### **4.4 Atualizar Invalidações**

```typescript
// Atualizar todas as invalidações de cache
// ❌ ANTES
trpc.app.chat.buscarMensagensTest.pathFilter({

// ✅ DEPOIS
trpc.app.chat.getMessages.pathFilter({
```

**🧪 Teste da Etapa 4:**

```bash
# Verificar que frontend compila
pnpm build

# Verificar que queries funcionam
pnpm dev:kdx
# Navegar para /apps/chat e verificar carregamento de mensagens
```

### **ETAPA 5: Limpeza e Finalização (15min)**

#### **5.1 Remover Código Legacy**

```typescript
// packages/api/src/trpc/routers/app/chat/_router.ts
// ❌ REMOVER após migração completa
// buscarMensagensTest: protectedProcedure...

// packages/validators/src/trpc/app/chat.ts
// ❌ REMOVER schemas deprecated
// export const buscarChatMessagesSchema = ...
// export const buscarMensagensSchema = ...
```

#### **5.2 Atualizar Testes**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/test-utils.ts

// ❌ ANTES
buscarMensagensTest: {

// ✅ DEPOIS
getMessages: {
```

#### **5.3 Documentação**

- [ ] Atualizar documentação da API
- [ ] Registrar mudança em logs-registry.md
- [ ] Atualizar este plano com status de conclusão

**🧪 Teste da Etapa 5:**

```bash
# Executar todos os testes
pnpm test:chat  # Deve passar 13/13 suites

# Verificar que não há referências ao endpoint antigo
grep -r "buscarMensagensTest" apps/kdx/src/
# Deve retornar 0 resultados

# Verificar que novo endpoint funciona
pnpm dev:kdx
# Testar navegação completa no chat
```

---

## 🎯 Critérios de Sucesso

### **Obrigatórios (Não Negociáveis)**

- [ ] Novo endpoint `getMessages` funcionando 100% ✅
- [ ] Zero referências a `buscarMensagensTest` no código ✅
- [ ] Todos os testes passando (13/13) ✅
- [ ] Funcionalidade preservada completamente ✅
- [ ] Nomenclatura em inglês conforme padrão ✅

### **Desejáveis (Melhorias)**

- [ ] Performance mantida ou melhorada
- [ ] Logs mais limpos com prefixos corretos
- [ ] Schema unificado sem duplicação
- [ ] Documentação atualizada

---

## 🔧 Comandos de Validação

### **Verificação de Migração Completa**

```bash
# 1. Verificar que não há referências ao endpoint antigo
grep -r "buscarMensagensTest" apps/kdx/src/
# Deve retornar 0 resultados

# 2. Verificar que novo endpoint está sendo usado
grep -r "getMessages" apps/kdx/src/ | grep -v ".md"
# Deve mostrar múltiplas ocorrências

# 3. Verificar que testes passam
pnpm test:chat
# Deve mostrar 13/13 suites passando

# 4. Verificar que aplicação funciona
pnpm dev:kdx
# Navegar para /apps/chat e testar carregamento de mensagens
```

### **Verificação de Performance**

```bash
# Monitorar queries no console
# Acessar /apps/chat e verificar que:
# - Queries são chamadas com nome correto
# - Não há duplicação excessiva
# - Performance mantida
```

---

## 🚨 Rollback Plan

### **Se Algo Der Errado**

1. **Reverter para branch anterior**

   ```bash
   git checkout main
   git branch -D refactor/buscar-mensagens-test-to-get-messages
   ```

2. **Restaurar endpoint legacy temporariamente**

   ```typescript
   // Manter buscarMensagensTest funcionando até resolver problemas
   ```

3. **Verificar estado dos testes**
   ```bash
   pnpm test:chat
   ```

---

## 📊 Impacto Esperado

### **Antes da Refatoração**

- **Endpoint:** `buscarMensagensTest` (nome incorreto)
- **Schema:** Duplicado e em português
- **Conformidade:** 0% com padrão arquitetural
- **Manutenibilidade:** Baixa (código legado)

### **Depois da Refatoração**

- **Endpoint:** `getMessages` (nome correto)
- **Schema:** Unificado e em inglês
- **Conformidade:** 100% com padrão arquitetural
- **Manutenibilidade:** Alta (código limpo)

---

## 🔗 Referências

- [Política de Logs](./kodix-logs-policy.md) - Política de debug e logs
- [Architecture Standards](../architecture/Architecture_Standards.md) - Padrões arquiteturais
- [Chat Architecture](../subapps/chat/architecture-overview.md) - Arquitetura do Chat
- [tRPC Patterns](../architecture/trpc-patterns.md) - Padrões de tRPC

---

**📋 IMPORTANTE:** Esta refatoração resolve problemas arquiteturais fundamentais e estabelece conformidade com padrões do projeto.

**⚡ EXECUÇÃO:** Implementação cuidadosa e incremental, mantendo funcionalidade durante toda a migração.

**🎯 META FINAL:** Chat SubApp com endpoints padronizados e arquiteturalmente corretos, servindo como referência para outros SubApps.
