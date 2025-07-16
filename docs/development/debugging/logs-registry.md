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

### **🟢 LOGS TEMPORÁRIOS REMOVIDOS**

### [DEBUG_EDIT_MODAL] Debug do Modal Editar Chat

- **Arquivo:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/app-sidebar.tsx:440`
- **Criado em:** 2025-01-26
- **Responsável:** @KodixAgent
- **Propósito:** Diagnosticar bug onde modal "Editar Chat" não salva alterações. Logs expandidos para incluir validação de mutation object, try/catch para capturar erros silenciosos, validação detalhada de parâmetros enviados (tipos e valores), e rastreamento completo da execução da updateSessionMutation.
- **Contexto:** Bug identificado no commit 31b27299 onde modal fecha prematuramente. Problema resolvido com Estratégia 1 - Simplificação da mutation seguindo padrão das mutations funcionais.
- **Status:** 🟢 Removido
- **Removido em:** 2025-01-26 (problema resolvido com simplificação da mutation)

### **🟡 LOGS TEMPORÁRIOS ATIVOS**

### [CHAT_DEBUG] Diagnóstico de Duplicação de Mensagem

- **Arquivo:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useChatSessionManager.ts`
- **Criado em:** 2024-07-26
- **Responsável:** @KodixAgent
- **Propósito:** Rastrear a criação de sessão e o manuseio de mensagens pendentes para diagnosticar o bug de duplicação.
- **Contexto:** Instrumentação da Estratégia 1 para o bug de duplicação de mensagem. **NOTA: A ferramenta de edição falhou em aplicar estes logs.**
- **Logs Planejados:**
  - `createEmptySession.onSuccess`: `[CHAT_DEBUG] Nova sessão criada no backend, ID: ${data.session.id}`
  - `handleSendMessage`: `[CHAT_DEBUG] Iniciando envio. Input: "${input}", SessionID: ${sessionId}`
  - `handleSendMessage (else)`: `[CHAT_DEBUG] Nenhuma sessão ativa. Criando nova e guardando mensagem.`
- **Status:** 🟢 Removido
- **Removido em:** 2024-07-27
- **Notas:** Logs não foram implementados conforme o plano. Verificação manual confirmou ausência de logs.

### [CHAT_DEBUG] Diagnóstico de Duplicação de Mensagem

- **Arquivo:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/empty-thread-state.tsx`
- **Criado em:** 2024-07-26
- **Responsável:** @KodixAgent
- **Propósito:** Rastrear a renderização do componente e o tratamento de mensagens pendentes do `sessionStorage`.
- **Contexto:** Instrumentação da Estratégia 1 para o bug de duplicação de mensagem.
- **Logs Implementados:**
  - `EmptyThreadState`: `[CHAT_DEBUG] Renderizando. Tentando ler mensagem pendente.`
  - `useEffect`: `[CHAT_DEBUG] Encontrada mensagem pendente "${pendingMessage}" para a nova sessão ${activeThreadId}.`
- **Status:** 🟢 Removido
- **Removido em:** 2024-07-27
- **Notas:** A verificação manual do arquivo confirmou que os logs não estavam presentes, indicando que o registro estava desatualizado.

### [CHAT_DEBUG] Diagnóstico de Duplicação de Mensagem

- **Arquivo:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useThreadChat.tsx`
- **Criado em:** 2024-07-26
- **Responsável:** @KodixAgent
- **Propósito:** Rastrear o ciclo de vida do hook `useChat`, incluindo inicialização, submissão e conclusão do streaming.
- **Contexto:** Instrumentação da Estratégia 1 para o bug de duplicação de mensagem.
- **Logs Implementados/Planejados:**
  - `useThreadChat`: `[CHAT_DEBUG] Inicializado para thread ${activeThread?.id}.` (Implementado)
  - `onFinish`: `[CHAT_DEBUG] Streaming finalizado. Mensagem recebida.` (Falha na implementação)
  - `onError`: `[CHAT_DEBUG] Erro no streaming.` (Falha na implementação)
  - `handleSubmit`: `[CHAT_DEBUG] Formulário submetido.` (Falha na implementação)
