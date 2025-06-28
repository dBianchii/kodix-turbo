# AI Studio SubApp

## 📖 Visão Geral

O **AI Studio** é o centro de controle para todas as integrações de Inteligência Artificial do Kodix. Permite gerenciar provedores, modelos, agentes, bibliotecas e tokens de API de forma centralizada, fornecendo uma infraestrutura robusta para outros SubApps que precisam de capacidades de IA.

## 🏗️ Arquitetura

O sistema é construído com React/Next.js no frontend e tRPC v11 no backend, oferecendo uma experiência type-safe completa. A interface utiliza Sidebar navigation com seções organizadas para máxima usabilidade.

### Componentes Principais

- **Team Instructions**: Configurações globais da IA para toda equipe
- **Tokens**: Gestão segura de chaves de API criptografadas
- **Enabled Models**: Controle de modelos disponíveis por equipe
- **Agents**: Sistema de assistentes personalizados
- **Libraries**: Bibliotecas de conhecimento para contextualização
- **Providers**: Configuração de provedores de IA
- **Models**: Gestão global de modelos do sistema

## 🚀 Início Rápido

### 1. Executar o Projeto

```bash
# Executar todo o monorepo
pnpm dev:kdx
```

### 2. Acessar AI Studio

Navegue para `/apps/aiStudio` e siga o fluxo de configuração:

1. **Configurar Instruções da Equipe** → Comportamento global da IA
2. **Adicionar Tokens** → Chaves de API dos provedores
3. **Ativar Modelos** → Selecionar quais modelos usar
4. **Criar Agentes** (opcional) → Assistentes especializados
5. **Configurar Bibliotecas** (opcional) → Base de conhecimento

## 📚 Documentação

### 📖 [User Guide](./user-guide.md)

Guia completo do usuário com:

- **Configuração Inicial**: Passo a passo para nova equipe
- **Gestão de Funcionalidades**: Como usar cada seção
- **Troubleshooting**: Resolução de problemas comuns
- **Manutenção**: Boas práticas de uso contínuo

### ��️ [Architecture](./ai-studio-architecture.md)

Documentação técnica com:

- **Frontend Architecture**: Componentes, estado e fluxos
- **Backend Architecture**: APIs, segurança e performance
- **Integração**: Como frontend e backend se comunicam

### 🔌 [API Reference](./api-reference.md)

Referência completa das APIs tRPC:

- **Endpoints**: Todos os métodos disponíveis
- **Schemas**: Validações Zod e tipos
- **Exemplos**: Código de uso prático

## 🛠️ Features Principais

### Gestão de Provedores

- Suporte para OpenAI, Anthropic, Google AI, Azure OpenAI
- Configuração de URLs customizadas e proxies
- Isolamento completo por equipe

### Segurança Robusta

- Tokens criptografados com AES-256-GCM
- Validação de permissões por team
- Máscaramento automático na interface

### Interface Intuitiva

- Sidebar responsivo com navegação clara
- Drag & drop para reordenação de prioridades
- Feedback visual e loading states

### Integração Seamless

- Sincronização automática com Chat SubApp
- Cache inteligente para performance
- Type safety completo via tRPC

## 🔧 Configurações Essenciais

### Variáveis de Ambiente

```bash
# Criptografia (obrigatório)
ENCRYPTION_KEY=your-32-character-encryption-key

# Cache opcional para performance
REDIS_URL=redis://localhost:6379
```

### Permissões Necessárias

O usuário precisa estar em um team ativo para acessar o AI Studio. Todas as operações respeitam o isolamento por equipe.

## 🧪 Testing

```bash
# Executar testes do AI Studio (futuro)
pnpm test:ai-studio

# Verificar tipos
pnpm typecheck
```

## 📊 Monitoramento

O AI Studio inclui logging automático de:

- Operações CRUD de recursos
- Uso de tokens e modelos
- Métricas de performance

## 🚀 Roadmap

- [ ] Upload real de arquivos para bibliotecas
- [ ] Sistema de auditoria completo
- [ ] Operações em lote para modelos
- [ ] Validação JSON em tempo real
- [ ] Controles touch-friendly para mobile

## 🤝 Contribuindo

1. Consulte `docs/architecture/` para padrões gerais
2. Siga as guidelines em `.cursor-rules/kodix-rules.md`
3. Execute testes antes de commits
4. Documente mudanças significativas

O AI Studio é a fundação de IA do Kodix - mantenha-o seguro, performático e fácil de usar.
