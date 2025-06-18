# Configuration Guide - AI Studio SubApp

## 📋 Visão Geral

Este guia cobre a configuração inicial do AI Studio, incluindo setup de provedores, modelos e tokens. O sistema vem com dados pré-configurados (seed) dos principais provedores de IA.

## 🏢 Provedores Incluídos

### Principais Provedores Comerciais

- **OpenAI** - GPT-4, GPT-3.5, etc.
- **Anthropic** - Claude 3.5 Sonnet, Haiku
- **Google** - Gemini 1.5 Pro, Flash

### Provedores Emergentes

- **Mistral AI** - Mistral Large, 7B
- **Cohere** - Command R+
- **Perplexity** - Sonar Pro
- **xAI** - Grok Beta

### Provedores Open Source

- **Hugging Face** - Modelos inference
- **Together AI** - Modelos hospedados
- **Groq** - Execução ultrarrápida

### Provedores Locais

- **Ollama** - Execução local
- **LM Studio** - Interface local

## 🤖 Modelos Pré-Configurados

### OpenAI

- **GPT-4o** - Modelo mais recente
- **GPT-4o Mini** - Versão econômica
- **GPT-4 Turbo** - Dados até abril 2024
- **GPT-3.5 Turbo** - Rápido e econômico

### Anthropic

- **Claude 3.5 Sonnet** - Melhor raciocínio
- **Claude 3.5 Haiku** - Mais rápido
- **Claude 3 Opus** - Tarefas complexas (desabilitado)

### Google

- **Gemini 1.5 Pro** - Contexto de 2M tokens
- **Gemini 1.5 Flash** - Mais rápido
- **Gemini Pro** - Versão clássica

### Outros

- **Mistral Large** - Modelo flagship
- **Command R+** - Para RAG
- **Sonar Pro** - Com busca web
- **Llama 3 70B** - Via Groq

## 🚀 Primeiros Passos

### 1. Acessar AI Studio

```bash
# Executar o projeto
pnpm dev:kdx

# Acessar: http://localhost:3000/apps/aiStudio
```

### 2. Configurar Tokens de API

1. Vá para a seção **Tokens**
2. Adicione suas chaves de API reais:
   - OpenAI: `sk-...`
   - Anthropic: `sk-ant-...`
   - Google: API key do Google AI
3. Os tokens são criptografados automaticamente

### 3. Ativar Modelos

1. Vá para a seção **Modelos**
2. Ative os modelos que deseja usar
3. Configure limites de tokens se necessário

### 4. Criar Agentes

1. Vá para a seção **Agentes**
2. Crie assistentes personalizados
3. Configure prompts de sistema
4. Associe a modelos específicos

## ⚙️ Configuração Padrão

### Modelos Habilitados

- Modelos principais comerciais
- Modelos de custo baixo/médio
- Modelos open source gratuitos

### Modelos Desabilitados

- **Claude 3 Opus** - Mais caro
- **Grok Beta** - Ainda em beta
- **Modelos locais** - Requerem setup local

### Configurações Técnicas

Cada modelo inclui:

- **maxTokens**: Limite padrão
- **temperature**: 0.7 padrão
- **pricing**: Custo por token
- **description**: Descrição detalhada

## 🔒 Segurança

### Tokens Criptografados

- Criptografia **AES-256-GCM**
- Armazenamento seguro no banco
- Nunca expostos em logs ou respostas

### Isolamento por Equipe

- Cada equipe tem seus próprios tokens
- Recursos isolados por `teamId`
- Validação automática de acesso

## 🔧 Personalização

### Adicionar Novo Provedor

1. Vá para **Provedores**
2. Clique em "Criar Provedor"
3. Configure nome, tipo e URL base
4. Adicione token na seção **Tokens**

### Adicionar Novo Modelo

1. Vá para **Modelos**
2. Clique em "Criar Modelo"
3. Associe a um provedor existente
4. Configure parâmetros específicos

### Configurar Modelo Local

```bash
# Para Ollama
ollama run llama3:8b

# Configurar no AI Studio:
# Provider: Ollama
# Base URL: http://localhost:11434/api
# Modelo: llama3:8b
```

## 📊 Informações dos Modelos

### Estrutura de Configuração

```typescript
{
  name: "GPT-4o",
  providerId: "openai-provider-id",
  maxTokens: 4096,
  enabled: true,
  config: {
    temperature: 0.7,
    pricing: {
      input: 0.005,   // USD por 1K tokens
      output: 0.015   // USD por 1K tokens
    },
    description: "Modelo mais recente da OpenAI",
    version: "gpt-4o"
  }
}
```

## 🛠️ Manutenção

### Atualizar Configurações

1. **Via Interface**: Edite diretamente no AI Studio
2. **Via Banco**: Execute seeds atualizados
3. **Via API**: Use endpoints de atualização

### Monitoramento

- **Uso por modelo**: Métricas integradas
- **Custos**: Tracking automático
- **Performance**: Tempo de resposta
- **Erros**: Logs centralizados

## 💡 Dicas de Uso

### Para Desenvolvimento

- Use **GPT-3.5 Turbo** para testes (mais barato)
- Configure **temperature baixa** (0.1-0.3) para código
- Use **Gemini Flash** para respostas rápidas

### Para Produção

- **GPT-4o** para qualidade máxima
- **Claude 3.5 Sonnet** para raciocínio complexo
- **Gemini Pro** para contexto longo

### Para Economia

- **GPT-4o Mini** para uso geral
- **Claude Haiku** para tarefas simples
- **Modelos locais** para máxima economia

## 🔗 Próximos Passos

1. **Configure tokens** reais dos provedores
2. **Teste modelos** através do chat
3. **Crie agentes** personalizados
4. **Monitor custos** através das métricas
5. **Explore bibliotecas** de conhecimento

A configuração inicial fornece uma base sólida para começar a usar IA imediatamente, com possibilidade de expansão conforme necessário.
