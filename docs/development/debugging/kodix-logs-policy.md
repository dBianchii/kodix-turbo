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

# Política Consolidada de Debug e Logs — Monorepo Kodix

**Data:** Janeiro 2025  
**Status:** Documento ÚNICO e obrigatório para manutenção de logs e debug em TODO o monorepo Kodix  
**Localização:** `/docs/debug/` - Políticas e controle de debugging  
**Escopo:** Todos os SubApps, packages e aplicações do Kodix

---

## 🎯 Objetivo

Manter o console limpo, garantir observabilidade eficiente e preservar logs críticos em todo o monorepo Kodix, seguindo padrões oficiais unificados.

---

## 🔎 Critérios de Limpeza

### ✅ Remover

- `console.log` informativos e verbosos (emojis, debug de tokens, state changes desnecessários)
- Logs de desenvolvimento que poluem o console
- Debug de operações repetitivas (loops, renders frequentes)
- Logs de estado de componentes desnecessários
- Debug de hydration temporário após resolução

### ✅ Manter

- `console.warn` importantes (warnings de dados antigos, performance)
- `console.error` críticos (hydration, erros de API, falhas de sistema)
- Logs de sucesso essenciais (`✅ [CHAT_SESSION_HOOK]`, `✅ [AI_STUDIO_SERVICE]`)
- Logs de auditoria e segurança
- Logs de monitoramento de performance crítica

---

## 🔒 Política de Implementação

1. **Análise manual individual** — JAMAIS em lote
2. **Testar funcionalidade** após cada arquivo modificado
3. **Preservar integralmente** logs de erro e warning
4. **Documentar localização** de logs criados neste arquivo
5. **Prefixos padronizados** por módulo (ver seção Sistema de Prefixos)
6. **Logs críticos** SEMPRE preservados
7. **Configuração por ambiente** via logger centralizado

---

## 🏷️ Sistema de Prefixos Unificado

### **Prefixos por SubApp**

- `[CHAT_]` - Chat SubApp
- `[AI_STUDIO_]` - AI Studio SubApp
- `[CALENDAR_]` - Calendar SubApp
- `[TODO_]` - Todo SubApp
- `[KODIX_CARE_]` - KodixCare SubApp
- `[CUPOM_]` - Cupom SubApp

### **Prefixos por Sistema**

- `[TRPC]` - Sistema tRPC (queries, mutations)
- `[NAV_]` - Sistema de navegação
- `[AUTH_]` - Sistema de autenticação
- `[DB_]` - Operações de banco de dados
- `[API_]` - Endpoints e integrações externas
- `[VERCEL_AI_]` - Vercel AI SDK operations

### **Prefixos por Tipo de Log**

- `[DEBUG_]` - Debug temporário (remover após uso)
- `[PERF_]` - Logs de performance
- `[AUDIT_]` - Logs de auditoria
- `[ERROR_]` - Logs de erro crítico
- `[WARN_]` - Logs de warning

### **Como Filtrar Logs**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# No console do navegador
"[CHAT_"     # Ver apenas logs do Chat SubApp
"[AI_STUDIO_" # Ver apenas logs do AI Studio
"[TRPC]"     # Ver apenas logs do tRPC

# No terminal
pnpm dev:kdx | grep "\[CHAT_"      # Filtrar Chat SubApp
pnpm dev:kdx | grep "\[TRPC\]"     # Filtrar tRPC
pnpm dev:kdx | grep "\[ERROR_\]"   # Ver apenas erros
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📝 Checklist de Manutenção

- [ ] Remover logs verbosos identificados via MCP Browser Tools
- [ ] Localizar arquivos com `grep`/busca por SubApp
- [ ] Remover individualmente cada log desnecessário
- [ ] Testar funcionalidade após cada arquivo
- [ ] Validar que sistema continua funcionando
- [ ] Atualizar este documento com localização e propósito de logs criados
- [ ] Verificar que prefixos estão sendo usados corretamente

---

## 🔧 Processo de Limpeza (Passo a Passo)

1. **Identificar** logs verbosos via MCP Browser Tools
2. **Classificar** por SubApp e tipo usando prefixos
3. **Localizar** arquivos específicos com grep/busca
4. **Remover individualmente** cada log desnecessário
5. **Testar** funcionalidade após cada arquivo
6. **Verificar** que sistema continua funcionando
7. **Documentar** remoções neste arquivo

---

## 📋 Scripts e Comandos Úteis

### **Verificação de Sistema**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar servidor funcionando
curl -s -I http://localhost:3000/apps/chat | head -1
curl -s -I http://localhost:3000/apps/aiStudio | head -1

# Verificar funcionalidade geral
pnpm dev:kdx  # Deve rodar sem erros
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Busca de Logs por SubApp**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Chat SubApp
grep -r "console.log" apps/kdx/src/ | grep -E "(🔍|🔄|🔧|🚀|🎯)" | grep -i chat

# AI Studio
grep -r "console.log" apps/kdx/src/ | grep -i "ai.studio\|aiStudio"

# Todos os SubApps
grep -r "\[.*_\]" apps/kdx/src/ | grep "console.log"

# Logs com emojis (candidatos à remoção)
grep -r "console.log" apps/kdx/src/ | grep -E "(🔍|🔄|🔧|🚀|🎯|📊|⚡|🎯)"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Busca de Logs por Tipo**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Logs de debug temporário
grep -r "\[DEBUG_\]" apps/kdx/src/

# Logs de performance
grep -r "\[PERF_\]" apps/kdx/src/