- **Status:** 🟢 Removido
- **Removido em:** 2024-07-27
- **Notas:** Os logs de `[CHAT_DEBUG]` foram removidos. Alguns logs de `console.error` com prefixo `[THREAD_CHAT]` não puderam ser alterados pela ferramenta e permanecem, mas sem o prefixo de debug temporário.

### Logs Temporários Ativos

### 2025-01-27 - Debug de Streaming no Chat ✅ RESOLVIDO

**Problema**: Após digitar mensagem em novo chat, a sessão é criada mas não há resposta
**Status**: ✅ **RESOLVIDO** - O sistema estava funcionando, mas havia loop infinito de logs

**Descoberta**:

- O chat estava funcionando corretamente
- A mensagem pendente era processada e enviada via `/api/chat/stream` (status 200)
- O problema era um **loop infinito** no `useEffect` de debug que causava re-execuções desnecessárias

**Correção**: Removido o `useEffect` problemático que causava o loop infinito

**Arquivos corrigidos**:

- `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/active-chat-window.tsx`
  - Removido: useEffect de processamento de mensagens pendentes (linhas 188-220)
  - **RESULTADO**: Loop infinito eliminado, chat funcionando normalmente

**Logs mantidos** (para referência futura):

- `apps/kdx/src/app/api/chat/stream/route.ts`
  - Linhas: 60-67 (requisição recebida)
  - Linhas: 76-124 (processamento de parâmetros)
  - Linhas: 270-301 (carregamento de modelo)
  - Linhas: 303-312 (criação do streaming)
  - Prefixo: `[STREAM_API]`
  - **Status**: MANTER para debug futuro

**Remover após**: Confirmar que não há mais problemas de streaming

### 2025-01-26 - Debug de Duplicação de Mensagens

### **🔴 LOGS CRÍTICOS DO SISTEMA**

_(Nenhum log crítico registrado atualmente)_

---

## 🔍 Comandos de Monitoramento

### **Buscar Logs Ativos por Prefixo**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
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
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Validação de Conformidade**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar se há logs não documentados
# (Comparar resultado do grep com registros neste arquivo)

# Buscar logs com emojis (geralmente verbosos)
grep -r "console.log" apps/kdx/src/ | grep -E "(🔍|🔄|🔧|🚀|🎯|📊|⚡)"

# Verificar logs sem prefixos padronizados
grep -r "console.log" apps/kdx/src/ | grep -v -E "\[(CHAT_|AI_STUDIO_|CALENDAR_|TODO_|KODIX_CARE_|CUPOM_|TRPC|NAV_|AUTH_|DB_|API_|VERCEL_AI_|DEBUG_|PERF_|AUDIT_|ERROR_|WARN_)\]"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

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
- **Última revisão:** 2025-01-26
- **Última correção:** 2025-01-26 - Modal Editar Chat Bug Fix RESOLVIDO (Estratégia 1 - Simplificação da mutation)

---

## 🔗 Referências

- **[Política de Logs](./kodix-logs-policy.md)** - Política completa de debug e logs
- **[Chat SubApp](../subapps/chat/README.md)** - Documentação do Chat SubApp
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](../architecture/standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->** - Padrões arquiteturais

---

**📋 IMPORTANTE:** Este arquivo deve ser atualizado TODA VEZ que um log de debug for criado ou removido. É parte integral da política de logs do Kodix.

**⚡ LEMBRE-SE:** Logs de debug são temporários por natureza. Se um log existe há mais de 7 dias, deve ser removido ou reclassificado como crítico com justificativa.

**🎯 META:** Manter o console limpo com menos de 5 logs informativos por navegação e 90%+ de logs relevantes.
