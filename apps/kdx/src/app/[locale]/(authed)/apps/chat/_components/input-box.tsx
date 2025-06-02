"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface InputBoxProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [value, setValue] = useState("");
  const t = useTranslations();

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className="flex-1 rounded-lg border border-gray-600 bg-[#2a2a2a] px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={t("apps.chat.messages.placeholder")}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        className={`rounded-md px-4 py-2 text-sm text-white ${
          disabled || !value.trim()
            ? "cursor-not-allowed bg-gray-600 opacity-50"
            : "cursor-pointer bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={disabled || !value.trim()}
      >
        {t("apps.chat.messages.send")}
      </button>
    </div>
  );
}
