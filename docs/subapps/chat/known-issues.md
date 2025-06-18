# Known Issues - Chat SubApp

## ⚠️ Problemas Conhecidos

Este documento lista os problemas conhecidos do Chat e suas soluções temporárias.

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

## 🟢 Problemas Menores

### 6. Título Automático Genérico

**Sintoma**: Sessões criadas com títulos como "Nova Conversa".

**Causa**: Geração de título baseada em primeira mensagem não implementada.

**Workaround**:

- Editar título manualmente após criação
- Incluir contexto claro na primeira mensagem

**Status**: Feature planejada.

### 7. Markdown Parcial

**Sintoma**: Alguns elementos markdown não são renderizados.

**Causa**: Parser markdown limitado.

**Workaround**:

- Usar formatação básica (negrito, itálico, listas)
- Evitar tabelas complexas e blocos de código aninhados

**Status**: Melhoria planejada.

### 8. Mobile: Teclado Cobre Input

**Sintoma**: Em alguns dispositivos móveis, o teclado cobre o campo de input.

**Causa**: Viewport não ajusta corretamente.

**Workaround**:

- Rolar manualmente para ver o input
- Usar em modo landscape

**Status**: Fix em desenvolvimento.

## 🔧 Problemas de Integração

### 9. Token Expirado do Provider

**Sintoma**: Erro 401 ao enviar mensagem.

**Causa**: Token da API do provider expirou ou é inválido.

**Solução**:

1. Acessar AI Studio > Tokens
2. Atualizar token do provider afetado
3. Verificar se modelo está ativo

**Status**: Melhorias na UX de erro planejadas.

### 10. Modelo Não Disponível

**Sintoma**: Modelo selecionado não funciona.

**Causa**: Modelo foi desativado no AI Studio ou requer configuração adicional.

**Solução**:

1. Verificar status no AI Studio > Modelos
2. Confirmar que o provedor tem token válido
3. Selecionar modelo alternativo ativo

**Status**: Validação em tempo real planejada.

## 📊 Problemas de Performance

### 11. Lentidão com Muitas Sessões

**Sintoma**: Interface fica lenta com 50+ sessões.

**Causa**: Todas as sessões são carregadas de uma vez.

**Workaround**:

- Deletar sessões antigas
- Usar busca para filtrar

**Status**: Virtualização da lista planejada.

### 12. Delay no Primeiro Token

**Sintoma**: Demora para começar a mostrar resposta.

**Causa**: Latência do provider + processamento.

**Workaround**:

- Usar modelos mais rápidos (GPT-3.5)
- Verificar conexão de internet

**Status**: Otimizações em andamento.

## 🐛 Como Reportar Novos Problemas

### Informações Necessárias

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado** vs atual
4. **Screenshots** se aplicável
5. **Console logs** (F12 > Console)
6. **Modelo de IA** sendo usado
7. **Navegador e OS**

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
