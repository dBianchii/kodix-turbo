# Model Configuration - AI Studio

## 🧠 Visão Geral

O sistema de modelos permite configurar e gerenciar diferentes modelos de IA disponíveis nos provedores. Cada modelo tem características específicas como limites de tokens, custos e capacidades.

## 📊 Gestão de Modelos

### Ativar/Desativar Modelos

1. Acesse a aba **Modelos**
2. Localize o modelo desejado
3. Use o toggle para ativar/desativar
4. Mudanças refletem imediatamente

### Configurar Parâmetros

#### Limites de Tokens

- **Input**: Máximo de tokens de entrada
- **Output**: Máximo de tokens de resposta
- **Total**: Limite combinado (contexto)

#### Configurações Avançadas

```json
{
  "temperature": 0.7,
  "top_p": 1.0,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

### Sistema de Prioridade

- **Alta Prioridade (90-100)**: Modelos preferenciais
- **Média Prioridade (50-89)**: Uso regular
- **Baixa Prioridade (1-49)**: Fallback

## 🎯 Modelos Populares

### GPT-4 (OpenAI)

- **Tokens**: 128k contexto
- **Uso**: Tarefas complexas, raciocínio
- **Custo**: Alto

### Claude 3 Opus (Anthropic)

- **Tokens**: 200k contexto
- **Uso**: Análise de documentos longos
- **Custo**: Alto

### Gemini Pro (Google)

- **Tokens**: 32k contexto
- **Uso**: Multimodal, velocidade
- **Custo**: Médio

### GPT-3.5 Turbo (OpenAI)

- **Tokens**: 16k contexto
- **Uso**: Tarefas gerais, chat
- **Custo**: Baixo

## ⚙️ Configurações por Equipe

### Modelo Padrão

1. Defina prioridades nos modelos
2. Sistema seleciona o de maior prioridade ativo
3. Fallback automático se indisponível

### Filtros e Organização

- Filtrar por provedor
- Buscar por nome
- Ordenar por prioridade

## 🔧 Casos de Uso

### Para Chat Geral

```json
{
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Para Código

```json
{
  "model": "claude-3-sonnet",
  "temperature": 0.3,
  "max_tokens": 4000
}
```

### Para Análise

```json
{
  "model": "gpt-4-turbo",
  "temperature": 0.5,
  "max_tokens": 8000
}
```

## 💰 Considerações de Custo

### Otimização

- Use modelos menores para tarefas simples
- Configure limites de tokens apropriados
- Monitore uso por modelo

### Estimativas

- **GPT-3.5**: ~$0.002/1k tokens
- **GPT-4**: ~$0.03/1k tokens
- **Claude**: Varia por tier

## 🚨 Problemas Comuns

### Modelo não aparece no Chat

- Confirme que está ativo
- Verifique se provedor tem token
- Aguarde cache atualizar (5 min)

### Erro de limite de tokens

- Reduza max_tokens
- Use modelo com maior contexto
- Divida requisições grandes

### Performance lenta

- Considere modelo mais rápido
- Ajuste temperatura (menor = mais rápido)
- Use streaming quando possível

## 💡 Boas Práticas

### Seleção de Modelo

- Combine capacidade com custo
- Teste diferentes modelos
- Documente casos de uso

### Configuração

- Comece com defaults
- Ajuste baseado em resultados
- Mantenha consistência

### Manutenção

- Revise modelos não utilizados
- Atualize limites conforme necessário
- Monitore novos lançamentos
