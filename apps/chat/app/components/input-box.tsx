"use client";

import { useEffect, useState } from "react";

interface InputBoxProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [inputValue, setInputValue] = useState("");

  // Função simplificada para enviar mensagem
  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;

    onSend(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  // Verifica se o botão deve estar habilitado
  const isButtonEnabled = inputValue.trim().length > 0 && !disabled;

  console.log(
    "InputBox render: disabled=",
    disabled,
    "inputValue=",
    inputValue,
    "isButtonEnabled=",
    isButtonEnabled,
  );

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        className="flex-1 rounded-md border border-gray-600 bg-[#1e1e1e] px-3 py-2 text-white focus:border-blue-500 focus:outline-none disabled:opacity-60"
        placeholder="Digite sua mensagem..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        className={`rounded-md px-4 py-2 text-white focus:outline-none ${
          inputValue.trim() && !disabled
            ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
            : "cursor-not-allowed bg-gray-600 opacity-60"
        }`}
        disabled={!inputValue.trim() || disabled}
      >
        Enviar
      </button>
    </div>
  );
}
