"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Message } from "./message";

interface ChatMessagesProps {
  messages: {
    id?: string;
    role: "user" | "assistant";
    content: string;
  }[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
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
        <div key={message.id || index}>
          <div className={message.role === "user" ? "flex justify-end" : ""}>
            <Message
              role={message.role}
              content={message.content}
              isStreaming={isLoading && index === messages.length - 1}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
