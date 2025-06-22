/**
 * 💬 CHAT SUBAPP - Página Principal (SUB-FASE 5.0)
 *
 * 🎯 ROTA: /apps/chat (sem sessionId)
 * 🎯 FUNÇÃO: Welcome screen + início de conversas
 */

import { use } from "react";

import { UnifiedChatPage } from "./_components/unified-chat-page";

export default function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return <UnifiedChatPage sessionId={undefined} locale={locale} />;
}
