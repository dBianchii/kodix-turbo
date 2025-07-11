# 💬 ChatService

- **Status:** 🟢 Ativo
- **Data de Criação:** 2025-07-01

---

## 🎯 Propósito

O `ChatService` encapsula a lógica de negócio específica do SubApp de Chat. Sua principal responsabilidade é gerenciar o ciclo de vida das sessões de chat e a persistência das mensagens.

## 🏛️ Enquadramento Arquitetural

O `ChatService` segue o **Padrão 1: Serviço de Domínio (Intra-App)**, conforme definido no [guia de padrões do Service Layer](../architecture/service-layer-patterns.md).

- **Justificativa:** Ele é consumido primariamente pelo seu próprio router tRPC (`chatRouter`) e não é projetado para ser chamado diretamente por outros serviços.

## 🔑 Responsabilidades Principais

- Criar novas sessões de chat (vazias ou com uma mensagem inicial).
- Buscar sessões e suas mensagens para um usuário/time.
- Persistir as mensagens do usuário e da IA no banco de dados.
- Atualizar e deletar sessões de chat.

## कंज्यूमर्स Principais

- **`Chat Router (tRPC)`**: Os endpoints tRPC do chat consomem este serviço para executar as operações solicitadas pelo frontend.

## 🔗 Links Úteis

- **[↗️ Ver Código Fonte](../../packages/api/src/internal/services/chat.service.ts)**
- **[📄 Ver Padrões de Implementação](../architecture/service-layer-patterns.md)**
