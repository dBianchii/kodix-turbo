# SubApps do Kodix

Esta seção contém toda a documentação dos **SubApps do Kodix**, que são as funcionalidades principais da aplicação web. Cada subapp oferece um conjunto específico de funcionalidades integradas.

## 📱 SubApps Disponíveis

### 🤖 [AI Studio](./ai-studio/)

Ambiente de desenvolvimento e gerenciamento de modelos de IA

- Configuração de provedores (OpenAI, Anthropic, Google)
- Testes e monitoramento de modelos
- Gerenciamento de tokens e custos
- Documentação completa de IA incluída

### 💬 [Chat](./chat/)

Sistema de conversação inteligente com IA

- Streaming em tempo real
- Múltiplos provedores de IA
- Sessões persistentes e editáveis
- Integração com AI Studio

### 📝 [Todo](./todo/)

Sistema de gerenciamento de tarefas

- Organização e priorização
- Colaboração em equipe
- Integração com outros módulos

### 📅 [Calendar](./calendar/)

Sistema de agendamento e calendário

- Múltiplas visualizações
- Eventos recorrentes
- Integração com Kodix Care

### 🎫 [Cupom](./cupom/)

Gestão de cupons e promoções

- Criação de descontos
- Regras de aplicação
- Relatórios de performance

### 🏥 [Kodix Care Web](./kodix-care-web/)

Versão web do módulo de gestão clínica

- Prontuários eletrônicos
- Gestão de pacientes
- Sincronização com app móvel

## 🚀 Como Usar Esta Documentação

1. **Para novos desenvolvedores**:
   - **Arquitetura**: Comece com os [Guias de Arquitetura](../architecture/) para entender padrões de desenvolvimento
   - **UI/Components**: Veja o [Design System](../ui-catalog/) para componentes específicos
2. **Para trabalhar com IA**: Consulte [AI Studio](./ai-studio/) e [Chat](./chat/)
3. **Para funcionalidades específicas**: Acesse a documentação do subapp correspondente
4. **Para desenvolvimento geral**: Veja a documentação em `docs/architecture/`

## 🏗️ Arquitetura dos SubApps

```
apps/kdx/src/app/[locale]/(authed)/apps/
├── aiStudio/        # 🤖 AI Studio
├── chat/           # 💬 Sistema de Chat
├── kodixCare/      # 🏥 Kodix Care Web
├── todo/           # 📝 Gerenciamento de Tarefas
├── calendar/       # 📅 Sistema de Calendário
└── cupom/          # 🎫 Gestão de Cupons
```

## 🔗 Integração entre SubApps

### Principais Integrações

- **AI Studio ↔ Chat**: Modelos configurados no AI Studio são usados no Chat
- **Calendar ↔ Kodix Care**: Agendamentos integrados com gestão clínica
- **Todo ↔ Todos os SubApps**: Tarefas podem ser criadas a partir de qualquer funcionalidade
- **Design System**: Componentes compartilhados entre todos os subapps (ver `docs/ui-catalog/`)

## 📖 Documentação Relacionada

Para contexto completo do projeto:

- `docs/architecture/` - Padrões de arquitetura, frontend e backend
- `docs/ui-catalog/` - Design system e componentes de UI
- `docs/database/` - Documentação do banco de dados
- `docs/subapps/` - Documentação específica por SubApp
