# Plano de Otimização Adicional - Chat SubApp (Fase 2)

**Data:** Janeiro 2025  
**Status:** Estratégia 4 - Análise Profunda + Correção Arquitetural  
**Localização:** `/docs/debug/chat-logs-optimization-phase2.md`  
**Política:** [Política Consolidada de Debug e Logs](./kodix-logs-policy.md)

---

## 🎯 Objetivo

Resolver os problemas remanescentes identificados nos logs do Chat SubApp através de análise profunda e correções arquiteturais específicas para eliminar queries duplicadas e logs verbosos restantes.

---

## 🚨 Problemas Identificados (Logs Reais)

### **1. Queries tRPC Duplicadas (CRÍTICO)**

```
loggerLink-ineCN1PO.mjs:79  >> query #157 app.chat.buscarSession Object
loggerLink-ineCN1PO.mjs:79  >> query #158 app.chat.buscarMensagensTest Object
loggerLink-ineCN1PO.mjs:79  >> query #159 app.chat.buscarMensagensTest Object
loggerLink-ineCN1PO.mjs:79  >> query #160 app.chat.buscarMensagensTest Object
```

**Problema:** `buscarMensagensTest` sendo executada múltiplas vezes simultaneamente

### **2. Logs tRPC Verbosos Excessivos**

```
loggerLink-ineCN1PO.mjs:79  << query #158 app.chat.buscarMensagensTest Object
loggerLink-ineCN1PO.mjs:79  << query #160 app.chat.buscarMensagensTest Object
```

**Problema:** Todos os requests/responses sendo logados

### **3. Vercel Analytics em Desenvolvimento**

```
script.debug.js:1 [Vercel Web Analytics] [pageview] http://localhost:3000/apps/chat/f8gb5yv6e3jz
```

**Problema:** Analytics desnecessário em desenvolvimento

### **4. Logs de Componentes Não Memoizados**

```
useSessionWithMessages.tsx:131  >> query #173 app.chat.buscarSession Object
chat-window.tsx:406  >> query #175 app.chat.listarSessions Object
```

**Problema:** Componentes fazendo queries desnecessárias

---

## 📋 Plano de Execução (Análise Profunda)

### **ETAPA 1: Análise de Queries Duplicadas (20min)**

#### **1.1 Investigar buscarMensagensTest**

- [ ] Mapear todas as chamadas de `buscarMensagensTest`
- [ ] Identificar componentes que fazem múltiplas chamadas
- [ ] Verificar dependências que causam re-execução
- [ ] Documentar padrão de duplicação

#### **1.2 Análise de Cache Inadequado**

- [ ] Verificar configurações de staleTime atuais
- [ ] Identificar queries sem cache otimizado
- [ ] Mapear invalidation patterns problemáticos

**🧪 Teste da Etapa 1:**

```bash
# Monitorar queries em tempo real
# Acessar http://localhost:3000/apps/chat e contar queries
# Meta: Identificar causa exata das duplicações
```

### **ETAPA 2: Configuração de Logs Mais Restritiva (15min)**

#### **2.1 Otimizar tRPC Logger**

- [ ] Configurar loggerLink apenas para erros e requests > 2s
- [ ] Desabilitar logs verbosos em desenvolvimento
- [ ] Manter apenas logs críticos

#### **2.2 Desabilitar Vercel Analytics em Dev**

- [ ] Configurar Analytics apenas para produção
- [ ] Remover logs desnecessários de pageview
- [ ] Manter funcionalidade intacta

**🧪 Teste da Etapa 2:**

```bash
# Console deve ter < 3 logs por navegação
# Verificar que Analytics não aparece em dev
```

### **ETAPA 3: Correção Arquitetural de Queries (30min)**

#### **3.1 Implementar Cache Mais Agressivo**

- [ ] Aumentar staleTime para `buscarMensagensTest` (2-5 minutos)
- [ ] Implementar cache inteligente baseado em sessionId
- [ ] Evitar refetch desnecessário em mudanças de rota

#### **3.2 Otimizar useSessionWithMessages**

- [ ] Implementar memoização do hook
- [ ] Evitar re-execução em renders desnecessários
- [ ] Cache local para mensagens já carregadas

#### **3.3 Corrigir chat-window.tsx**

- [ ] Evitar múltiplas chamadas de `listarSessions`
- [ ] Implementar debounce se necessário
- [ ] Memoizar computações pesadas

**🧪 Teste da Etapa 3:**

```bash
# Queries por navegação deve ser < 5
# Verificar que mensagens não recarregam desnecessariamente
```

### **ETAPA 4: Validação e Documentação (10min)**

#### **4.1 Testes de Performance**

- [ ] Medir queries por navegação (meta: < 5)
- [ ] Verificar tempo de primeira mensagem
- [ ] Validar que funcionalidade está preservada

#### **4.2 Atualizar Documentação**

- [ ] Registrar mudanças em logs-registry.md
- [ ] Documentar configurações otimizadas
- [ ] Atualizar plano de otimização principal

**🧪 Teste da Etapa 4:**

```bash
# Executar testes completos
pnpm test:chat  # Deve passar 13/13 suites
```

---

## 🎯 Metas de Performance (Fase 2)

### **Antes (Estado Atual)**

- **Queries por navegação:** 10-15 (ainda alto)
- **Logs tRPC:** Todos requests/responses
- **Analytics em dev:** Ativo e verboso
- **Cache efficiency:** Baixa para mensagens

### **Depois (Meta Fase 2)**

- **Queries por navegação:** < 5
- **Logs tRPC:** Apenas erros e requests > 2s
- **Analytics em dev:** Desabilitado
- **Cache efficiency:** Alta para todas as queries

---

## 🔧 Implementações Técnicas Específicas

### **Cache Agressivo para Mensagens**

```typescript
// buscarMensagensTest com cache otimizado
const messagesQuery = useQuery(
  trpc.app.chat.buscarMensagensTest.queryOptions(
    { sessionId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Evitar refetch desnecessário
    },
  ),
);
```

### **tRPC Logger Otimizado**

```typescript
// Configuração mais restritiva
loggerLink({
  enabled: (op) => {
    return (
      // Apenas erros
      (op.direction === "down" && op.result instanceof Error) ||
      // Ou requests muito lentos
      (op.direction === "down" && op.elapsedMs > 2000)
    );
  },
});
```

### **Vercel Analytics Condicional**

```typescript
// Apenas em produção
if (process.env.NODE_ENV === "production") {
  // Inicializar Analytics
}
```

### **Hook Memoizado**

```typescript
// useSessionWithMessages otimizado
export const useSessionWithMessages = memo(function useSessionWithMessages(
  sessionId: string,
) {
  const messagesQuery = useMemo(
    () => trpc.app.chat.buscarMensagensTest.queryOptions({ sessionId }),
    [sessionId],
  );

  return useQuery(messagesQuery, {
    staleTime: 5 * 60 * 1000,
    // ... outras configurações
  });
});
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
