import { describe, it, expect, beforeEach, vi } from "vitest";
import { JsonProviderService, jsonProviderService } from "../../services/json-provider.service";
import fs from "fs";
import fsPromises from "fs/promises";

// Mock the filesystem
vi.mock("fs");
vi.mock("fs/promises");

// Mock JSON data that matches the supported-providers.json structure
const mockProvidersData = {
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

describe("JsonProviderService", () => {
  beforeEach(() => {
    // Reset singleton instance
    (JsonProviderService as any).instance = null;
    
    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fsPromises.readFile).mockResolvedValue(
      JSON.stringify(mockProvidersData)
    );
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = JsonProviderService.getInstance();
      const instance2 = JsonProviderService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Provider Loading", () => {
    it("should load providers from JSON file", async () => {
      const service = JsonProviderService.getInstance();
      const providers = await service.getAllProviders();
      
      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual({
        providerId: "openai",
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        models: [],
        tokens: []
      });
    });

    it("should validate JSON schema", async () => {
      const invalidData = {
        providers: [
          {
            // Missing required fields
            name: "Invalid Provider"
          }
        ]
      };
      
      vi.mocked(fsPromises.readFile).mockResolvedValue(
        JSON.stringify(invalidData)
      );
      
      const service = JsonProviderService.getInstance();
      
      await expect(service.getAllProviders()).rejects.toThrow();
    });

    it("should handle file read errors", async () => {
      vi.mocked(fsPromises.readFile).mockRejectedValue(
        new Error("File not found")
      );
      
      const service = JsonProviderService.getInstance();
      
      await expect(service.getAllProviders()).rejects.toThrow(
        "Failed to load provider configuration"
      );
    });

    it("should handle invalid JSON", async () => {
      vi.mocked(fsPromises.readFile).mockResolvedValue("invalid json");
      
      const service = JsonProviderService.getInstance();
      
      await expect(service.getAllProviders()).rejects.toThrow();
    });
  });

  describe("Provider Queries", () => {
    let service: JsonProviderService;

    beforeEach(async () => {
      service = JsonProviderService.getInstance();
      // Pre-load providers
      await service.getAllProviders();
    });

    describe("findById", () => {
      it("should find provider by ID", async () => {
        const provider = await service.findById("openai");
        
        expect(provider).toBeDefined();
        expect(provider?.name).toBe("OpenAI");
        expect(provider?.providerId).toBe("openai");
      });

      it("should return null for non-existent ID", async () => {
        const provider = await service.findById("non-existent");
        expect(provider).toBeNull();
      });
    });

    describe("findByName", () => {
      it("should find provider by name", async () => {
        const provider = await service.findByName("OpenAI");
        
        expect(provider).toBeDefined();
        expect(provider?.name).toBe("OpenAI");
        expect(provider?.providerId).toBe("openai");
      });

      it("should return null for non-existent name", async () => {
        const provider = await service.findByName("Non-existent Provider");
        expect(provider).toBeNull();
      });
    });

    describe("findMany", () => {
      it("should return all providers by default", async () => {
        const providers = await service.findMany();
        expect(providers).toHaveLength(4);
      });

      it("should respect limit parameter", async () => {
        const providers = await service.findMany({ limite: 2 });
        expect(providers).toHaveLength(2);
      });

      it("should respect offset parameter", async () => {
        const providers = await service.findMany({ limite: 2, offset: 2 });
        expect(providers).toHaveLength(2);
        
        // Should be different providers due to offset
        const firstTwo = await service.findMany({ limite: 2, offset: 0 });
        expect(providers[0]?.providerId).not.toBe(firstTwo[0]?.providerId);
      });

      it("should return providers sorted by name", async () => {
        const providers = await service.findMany();
        const names = providers.map(p => p.name);
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
      });
    });

    describe("count", () => {
      it("should return correct provider count", async () => {
        const count = await service.count();
        expect(count).toBe(4);
      });
    });

    describe("exists", () => {
      it("should return true for existing provider", async () => {
        const exists = await service.exists("openai");
        expect(exists).toBe(true);
      });

      it("should return false for non-existent provider", async () => {
        const exists = await service.exists("non-existent");
        expect(exists).toBe(false);
      });
    });

    describe("existsByName", () => {
      it("should return true for existing provider name", async () => {
        const exists = await service.existsByName("OpenAI");
        expect(exists).toBe(true);
      });

      it("should return false for non-existent provider name", async () => {
        const exists = await service.existsByName("Non-existent");
        expect(exists).toBe(false);
      });
    });

    describe("validateProviderId", () => {
      it("should validate existing provider ID", async () => {
        const isValid = await service.validateProviderId("openai");
        expect(isValid).toBe(true);
      });

      it("should reject invalid provider ID", async () => {
        const isValid = await service.validateProviderId("invalid");
        expect(isValid).toBe(false);
      });
    });

    describe("getProviderIds", () => {
      it("should return all provider IDs", async () => {
        const ids = await service.getProviderIds();
        expect(ids).toEqual(["openai", "anthropic", "google", "xai"]);
      });
    });
  });

  describe("Caching", () => {
    it("should cache providers after first load", async () => {
      const service = JsonProviderService.getInstance();
      
      // First call should read file
      await service.getAllProviders();
      expect(vi.mocked(fsPromises.readFile)).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      await service.getAllProviders();
      expect(vi.mocked(fsPromises.readFile)).toHaveBeenCalledTimes(1);
    });

    it("should reload providers when requested", async () => {
      const service = JsonProviderService.getInstance();
      
      // First load
      await service.getAllProviders();
      expect(vi.mocked(fsPromises.readFile)).toHaveBeenCalledTimes(1);
      
      // Reload
      await service.reload();
      expect(vi.mocked(fsPromises.readFile)).toHaveBeenCalledTimes(2);
    });

    it("should expire cache after TTL", async () => {
      // Mock Date.now to control time
      const mockNow = vi.spyOn(Date, "now");
      mockNow.mockReturnValue(0);
      
      const service = JsonProviderService.getInstance();
      
      // First load
      await service.getAllProviders();
      expect(vi.mocked(fsPromises.readFile)).toHaveBeenCalledTimes(1);
      
      // Move time forward past TTL (1 hour + 1ms)
      mockNow.mockReturnValue(60 * 60 * 1000 + 1);
      
      // Should reload due to expired cache
      await service.getAllProviders();
      expect(vi.mocked(fsPromises.readFile)).toHaveBeenCalledTimes(2);
      
      mockNow.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle provider ID validation gracefully", async () => {
      const service = JsonProviderService.getInstance();
      
      // Should not throw for empty string
      const isValid = await service.validateProviderId("");
      expect(isValid).toBe(false);
    });

    it("should handle malformed provider data", async () => {
      const malformedData = {
        providers: [
          {
            providerId: "", // Invalid empty ID
            name: "Test",
            baseUrl: "not-a-url" // Invalid URL
          }
        ]
      };
      
      vi.mocked(fsPromises.readFile).mockResolvedValue(
        JSON.stringify(malformedData)
      );
      
      const service = JsonProviderService.getInstance();
      
      await expect(service.getAllProviders()).rejects.toThrow();
    });
  });

  describe("Performance", () => {
    it("should handle large number of provider lookups efficiently", async () => {
      const service = JsonProviderService.getInstance();
      await service.getAllProviders(); // Pre-load cache
      
      const startTime = Date.now();
      
      // Perform 1000 lookups
      const promises = Array.from({ length: 1000 }, (_, i) => {
        const providerId = i % 2 === 0 ? "openai" : "anthropic";
        return service.findById(providerId);
      });
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      // All lookups should succeed
      expect(results.every(r => r !== null)).toBe(true);
      
      // Should complete in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});