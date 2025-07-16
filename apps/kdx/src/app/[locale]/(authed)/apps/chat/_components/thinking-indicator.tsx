"use client";

import { useEffect, useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";

interface ThinkingIndicatorProps {
  /** Whether the AI is thinking (processing request) */
  isThinking: boolean;
  /** Whether the AI has started streaming response */
  isStreaming: boolean;
  /** How long the AI has been thinking (in seconds) */
  thinkingDuration?: number;
  /** Whether the thinking has exceeded normal duration */
  isDelayed?: boolean;
  /** Custom className */
  className?: string;
}

export function ThinkingIndicator({
  isThinking,
  isStreaming,
  thinkingDuration = 0,
  isDelayed = false,
  className,
}: ThinkingIndicatorProps) {
  const [dots, setDots] = useState("");

  // Animated dots effect
  useEffect(() => {
    if (!isThinking || isStreaming) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isThinking, isStreaming]);

  // Don't show if not thinking or already streaming
  if (!isThinking || isStreaming) {
    return null;
  }

  const getThinkingMessage = () => {
    return isDelayed
      ? `AI is thinking (${thinkingDuration}s)...`
      : "AI is thinking...";
  };

  const thinkingMessage = getThinkingMessage();

  return (
    <div
      className={cn("group relative mb-6 flex w-full justify-start", className)}
    >
      <div className="bg-muted/30 relative mx-4 w-full rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Animated brain icon */}
          <div className="relative">
            <Brain className="text-muted-foreground h-5 w-5 animate-pulse" />
            <Sparkles className="text-primary absolute -top-1 -right-1 h-3 w-3 animate-ping" />
          </div>

          {/* Thinking text with animated dots */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">
              {thinkingMessage}
            </span>
            <span className="text-muted-foreground w-6 text-left text-sm">
              {dots}
            </span>
          </div>
        </div>

        {/* Subtle loading bar */}
        <div className="bg-muted mt-2 h-0.5 overflow-hidden rounded-full">
          <div className="bg-primary/30 h-full w-full animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
