import type { AppIdsWithUserAppTeamConfig, KodixAppId } from "@kdx/shared";
import { appRepository } from "@kdx/db";

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
   */
  async get(params: {
    appId: AppIdsWithUserAppTeamConfig;
    teamId: string;
    userId?: string;
  }): Promise<any> {
    const { appId, teamId, userId } = params;

    // 1. Configuração base da plataforma
    const platformConfig = getPlatformConfig(appId);

    // 2. Configuração do team
    let teamConfig = {};
    try {
      const [teamConfigResult] = await appRepository.findAppTeamConfigs({
        appId,
        teamIds: [teamId],
      });
      teamConfig = teamConfigResult?.config || {};
    } catch (error) {
      console.warn(
        `[CORE_ENGINE] Failed to fetch team config for ${appId}:`,
        error,
      );
    }

    // 3. Configuração do usuário (se userId fornecido)
    let userConfig = {};
    if (userId) {
      try {
        const [userConfigResult] = await appRepository.findUserAppTeamConfigs({
          appId,
          teamIds: [teamId],
          userIds: [userId],
        });
        userConfig = userConfigResult?.config || {};
      } catch (error) {
        console.warn(
          `[CORE_ENGINE] Failed to fetch user config for ${appId}:`,
          error,
        );
      }
    }

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
   */
  async getTeamLevel(params: {
    appId: AppIdsWithUserAppTeamConfig;
    teamId: string;
  }): Promise<any> {
    const { appId, teamId } = params;

    // Configuração base da plataforma
    const platformConfig = getPlatformConfig(appId);

    // Configuração do team
    let teamConfig = {};
    try {
      const [teamConfigResult] = await appRepository.findAppTeamConfigs({
        appId,
        teamIds: [teamId],
      });
      teamConfig = teamConfigResult?.config || {};
    } catch (error) {
      console.warn(
        `[CORE_ENGINE] Failed to fetch team config for ${appId}:`,
        error,
      );
    }

    // Merge: platform <- team
    return deepMerge(platformConfig, teamConfig);
  }
}
