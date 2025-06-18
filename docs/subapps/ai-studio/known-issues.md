# Known Issues - AI Studio SubApp

## ⚠️ Problemas Conhecidos

Este documento lista os problemas conhecidos do AI Studio e suas soluções temporárias.

## 🔴 Problemas Críticos

### 1. Limite de Caracteres em System Prompts

**Sintoma**: Erro ao salvar agentes com prompts muito longos.

**Causa**: Campo TEXT no banco tem limite prático de 65,535 caracteres.

**Workaround**:

- Manter prompts abaixo de 60,000 caracteres
- Dividir instruções complexas em múltiplos agentes
- Usar referências externas quando necessário

**Status**: Em análise - possível migração para LONGTEXT.

### 2. Cache de Modelos Desatualizado

**Sintoma**: Mudanças em modelos não refletem imediatamente no Chat.

**Causa**: Cache Redis com TTL de 5 minutos.

**Workaround**:

- Aguardar 5 minutos após alterações
- Limpar cache manualmente se urgente
- Recarregar página do Chat

**Status**: Planejado sistema de invalidação de cache.

## 🟡 Problemas Moderados

### 1. Ordenação de Modelos por Prioridade

**Sintoma**: Ordem de modelos não persiste após reload.

**Causa**: Frontend não mantém estado de ordenação.

**Workaround**:

- Usar sistema de prioridade numérica
- Salvar preferências manualmente

**Status**: Feature de drag-and-drop planejada.

### 2. Validação de Tokens de API

**Sintoma**: Tokens inválidos só são detectados no uso.

**Causa**: Não há validação prévia com providers.

**Workaround**:

- Testar token imediatamente após adicionar
- Verificar logs de erro no Chat

**Status**: Validação assíncrona em desenvolvimento.

### 3. Filtros de Modelos Limitados

**Sintoma**: Difícil encontrar modelos específicos com muitos cadastrados.

**Causa**: Interface mostra todos os modelos sem paginação.

**Workaround**:

- Usar Ctrl+F para buscar
- Desativar modelos não utilizados

**Status**: Sistema de filtros avançados planejado.

## 🟢 Problemas Menores

### 1. Descrições de Modelos Truncadas

**Sintoma**: Descrições longas cortadas nos cards.

**Causa**: Limite visual para manter layout consistente.

**Workaround**:

- Hover para ver descrição completa
- Manter descrições concisas

**Status**: Tooltip com texto completo planejado.

### 2. Sem Histórico de Alterações

**Sintoma**: Não é possível ver quem/quando alterou configurações.

**Causa**: Sistema de auditoria não implementado.

**Workaround**:

- Documentar mudanças importantes
- Usar logs do servidor

**Status**: Sistema de auditoria em roadmap.

## 🔧 Problemas de Integração

### 1. Sincronização com Chat

**Sintoma**: Novos modelos não aparecem imediatamente no Chat.

**Causa**: Chat mantém cache próprio de sessão.

**Workaround**:

- Criar nova sessão de chat
- Fazer logout/login
- Limpar localStorage

**Status**: Melhoria na sincronização planejada.

### 2. Tokens Compartilhados Entre Teams

**Sintoma**: Cada team precisa adicionar próprios tokens.

**Causa**: Isolamento de segurança por design.

**Workaround**:

- Documentar tokens para cada team
- Usar cofre de senhas compartilhado

**Status**: Funcionando como esperado - não é bug.

## 🚀 Performance

### 1. Carregamento Inicial Lento

**Sintoma**: Página demora para carregar com muitos recursos.

**Causa**: Carrega todos os dados de uma vez.

**Workaround**:

- Desativar recursos não utilizados
- Limpar dados antigos periodicamente

**Status**: Lazy loading em desenvolvimento.

### 2. Operações em Lote

**Sintoma**: Não é possível ativar/desativar múltiplos modelos.

**Causa**: Interface opera item por item.

**Workaround**:

- Usar scripts SQL para operações em massa
- Planejar mudanças com antecedência

**Status**: Operações em lote no roadmap.

## 🔐 Segurança

### 1. Rotação de Tokens Manual

**Sintoma**: Não há lembretes para rotacionar tokens.

**Causa**: Sistema de expiração não implementado.

**Workaround**:

- Criar lembretes manuais
- Política de rotação trimestral

**Status**: Sistema de expiração planejado.

## 📱 Interface

### 1. Responsividade em Mobile

**Sintoma**: Algumas funcionalidades difíceis de usar em telas pequenas.

**Causa**: Interface otimizada para desktop.

**Workaround**:

- Usar modo desktop no mobile
- Acessar via tablet/PC quando possível

**Status**: Melhorias mobile em backlog.

### 2. Sem Modo Claro

**Sintoma**: Apenas tema escuro disponível.

**Causa**: Priorização de outras features.

**Workaround**:

- Ajustar brilho da tela
- Usar extensões de browser

**Status**: Tema claro em consideração.

## 🔄 Migrações e Atualizações

### 1. Migração de Dados Legados

**Sintoma**: Dados antigos podem ter formato incompatível.

**Causa**: Mudanças no schema ao longo do tempo.

**Workaround**:

- Executar scripts de migração
- Recriar recursos se necessário

**Status**: Scripts de migração disponíveis.

## 📋 Como Reportar Novos Problemas

1. **Verificar** se o problema já está listado
2. **Reproduzir** o erro consistentemente
3. **Documentar** passos para reprodução
4. **Incluir** logs relevantes
5. **Sugerir** workaround se conhecido

## 🎯 Prioridades de Correção

- **P0**: Problemas que impedem uso do sistema
- **P1**: Problemas que afetam funcionalidade core
- **P2**: Problemas que têm workaround viável
- **P3**: Melhorias de qualidade de vida

A equipe revisa e prioriza correções regularmente baseado em impacto e frequência.
