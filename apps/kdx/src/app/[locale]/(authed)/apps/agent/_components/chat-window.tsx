"use client";

import { useEffect, useRef, useState } from "react";

import { InputBox } from "./input-box";
import { Message } from "./message";

type MessageRole = "agent" | "user";

interface ChatMessage {
  role: MessageRole;
  content: string;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "agent", content: "Olá! Como posso te ajudar hoje?" },
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

    const agentMessage: ChatMessage = { role: "agent", content: "" };
    setMessages((prev) => [...prev, agentMessage]);

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
        let errorMessage = "Erro na resposta da API";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Erro ${response.status}`;
        } catch (e) {
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
            return [{ role: "agent", content: chunk }];
          }

          const others = prev.slice(0, -1);
          const lastMessage = prev[prev.length - 1];
          const updatedAgentMessage: ChatMessage = {
            role: "agent",
            content: lastMessage ? lastMessage.content + chunk : chunk,
          };
          return [...others, updatedAgentMessage];
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
        const withoutEmptyAgent = prev.slice(0, -1);
        const errorMessage: ChatMessage = {
          role: "agent",
          content: `Ocorreu um erro: ${error.message}. Por favor, tente novamente.`,
        };
        return [...withoutEmptyAgent, errorMessage];
      });
    } finally {
      console.log("🔄 Finalizando requisição");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      {/* Área de mensagens com espaço no fim para o input "flutuar" */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-6 pb-32">
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

      {/* Campo de input "flutuando" com margem no fundo */}
      <div className="absolute bottom-6 left-0 w-full px-4">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-700 bg-[#1e1e1e] px-4 py-3 shadow-lg">
          <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
