/**
 * 💬 CHAT SUBAPP - Layout com ChatThreadProvider
 *
 * 🎯 SUB-ETAPA 2.1: Wrapper ChatThreadProvider
 *
 * Adiciona ChatThreadProvider em volta de todo o chat sem quebrar funcionalidades existentes.
 * Sistema atual continua funcionando, mas agora com thread context disponível.
 *
 * 📚 DOCUMENTAÇÃO:
 * - Troubleshooting: @docs/subapps/chat/troubleshooting-welcome-screen-flow.md
 * - Plano Migração: @docs/subapps/chat/session-message-flow-migration-plan.md
 */

import { ChatThreadProvider } from "./_providers/chat-thread-provider";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return <ChatThreadProvider>{children}</ChatThreadProvider>;
}
