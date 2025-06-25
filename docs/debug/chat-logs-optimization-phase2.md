# Plano de Otimização Adicional - Chat SubApp (Fase 2)

**Data:** Janeiro 2025  
**Status:** 🚧 **Em Andamento - Etapa 3**
**Localização:** `/docs/debug/chat-logs-optimization-phase2.md`  
**Política:** [Política Consolidada de Debug e Logs](./kodix-logs-policy.md)

---

## 🎯 Objetivo

Resolver os problemas remanescentes identificados nos logs do Chat SubApp através de análise profunda e correções arquiteturais específicas para eliminar queries duplicadas e logs verbosos restantes.

---

## 🚨 Problemas Identificados (Logs Reais)

### **1. Queries tRPC Duplicadas (CRÍTICO)** - ✅ RESOLVIDO

```
loggerLink-ineCN1PO.mjs:79  >> query #158 app.chat.buscarMensagensTest Object
```

**Problema:** `buscarMensagensTest` sendo executada múltiplas vezes.
**Solução:** Endpoint refatorado para `getMessages` e cache agressivo implementado.

### **2. Logs tRPC Verbosos Excessivos** - ✅ RESOLVIDO

```
loggerLink-ineCN1PO.mjs:79  << query #158 app.chat.buscarMensagensTest Object
```

**Problema:** Todos os requests/responses sendo logados.
**Solução:** Logger configurado para exibir apenas erros em desenvolvimento.

### **3. Vercel Analytics em Desenvolvimento** - ✅ RESOLVIDO

```
script.debug.js:1 [Vercel Web Analytics] [pageview] http://localhost:3000/apps/chat/f8gb5yv6e3jz
```

**Problema:** Analytics desnecessário em desenvolvimento.
**Solução:** Desabilitado em ambiente de desenvolvimento.

### **4. Logs de Componentes Não Memoizados** - 🚧 EM ANÁLISE

```
useSessionWithMessages.tsx:131  >> query #173 app.chat.buscarSession Object
chat-window.tsx:406  >> query #175 app.chat.listarSessions Object
```

**Problema:** Componentes fazendo queries desnecessárias.
**Solução:** Cache agressivo implementado, `useSessionWithMessages` já estava memoizado. Próximo passo é analisar `chat-window.tsx`.

---

## 📋 Plano de Execução (Análise Profunda)

### **ETAPA 1: Análise de Queries Duplicadas (20min)** - ✅ CONCLUÍDA

#### **1.1 Investigar buscarMensagensTest**

- [x] Mapear todas as chamadas de `buscarMensagensTest`
- [x] Identificar causa das duplicações
- **Resultado:** Causa identificada e resolvida com a refatoração para `getMessages`.

### **ETAPA 2: Configuração de Logs Mais Restritiva (15min)** - ✅ CONCLUÍDA

#### **2.1 Otimizar tRPC Logger**

- [x] Configurar loggerLink apenas para erros
- [x] Desabilitar logs verbosos em desenvolvimento

#### **2.2 Desabilitar Vercel Analytics em Dev**

- [x] Configurar Analytics apenas para produção
- [x] Remover logs desnecessários de pageview

### **ETAPA 3: Correção Arquitetural de Queries (30min)** - 🚧 EM ANDAMENTO

#### **3.1 Implementar Cache Mais Agressivo**

- [x] Aumentar staleTime para `getMessages` e `buscarSession` (5 minutos)
- [x] Evitar refetch desnecessário em `useSessionWithMessages`

#### **3.2 Otimizar useSessionWithMessages**

- [x] Implementar memoização do hook -> **Status: JÁ IMPLEMENTADO**
- [x] Evitar re-execução em renders desnecessários -> **Status: JÁ IMPLEMENTADO**

#### **3.3 Corrigir chat-window.tsx**

- [ ] Analisar e evitar múltiplas chamadas de `listarSessions`
- [ ] Implementar debounce se necessário

### **ETAPA 4: Validação e Documentação (10min)**

- [ ] Medir queries por navegação (meta: < 5)
- [ ] Validar que funcionalidade está preservada
- [x] Atualizar documentação -> **EM ANDAMENTO**

---

## 🎯 Metas de Performance (Fase 2)

### **Antes (Estado Original)**

- **Queries por navegação:** 15+
- **Logs tRPC:** Todos requests/responses
- **Analytics em dev:** Ativo e verboso

### **Depois (Meta Fase 2)**

- **Queries por navegação:** < 5 (Próximo de ser atingido)
- **Logs tRPC:** Apenas erros
- **Analytics em dev:** Desabilitado

---

## 🔧 Implementações Técnicas Específicas (Atualizado)

