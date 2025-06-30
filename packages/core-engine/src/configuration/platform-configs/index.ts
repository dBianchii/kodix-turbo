import type { KodixAppId } from "@kdx/shared";

import { aiStudioConfig } from "./ai-studio.config";

/**
 * Mapa central de configurações de plataforma por AppId
 * Usado pelo ConfigurationService para obter as configurações base
 */
export const platformConfigsMap: Record<KodixAppId, any> = {
  ai9x7m2k5p1s: aiStudioConfig,
  az1x2c3bv4n5: {}, // Placeholder para futuras configurações do Chat
  calendar_app_321: {}, // Placeholder para futuras configurações do Calendar
  "7mwag78tv8pa": {}, // Placeholder para futuras configurações do Todo
  kodix_care_app_432: {}, // Placeholder para futuras configurações do KodixCare
  cupom_app_543: {}, // Placeholder para futuras configurações do Cupom
} as const;

/**
 * Obtém a configuração de plataforma para um AppId específico
 */
export function getPlatformConfig(appId: KodixAppId): any {
  return platformConfigsMap[appId] || {};
}

// Re-export das configurações específicas
export { aiStudioConfig } from "./ai-studio.config";
export type { AiStudioConfigType } from "./ai-studio.config";
