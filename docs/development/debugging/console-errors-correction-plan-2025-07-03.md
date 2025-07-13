<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Plano de Correção: Logs de Console e Erros - Kodix

**Data:** 2025-07-03  
**Status:** 🟡 Plano de Ação Ativo  
**Escopo:** Todo o monorepo Kodix  
**Política de Referência:** [Política Consolidada de Debug e Logs](./kodix-logs-policy.md)

---

## 🎯 Resumo Executivo

Análise do código identificou **150+ logs verbosos** distribuídos em todo o monorepo, especialmente nos SubApps Chat e AI Studio. Este plano organiza a limpeza seguindo a política estabelecida, priorizando a remoção de logs informativos e preservando logs críticos de erro e warning.

---

## 📊 Análise dos Logs Encontrados

### **🔍 Estatísticas Gerais**

- **Total de `console.log` identificados:** ~150+
- **Logs críticos (`console.error/warn`):** ~80 (MANTER)
- **Logs verbosos para remoção:** ~70
- **Arquivos afetados:** 45+ arquivos

### **📁 Distribuição por SubApp**

| SubApp/Área     | console.log | console.error/warn | Prioridade |
| --------------- | ----------- | ------------------ | ---------- |
| **Chat SubApp** | ~40         | ~25                | 🔴 ALTA    |
| **AI Studio**   | ~15         | ~30                | 🟡 MÉDIA   |
| **API Routes**  | ~10         | ~15                | 🟡 MÉDIA   |
| **Hooks/Utils** | ~5          | ~10                | 🟢 BAIXA   |

---

## 🚨 Logs Críticos Identificados (MANTER)

### **✅ Logs de Erro que DEVEM ser Preservados**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Logs de sistema críticos
packages/api/src/trpc/middlewares.ts - Erros de middleware
packages/api/src/internal/monitoring/ - Alertas de performance
packages/api/src/trpc/routers/app/chat/ - Erros de operações de chat
packages/api/src/trpc/routers/app/ai-studio/ - Erros de AI Studio

# Logs de monitoramento
packages/api/src/internal/monitoring/vercel-ai-metrics.ts
packages/api/src/internal/monitoring/alerts.ts
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **⚠️ Warnings Importantes**

- Modelos não disponíveis (AI Studio)
- Falhas de conectividade
- Problemas de performance
- Erros de validação de dados

---

## 🧹 Logs Verbosos para Remoção

### **🔴 PRIORIDADE ALTA - Chat SubApp**

#### `apps/kdx/src/app/[locale]/(authed)/apps/chat/`

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Arquivos com logs verbosos excessivos:

// _providers/chat-thread-provider.tsx (15+ logs)
console.log("🚀 [THREAD_PROVIDER] Criando nova thread:", options);
console.log("✅ [THREAD_PROVIDER] Thread criada:", newThread.id);
console.log("🗑️ [THREAD_PROVIDER] Deletando thread:", threadId);
// ... outros logs informativos

// _components/chat-window-session.tsx (20+ logs)
console.log("📤 Enviando mensagem:", text);
console.log("🔄 Fazendo requisição para API de streaming...");
console.log("📥 Resposta recebida, status:", response.status);
// ... logs de streaming

// _providers/external-store-runtime.tsx (10+ logs)
console.log("✅ [EXTERNAL_STORE] Mensagem processada com sucesso");
console.log("✏️ [EXTERNAL_STORE] Editando mensagem:", message);
// ... logs de runtime
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### `apps/kdx/src/app/api/chat/`

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// route.ts (15+ logs)
console.log("🔵 [API] POST recebido");
console.log("🟢 [API] Mensagens recebidas:", messages);
console.log("🟢 [API] Stream criado com sucesso");
// ... logs de API

// stream/route.ts (5+ logs)
console.log("✅ [VERCEL_AI_NATIVE] Stream finished:", {...});
console.log(`⚠️ [DEBUG] Using default model: ${model.name}`);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🟡 PRIORIDADE MÉDIA - AI Studio**

#### `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/`

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// _components/sections/enabled-models-section.tsx
console.log("Reordering models:", {...});
console.log(...); // logs de reordenação
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### `apps/kdx/src/hooks/`

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// useAiProvider.ts e useAiProviderToken.ts
console.log("Submitting provider:", data, id);
console.log("Deleting provider:", provider.id);
console.log("Submitting token:", data, id);
// ... logs de operações CRUD
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🟢 PRIORIDADE BAIXA - Outros**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// test-openai-direct.ts (arquivo de teste - pode ser removido)
// apps/kdx/src/test-setup.ts (logs de setup)
// apps/kdx/src/trpc/react.tsx (logs customizados)
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📋 Plano de Execução

### **Fase 1: Chat SubApp (2-3 horas)**

1. **`_providers/chat-thread-provider.tsx`**

   - Remover logs informativos de criação/deleção de threads
   - Manter apenas logs de erro
   - Testar funcionalidade de threads

