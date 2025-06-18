# Known Issues - Chat SubApp

## ⚠️ Problemas Conhecidos

Este documento lista os problemas conhecidos do Chat e suas soluções temporárias. O sistema utiliza arquitetura híbrida (Vercel AI SDK + Legacy fallback).

## 🔴 Problemas Críticos

### 1. Limite de Tokens Excedido

**Sintoma**: Erro "max_tokens: X > Y" ao usar certos modelos.

**Causa**: Contexto da conversa excede limites configurados no AI Studio.

**Workaround**:

- Reduzir o histórico da conversa
- Criar nova sessão para tópico diferente
- Verificar limites no AI Studio > Modelos

**Status**: Em desenvolvimento - sistema de truncamento automático.

### 2. Perda de Contexto em Conversas Longas

**Sintoma**: IA "esquece" informações mencionadas anteriormente.

**Causa**: Sistema trunca mensagens antigas para caber no limite de tokens.

**Workaround**:

- Criar nova sessão para tópicos diferentes
- Resumir pontos importantes periodicamente
- Verificar modelos com limites maiores no AI Studio

**Status**: Planejado - sistema de resumo automático.

## 🟡 Problemas Moderados

### 3. Sessão Sem Modelo Configurado

**Sintoma**: Chat usa modelo padrão mesmo após selecionar outro.

**Causa**: Sessão criada antes da seleção do modelo.

**Workaround**:

- Selecionar modelo antes de enviar primeira mensagem
- Atualizar sessão manualmente após criação

**Status**: Parcialmente resolvido - fallback automático implementado.

### 4. Streaming Interrompido

**Sintoma**: Resposta para no meio da geração.

**Causa**: Timeout de conexão ou erro no provider.

**Workaround**:

- Reenviar a mensagem
- Verificar status do provider no AI Studio
- Reduzir tamanho da resposta esperada

**Status**: Em investigação.

### 5. Histórico Não Carrega

**Sintoma**: Mensagens antigas não aparecem ao reabrir sessão.

**Causa**: Paginação não implementada completamente.

**Workaround**:

- Scroll manual para carregar mais mensagens
- Limite atual de 20 mensagens por página

**Status**: Feature em desenvolvimento.

## 🔧 Problemas do Sistema Híbrido

### 6. Fallback Frequente para Sistema Legacy

**Sintoma**: Sistema usa legacy mesmo com Vercel AI SDK habilitado.

**Causa**: Erros no Vercel AI SDK causam fallback automático.

**Diagnóstico**:

```bash
# Verificar taxa de fallback
grep -c "fallback para sistema atual" logs/app.log

# Verificar erros do Vercel AI SDK
grep "🔴 \[MIGRATION\]" logs/app.log
```

**Workaround**:

- Verificar configuração de tokens no AI Studio
- Confirmar que modelos estão ativos
- Verificar conectividade com providers

**Status**: Monitoramento ativo - fallback é comportamento esperado.

### 7. Headers Inconsistentes

**Sintoma**: Header `X-Powered-By` aparece/desaparece entre requisições.

**Causa**: Sistema híbrido alterna entre Vercel AI SDK e Legacy.

**Identificação**:

```bash
# Verificar qual sistema está ativo
curl -I http://localhost:3000/api/chat/stream | grep "X-Powered-By"

# Vercel AI SDK ativo: X-Powered-By: Vercel-AI-SDK
# Legacy ativo: (sem header)
```

**Status**: Comportamento esperado do sistema híbrido.

### 8. Feature Flag Não Funciona

**Sintoma**: `ENABLE_VERCEL_AI_ADAPTER=false` não desabilita Vercel AI SDK.

**Causa**: Variável de ambiente não carregada ou servidor não reiniciado.

**Solução**:

```bash
# Verificar variável
echo $ENABLE_VERCEL_AI_ADAPTER

# Reiniciar servidor
pnpm dev:kdx
```

**Status**: Configuração - não é bug.

## 🟢 Problemas Menores

### 9. Título Automático Genérico

**Sintoma**: Sessões criadas com títulos como "Nova Conversa".

**Causa**: Geração de título baseada em primeira mensagem não implementada.

**Workaround**:

- Editar título manualmente após criação
- Incluir contexto claro na primeira mensagem

**Status**: Feature planejada.

### 10. Markdown Parcial

**Sintoma**: Alguns elementos markdown não são renderizados.

**Causa**: Parser markdown limitado.

**Workaround**:

- Usar formatação básica (negrito, itálico, listas)
- Evitar tabelas complexas e blocos de código aninhados

**Status**: Melhoria planejada.

