# Chat - Documentação

O **Chat** é o sistema de conversação com IA do Kodix, permitindo interações inteligentes e personalizadas com diferentes modelos de linguagem.

## 📋 Documentação Disponível

### Funcionalidades Core

- **[Chat Session Edit Feature](./Chat_Session_Edit_Feature.md)** - Implementação da funcionalidade de edição de sessões de chat
- **[Chat Team Configuration System](./Chat_Team_Config_System.md)** - Sistema de configurações por equipe e salvamento do último modelo selecionado

### Streaming e Performance

- **[Kodix Chat Real Streaming Restoration](./Kodix_Chat_Real_Streaming_Restoration.md)** - Restauração do streaming em tempo real
- **[Kodix Chat Streaming Implementation](./Kodix_Chat_Streaming_Implementation.md)** - Implementação do sistema de streaming

### Resolução de Problemas

- **[Kodix Chat Error Resolution](./Kodix_Chat_Error_Resolution.md)** - Resolução de erros no sistema de chat
- **[Kodix Chat Fixes AI Architecture](./Kodix_Chat_Fixes_AI_Architecture.md)** - Correções na arquitetura de IA do chat

## 💬 Sobre o Chat

O sistema de Chat oferece:

- **Conversas em Tempo Real**: Streaming de respostas com diferentes modelos de IA
- **Sessões Persistentes**: Histórico e gerenciamento de conversas
- **Múltiplos Provedores**: Suporte a OpenAI, Anthropic, Google, etc.
- **Edição de Mensagens**: Capacidade de editar e reenviar mensagens
- **Interface Responsiva**: Experiência otimizada em diferentes dispositivos
- **Configurações por Team**: Cada equipe pode ter suas próprias configurações e modelos padrão

## 🚀 Localização no Código

```
apps/kdx/src/app/[locale]/(authed)/apps/chat/
```

## 🔧 Principais Componentes

- **Chat Window**: Interface principal de conversação
- **Message Components**: Renderização de mensagens
- **App Sidebar**: Navegação e histórico de sessões
- **Streaming Handler**: Gerenciamento de responses em tempo real
- **Model Selector**: Seleção de modelos de IA com persistência por team
- **Team Config System**: Sistema de configurações personalizáveis por equipe

## 📚 **Documentação Relacionada**

- **[Chat Team Config System](./Chat_Team_Config_System.md)** - Sistema específico de configurações por team do Chat
- **[AppTeamConfig Overview](../../architecture/subapp-architecture.md#sistema-de-configurações-por-team)** - Sistema base de configurações por team
- **[AI Studio Integration](../ai-studio/)** - Documentação da integração com AI Studio para agentes e modelos
- **[Backend Development Guide](../../architecture/backend-guide.md)** - Padrões de desenvolvimento backend
