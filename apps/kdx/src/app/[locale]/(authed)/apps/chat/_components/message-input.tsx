"use client";

import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { Textarea } from "@kdx/ui/textarea";

interface MessageInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSendMessage,
  disabled = false,
  placeholder,
  isLoading = false,
}: MessageInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();

  // Usar valor controlado ou interno
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const handleSend = () => {
    const message = currentValue.trim();
    if (!message || disabled || isLoading) return;

    onSendMessage(message);

    // Limpar apenas se for valor interno
    if (value === undefined) {
      setInternalValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={currentValue}
          onChange={(e) => {
            handleChange(e);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("apps.chat.placeholders.typeMessage")}
          disabled={disabled || isLoading}
          className="max-h-32 min-h-[44px] resize-none"
          rows={1}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={!currentValue.trim() || disabled || isLoading}
        size="icon"
        className="h-11 w-11 flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
