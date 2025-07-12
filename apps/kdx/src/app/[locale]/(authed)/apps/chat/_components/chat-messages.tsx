"use client";

import type { Message } from "@ai-sdk/react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Message as MessageComponent } from "./message";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  isError?: boolean;
  bottomRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  isLoading,
  isError,
  bottomRef,
}: ChatMessagesProps) {
  const t = useTranslations();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">
          {t("apps.chat.messages.emptyTitle")}
        </h3>
        <p className="text-muted-foreground">
          {t("apps.chat.messages.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div key={message.id}>
          <div className={message.role === "user" ? "flex justify-end" : ""}>
            <MessageComponent
              role={message.role === "assistant" ? "assistant" : "user"}
              content={message.content}
              isStreaming={isLoading && index === messages.length - 1}
            />
          </div>
        </div>
      ))}
      {bottomRef && <div ref={bottomRef} />}
    </div>
  );
}
