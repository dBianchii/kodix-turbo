export const FEATURE_FLAGS = {
  // Outras feature flags podem ser adicionadas aqui no futuro
} as const;

// Type helper para garantir type safety
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

// Função helper para verificar feature flags
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
