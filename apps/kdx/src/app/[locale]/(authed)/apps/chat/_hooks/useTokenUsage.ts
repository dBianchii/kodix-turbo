"use client";

import { useMemo } from "react";

interface TokenUsageResult {
  usedTokens: number;
  maxTokens: number;
  percentage: number;
}

// Função para estimar tokens (mesma lógica do backend)
const estimateTokens = (text: string): number => {
  // Estimativa simples: ~4 caracteres por token para texto em português/inglês
  return Math.ceil(text.length / 4);
};

// Função para obter tokens máximos baseado no modelo
const getMaxTokensForModel = (modelName: string): number => {
  const modelLimits: Record<string, number> = {
    // OpenAI
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "gpt-4-turbo": 128000,
    "gpt-4": 8192,
    "gpt-3.5-turbo": 16385,

    // Anthropic Claude
    "claude-3-5-sonnet": 200000,
    "claude-3-5-haiku": 200000,
    "claude-3-opus": 200000,
    "claude-3-sonnet": 200000,
    "claude-3-haiku": 200000,

    // Google
    "gemini-pro": 32768,
    "gemini-1.5-pro": 2097152,
    "gemini-1.5-flash": 1048576,
  };

  // Normalizar nome do modelo
  const normalizedName = modelName
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/-\d{4}-\d{2}-\d{2}.*$/, "")
    .replace(/-\d{8}.*$/, "")
    .replace(/-\d{4}.*$/, "")
    .replace(/-v\d+.*$/, "")
    .replace(/-latest$/, "")
    .replace(/-preview$/, "")
    .replace(/-snapshot.*$/, "")
    .replace(/-instruct.*$/, "")
    .replace(/-chat.*$/, "")
    .replace(/-beta.*$/, "")
    .replace(/-alpha.*$/, "")
    .replace(/-turbo-\d+.*$/, "")
    .replace(/-\d+k.*$/, "")
    .replace(/-\d+b.*$/, "")
    .replace(/-fine-tuned.*$/, "")
    .replace(/-ft-.*$/, "")
    .trim();

  return modelLimits[normalizedName] || 4096; // Fallback para 4096 tokens
};

export function useTokenUsage(
  messages: { content: string }[] = [],
  modelName = "",
): TokenUsageResult {
  return useMemo(() => {
    // 🔍 DEBUG: Log dentro do hook
    console.log("🔍 [useTokenUsage] Hook chamado com:", {
      messagesLength: messages.length,
      modelName,
      messagesPreview: messages.slice(0, 2).map((m) => ({
        content: (m.content || "").substring(0, 30) + "...",
        contentLength: (m.content || "").length,
      })),
    });

    // Calcular tokens baseado nas mensagens
    const usedTokens = messages.reduce((total, message) => {
      const tokens = estimateTokens(message.content || "");
      console.log("🔍 [useTokenUsage] Calculando tokens para mensagem:", {
        contentLength: (message.content || "").length,
        tokens,
        total: total + tokens,
      });
      return total + tokens;
    }, 0);

    // Obter limite máximo baseado no modelo
    const maxTokens = getMaxTokensForModel(modelName);

    // Calcular porcentagem
    const percentage =
      maxTokens > 0 ? Math.min((usedTokens / maxTokens) * 100, 100) : 0;

    console.log("🔍 [useTokenUsage] Resultado final:", {
      usedTokens,
      maxTokens,
      percentage,
    });

    return {
      usedTokens,
      maxTokens,
      percentage,
    };
  }, [messages, modelName]);
}
