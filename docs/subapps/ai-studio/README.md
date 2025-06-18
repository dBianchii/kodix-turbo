# AI Studio SubApp

## 📖 Visão Geral

O **AI Studio** é o centro de controle para todas as integrações de Inteligência Artificial do Kodix. Permite gerenciar provedores, modelos, agentes e tokens de API de forma centralizada, fornecendo uma infraestrutura robusta para outros SubApps que precisam de capacidades de IA.

## 🚀 Início Rápido

### 1. Executar o Projeto

```bash
# Executar todo o monorepo
pnpm dev:kdx
```

### 2. Acessar AI Studio

1. Faça login na aplicação
2. Navegue para `/apps/aiStudio`
3. Configure seu primeiro provedor em **Provedores**
4. Adicione tokens de API em **Tokens**
5. Ative modelos desejados em **Modelos**
6. Crie agentes personalizados em **Agentes**

## 🔧 Funcionalidades Principais

### Gestão de Provedores

- **Múltiplos Provedores**: Suporte para OpenAI, Anthropic, Google, Azure e mais
- **Configuração Flexível**: URLs customizadas e versões de API
- **Controle Centralizado**: Ative/desative provedores por equipe
- **Expansibilidade**: Adicione novos provedores facilmente

### Gerenciamento de Modelos

- **Catálogo Completo**: Modelos pré-configurados dos principais provedores
- **Configuração Granular**: Ajuste parâmetros como temperatura e tokens
- **Priorização**: Defina ordem de preferência dos modelos
- **Controle de Acesso**: Ative modelos específicos por equipe

### Sistema de Agentes

- **Assistentes Personalizados**: Crie agentes com personalidades específicas
- **Prompts Customizados**: Configure instruções de sistema detalhadas
- **Associação Flexível**: Vincule agentes a modelos específicos
- **Reutilização**: Compartilhe agentes entre aplicações

### Segurança de Tokens

- **Criptografia Forte**: AES-256-GCM para todos os tokens
- **Isolamento Total**: Tokens separados por equipe
- **Gestão Segura**: Tokens nunca expostos após criação
- **Rotação Facilitada**: Atualize tokens sem impactar serviços

### Integração com SubApps

- **Service Layer**: APIs seguras para outros SubApps
- **Chat Integration**: Fornece modelos e agentes para o Chat via Vercel AI SDK
- **Configuração Centralizada**: Um lugar para gerenciar toda IA
- **Métricas Unificadas**: Acompanhe uso através dos SubApps
- **Vercel AI SDK**: Integração moderna e otimizada com providers

## 📚 Documentação Completa

### **Arquitetura e Implementação**

- **[📱 Frontend Architecture](./frontend-architecture.md)** - Estrutura e componentes da interface
- **[⚙️ Backend Architecture](./backend-architecture.md)** - APIs e processamento server-side
- **[🔐 Security Implementation](./security-implementation.md)** - Criptografia e isolamento

### **Funcionalidades Específicas**

- **[🏢 Provider Management](./provider-management.md)** - Sistema de provedores de IA
- **[🧠 Model Configuration](./model-configuration.md)** - Configuração e gestão de modelos
- **[👤 Agent System](./agent-system.md)** - Criação e gestão de agentes
- **[🔑 Token Security](./token-security.md)** - Sistema de tokens criptografados

### **Guias e Referências**

- **[📋 API Reference](./api-reference.md)** - Documentação completa das APIs
- **[⚙️ Configuration Guide](./configuracao-inicial.md)** - Setup inicial e configuração
- **[⚠️ Known Issues](./known-issues.md)** - Problemas conhecidos e soluções

## 🔗 Integração com Outros SubApps

- **Chat**: Fornece modelos e configurações de IA via Vercel AI SDK
- **Future Apps**: Base para qualquer app que precise de IA
- **Service Layer**: Comunicação segura via `AiStudioService`
- **Configurações Compartilhadas**: Gerenciamento centralizado
- **Tecnologia Moderna**: Integração através do Vercel AI SDK para máxima performance

## 🔒 Segurança

- **Isolamento por Team**: Cada equipe tem seus próprios recursos
- **Criptografia End-to-End**: Tokens sempre protegidos
- **Validação Automática**: Verificação de acesso em todas operações
- **Auditoria**: Logs de todas as ações críticas

## 🔗 Links Relacionados

- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo
- **[SubApp Architecture](../../architecture/subapp-architecture.md)** - Padrões de SubApps
- **[Chat SubApp](../chat/README.md)** - Principal consumidor do AI Studio

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🎨 Frontend Development Guide](../../architecture/frontend-guide.md)** - Padrões de desenvolvimento frontend
