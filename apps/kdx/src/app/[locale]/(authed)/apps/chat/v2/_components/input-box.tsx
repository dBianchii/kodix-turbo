"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { Textarea } from "@kdx/ui/textarea";

interface InputBoxProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const canSend = value.trim() && !disabled;

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("apps.chat.messages.placeholder")}
          disabled={disabled}
          className="max-h-[200px] min-h-[40px] resize-none border-gray-600 bg-slate-800/50 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
          autoFocus
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!canSend}
        size="sm"
        className="h-10 w-10 shrink-0 bg-blue-600 p-0 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
