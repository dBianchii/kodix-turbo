# Provider Management - AI Studio

## 🏢 Visão Geral

O sistema de provedores do AI Studio permite gerenciar diferentes serviços de IA de forma centralizada. Cada provedor representa uma empresa ou serviço que oferece modelos de linguagem.

## 📋 Provedores Suportados

### OpenAI

- **Modelos**: GPT-4, GPT-3.5, DALL-E
- **Configurações**: Base URL customizável
- **Tokens**: Chave de API começando com `sk-`

### Anthropic

- **Modelos**: Claude 3 (Opus, Sonnet, Haiku)
- **Configurações**: Versão da API
- **Tokens**: Chave de API específica

### Google AI

- **Modelos**: Gemini Pro, Gemini Ultra
- **Configurações**: Região e projeto
- **Tokens**: API Key do Google Cloud

### Azure OpenAI

- **Modelos**: Deployments customizados
- **Configurações**: Resource name, deployment ID
- **Tokens**: Chave de API do Azure

## 🔧 Funcionalidades

### Criar Provedor

1. Acesse a aba **Provedores**
2. Clique em **Adicionar Provedor**
3. Preencha:
   - **Nome**: Identificador único
   - **Tipo**: Selecione o serviço
   - **Descrição**: Opcional
   - **Configurações**: URLs e versões

### Gerenciar Provedores

- **Ativar/Desativar**: Toggle rápido no card
- **Editar**: Alterar nome e configurações
- **Excluir**: Remove provedor e modelos associados

### Configurações Avançadas

#### URLs Customizadas

```json
{
  "baseUrl": "https://api.openai.com/v1",
  "version": "v1"
}
```

#### Proxy Configuration

```json
{
  "baseUrl": "https://proxy.company.com/openai",
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

## 🔐 Segurança

### Isolamento por Team

- Cada equipe tem seus próprios provedores
- Não há compartilhamento entre equipes
- Configurações independentes

### Validação

- Nomes únicos por equipe
- Tipos válidos apenas
- URLs no formato correto

## 💡 Boas Práticas

### Nomenclatura

- Use nomes descritivos: "OpenAI Produção", "Anthropic Dev"
- Indique ambiente: "GPT-4 Staging"
- Seja consistente na equipe

### Organização

- Desative provedores não utilizados
- Agrupe por tipo de uso
- Documente configurações especiais

### Manutenção

- Revise provedores periodicamente
- Remova configurações obsoletas
- Atualize versões de API

## 🚨 Troubleshooting

### Provedor não aparece nos modelos

- Verifique se está ativado
- Confirme se tem modelos cadastrados
- Recarregue a página

### Erro ao criar provedor

- Nome pode estar duplicado
- Verifique formato das URLs
- Confirme tipo válido

### Configurações não salvam

- Valide formato JSON
- Verifique permissões
- Tente logout/login
