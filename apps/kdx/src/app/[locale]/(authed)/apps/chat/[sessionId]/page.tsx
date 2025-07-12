/**
 * 💬 CHAT SUBAPP - Página de Sessão (SUB-FASE 5.0)
 *
 * 🎯 ROTA: /apps/chat/[sessionId] (com sessionId)
 * 🎯 FUNÇÃO: Chat ativo com sessão específica
 */

import { use } from "react";

import { UnifiedChatPage } from "../_components/unified-chat-page";

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = use(params);

  // Hydration debugging removed - issue was in ThemeToggle component

  return <UnifiedChatPage sessionId={sessionId} locale={locale} />;
}
