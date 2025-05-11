"use client";

import { useEffect, useRef, useState } from "react";

import { InputBox } from "./input-box";
import { Message } from "./message";

export function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá! Como posso ajudar?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Log o estado de carregamento quando ele mudar
  useEffect(() => {
    console.log("⏱️ Estado de carregamento mudou:", isLoading);
  }, [isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    console.log("📤 Enviando mensagem:", text);

    // Atualizando estado de carregamento
    setIsLoading(true);
    console.log("🔄 Definindo isLoading como TRUE");

    setError(null);

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    let assistantMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      console.log("🔄 Fazendo requisição para API...");
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      console.log("📥 Resposta recebida, status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro na resposta da API:", errorData);
        throw new Error(
          `Erro na resposta da API: ${errorData.error || response.status}`,
        );
      }

      if (!response.body) {
        console.error("❌ Resposta sem body");
        throw new Error("Resposta sem conteúdo");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      console.log("🔄 Iniciando leitura do stream");
      let receivedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("✅ Stream concluído");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        //console.log("🟡 Chunk recebido:", chunk);
        receivedText += chunk;

        assistantMessage.content += chunk;

        setMessages((prev) => {
          const others = prev.slice(0, -1);
          return [...others, { ...assistantMessage }];
        });
      }

      if (!receivedText) {
        console.warn("⚠️ Nenhum texto foi recebido no stream");
      }
    } catch (error: any) {
      console.error("🔴 Erro ao enviar mensagem:", error);
      setError(`Erro: ${error.message}`);
      setMessages((prev) => {
        // Remove a mensagem do assistente vazia
        const withoutEmptyAssistant = prev.slice(0, -1);
        return [
          ...withoutEmptyAssistant,
          {
            role: "assistant",
            content: `Ocorreu um erro: ${error.message}. Por favor, tente novamente.`,
          },
        ];
      });
    } finally {
      // Garantir que o estado de carregamento seja atualizado, mesmo em caso de erro
      console.log("🔄 Definindo isLoading como FALSE");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="text-center text-gray-400">Carregando...</div>
        )}
        {error && <div className="text-center text-red-500">{error}</div>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-700 bg-[#1e1e1e] p-3">
        <InputBox onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
