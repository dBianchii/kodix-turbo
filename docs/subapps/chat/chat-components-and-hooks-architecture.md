# Guia de Arquitetura: Componentes e Hooks do Chat

> **Data da Última Revisão**: Julho 2025
> **Status**: ✅ Documentação Ativa

## 🎯 Objetivo

Este documento descreve a arquitetura de frontend do SubApp de Chat, detalhando a responsabilidade de seus principais componentes e hooks.

---

## 🏗️ Componentes (`_components`)

Os componentes são os blocos de construção da interface. A estrutura segue o Princípio da Responsabilidade Única.

| Componente               | Responsabilidade Principal                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `unified-chat-page.tsx`  | **Orquestrador Raiz.** Gerencia o estado global da página, a navegação e a comunicação entre os componentes filhos. |
| `app-sidebar.tsx`        | **Barra Lateral.** Exibe e gerencia a lista de sessões de chat.                                                     |
| `chat-window.tsx`        | **Janela de Chat.** Renderiza o chat ativo (`ActiveChatWindow`) ou a tela de boas-vindas (`EmptyThreadState`).      |
| `active-chat-window.tsx` | **Chat Ativo.** Contém a lógica de uma conversa em andamento (mensagens, input, etc.).                              |
| `empty-thread-state.tsx` | **Tela de Boas-Vindas.** Interface para iniciar uma nova conversa.                                                  |
| `agent-selector.tsx`     | **Seletor de Agente.** Permite ao usuário escolher o agente de IA.                                                  |
| `model-selector.tsx`     | **Seletor de Modelo.** Permite ao usuário escolher o modelo de IA.                                                  |

---

## 🎣 Hooks (`_hooks`)

Os hooks encapsulam a lógica de negócio, o estado e a comunicação com o backend.

| Hook                         | Responsabilidade Principal                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `useThreadChat.tsx`          | **Lógica do Chat.** Abstrai o `useChat` do Vercel AI SDK para gerenciar a conversa (mensagens, input, streaming). |
| `useChatSessionManager.ts`   | **Gerenciador de Sessão.** Centraliza a lógica de **criação** de novas sessões de chat.                           |
| `useSessionWithMessages.tsx` | **Carregador de Sessão.** Busca os dados de uma sessão existente e suas mensagens.                                |
| `useSessionModals.ts`        | **Modais de Sessão.** Gerencia os modais de edição e exclusão de sessões.                                         |
| `useFolderModals.ts`         | **Modais de Pasta.** Gerencia os modais de criação, edição e exclusão de pastas.                                  |
| `useTitleSync.tsx`           | **Sincronizador de Título.** Atualiza o título da sessão no backend após ser gerado automaticamente pela IA.      |
| `useTokenUsage.ts`           | **Cálculo de Tokens.** Calcula o uso de tokens da conversa.                                                       |

---

Este guia representa o estado atual da arquitetura de frontend do SubApp de Chat.
