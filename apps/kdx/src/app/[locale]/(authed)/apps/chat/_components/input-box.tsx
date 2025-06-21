"use client";

import { forwardRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // ✅ NOVO: Props para streaming
  isStreaming?: boolean;
  onStop?: () => void;
}

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      onSend,
      disabled = false,
      placeholder,
      value,
      onChange,
      isStreaming = false,
      onStop,
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = useState("");
    const t = useTranslations();

    const inputValue = value !== undefined ? value : localValue;
    const handleChange = onChange || ((e) => setLocalValue(e.target.value));

    function handleSend() {
      if (!inputValue.trim() || disabled) return;
      onSend(inputValue);

      // ✅ CORREÇÃO: Limpar input em ambos os modos (controlado e não-controlado)
      if (value === undefined) {
        // Modo não-controlado: limpar estado local
        setLocalValue("");
      } else {
        // Modo controlado: simular evento para limpar via onChange
        const clearEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(clearEvent);
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isStreaming && onStop) {
          onStop();
        } else {
          handleSend();
        }
      }
    };

    const canSend = inputValue.trim() && !disabled;

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("apps.chat.messages.placeholder")}
          disabled={disabled}
          className="min-h-[52px] rounded-xl pr-12 text-base focus:ring-2 focus:ring-primary/20"
        />
        <Button
          onClick={isStreaming && onStop ? onStop : handleSend}
          disabled={isStreaming ? false : !canSend}
          size="icon"
          variant={isStreaming ? "secondary" : "default"}
          className={cn(
            "absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg transition-all duration-200",
            isStreaming && "bg-muted hover:bg-muted/80",
          )}
        >
          {isStreaming ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  },
);
InputBox.displayName = "InputBox";
