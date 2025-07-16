"use client";

import { useEffect, useState } from "react";

import type { ChatWindowProps } from "~/trpc/shared";
import { ActiveChatWindow } from "./active-chat-window";
import { EmptyThreadState } from "./empty-thread-state";

export function ChatWindow({
  sessionId,
  onNewSession,
  selectedModelId,
  selectedAgentId,
  onStreamingFinished,
}: ChatWindowProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className="flex h-full items-center justify-center"
        suppressHydrationWarning
      >
        <div className="text-center">
          <div className="bg-muted mx-auto mb-4 h-8 w-8 animate-pulse rounded" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <EmptyThreadState
        onNewSession={onNewSession}
        selectedModelId={selectedModelId}
        selectedAgentId={selectedAgentId}
      />
    );
  }

  return (
    <ActiveChatWindow
      sessionId={sessionId}
      onStreamingFinished={onStreamingFinished}
      selectedModelId={selectedModelId}
    />
  );
}
