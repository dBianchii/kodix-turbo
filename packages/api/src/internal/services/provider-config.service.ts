import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Provider configuration interface
export interface ProviderConfig {
  providerId: string;
  name: string;
  baseUrl: string;
}

// Provider configuration response with validation
export interface ProviderConfigResponse {
  providers: ProviderConfig[];
}

export class ProviderConfigService {
  private static readonly CONFIG_PATH = join(
    dirname(fileURLToPath(import.meta.url)),
    "ai-model-sync-adapter/config/supported-providers.json"
  );
  
  private static _cachedConfig: ProviderConfig[] | null = null;
  private static _lastReadTime = 0;
  private static readonly CACHE_TTL = 60000; // 1 minute cache TTL

  /**
   * Get all providers from configuration file with caching
   */
  static getProviders(): ProviderConfig[] {
    const now = Date.now();
    
    // Return cached config if still valid
    if (
      this._cachedConfig && 
      (now - this._lastReadTime < this.CACHE_TTL)
    ) {
      return this._cachedConfig;
    }

    try {
      const configContent = readFileSync(this.CONFIG_PATH, "utf-8");
      const config = JSON.parse(configContent) as ProviderConfigResponse;
      
      // Validate configuration structure
      if (!Array.isArray(config.providers)) {
        throw new Error("Invalid configuration format: 'providers' array is required");
      }

      // Validate each provider
      for (const provider of config.providers) {
        this.validateProviderConfig(provider);
      }

      // Update cache
      this._cachedConfig = config.providers;
      this._lastReadTime = now;
      
      return config.providers;
    } catch (error) {
      console.error("[ProviderConfigService] Error reading configuration:", error);
      
      // Return cached config if available, otherwise throw
      if (this._cachedConfig) {
        console.warn("[ProviderConfigService] Using cached configuration due to read error");
        return this._cachedConfig;
      }
      
      throw new Error(`Failed to load provider configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a specific provider by ID
   */
  static getProviderById(providerId: string): ProviderConfig | null {
    if (!providerId || typeof providerId !== "string") {
      return null;
    }

    const providers = this.getProviders();
    return providers.find(provider => provider.providerId === providerId) ?? null;
  }

  /**
   * Get a specific provider by name
   */
  static getProviderByName(name: string): ProviderConfig | null {
    if (!name || typeof name !== "string") {
      return null;
    }

    const providers = this.getProviders();
    return providers.find(provider => provider.name === name) ?? null;
  }

  /**
   * Validate if a provider ID exists in configuration
   */
  static validateProviderId(providerId: string): boolean {
    if (!providerId || typeof providerId !== "string") {
      return false;
    }

    try {
      const provider = this.getProviderById(providerId);
      return provider !== null;
    } catch (error) {
      console.error("[ProviderConfigService] Error validating provider ID:", error);
      return false;
    }
  }

  /**
   * Get all supported provider IDs
   */
  static getSupportedProviderIds(): string[] {
    try {
      const providers = this.getProviders();
      return providers.map(provider => provider.providerId);
    } catch (error) {
      console.error("[ProviderConfigService] Error getting supported provider IDs:", error);
      return [];
    }
  }

  /**
   * Get all supported provider names
   */
  static getSupportedProviderNames(): string[] {
    try {
      const providers = this.getProviders();
      return providers.map(provider => provider.name);
    } catch (error) {
      console.error("[ProviderConfigService] Error getting supported provider names:", error);
      return [];
    }
  }

  /**
   * Clear cached configuration (useful for testing)
   */
  static clearCache(): void {
    this._cachedConfig = null;
    this._lastReadTime = 0;
  }

  /**
   * Get provider configuration mapped by ID for efficient lookups
   */
  static getProvidersMap(): Map<string, ProviderConfig> {
    const providers = this.getProviders();
    const map = new Map<string, ProviderConfig>();
    
    for (const provider of providers) {
      map.set(provider.providerId, provider);
    }
    
    return map;
  }

  /**
   * Get provider configuration mapped by name for efficient lookups
   */
  static getProvidersByNameMap(): Map<string, ProviderConfig> {
    const providers = this.getProviders();
    const map = new Map<string, ProviderConfig>();
    
    for (const provider of providers) {
      map.set(provider.name, provider);
    }
    
    return map;
  }

  /**
   * Validate a single provider configuration
   */
  private static validateProviderConfig(provider: unknown): asserts provider is ProviderConfig {
    if (!provider || typeof provider !== "object") {
      throw new Error("Provider configuration must be an object");
    }

    const p = provider as Record<string, unknown>;

    if (!p.providerId || typeof p.providerId !== "string") {
      throw new Error("Provider configuration missing required 'providerId' string");
    }

    if (!p.name || typeof p.name !== "string") {
      throw new Error("Provider configuration missing required 'name' string");
    }

    if (!p.baseUrl || typeof p.baseUrl !== "string") {
      throw new Error("Provider configuration missing required 'baseUrl' string");
    }

    // Validate baseUrl is a valid URL
    try {
      new URL(p.baseUrl);
    } catch {
      throw new Error(`Provider '${p.providerId}' has invalid baseUrl: ${p.baseUrl}`);
    }
  }

  /**
   * Get provider statistics
   */
  static getStats(): {
    totalProviders: number;
    providerIds: string[];
    configurationPath: string;
    lastRead: Date | null;
    isCached: boolean;
  } {
    try {
      const providers = this.getProviders();
      return {
        totalProviders: providers.length,
        providerIds: providers.map(p => p.providerId),
        configurationPath: this.CONFIG_PATH,
        lastRead: this._lastReadTime > 0 ? new Date(this._lastReadTime) : null,
        isCached: this._cachedConfig !== null,
      };
    } catch {
      return {
        totalProviders: 0,
        providerIds: [],
        configurationPath: this.CONFIG_PATH,
        lastRead: null,
        isCached: false,
      };
    }
  }
}