2. **`_components/chat-window-session.tsx`**

   - Remover logs de streaming detalhados
   - Manter logs de erro de conectividade
   - Testar fluxo de mensagens

3. **`_providers/external-store-runtime.tsx`**

   - Remover logs de processamento de mensagens
   - Manter logs de erro de estado
   - Testar store runtime

4. **`apps/kdx/src/app/api/chat/route.ts`**
   - Remover logs informativos de API
   - Manter logs de erro de processamento
   - Testar endpoints de chat

### **Fase 2: AI Studio (1-2 horas)**

1. **`_components/sections/enabled-models-section.tsx`**

   - Remover logs de reordenação
   - Manter logs de erro de configuração
   - Testar funcionalidade de modelos

2. **`hooks/useAiProvider.ts` e `useAiProviderToken.ts`**
   - Remover logs de operações CRUD
   - Manter logs de erro de validação
   - Testar operações de provider/token

### **Fase 3: Limpeza Geral (1 hora)**

1. **Arquivos de teste e setup**

   - Revisar necessidade do `test-openai-direct.ts`
   - Limpar logs de setup desnecessários
   - Validar configurações de teste

2. **Verificação final**
   - Executar `pnpm dev:kdx`
   - Testar funcionalidades principais
   - Verificar console no navegador

---

## 🔧 Scripts de Execução

### **Busca e Identificação**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Identificar logs por SubApp
grep -r "console.log" apps/kdx/src/app/ | grep -E "(🔍|🔄|🔧|🚀|🎯|📊|⚡|🟢|🔵|✅)" | head -20

# Contar logs por arquivo
grep -r "console.log" apps/kdx/src/app/ | cut -d: -f1 | sort | uniq -c | sort -nr

# Verificar logs sem prefixos
grep -r "console.log" apps/kdx/src/ | grep -v -E "\[(CHAT_|AI_STUDIO_|THREAD_|EXTERNAL_|API_)\]"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Validação Pós-Limpeza**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar servidor funcionando
curl -s -I http://localhost:3000/apps/chat | head -1
curl -s -I http://localhost:3000/apps/aiStudio | head -1

# Contar logs restantes
grep -r "console.log" apps/kdx/src/ | wc -l

# Verificar apenas logs críticos restantes
grep -r "console.error\|console.warn" apps/kdx/src/ | wc -l
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📊 Métricas de Sucesso

### **Antes da Limpeza**

- **console.log total:** ~150
- **Logs por navegação:** 15-20
- **Console clarity:** ~30%

### **Meta Pós-Limpeza**

- **console.log total:** <30 (80% redução)
- **Logs por navegação:** <5
- **Console clarity:** >90%
- **Logs críticos preservados:** 100%

---

## ⚠️ Regras Críticas Durante Execução

### **✅ SEMPRE Fazer**

1. **Análise individual** de cada log antes da remoção
2. **Testar funcionalidade** após cada arquivo modificado
3. **Preservar integralmente** `console.error` e `console.warn`
4. **Documentar** logs críticos que devem permanecer
5. **Usar prefixos padronizados** para novos logs se necessário

### **❌ NUNCA Fazer**

1. **Remoção em lote** sem análise individual
2. **Remover logs de erro** (`console.error`, `console.warn`)
3. **Alterar funcionalidade** durante limpeza de logs
4. **Quebrar fluxos críticos** (autenticação, streaming, etc.)
5. **Ignorar testes** após modificações

---

## 📝 Checklist de Execução

### **Preparação**

- [ ] Backup do estado atual
- [ ] Servidor funcionando (`pnpm dev:kdx`)
- [ ] Testes passando
- [ ] Console baseline documentado

### **Execução por Fase**

- [ ] **Fase 1:** Chat SubApp limpo e testado
- [ ] **Fase 2:** AI Studio limpo e testado
- [ ] **Fase 3:** Limpeza geral concluída

### **Validação Final**

- [ ] Servidor funcionando sem erros
- [ ] Funcionalidades principais testadas
- [ ] Console com <5 logs por navegação
- [ ] Logs críticos preservados
- [ ] Documentação atualizada

---

## 🔗 Referências

- **[Política de Logs](./kodix-logs-policy.md)** - Política completa
- **[Registro de Logs](./logs-registry.md)** - Controle de logs criados
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[Chat Architecture](../subapps/chat/README.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Arquitetura do Chat
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[AI Studio Architecture](../subapps/ai-studio/ai-studio-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Arquitetura do AI Studio

---

**📋 IMPORTANTE:** Este plano deve ser executado seguindo rigorosamente a ordem das fases e validando cada etapa antes de prosseguir. A meta é um console limpo mantendo 100% da funcionalidade e observabilidade crítica.

**⚡ EXECUÇÃO:** Estimativa total de 4-6 horas distribuídas ao longo de 2-3 dias para validação adequada.