# Logs tRPC
grep -r "\[TRPC\]" apps/kdx/src/
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🛡️ Regras de Manutenção por Tipo

### **SEMPRE Preservar**

- `console.error` e `console.warn` — logs críticos
- Logs de segurança/auditoria
- Logs de monitoramento de performance crítica
- Logs de falhas de sistema
- Logs de validação de dados importantes

### **Configurar por Ambiente**

- Debug de arquitetura — apenas em desenvolvimento
- Logs verbosos de tRPC — filtrar por tempo de execução
- Logs de Vercel Analytics — desabilitar em desenvolvimento se desejado

### **PROIBIDO**

- Logs informativos repetitivos sem valor
- Estado de componentes desnecessários
- Loops de rendering sem propósito
- Debug temporário não documentado
- Logs sem prefixos em código novo

---

## 🏗️ Sistema de Debug Unificado

### **Logger Centralizado**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/shared/src/logger.ts (sugestão de implementação)
export const logger = {
  chat: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[CHAT_] ${message}`, data);
    }
  },
  aiStudio: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[AI_STUDIO_] ${message}`, data);
    }
  },
  trpc: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[TRPC] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR_] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN_] ${message}`, data);
  },
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Configuração por Ambiente**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Configuração sugerida para tRPC
loggerLink({
  enabled: (op) => {
    return (
      process.env.NODE_ENV === "development" ||
      (op.direction === "down" && op.result instanceof Error) ||
      (op.direction === "down" && op.elapsedMs > 2000)
    );
  },
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📚 Lições Aprendidas Críticas

### **Do Chat SubApp (Aplicável a Todos)**

- **Nunca remover logs em lote** — análise individual obrigatória
- **Preservar logs críticos** — erros e warnings nunca removidos
- **Documentar logs criados** — sempre atualizar este arquivo
- **Centralizar navegação** — nunca alterar hooks fundamentais sem motivo crítico
- **Evitar mudanças arquiteturais** — correção deve ser cirúrgica

### **Padrões Arquiteturais Críticos**

- **Hydration Errors:** Sempre investigar e corrigir, não apenas silenciar
- **Service Layer:** Logs de comunicação entre SubApps são essenciais
- **tRPC Performance:** Monitorar requests > 2s automaticamente
- **Model Selector:** Logs de debugging devem ser removidos após validação

### **Antipadrões Identificados**

- **Substituição de hooks fundamentais** sem motivo crítico
- **Debugging não documentado** que permanece no código
- **Logs sem prefixos** que dificultam filtragem
- **Remoção em lote** sem análise individual

---

## 📈 Métricas de Sucesso por SubApp

### **Chat SubApp**

- **Hydration Errors:** 0
- **Logs por Navegação:** < 5
- **Performance tRPC:** Logs apenas > 2s
- **Console Clarity:** 90%+ logs relevantes

### **AI Studio SubApp**

- **Service Calls:** Logs apenas para erros ou debug
- **Model Loading:** Performance tracking essencial
- **Token Usage:** Logs de auditoria preservados

### **Geral (Todos os SubApps)**

- **Console Noise Reduction:** 80-90% menos logs verbosos
- **Error Visibility:** 100% erros críticos visíveis
- **Debug Efficiency:** Filtragem por prefixos funcionando
- **Performance Monitoring:** Requests lentos identificados

---

## 🔧 Configuração por SubApp

### **Chat SubApp**

- Prefixo: `[CHAT_]`
- Logs críticos: Session management, message flow
- Performance: First message < 200ms

### **AI Studio SubApp**

- Prefixo: `[AI_STUDIO_]`
- Logs críticos: Model availability, token validation
- Performance: Model loading, API calls

### **Calendar SubApp**

- Prefixo: `[CALENDAR_]`
- Logs críticos: Event synchronization, recurring events
- Performance: Calendar rendering, event queries

### **KodixCare SubApp**

- Prefixo: `[KODIX_CARE_]`
- Logs críticos: Task synchronization, care shifts
- Performance: Calendar integration, task management

---

## 📁 Registro de Logs Criados

**📋 ARQUIVO DEDICADO:** [Registro de Logs Criados](./logs-registry.md)

### **Controle Obrigatório**

- **Todo log criado** deve ser registrado em `logs-registry.md`
- **Localização exata** e propósito documentados
- **Status de remoção** atualizado regularmente
- **Revisão semanal** obrigatória

### **Resumo Atual**

- **Logs ativos:** 0
- **Logs críticos:** 0
- **Última limpeza:** Chat SubApp (~75+ logs removidos - Janeiro 2025)
- **Próxima revisão:** Sexta-feira

---

## 🔗 Referências Cruzadas

### **Documentação de Arquitetura**

- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[Chat Architecture](../subapps/chat/README.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Debug Logging Standards](./debug-logging-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture](../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- [tRPC Patterns](../architecture/backend/trpc-patterns.md)

### **SubApps Específicos**

- [Chat SubApp](../subapps/chat/README.md)
- [AI Studio SubApp](../subapps/ai-studio/README.md)
- [Calendar SubApp](../subapps/calendar/README.md)
- [KodixCare SubApp](../subapps/kodix-care-web/README.md)

### **Padrões de Desenvolvimento**

- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](../architecture/standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->
- [Inter-App Dependencies](../architecture/subapp-inter-dependencies.md)

---

**Documento obrigatório para qualquer alteração de logs em TODO o monorepo Kodix.**

**Aplicabilidade:** Todos os SubApps, packages e aplicações  
**Revisão:** Mensal ou após grandes mudanças arquiteturais  
**Responsabilidade:** Toda a equipe de desenvolvimento
