"use client";

import { useMemo, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";

import { useEmptySession } from "../_hooks/useEmptySession";
import { MessageInput } from "./message-input";

export function EmptyThreadState({
  onNewSession,
  selectedModelId,
  selectedAgentId,
}: {
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string;
  selectedAgentId?: string | null;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations("apps.chat");

  const { createEmptySession, isCreating } = useEmptySession({
    onSuccess: (sessionId) => {
      const pendingMessage = sessionStorage.getItem("pending-message-temp");
      if (pendingMessage) {
        sessionStorage.setItem(`pending-message-${sessionId}`, pendingMessage);
        sessionStorage.removeItem("pending-message-temp");
      }
      onNewSession?.(sessionId);
    },
  });

  const handleFirstMessage = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isCreating) return;

    sessionStorage.setItem("pending-message-temp", trimmedMessage);

    void createEmptySession({
      aiModelId: selectedModelId,
      aiAgentId: selectedAgentId || undefined,
      metadata: {
        firstMessage: trimmedMessage,
      },
      generateTitle: true,
    });
  };

  const suggestions = useMemo(
    () => [
      "Como posso ajudar você hoje?",
      "Explique um conceito complexo",
      "Resuma um texto para mim",
    ],
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container-app">
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <MessageCircle className="text-muted-foreground mb-4 h-12 w-12" />
            <h2 className="text-2xl font-semibold">{t("welcome-chat")}</h2>
            <p className="text-muted-foreground mt-2">{t("appDescription")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.value = suggestion;
                      inputRef.current.focus();
                    }
                  }}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container-app py-4">
          <MessageInput
            ref={inputRef}
            onSendMessage={handleFirstMessage}
            placeholder={t("startConversation")}
            isLoading={isCreating}
            disabled={isCreating}
          />
        </div>
      </div>
    </div>
  );
}
