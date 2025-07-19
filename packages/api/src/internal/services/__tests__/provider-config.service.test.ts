import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";

import { ProviderConfigService, type ProviderConfig } from "../provider-config.service";

// Mock fs module
vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

const mockReadFileSync = vi.mocked(readFileSync);

// Mock valid configuration data
const mockValidConfig = {
  providers: [
    {
      providerId: "openai",
      name: "OpenAI",
      baseUrl: "https://api.openai.com/v1"
    },
    {
      providerId: "anthropic",
      name: "Anthropic",
      baseUrl: "https://api.anthropic.com/v1"
    },
    {
      providerId: "google",
      name: "Google",
      baseUrl: "https://generativelanguage.googleapis.com"
    },
    {
      providerId: "xai",
      name: "XAI",
      baseUrl: "https://api.x.ai/v1"
    }
  ]
};

describe("ProviderConfigService", () => {
  beforeEach(() => {
    // Clear cache before each test
    ProviderConfigService.clearCache();
    vi.clearAllMocks();
  });

  describe("getProviders", () => {
    it("should return providers when configuration is valid", () => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));

      const providers = ProviderConfigService.getProviders();

      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual({
        providerId: "openai",
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1"
      });
    });

    it("should cache providers and not read file again within TTL", () => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));

      // First call
      ProviderConfigService.getProviders();
      // Second call
      ProviderConfigService.getProviders();

      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
    });

    it("should throw error when configuration file has invalid JSON", () => {
      mockReadFileSync.mockReturnValue("invalid json");

      expect(() => ProviderConfigService.getProviders()).toThrow(
        "Failed to load provider configuration"
      );
    });

    it("should throw error when providers array is missing", () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ other: "data" }));

      expect(() => ProviderConfigService.getProviders()).toThrow(
        "Invalid configuration format: 'providers' array is required"
      );
    });

    it("should throw error when provider is missing required fields", () => {
      const invalidConfig = {
        providers: [
          {
            providerId: "openai",
            // missing name and baseUrl
          }
        ]
      };
      mockReadFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => ProviderConfigService.getProviders()).toThrow(
        "Provider configuration missing required 'name' string"
      );
    });

    it("should throw error when provider has invalid baseUrl", () => {
      const invalidConfig = {
        providers: [
          {
            providerId: "openai",
            name: "OpenAI",
            baseUrl: "not-a-valid-url"
          }
        ]
      };
      mockReadFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => ProviderConfigService.getProviders()).toThrow(
        "Provider 'openai' has invalid baseUrl: not-a-valid-url"
      );
    });

    it("should use cached config when file read fails", () => {
      // First successful read
      mockReadFileSync.mockReturnValueOnce(JSON.stringify(mockValidConfig));
      const firstResult = ProviderConfigService.getProviders();

      // Second call fails but should return cached result
      mockReadFileSync.mockImplementationOnce(() => {
        throw new Error("File read error");
      });

      // Clear TTL by mocking time
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      ProviderConfigService["_lastReadTime"] = 0; // Force cache invalidation
      const secondResult = ProviderConfigService.getProviders();

      expect(secondResult).toEqual(firstResult);
      expect(warnSpy).toHaveBeenCalledWith(
        "[ProviderConfigService] Using cached configuration due to read error"
      );

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe("getProviderById", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return provider when found", () => {
      const provider = ProviderConfigService.getProviderById("openai");

      expect(provider).toEqual({
        providerId: "openai",
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1"
      });
    });

    it("should return null when provider not found", () => {
      const provider = ProviderConfigService.getProviderById("nonexistent");

      expect(provider).toBeNull();
    });

    it("should return null when providerId is empty", () => {
      const provider = ProviderConfigService.getProviderById("");

      expect(provider).toBeNull();
    });

    it("should return null when providerId is not a string", () => {
      const provider = ProviderConfigService.getProviderById(null as any);

      expect(provider).toBeNull();
    });
  });

  describe("getProviderByName", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return provider when found", () => {
      const provider = ProviderConfigService.getProviderByName("OpenAI");

      expect(provider).toEqual({
        providerId: "openai",
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1"
      });
    });

    it("should return null when provider not found", () => {
      const provider = ProviderConfigService.getProviderByName("Nonexistent");

      expect(provider).toBeNull();
    });

    it("should return null when name is empty", () => {
      const provider = ProviderConfigService.getProviderByName("");

      expect(provider).toBeNull();
    });
  });

  describe("validateProviderId", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return true for valid provider ID", () => {
      const isValid = ProviderConfigService.validateProviderId("openai");

      expect(isValid).toBe(true);
    });

    it("should return false for invalid provider ID", () => {
      const isValid = ProviderConfigService.validateProviderId("nonexistent");

      expect(isValid).toBe(false);
    });

    it("should return false when providerId is empty", () => {
      const isValid = ProviderConfigService.validateProviderId("");

      expect(isValid).toBe(false);
    });

    it("should return false when configuration read fails", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      ProviderConfigService.clearCache();
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const isValid = ProviderConfigService.validateProviderId("openai");

      expect(isValid).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("getSupportedProviderIds", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return array of provider IDs", () => {
      const providerIds = ProviderConfigService.getSupportedProviderIds();

      expect(providerIds).toEqual(["openai", "anthropic", "google", "xai"]);
    });

    it("should return empty array when configuration read fails", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      ProviderConfigService.clearCache();
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const providerIds = ProviderConfigService.getSupportedProviderIds();

      expect(providerIds).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("getSupportedProviderNames", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return array of provider names", () => {
      const providerNames = ProviderConfigService.getSupportedProviderNames();

      expect(providerNames).toEqual(["OpenAI", "Anthropic", "Google", "XAI"]);
    });

    it("should return empty array when configuration read fails", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      ProviderConfigService.clearCache();
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const providerNames = ProviderConfigService.getSupportedProviderNames();

      expect(providerNames).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("getProvidersMap", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return map of providers by ID", () => {
      const providersMap = ProviderConfigService.getProvidersMap();

      expect(providersMap.size).toBe(4);
      expect(providersMap.get("openai")).toEqual({
        providerId: "openai",
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1"
      });
      expect(providersMap.get("nonexistent")).toBeUndefined();
    });
  });

  describe("getProvidersByNameMap", () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));
    });

    it("should return map of providers by name", () => {
      const providersMap = ProviderConfigService.getProvidersByNameMap();

      expect(providersMap.size).toBe(4);
      expect(providersMap.get("OpenAI")).toEqual({
        providerId: "openai",
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1"
      });
      expect(providersMap.get("Nonexistent")).toBeUndefined();
    });
  });

  describe("getStats", () => {
    it("should return stats when configuration is valid", () => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));

      const stats = ProviderConfigService.getStats();

      expect(stats.totalProviders).toBe(4);
      expect(stats.providerIds).toEqual(["openai", "anthropic", "google", "xai"]);
      expect(stats.configurationPath).toContain("supported-providers.json");
      expect(stats.lastRead).toBeInstanceOf(Date);
      expect(stats.isCached).toBe(true);
    });

    it("should return empty stats when configuration read fails", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      ProviderConfigService.clearCache();
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const stats = ProviderConfigService.getStats();

      expect(stats.totalProviders).toBe(0);
      expect(stats.providerIds).toEqual([]);
      expect(stats.lastRead).toBeNull();
      expect(stats.isCached).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("clearCache", () => {
    it("should clear cached configuration", () => {
      mockReadFileSync.mockReturnValue(JSON.stringify(mockValidConfig));

      // Load configuration
      ProviderConfigService.getProviders();
      let stats = ProviderConfigService.getStats();
      expect(stats.isCached).toBe(true);

      // Clear cache
      ProviderConfigService.clearCache();
      
      // Need to mock a failed read to check cache is truly cleared
      mockReadFileSync.mockImplementationOnce(() => {
        throw new Error("File read error");
      });
      
      // This should return empty stats since cache is cleared and file read fails
      stats = ProviderConfigService.getStats();
      expect(stats.isCached).toBe(false);
    });
  });
});