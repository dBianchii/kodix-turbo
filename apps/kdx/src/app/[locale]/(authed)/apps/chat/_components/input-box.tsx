"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Textarea } from "@kdx/ui/textarea";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  // ✅ Props para streaming (baseado na v0916e276)
  isStreaming?: boolean;
  onStop?: () => void;
}

export const InputBox = forwardRef<HTMLTextAreaElement, InputBoxProps>(
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
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const t = useTranslations();

    // ✅ RESTAURADO v0916e276: Usar ref externo ou interno
    const textareaRef = ref || internalRef;

    // ✅ RESTAURADO v0916e276: Suporte a modo controlado e não-controlado
    const inputValue = value !== undefined ? value : localValue;
    const handleChange = onChange || ((e) => setLocalValue(e.target.value));

    function handleSend() {
      if (!inputValue.trim() || disabled) return;
      onSend(inputValue);

      // ✅ RESTAURADO v0916e276: Limpar input em ambos os modos
      if (value === undefined) {
        // Modo não-controlado: limpar estado local
        setLocalValue("");
      } else {
        // Modo controlado: simular evento para limpar via onChange
        const clearEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleChange(clearEvent);
      }
    }

    // ✅ RESTAURADO v0916e276: Controle de teclas com streaming
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isStreaming && onStop) {
          onStop();
        } else {
          handleSend();
        }
      }
    };

    // ✅ RESTAURADO v0916e276: Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef as React.RefObject<HTMLTextAreaElement>;
      if (textarea.current) {
        textarea.current.style.height = "auto";
        textarea.current.style.height = `${textarea.current.scrollHeight}px`;
      }
    }, [inputValue, textareaRef]);

    // ✅ RESTAURADO v0916e276: Lógica de habilitação do botão
    const canSend = inputValue.trim() && !disabled;

    return (
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? t("apps.chat.messages.placeholder")}
            disabled={disabled}
            className="max-h-[200px] min-h-[40px] resize-none"
            rows={1}
          />
        </div>
        <Button
          onClick={isStreaming && onStop ? onStop : handleSend}
          disabled={isStreaming ? false : !canSend}
          size="sm"
          className={cn(
            "h-10 w-10 shrink-0 transition-all duration-200",
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
