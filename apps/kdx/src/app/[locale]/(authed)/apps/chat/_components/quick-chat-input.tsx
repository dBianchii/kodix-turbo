"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@kdx/ui/button";
import { Textarea } from "@kdx/ui/textarea";

import { useAutoCreateSession } from "../_hooks/useAutoCreateSession";

interface QuickChatInputProps {
  onSessionCreated: (sessionId: string) => void;
}

export function QuickChatInput({ onSessionCreated }: QuickChatInputProps) {
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ensure we're on the client side before using hooks
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ SEMPRE chame o hook - nunca condicionalmente
  const { createSessionWithMessage, isCreating } = useAutoCreateSession({
    onSuccess: onSessionCreated,
  });

  const handleSubmit = () => {
    if (!message.trim() || isCreating || !isClient) return;

    createSessionWithMessage({
      firstMessage: message.trim(),
      useAgent: true,
      generateTitle: true,
    });

    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-foreground mb-8 text-center text-4xl font-semibold">
          Como posso ajudar você hoje?
        </h1>
        <div className="bg-background border-border min-h-[120px] animate-pulse rounded-xl border-2 p-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-foreground mb-8 text-center text-4xl font-semibold">
        Como posso ajudar você hoje?
      </h1>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 min-h-[120px] resize-none rounded-xl border-2 p-6 pr-16 text-base focus:ring-2 focus:outline-none"
          disabled={isCreating || !isClient}
          autoFocus
        />

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isCreating || !isClient}
          size="icon"
          className="bg-primary hover:bg-primary/90 absolute right-3 bottom-3 h-10 w-10 rounded-full disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Digite sua mensagem e pressione Enter para começar uma conversa
      </p>
    </div>
  );
}
