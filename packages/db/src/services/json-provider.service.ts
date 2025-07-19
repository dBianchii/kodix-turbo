import { z } from "zod";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Zod schema for provider validation
const ProviderSchema = z.object({
  providerId: z.string().min(1),
  name: z.string().min(1),
  baseUrl: z.string().url().optional().nullable(),
});

const ProvidersConfigSchema = z.object({
  providers: z.array(ProviderSchema),
});

// Type definitions matching the database schema
export type JsonProvider = z.infer<typeof ProviderSchema>;
export type ProvidersConfig = z.infer<typeof ProvidersConfigSchema>;

// Provider with computed fields to match database structure
export interface ProviderWithRelations extends JsonProvider {
  models?: Array<{ modelId: string; enabled: boolean }>;
  tokens?: Array<{ id: string; teamId: string }>;
}

/**
 * Service for managing AI providers from JSON configuration
 * Provides in-memory caching and validation for provider data
 */
export class JsonProviderService {
  private static instance: JsonProviderService;
  private providersCache: Map<string, ProviderWithRelations> | null = null;
  private providersByNameCache: Map<string, ProviderWithRelations> | null = null;
  private configPath: string;
  private lastLoadTime: number = 0;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache TTL

  private constructor() {
    // Path to supported-providers.json
    // Find the root directory by looking for the monorepo root
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    let rootDir = currentDir;
    
    // Navigate up until we find the monorepo root (has packages directory)
    while (!fs.existsSync(path.join(rootDir, "packages"))) {
      const parentDir = path.dirname(rootDir);
      if (parentDir === rootDir) {
        // Reached filesystem root, use current working directory as fallback
        rootDir = process.cwd();
        break;
      }
      rootDir = parentDir;
    }
    
    this.configPath = path.join(
      rootDir,
      "packages",
      "api",
      "src",
      "internal",
      "services",
      "ai-model-sync-adapter",
      "config",
      "supported-providers.json"
    );
  }

  public static getInstance(): JsonProviderService {
    if (!JsonProviderService.instance) {
      JsonProviderService.instance = new JsonProviderService();
    }
    return JsonProviderService.instance;
  }

  /**
   * Load providers from JSON file with validation
   */
  private async loadProviders(): Promise<void> {
    try {
      const fileContent = await fsPromises.readFile(this.configPath, "utf-8");
      const parsedData = JSON.parse(fileContent);
      
      // Validate with Zod schema
      const validatedData = ProvidersConfigSchema.parse(parsedData);
      
      // Build cache maps
      this.providersCache = new Map();
      this.providersByNameCache = new Map();
      
      for (const provider of validatedData.providers) {
        const providerWithRelations: ProviderWithRelations = {
          ...provider,
          models: [], // Will be populated by the repository if needed
          tokens: [], // Will be populated by the repository if needed
        };
        
        this.providersCache.set(provider.providerId, providerWithRelations);
        this.providersByNameCache.set(provider.name, providerWithRelations);
      }
      
      this.lastLoadTime = Date.now();
    } catch (error) {
      console.error("[JsonProviderService] Failed to load providers:", error);
      throw new Error(`Failed to load provider configuration: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Ensure providers are loaded and cache is fresh
   */
  private async ensureLoaded(): Promise<void> {
    const now = Date.now();
    const cacheExpired = now - this.lastLoadTime > this.CACHE_TTL;
    
    if (!this.providersCache || !this.providersByNameCache || cacheExpired) {
      await this.loadProviders();
    }
  }

  /**
   * Get all providers
   */
  public async getAllProviders(): Promise<ProviderWithRelations[]> {
    await this.ensureLoaded();
    return Array.from(this.providersCache!.values());
  }

  /**
   * Find provider by ID
   */
  public async findById(providerId: string): Promise<ProviderWithRelations | null> {
    await this.ensureLoaded();
    return this.providersCache!.get(providerId) || null;
  }

  /**
   * Find provider by name
   */
  public async findByName(name: string): Promise<ProviderWithRelations | null> {
    await this.ensureLoaded();
    return this.providersByNameCache!.get(name) || null;
  }

  /**
   * Find many providers with pagination
   */
  public async findMany(params: {
    limite?: number;
    offset?: number;
  } = {}): Promise<ProviderWithRelations[]> {
    const { limite = 50, offset = 0 } = params;
    await this.ensureLoaded();
    
    const allProviders = Array.from(this.providersCache!.values());
    
    // Sort by name for consistent ordering
    allProviders.sort((a, b) => a.name.localeCompare(b.name));
    
    // Apply pagination
    return allProviders.slice(offset, offset + limite);
  }

  /**
   * Count providers
   */
  public async count(): Promise<number> {
    await this.ensureLoaded();
    return this.providersCache!.size;
  }

  /**
   * Check if a provider exists by ID
   */
  public async exists(providerId: string): Promise<boolean> {
    await this.ensureLoaded();
    return this.providersCache!.has(providerId);
  }

  /**
   * Check if a provider exists by name
   */
  public async existsByName(name: string): Promise<boolean> {
    await this.ensureLoaded();
    return this.providersByNameCache!.has(name);
  }

  /**
   * Reload providers from disk (useful for development)
   */
  public async reload(): Promise<void> {
    this.providersCache = null;
    this.providersByNameCache = null;
    this.lastLoadTime = 0;
    await this.loadProviders();
  }

  /**
   * Validate provider ID exists (for foreign key validation)
   */
  public async validateProviderId(providerId: string): Promise<boolean> {
    return this.exists(providerId);
  }

  /**
   * Get provider IDs for validation
   */
  public async getProviderIds(): Promise<string[]> {
    await this.ensureLoaded();
    return Array.from(this.providersCache!.keys());
  }
}

// Export singleton instance
export const jsonProviderService = JsonProviderService.getInstance();