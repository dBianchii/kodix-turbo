# ⚙️ Catálogo de Serviços Internos

## 📖 Visão Geral

Este diretório serve como um **catálogo central** para todos os serviços internos da plataforma Kodix, localizados em `packages/api/src/internal/services/`.

Cada arquivo `.md` neste diretório corresponde a um serviço específico e funciona como um "arquivo-ponte", oferecendo um resumo de alto nível e links para a implementação detalhada e os padrões arquiteturais.

## 🎯 Padrões e Arquitetura

Para entender **como** os serviços devem ser implementados, quais padrões seguir e como eles se comunicam, consulte o guia arquitetural:

- **[📄 Guia de Padrões de Service Layer](../architecture/service-layer-patterns.md)**

## 📚 Índice de Serviços

A seguir está a lista de todos os serviços implementados e seus respectivos documentos:

- **[🤖 AiStudioService](./ai-studio.service.md)**

  - **Descrição:** Gerencia a lógica de negócio central para toda a infraestrutura de IA, incluindo modelos, provedores e tokens. É um "SubApp Core".

- **[💬 ChatService](./chat.service.md)**

  - **Descrição:** Gerencia a lógica de negócio para o SubApp de Chat, como criação de sessões e persistência de mensagens.

- **[🛡️ PermissionsService](./permissions.service.md)**

  - **Descrição:** Lógica centralizada para verificar permissões de usuários e times.

- **[📝 AppActivityLogsService](./appActivityLogs.service.md)**
  - **Descrição:** Serviço responsável por registrar e consultar logs de atividade dos usuários nos SubApps.
