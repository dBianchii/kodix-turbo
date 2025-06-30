import { ConfigurationService } from "./configuration/configuration.service";

/**
 * CoreEngine - Fachada principal do sistema de configurações
 * Implementa padrão Singleton para acesso global
 */
export class CoreEngine {
  private static _instance: CoreEngine;

  public readonly config: ConfigurationService;

  private constructor() {
    this.config = new ConfigurationService();
  }

  public static getInstance(): CoreEngine {
    if (!CoreEngine._instance) {
      CoreEngine._instance = new CoreEngine();
    }
    return CoreEngine._instance;
  }

  /**
   * Acesso estático para facilitar o uso
   */
  public static get config(): ConfigurationService {
    return CoreEngine.getInstance().config;
  }
}

// Export para uso direto
export const coreEngine = CoreEngine.getInstance();

// Export dos tipos e serviços
export type { ConfigurationService } from "./configuration/configuration.service";
export { CoreEngine as default };
