"use client";

import type { KeyboardEvent } from "react";
import { forwardRef, useRef, useState } from "react";
import { Loader2, Send, Square } from "lucide-react";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Textarea } from "@kdx/ui/textarea";

interface MessageInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  function MessageInput(
    {
      value,
      onChange,
      onSendMessage,
      disabled = false,
      placeholder,
      isLoading = false,
      isStreaming = false,
      onStop,
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState("");
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // ✅ RESTAURADO v0916e276: Usar ref externo ou interno
    const textareaRef = ref ?? internalRef;

    // Usar valor controlado ou interno
    const currentValue = value ?? internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      } else {
        setInternalValue(e.target.value);
      }
    };

    const handleSend = () => {
      const message = currentValue.trim();
      // Debug input handling - logs removed for performance

      if (!message || disabled || isLoading) {
        // Send cancelled - log removed for performance
        return;
      }

      // Calling onSendMessage - log removed for performance
      onSendMessage(message);

      // Limpar apenas se for valor interno
      if (value === undefined) {
        setInternalValue("");
      }
    };

    // ✅ RESTAURADO v0916e276: Controle de teclas com streaming
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isStreaming && onStop) {
          onStop();
        } else {
          handleSend();
        }
      }
    };

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
      const textarea = textareaRef as React.RefObject<HTMLTextAreaElement>;
      textarea.current.style.height = "auto";
      textarea.current.style.height = `${textarea.current.scrollHeight}px`;
    };

    // ✅ RESTAURADO v0916e276: Lógica de habilitação do botão
    const canSend = currentValue.trim() && !disabled;

    return (
      <div
        className="flex items-end gap-2"
        style={{ marginLeft: "10%", marginRight: "10%" }}
      >
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => {
              handleChange(e);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="max-h-32 min-h-[44px] resize-none"
            rows={1}
          />
        </div>

        <Button
          onClick={isStreaming && onStop ? onStop : handleSend}
          disabled={isStreaming ? false : !canSend}
          size="icon"
          variant={isStreaming ? "secondary" : "default"}
          className={cn(
            "h-11 w-11 flex-shrink-0 transition-all duration-200",
            isStreaming && "bg-muted hover:bg-muted/80",
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isStreaming ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  },
);
