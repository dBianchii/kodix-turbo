# Guia de Testes do SubApp de Chat

> **Data da Última Revisão**: Julho 2025
> **Status**: ✅ Documentação Ativa

## 🎯 Visão Geral

Este documento detalha a suíte de testes do Chat, que garante a estabilidade, protege contra regressões e valida a arquitetura unificada do frontend.

**Execução Rápida**: `pnpm test:chat` executa todas as suítes de teste do Chat.

---

## 🏗️ Arquitetura Testada

A suíte de testes valida os seguintes pilares da arquitetura atual:

- **Orquestração Centralizada**: Lógica no `UnifiedChatPage`.
- **Gerenciamento de Sessão**: Hook `useChatSessionManager` para criação de sessões.
- **Fluxo de Primeira Mensagem**: Uso do `sessionStorage` para a mensagem pendente.
- **Streaming Nativo**: Backend com Vercel AI SDK e auto-save.
- **Segurança**: Isolamento de dados por time em todas as operações.

---

## 🧪 Estrutura dos Testes

### Backend (`packages/api/.../__tests__/`)

| Arquivo                           | Responsabilidade Principal                                    |
| --------------------------------- | ------------------------------------------------------------- |
| `service-layer.test.ts`           | Valida a integração entre `ChatService` e `AiStudioService`.  |
| `streaming.test.ts`               | Garante a robustez do endpoint de streaming e do auto-save.   |
| `chat-integration.test.ts`        | Testa o fluxo de chat de ponta-a-ponta.                       |
| `session-storage-flow.test.ts`    | Valida a criação de sessão a partir de uma mensagem pendente. |
| `welcome-flow-regression.test.ts` | Testes de regressão específicos para a tela de boas-vindas.   |
| `ci-config.test.ts`               | Valida a configuração do ambiente e dependências.             |

### Frontend (`apps/kdx/.../__tests__/`)

| Diretório/Arquivo                      | Responsabilidade Principal                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `integration/`                         | Testes de integração que validam a comunicação com a API e a lógica de navegação. |
| `components/app-sidebar.test.tsx`      | Valida as interações do usuário na barra lateral (criação de sessão, etc.).       |
| `components/chat-window.test.tsx`      | Testa a orquestração entre os estados de chat ativo e de boas-vindas.             |
| `components/message.test.tsx`          | Garante a correta renderização e formatação das mensagens.                        |
| `hooks/useChatPreferredModel.test.ts`  | Testa a lógica de seleção e persistência do modelo de IA preferido do usuário.    |
| `hooks/useSessionWithMessages.test.ts` | Valida o carregamento e o cache dos dados da sessão e suas mensagens.             |

---

## 🛡️ Proteções Críticas contra Regressão

A suíte de testes protege ativamente contra bugs críticos que foram encontrados e corrigidos:

1.  **Fluxo da Primeira Mensagem**: Garante que a primeira mensagem enviada na tela de boas-vindas nunca seja perdida e inicie o streaming corretamente.
2.  **Navegação Robusta**: Previne a criação de URLs duplicadas (ex: `/apps/apps/chat`) e garante que a navegação seja sempre consistente.
3.  **Sincronização de Estado da UI**: Assegura que, após uma ação (como trocar um modelo), todas as partes da UI sejam atualizadas, prevenindo o "estado obsoleto" (stale state).
