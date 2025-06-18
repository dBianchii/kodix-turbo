// 🧪 DEBUG: Log da variável de ambiente
console.log(
  "🔍 [DEBUG] ENABLE_VERCEL_AI_ADAPTER:",
  process.env.ENABLE_VERCEL_AI_ADAPTER,
);

export const FEATURE_FLAGS = {
  VERCEL_AI_ADAPTER: process.env.ENABLE_VERCEL_AI_ADAPTER === "true",
} as const;

// 🧪 DEBUG: Log do resultado final
console.log(
  "🔍 [DEBUG] FEATURE_FLAGS.VERCEL_AI_ADAPTER:",
  FEATURE_FLAGS.VERCEL_AI_ADAPTER,
);

// Type helper para garantir type safety
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

// Função helper para verificar feature flags
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
