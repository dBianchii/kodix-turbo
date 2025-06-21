"use client";

import { useEffect, useState } from "react";

// Tipos de feature flags disponíveis
type FeatureFlagKey =
  | "use-empty-session-flow"
  | "enable-smart-auto-process"
  | "use-assistant-ui-patterns";

interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage: number;
  description: string;
}

type FeatureFlagConfig = Record<string, FeatureFlag>;

// Configuração padrão das feature flags
const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  "use-empty-session-flow": {
    enabled: false, // Inicia desabilitado para migração segura
    rolloutPercentage: 0,
    description:
      "Usar createEmptySession ao invés de autoCreateSessionWithMessage",
  },
  "enable-smart-auto-process": {
    enabled: true, // Já implementado e funcionando
    rolloutPercentage: 100,
    description: "Auto-processamento inteligente usando reload()",
  },
  "use-assistant-ui-patterns": {
    enabled: true, // Padrões já implementados
    rolloutPercentage: 100,
    description: "Usar padrões do Assistant-UI para thread management",
  },
};

// Simulação de usuário para rollout gradual
function getUserRolloutId(): string {
  // Em produção, isso viria do contexto do usuário
  // Para desenvolvimento, usar localStorage ou ID fixo
  if (typeof window !== "undefined") {
    let userId = localStorage.getItem("feature-flag-user-id");
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("feature-flag-user-id", userId);
    }
    return userId;
  }
  return "default-user";
}

// Função para verificar se usuário está no rollout
function isUserInRollout(userId: string, percentage: number): boolean {
  if (percentage === 0) return false;
  if (percentage === 100) return true;

  // Hash simples do userId para distribuição consistente
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return Math.abs(hash) % 100 < percentage;
}

/**
 * Hook para gerenciar feature flags
 *
 * @param flagKey - Chave da feature flag
 * @returns Objeto com estado da feature flag
 */
export function useFeatureFlag(flagKey: FeatureFlagKey) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkFeatureFlag = () => {
      const config = DEFAULT_FEATURE_FLAGS[flagKey];

      if (!config) {
        console.warn(`[FEATURE_FLAG] Flag não encontrada: ${flagKey}`);
        setIsEnabled(false);
        setIsLoading(false);
        return;
      }

      // Verificar se está habilitado globalmente
      if (!config.enabled) {
        setIsEnabled(false);
        setIsLoading(false);
        return;
      }

      // Verificar rollout percentage
      const userId = getUserRolloutId();
      const inRollout = isUserInRollout(userId, config.rolloutPercentage);

      setIsEnabled(inRollout);
      setIsLoading(false);

      console.log(`[FEATURE_FLAG] ${flagKey}:`, {
        enabled: config.enabled,
        rolloutPercentage: config.rolloutPercentage,
        userId: userId.substring(0, 8) + "...",
        inRollout,
        result: inRollout,
      });
    };

    checkFeatureFlag();
  }, [flagKey]);

  return {
    enabled: isEnabled,
    loading: isLoading,
    config: DEFAULT_FEATURE_FLAGS[flagKey],
  };
}

/**
 * Hook para gerenciar múltiplas feature flags
 *
 * @param flagKeys - Array de chaves das feature flags
 * @returns Objeto com estado de todas as flags
 */
export function useFeatureFlags(flagKeys: FeatureFlagKey[]) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAllFlags = () => {
      const userId = getUserRolloutId();
      const results: Record<string, boolean> = {};

      flagKeys.forEach((flagKey) => {
        const config = DEFAULT_FEATURE_FLAGS[flagKey];

        if (!config) {
          results[flagKey] = false;
          return;
        }

        if (!config.enabled) {
          results[flagKey] = false;
          return;
        }

        const inRollout = isUserInRollout(userId, config.rolloutPercentage);
        results[flagKey] = inRollout;
      });

      setFlags(results);
      setIsLoading(false);

      console.log("[FEATURE_FLAGS] Múltiplas flags:", results);
    };

    checkAllFlags();
  }, [flagKeys]);

  return {
    flags,
    loading: isLoading,
    isEnabled: (flagKey: FeatureFlagKey) => flags[flagKey] || false,
  };
}

/**
 * Hook para desenvolvimento - permite override manual das flags
 *
 * @param overrides - Objeto com overrides das flags
 */
export function useFeatureFlagOverrides(
  overrides: Partial<Record<FeatureFlagKey, boolean>>,
) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      Object.entries(overrides).forEach(([key, value]) => {
        localStorage.setItem(`feature-flag-override-${key}`, String(value));
      });

      console.log("[FEATURE_FLAG] Overrides aplicados (dev only):", overrides);
    }
  }, [overrides]);
}

/**
 * Utilitário para debug de feature flags
 */
export function debugFeatureFlags() {
  if (process.env.NODE_ENV === "development") {
    console.table(DEFAULT_FEATURE_FLAGS);

    const userId = getUserRolloutId();
    console.log("User ID para rollout:", userId);

    Object.entries(DEFAULT_FEATURE_FLAGS).forEach(([key, config]) => {
      const inRollout = isUserInRollout(userId, config.rolloutPercentage);
      console.log(`${key}: ${inRollout ? "✅ ENABLED" : "❌ DISABLED"}`);
    });
  }
}