### 11. Mobile: Teclado Cobre Input

**Sintoma**: Em alguns dispositivos móveis, o teclado cobre o campo de input.

**Causa**: Viewport não ajusta corretamente.

**Workaround**:

- Rolar manualmente para ver o input
- Usar em modo landscape

**Status**: Fix em desenvolvimento.

## 🔧 Problemas de Integração

### 12. Token Expirado do Provider

**Sintoma**: Erro 401 ao enviar mensagem.

**Causa**: Token da API do provider expirou ou é inválido.

**Solução**:

1. Acessar AI Studio > Tokens
2. Atualizar token do provider afetado
3. Verificar se modelo está ativo

**Status**: Melhorias na UX de erro planejadas.

### 13. Modelo Não Disponível

**Sintoma**: Modelo selecionado não funciona.

**Causa**: Modelo foi desativado no AI Studio ou requer configuração adicional.

**Solução**:

1. Verificar status no AI Studio > Modelos
2. Confirmar que o provedor tem token válido
3. Selecionar modelo alternativo ativo

**Status**: Validação em tempo real planejada.

### 14. Provider Não Suportado pelo Vercel AI SDK

**Sintoma**: Erro "Provider X not supported" mesmo com token válido.

**Causa**: Vercel AI SDK ainda não suporta o provider, sistema usa legacy automaticamente.

**Identificação**:

```bash
# Verificar logs de provider
grep "Provider.*not supported" logs/app.log
```

**Status**: Comportamento esperado - fallback automático funciona.

## 📊 Problemas de Performance

### 15. Lentidão com Muitas Sessões

**Sintoma**: Interface fica lenta com 50+ sessões.

**Causa**: Todas as sessões são carregadas de uma vez.

**Workaround**:

- Deletar sessões antigas
- Usar busca para filtrar

**Status**: Virtualização da lista planejada.

### 16. Delay no Primeiro Token

**Sintoma**: Demora para começar a mostrar resposta.

**Causa**: Latência do provider + processamento.

**Workaround**:

- Usar modelos mais rápidos (GPT-3.5)
- Verificar conexão de internet

**Status**: Otimizações em andamento.

### 17. Diferença de Performance Entre Sistemas

**Sintoma**: Vercel AI SDK às vezes mais lento que sistema legacy.

**Causa**: Overhead da camada de adaptação.

**Monitoramento**:

```bash
# Comparar tempos de resposta
grep -E "POST.*stream.*in.*ms" logs/app.log
```

**Status**: Otimização do adapter em andamento.

## 🔍 Debugging do Sistema Híbrido

### Comandos Úteis

```bash
# Verificar qual sistema está ativo
grep -E "\[MIGRATION\]|\[LEGACY\]" logs/app.log | tail -10

# Verificar taxa de fallback
grep -c "fallback para sistema atual" logs/app.log

# Verificar feature flag
grep "VERCEL_AI_ADAPTER" logs/app.log | tail -5

# Status geral
curl -s -I http://localhost:3000/api/chat/stream | grep -E "HTTP|X-Powered-By"
```

### Identificação de Problemas

1. **Sistema sempre usa Legacy**: Verificar feature flag
2. **Fallbacks frequentes**: Verificar tokens e modelos
3. **Performance degradada**: Comparar sistemas via logs
4. **Erros de provider**: Verificar configuração no AI Studio

## 🐛 Como Reportar Novos Problemas

### Informações Necessárias

1. **Descrição clara** do problema
2. **Sistema ativo** (Vercel AI SDK ou Legacy)
3. **Passos para reproduzir**
4. **Logs relevantes** (incluir `[MIGRATION]` ou `[LEGACY]`)
5. **Headers HTTP** se aplicável
6. **Feature flag status**: `ENABLE_VERCEL_AI_ADAPTER`
7. **Modelo de IA** sendo usado
8. **Navegador e OS**

### Onde Reportar

- Issues do GitHub do projeto
- Canal #bugs no Slack/Discord da equipe
- Email: support@kodix.com

## 🔄 Atualizações

**Última atualização**: Janeiro 2024

**Frequência de revisão**: Mensal

**Próxima revisão**: Fevereiro 2024

## 📝 Notas

- Problemas marcados como "Em desenvolvimento" têm PRs abertas
- Problemas "Planejados" estão no roadmap do próximo quarter
- Workarounds são soluções temporárias até fix definitivo
- **Sistema híbrido**: Fallbacks são comportamento esperado, não bugs

---

**🎉 Sistema híbrido robusto: Vercel AI SDK como principal + Fallback automático para máxima confiabilidade!**
