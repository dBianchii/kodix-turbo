# Regras para Limpeza de Logs - Chat SubApp

**Objetivo:** Manter console limpo preservando logs críticos  
**Estratégia:** Remoção manual individual seguindo política de logs

## 🔧 **CRITÉRIOS DE LIMPEZA**

### **✅ LOGS PARA REMOVER**

- `console.log` informativos com emojis (`🔍`, `🔄`, `🔧`, `🚀`, `🎯`)
- Logs de debug verbosos (cálculos de tokens, state changes desnecessários)
- Logs de desenvolvimento que poluem o console
- Debug de operações repetitivas (loops, renders frequentes)

### **✅ LOGS PARA MANTER**

- `console.warn` importantes (`⚠️`, warnings de dados antigos)
- `console.error` críticos (hydration, erros de API)
- Logs de sucesso importantes (`✅ [CHAT_SESSION_HOOK]`)
- Logs de auditoria e segurança

## 🔒 **POLÍTICA DE IMPLEMENTAÇÃO**

### **Regras Obrigatórias:**

1. **Análise manual individual** - JAMAIS em lote
2. **Testar funcionalidade** após cada arquivo modificado
3. **Preservar integralmente** logs de erro e warning
4. **Documentar localização** de logs criados em `/docs/logs/`

### **Processo de Limpeza:**

1. **Identificar** logs verbosos via MCP Browser Tools
2. **Localizar** arquivos específicos com grep/busca
3. **Remover individualmente** cada log desnecessário
4. **Testar** funcionalidade após cada arquivo
5. **Verificar** que sistema continua funcionando

## 📋 **COMANDOS DE VERIFICAÇÃO**

```bash
# Verificar servidor funcionando
curl -s -I http://localhost:3000/apps/chat | head -1

# Buscar logs específicos
grep -r "🔍 \\[" apps/kdx/src/
grep -r "console.log" apps/kdx/src/ | grep -E "(🔍|🔄|🔧|🚀|🎯)"

# Verificar funcionalidade
pnpm dev:kdx  # Deve rodar sem erros
```

## 🎯 **RESULTADO ESPERADO**

- **Console Performance:** Melhoria significativa
- **Logs por Interação:** Redução de ~80-90%
- **Breaking Changes:** Zero
- **Logs Críticos:** 100% preservados

---

**📅 Documento atualizado:** Janeiro 2025  
**🎯 Baseado em:** Política consolidada de logs  
**🔒 Regra:** Limpeza manual individual preservando logs críticos
