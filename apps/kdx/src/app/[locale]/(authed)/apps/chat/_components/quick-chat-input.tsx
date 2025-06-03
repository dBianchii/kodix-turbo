"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { Card, CardContent } from "@kdx/ui/card";
import { Textarea } from "@kdx/ui/textarea";

import { useAutoCreateSession } from "../_hooks/useAutoCreateSession";

interface QuickChatInputProps {
  onSessionCreated: (sessionId: string) => void;
}

export function QuickChatInput({ onSessionCreated }: QuickChatInputProps) {
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();

  // Ensure we're on the client side before using hooks
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ SEMPRE chame o hook - nunca condicionalmente
  const { createSessionWithMessage, isCreating, error, reset } =
    useAutoCreateSession({
      onSuccess: onSessionCreated,
      onError: (error) => {
        console.error("❌ [CHAT] Erro ao criar sessão:", error);
      },
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

    // Clear previous errors when user starts typing
    if (error) {
      reset();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="text-center">
          <div className="text-foreground mb-6 inline-flex items-center gap-2 text-4xl font-bold">
            <Sparkles className="text-primary h-8 w-8" />
            <span>Como posso ajudar você hoje?</span>
          </div>

          <Card className="mx-auto max-w-3xl">
            <CardContent className="p-6">
              <div className="bg-muted min-h-[120px] animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isDisabled = isCreating || !isClient;
  const hasMessage = message.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="text-center">
        {/* Header with Icon */}
        <div className="text-foreground mb-6 inline-flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <Sparkles className="text-primary h-8 w-8 animate-pulse" />
          <span>{t("apps.chat.welcome-chat")}</span>
        </div>

        {/* Input Card */}
        <Card className="hover:border-primary/50 focus-within:border-primary mx-auto max-w-3xl border-2 transition-all duration-200">
          <CardContent className="p-6">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={t("apps.chat.messages.placeholder")}
                className="max-h-[300px] min-h-[28px] resize-none border-0 bg-transparent p-0 text-base focus:ring-0 focus-visible:ring-0"
                disabled={isDisabled}
                autoFocus
              />

              {/* Send Button */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  {/* Character count */}
                  <span
                    className={message.length > 1000 ? "text-destructive" : ""}
                  >
                    {message.length}/1000
                  </span>

                  {/* Error message */}
                  {error && (
                    <span className="text-destructive">• {error.message}</span>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!hasMessage || isDisabled || message.length > 1000}
                  size="lg"
                  className="gap-2"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isCreating ? "Criando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helper Text */}
        <div className="mt-4 space-y-2 text-center">
          <p className="text-muted-foreground text-sm">
            Digite sua mensagem e pressione Enter para começar uma conversa
          </p>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Explique quantum computing",
              "Crie um plano de negócios",
              "Analise este código",
              "Escreva um email profissional",
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setMessage(suggestion)}
                disabled={isDisabled}
                className="h-auto px-3 py-1 text-xs whitespace-normal"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
