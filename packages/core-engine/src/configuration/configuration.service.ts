import type { KodixAppId } from "@kdx/shared";

// TODO: Fix import - import { appRepository } from "@kdx/db";

import { getPlatformConfig } from "./platform-configs";
import { deepMerge } from "./utils/deep-merge";

/**
 * ConfigurationService - Serviço central de configurações do CoreEngine
 *
 * Implementa a lógica hierárquica de configurações:
 * 1. Configuração de Plataforma (base)
 * 2. Configuração de Team (sobrescreve plataforma)
 * 3. Configuração de Usuário (sobrescreve team)
 */
export class ConfigurationService {
  /**
   * Obtém a configuração mesclada para um app específico
   * TODO: Implementar integração com banco de dados após resolver import
   */
  async get(params: {
    appId: KodixAppId;
    teamId: string;
    userId?: string;
  }): Promise<any> {
    const { appId } = params;

    // 1. Configuração base da plataforma
    const platformConfig = getPlatformConfig(appId);

    // TODO: Implementar busca no banco
    // 2. Configuração do team (placeholder)
    const teamConfig = {};

    // 3. Configuração do usuário (placeholder)
    const userConfig = {};

    // 4. Merge hierárquico: platform <- team <- user
    let finalConfig = platformConfig;
    finalConfig = deepMerge(finalConfig, teamConfig);
    finalConfig = deepMerge(finalConfig, userConfig);

    return finalConfig;
  }

  /**
   * Obtém apenas a configuração de plataforma (sem team/user)
   */
  getPlatformOnly(appId: KodixAppId): any {
    return getPlatformConfig(appId);
  }

  /**
   * Obtém a configuração mesclada de plataforma + team (sem usuário)
   * TODO: Implementar integração com banco de dados após resolver import
   */
  async getTeamLevel(params: {
    appId: KodixAppId;
    teamId: string;
  }): Promise<any> {
    const { appId } = params;

    // Configuração base da plataforma
    const platformConfig = getPlatformConfig(appId);

    // TODO: Implementar busca no banco
    // Configuração do team (placeholder)
    const teamConfig = {};

    // Merge: platform <- team
    return deepMerge(platformConfig, teamConfig);
  }
}
