# Registro de Logs Criados — Kodix

**Data:** Janeiro 2025  
**Status:** Arquivo de controle obrigatório para rastreamento de logs de debug  
**Localização:** `/docs/debug/logs-registry.md`  
**Política:** [Política Consolidada de Debug e Logs](./kodix-logs-policy.md)

---

## 🎯 Objetivo

Este arquivo registra **TODOS os logs de debug criados** no projeto Kodix, permitindo controle rigoroso e limpeza posterior conforme a política estabelecida.

---

## 📋 Regras de Uso

### **🔒 OBRIGATÓRIO**

1. **Todo log criado** deve ser registrado aqui IMEDIATAMENTE
2. **Incluir localização exata** (arquivo e linha aproximada)
3. **Documentar propósito** e contexto do debug
4. **Marcar data de criação** e responsável
5. **Atualizar status** quando removido

### **📝 Formato de Entrada**

```markdown
### [PREFIXO] Descrição do Log

- **Arquivo:** `caminho/para/arquivo.ts:linha`
- **Criado em:** YYYY-MM-DD
- **Responsável:** @username
- **Propósito:** Descrição detalhada do que está sendo debuggado
- **Contexto:** Situação que motivou a criação do log
- **Status:** 🟡 Ativo | 🟢 Removido | 🔴 Crítico (manter)
- **Remoção prevista:** Data estimada para remoção
```

---

## 📊 Logs Ativos

### **🟡 LOGS TEMPORÁRIOS ATIVOS**

_(Nenhum log temporário registrado atualmente)_

### **🔴 LOGS CRÍTICOS DO SISTEMA**

_(Nenhum log crítico registrado atualmente)_

---

## 🔍 Comandos de Monitoramento

### **Buscar Logs Ativos por Prefixo**

```bash
# Buscar todos os logs de debug temporário
grep -r "\[DEBUG_\]" apps/kdx/src/

# Buscar logs por SubApp
grep -r "\[CHAT_\]" apps/kdx/src/ | grep "console.log"
grep -r "\[AI_STUDIO_\]" apps/kdx/src/ | grep "console.log"

# Buscar logs sem prefixo (candidatos a padronização)
grep -r "console.log" apps/kdx/src/ | grep -v "\[.*\]"

# Contar logs ativos por tipo
grep -r "console.log" apps/kdx/src/ | wc -l
```

### **Validação de Conformidade**

```bash
# Verificar se há logs não documentados
# (Comparar resultado do grep com registros neste arquivo)

# Buscar logs com emojis (geralmente verbosos)
grep -r "console.log" apps/kdx/src/ | grep -E "(🔍|🔄|🔧|🚀|🎯|📊|⚡)"

# Verificar logs sem prefixos padronizados
grep -r "console.log" apps/kdx/src/ | grep -v -E "\[(CHAT_|AI_STUDIO_|CALENDAR_|TODO_|KODIX_CARE_|CUPOM_|TRPC|NAV_|AUTH_|DB_|API_|VERCEL_AI_|DEBUG_|PERF_|AUDIT_|ERROR_|WARN_)\]"
```

---

## 📝 Template para Novos Logs

### **Antes de Criar um Log de Debug:**

1. **Verificar se é realmente necessário**
2. **Usar prefixo adequado** conforme [Sistema de Prefixos](./kodix-logs-policy.md#🏷️-sistema-de-prefixos-unificado)
3. **Registrar neste arquivo IMEDIATAMENTE**
4. **Definir data de remoção**

### **Template de Registro:**

```markdown
### [PREFIXO] Título Descritivo

- **Arquivo:** `caminho/arquivo.ts:linha`
- **Criado em:** $(date +%Y-%m-%d)
- **Responsável:** @seu-username
- **Propósito:** Descrever o que está sendo debuggado
- **Contexto:** Situação/bug que motivou a criação
- **Status:** 🟡 Ativo
- **Remoção prevista:** Data estimada (máximo 7 dias)
```

---

## 🚨 Alertas e Lembretes

### **🔔 REVISÃO SEMANAL OBRIGATÓRIA**

- **Frequência:** Toda sexta-feira
- **Ação:** Revisar logs ativos há mais de 7 dias
- **Decisão:** Remover ou justificar manutenção

### **⚠️ LOGS ÓRFÃOS**

Logs encontrados no código mas não documentados neste arquivo:

_(Nenhum log órfão identificado atualmente)_

### **📊 MÉTRICAS DE CONTROLE**

- **Total de logs ativos:** 0
- **Logs aguardando remoção:** 0
- **Logs críticos permanentes:** 0
- **Última revisão:** 2025-01-24
- **Última remoção:** 2025-01-24 - SUB_ETAPA_2.1 ChatLayout (otimização concluída)

---

## 🔗 Referências

- **[Política de Logs](./kodix-logs-policy.md)** - Política completa de debug e logs
- **[Chat SubApp](../subapps/chat/README.md)** - Documentação do Chat SubApp
- **[Architecture Standards](../architecture/Architecture_Standards.md)** - Padrões arquiteturais

---

**📋 IMPORTANTE:** Este arquivo deve ser atualizado TODA VEZ que um log de debug for criado ou removido. É parte integral da política de logs do Kodix.

**⚡ LEMBRE-SE:** Logs de debug são temporários por natureza. Se um log existe há mais de 7 dias, deve ser removido ou reclassificado como crítico com justificativa.

**🎯 META:** Manter o console limpo com menos de 5 logs informativos por navegação e 90%+ de logs relevantes.
