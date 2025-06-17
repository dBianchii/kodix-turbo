"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  ({ onSend, disabled = false, placeholder }, ref) => {
    const [value, setValue] = useState("");
    const t = useTranslations();

    function handleSend() {
      if (!value.trim() || disabled) return;
      onSend(value);
      setValue("");
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const canSend = value.trim() && !disabled;

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("apps.chat.messages.placeholder")}
          disabled={disabled}
          className="focus:ring-primary/20 min-h-[52px] rounded-xl pr-12 text-base focus:ring-2"
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  },
);
InputBox.displayName = "InputBox";
