"use client";

import { useEffect, useRef, useState } from "react";

import { InputBox } from "./input-box";
import { Message } from "./message";

type MessageRole = "assistant" | "user";

interface ChatMessage {
  role: MessageRole;
  content: string;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Como posso te ajudar hoje?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (isLoading) return;

    console.log("📤 Enviando mensagem:", text);
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      console.log("🔄 Fazendo requisição para API...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      console.log("📥 Resposta recebida, status:", response.status);

      if (!response.ok) {
        let errorMessage = "Erro na resposta da API";
        try {
          const errorData = (await response.json()) as { error?: string };
          errorMessage = errorData.error ?? `Erro ${response.status}`;
        } catch {
          errorMessage = `Erro ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
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
        receivedText += chunk;

        setMessages((prev) => {
          if (prev.length === 0) {
            return [{ role: "assistant", content: chunk }];
          }

          const others = prev.slice(0, -1);
          const lastMessage = prev[prev.length - 1];
          const updatedAssistantMessage: ChatMessage = {
            role: "assistant",
            content: lastMessage ? lastMessage.content + chunk : chunk,
          };
          return [...others, updatedAssistantMessage];
        });
      }

      if (!receivedText) {
        console.warn("⚠️ Nenhum texto foi recebido no stream");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("🔴 Erro ao enviar mensagem:", err);
      setError(`Erro: ${err.message}`);
      setMessages((prev) => {
        // Remove a mensagem do assistente vazia
        const withoutEmptyAssistant = prev.slice(0, -1);
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Ocorreu um erro: ${err.message}. Por favor, tente novamente.`,
        };
        return [...withoutEmptyAssistant, errorMessage];
      });
    } finally {
      console.log("🔄 Finalizando requisição");
      setIsLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#121212]">
      {/* Container de mensagens com scroll e espaço extra na parte inferior para o input flutuante */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-32">
          {messages.map((msg, idx) => (
            <Message key={idx} role={msg.role} content={msg.content} />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="text-sm text-gray-400">Digitando...</div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Campo de input flutuante */}
      <div className="absolute right-0 bottom-6 left-0 px-4">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-700 bg-[#1e1e1e] px-4 py-3 shadow-lg">
          <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
