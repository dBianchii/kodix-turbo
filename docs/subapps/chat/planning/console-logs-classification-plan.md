# Classificação e Plano de Ação - Logs do Console

**Data:** Janeiro 2025  
**Objetivo:** Classificar todos os logs atuais e definir estratégia de limpeza/manutenção  
**Análise baseada em:** MCP Browser Tools console inspection

## 📊 **RESUMO EXECUTIVO**

### **Status Atual:**

- **🟢 LOGS CRÍTICOS:** 1 (hydration error - requer investigação)
- **🟡 LOGS INFORMATIVOS:** 2 (desenvolvimento - manter)
- **🟠 LOGS VERBOSOS:** 3 (tRPC - configurar filtros)
- **🔵 LOGS EXTERNOS:** 13+ (Vercel Analytics - configurar)

### **Prioridade de Ação:**

1. **🔴 URGENTE:** Investigar hydration error
2. **🟡 MÉDIA:** Configurar filtros de tRPC
3. **🟢 BAIXA:** Configurar Vercel Analytics para produção

---

## 🔴 **CATEGORIA 1: LOGS CRÍTICOS - AÇÃO IMEDIATA**

### **1.1 Hydration Error (CRÍTICO)**

**Log:**

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties...
```

**📊 Análise:**

- **Severidade:** 🔴 CRÍTICA
- **Frequência:** Ocasional (durante navegação)
- **Impacto:** Quebra de SSR/hidratação React
- **Localização:** Sistema de roteamento/componentes

**🎯 Ação Requerida:**

- [ ] **INVESTIGAR IMEDIATAMENTE** - Identificar componente causador
- [ ] **ADICIONAR DEBUGGING** temporário para localizar fonte
- [ ] **CORRIGIR** diferenças server/client rendering
- [ ] **TESTAR** em múltiplos navegadores

**💡 Possíveis Causas:**

- Componentes usando `Date.now()` ou `Math.random()`
- Diferenças de timezone/locale
- Estado inicial diferente entre server/client
- Componentes condicionais baseados em `typeof window`

**🔧 Investigação Sugerida:**

```typescript
// Adicionar debugging temporário
useEffect(() => {
  console.log("[HYDRATION_DEBUG] Component mounted:", componentName);
}, []);
```

---

## 🟡 **CATEGORIA 2: LOGS INFORMATIVOS - MANTER**

### **2.1 React DevTools Info**

**Log:**

```
Download the React DevTools for a better development experience
```

**📊 Análise:**

- **Severidade:** 🟢 INFORMATIVO
- **Frequência:** Uma vez por sessão
- **Impacto:** Zero (apenas informativo)
- **Ambiente:** Apenas desenvolvimento

**🎯 Ação:**

- [x] **MANTER** - Log útil para desenvolvedores
- [ ] **DOCUMENTAR** - Adicionar ao guia de desenvolvimento

### **2.2 Chat Layout Debug**

**Log:**

```
🎯 [SUB_ETAPA_2.1] ChatLayout renderizado com ChatThreadProvider
```

**📊 Análise:**

- **Severidade:** 🟡 DEBUG
- **Frequência:** Uma vez por carregamento
- **Impacto:** Útil para debugging da arquitetura thread-first
- **Localização:** `ChatLayout` component

**🎯 Ação:**

- [x] **MANTER TEMPORARIAMENTE** - Útil durante desenvolvimento
- [ ] **REMOVER EM 6 MESES** - Quando arquitetura estiver consolidada
- [ ] **CONFIGURAR** - Apenas em NODE_ENV === 'development'

---

## 🟠 **CATEGORIA 3: LOGS VERBOSOS - CONFIGURAR FILTROS**

### **3.1 tRPC Request Logging**

**Logs:**

```
>>> tRPC Request from rsc by {...}
[TRPC] user.getInvitations took 991ms to execute
[TRPC] app.getInstalled took 1000ms to execute
```

**📊 Análise:**

- **Severidade:** 🟠 VERBOSO
- **Frequência:** Alta (múltiplas vezes por navegação)
- **Impacto:** Polui console mas útil para performance
- **Localização:** `apps/kdx/src/trpc/react.tsx`

**🎯 Ação:**

- [ ] **CONFIGURAR FILTROS** - Mostrar apenas erros e requests > 2s
- [ ] **IMPLEMENTAR NÍVEIS** - DEBUG, INFO, WARN, ERROR
- [ ] **DOCUMENTAR** - Como filtrar logs no console

**🔧 Configuração Sugerida:**

```typescript
// apps/kdx/src/trpc/react.tsx
loggerLink({
  enabled: (op) => {
    // Apenas erros ou requests lentos
    return (
      (op.direction === "down" && op.result instanceof Error) ||
      (op.direction === "down" && op.elapsedMs > 2000)
    );
  },
});
```

---

## 🔵 **CATEGORIA 4: LOGS EXTERNOS - CONFIGURAR PRODUÇÃO**

### **4.1 Vercel Analytics & Speed Insights**

**Logs:**

```
[Vercel Web Analytics] Debug mode is enabled by default in development
[Vercel Web Analytics] [pageview] http://localhost:3000/apps/chat/...
[Vercel Speed Insights] Debug mode is enabled by default in development
[Vercel Speed Insights] [vitals] {...}
```

**📊 Análise:**

- **Severidade:** 🔵 EXTERNO
- **Frequência:** Muito alta (a cada navegação)
- **Impacto:** Polui console mas necessário para analytics
- **Ambiente:** Desenvolvimento (desabilitado em produção)

**🎯 Ação:**

- [ ] **CONFIGURAR** - Desabilitar logs em desenvolvimento se desejado
- [ ] **DOCUMENTAR** - Como interpretar métricas
- [ ] **VALIDAR** - Funcionamento em produção

**🔧 Configuração Opcional:**

```typescript
// next.config.js - Para desabilitar logs em dev
const nextConfig = {
  experimental: {
    webVitalsAttribution: ["CLS", "LCP"],
  },
  // Configurar analytics apenas para produção
};
```

---

## 📋 **PLANO DE EXECUÇÃO PRIORITIZADO**

### **🔴 FASE 1: CRÍTICA (Esta Semana)**

1. **Investigar Hydration Error**
   - [ ] Adicionar debugging específico
   - [ ] Identificar componente causador
   - [ ] Implementar correção
   - [ ] Testar em múltiplos cenários

### **🟡 FASE 2: OTIMIZAÇÃO (Próximas 2 Semanas)**

2. **Configurar Filtros tRPC**

   - [ ] Implementar níveis de log
   - [ ] Configurar filtros por performance
   - [ ] Documentar configuração

3. **Revisar Debug Logs**
   - [ ] Avaliar necessidade do `[SUB_ETAPA_2.1]`
   - [ ] Configurar para desenvolvimento apenas
   - [ ] Planejar remoção futura

### **🟢 FASE 3: MELHORIA (Próximo Mês)**

4. **Configurar Analytics**
   - [ ] Otimizar configuração Vercel
   - [ ] Documentar interpretação de métricas
   - [ ] Validar produção

---

## 🛡️ **REGRAS DE MANUTENÇÃO**

### **✅ LOGS PERMITIDOS (Sempre)**

- `console.error` - Erros críticos
- `console.warn` - Avisos importantes
- Logs de segurança/auditoria
- Performance metrics essenciais

### **🟡 LOGS CONDICIONAIS (Desenvolvimento)**

- Debug de arquitetura (temporário)
- tRPC requests (filtrados)
- Analytics em modo debug

### **❌ LOGS PROIBIDOS**

- Debug verboso sem filtros
- Logs informativos repetitivos
- Estado de componentes desnecessários
- Loops de rendering

---

## 📊 **MÉTRICAS DE SUCESSO**

### **Objetivos Quantitativos:**

- **Hydration Errors:** 0 (atualmente: 1)
- **Logs por Navegação:** < 5 (atualmente: ~15+)
- **Performance tRPC:** Logs apenas > 2s
- **Console Clarity:** 90%+ logs relevantes

### **Objetivos Qualitativos:**

- Console limpo para desenvolvimento
- Debugging eficiente quando necessário
- Zero impacto na experiência do usuário
- Manutenibilidade a longo prazo

---

## 🔧 **FERRAMENTAS DE MONITORAMENTO**

### **Scripts de Verificação:**

```bash
# Verificar hydration errors
pnpm dev:kdx | grep -i "hydrat"

# Monitorar performance tRPC
pnpm dev:kdx | grep "\[TRPC\].*[2-9][0-9][0-9][0-9]ms"

# Verificar logs verbosos
pnpm dev:kdx | grep -v "Vercel\|DevTools"
```

### **Comandos MCP Browser Tools:**

```typescript
// Verificar estado atual
mcp_browser - tools_getConsoleLogs();
mcp_browser - tools_getConsoleErrors();

// Limpar para teste
mcp_browser - tools_wipeLogs();
```

---

## 📚 **DOCUMENTAÇÃO RELACIONADA**

- **[Política de Logs](./chat-logs-cleanup-plan.md)** - Regras gerais
- **[Debug Standards](../../architecture/debug-logging-standards.md)** - Padrões de debug
- **[Performance Guide](../../architecture/performance-guide.md)** - Otimização

---

**📅 Próxima Revisão:** 1 semana (após correção hydration error)  
**📊 Status:** 🔴 AÇÃO REQUERIDA - Hydration error crítico  
**🎯 Responsável:** Equipe de desenvolvimento frontend