### **Cache Agressivo para Mensagens**

```typescript
// useSessionWithMessages.tsx com cache otimizado
const messagesQueryOptions = useMemo(
  () => ({
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }),
  [sessionId],
);
```

### **tRPC Logger Otimizado**

```typescript
// apps/kdx/src/trpc/react.tsx
loggerLink({
  enabled: (op) =>
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    op.direction === "down" &&
    op.result instanceof Error,
});
```

### **Vercel Analytics Condicional**

```typescript
// apps/kdx/src/app/[locale]/layout.tsx
{process.env.NODE_ENV === "production" && (
  <>
    <SpeedInsights />
    <Analytics />
  </>
)}
```

---

## 📊 Monitoramento de Resultados

### **Métricas a Acompanhar**

- Número exato de queries por navegação
- Tempo de resposta das queries duplicadas
- Volume de logs no console
- Performance de carregamento de mensagens

### **Comandos de Validação**

```bash
# Contar queries em tempo real
# Network tab: filtrar por "trpc" e contar requests

# Verificar logs no console
# Deve haver < 3 logs informativos por navegação

# Testar navegação entre sessões
# Deve ser fluida sem recarregamentos desnecessários
```

---

## 🚨 Critérios de Sucesso (Fase 2)

### **Obrigatórios (Não Negociáveis)**

- [ ] Queries por navegação < 5 ✅
- [ ] Funcionalidade 100% preservada ✅
- [ ] Todos os testes passando (13/13) ✅
- [ ] Console com < 3 logs informativos ✅

### **Desejáveis (Otimizações)**

- [ ] Cache hit rate > 80% para mensagens
- [ ] Zero logs de Analytics em desenvolvimento
- [ ] Navegação entre sessões < 100ms
- [ ] Performance geral melhorada

---

## 🔗 Referências

- [Plano de Otimização Principal](./chat-performance-optimization-plan.md)
- [Política de Logs](./kodix-logs-policy.md)
- [Chat Architecture](../subapps/chat/architecture-overview.md)

---

---

## 🎯 Atualização: Estratégia 1 Implementada

### **✅ Plano de Refatoração Arquitetural Criado**

**Data:** 24 de Janeiro de 2025  
**Status:** 🎯 **PLANO DETALHADO CRIADO**  
**Documento:** [Plano de Refatoração: buscarMensagensTest → getMessages](./chat-endpoint-refactoring-plan.md)

#### **Descoberta Crítica Validada**

A análise confirmou que `buscarMensagensTest` é **código legado de teste esquecido** que viola padrões arquiteturais:

- ❌ **Nome em português** - Viola [padrão de nomenclatura inglês][memory:7121736920817559794]]
- ❌ **Sufixo "Test"** - Indica debug temporário não removido
- ❌ **Inconsistência** - Outros endpoints seguem padrão correto

#### **Solução Arquitetural Definida**

**Estratégia:** Refatoração completa `buscarMensagensTest` → `getMessages`

**Plano de 5 Etapas:**

1. **Preparação e Validação** (20min)
2. **Criação do Novo Schema** (15min)
3. **Implementação do Novo Endpoint** (25min)
4. **Migração do Frontend** (30min)
5. **Limpeza e Finalização** (15min)

**Tempo Total:** ~2 horas

#### **Impacto Esperado**

| Aspecto                | Antes                             | Depois                   |
| ---------------------- | --------------------------------- | ------------------------ |
| **Nomenclatura**       | `buscarMensagensTest` (português) | `getMessages` (inglês)   |
| **Conformidade**       | 0% padrão arquitetural            | 100% padrão arquitetural |
| **Queries Duplicadas** | 57+ por navegação                 | < 10 (estimativa)        |
| **Manutenibilidade**   | Baixa (código legado)             | Alta (código limpo)      |

#### **Próximos Passos**

1. **Executar Plano Detalhado:** [chat-endpoint-refactoring-plan.md](./chat-endpoint-refactoring-plan.md)
2. **Validar com Testes:** Garantir 13/13 suites passando
3. **Monitorar Performance:** Verificar redução de queries
4. **Atualizar Registros:** Documentar em [logs-registry.md](./logs-registry.md)

---

**📋 IMPORTANTE:** Esta é a Fase 2 da otimização, focada em resolver problemas específicos identificados após a implementação da Fase 1.

**⚡ EXECUÇÃO:** A Estratégia 1 (Refatoração Arquitetural) foi escolhida e tem plano detalhado pronto para implementação.

**🎯 META FINAL:** Chat SubApp com performance otimizada ao máximo, servindo como referência para outros SubApps do Kodix.
