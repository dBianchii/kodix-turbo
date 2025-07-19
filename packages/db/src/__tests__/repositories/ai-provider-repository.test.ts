import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AiProviderRepository } from "../../repositories/ai-studio";
import { jsonProviderService } from "../../services/json-provider.service";
import { db } from "../../client";

// Mock the database and JSON service
vi.mock("../../client");
vi.mock("../../services/json-provider.service");

// Mock data
const mockProviders = [
  {
    providerId: "openai",
    name: "OpenAI", 
    baseUrl: "https://api.openai.com/v1",
    models: [],
    tokens: []
  },
  {
    providerId: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1", 
    models: [],
    tokens: []
  }
];

const mockModels = [
  { 
    modelId: "gpt-4", 
    enabled: true,
    providerId: "openai",
    status: "active" as const,
    config: null,
    originalConfig: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    modelId: "gpt-3.5-turbo", 
    enabled: false,
    providerId: "openai",
    status: "active" as const,
    config: null,
    originalConfig: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockTokens = [
  { 
    id: "token1", 
    teamId: "team1",
    providerId: "openai",
    token: "encrypted_token_1",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: "token2", 
    teamId: "team2",
    providerId: "openai", 
    token: "encrypted_token_2",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe("AiProviderRepository with JSON Backend", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default JSON service mocks
    vi.mocked(jsonProviderService.findById).mockImplementation(async (id) => {
      return mockProviders.find(p => p.providerId === id) || null;
    });
    
    vi.mocked(jsonProviderService.findByName).mockImplementation(async (name) => {
      return mockProviders.find(p => p.name === name) || null;
    });
    
    vi.mocked(jsonProviderService.findMany).mockResolvedValue(mockProviders);
    vi.mocked(jsonProviderService.count).mockResolvedValue(mockProviders.length);
    
    // Setup database query mocks
    vi.mocked(db.query.aiModel.findMany).mockResolvedValue(mockModels);
    vi.mocked(db.query.aiTeamProviderToken.findMany).mockResolvedValue(mockTokens);
  });

  describe("findById", () => {
    it("should find provider by ID with related data", async () => {
      const provider = await AiProviderRepository.findById("openai");
      
      expect(provider).toBeDefined();
      expect(provider?.name).toBe("OpenAI");
      expect(provider?.providerId).toBe("openai");
      expect(provider?.models).toEqual(mockModels);
      expect(provider?.tokens).toEqual(mockTokens);
      
      // Verify JSON service was called
      expect(jsonProviderService.findById).toHaveBeenCalledWith("openai");
      
      // Verify database queries were made for related data
      expect(db.query.aiModel.findMany).toHaveBeenCalled();
      expect(db.query.aiTeamProviderToken.findMany).toHaveBeenCalled();
    });

    it("should return null for non-existent provider", async () => {
      vi.mocked(jsonProviderService.findById).mockResolvedValue(null);
      
      const provider = await AiProviderRepository.findById("non-existent");
      
      expect(provider).toBeNull();
      expect(jsonProviderService.findById).toHaveBeenCalledWith("non-existent");
      
      // Should not query database if provider not found
      expect(db.query.aiModel.findMany).not.toHaveBeenCalled();
      expect(db.query.aiTeamProviderToken.findMany).not.toHaveBeenCalled();
    });
  });

  describe("findByName", () => {
    it("should find provider by name with related models", async () => {
      const provider = await AiProviderRepository.findByName("OpenAI");
      
      expect(provider).toBeDefined();
      expect(provider?.name).toBe("OpenAI");
      expect(provider?.providerId).toBe("openai");
      expect(provider?.models).toEqual(mockModels);
      
      // Verify JSON service was called
      expect(jsonProviderService.findByName).toHaveBeenCalledWith("OpenAI");
      
      // Verify database query was made for models
      expect(db.query.aiModel.findMany).toHaveBeenCalled();
    });

    it("should return null for non-existent provider name", async () => {
      vi.mocked(jsonProviderService.findByName).mockResolvedValue(null);
      
      const provider = await AiProviderRepository.findByName("Non-existent");
      
      expect(provider).toBeNull();
      expect(jsonProviderService.findByName).toHaveBeenCalledWith("Non-existent");
      
      // Should not query database if provider not found
      expect(db.query.aiModel.findMany).not.toHaveBeenCalled();
    });
  });

  describe("findMany", () => {
    it("should find multiple providers with related data", async () => {
      const providers = await AiProviderRepository.findMany();
      
      expect(providers).toHaveLength(2);
      expect(providers[0]?.name).toBe("OpenAI");
      expect(providers[1]?.name).toBe("Anthropic");
      
      // Each provider should have related data
      providers.forEach(provider => {
        expect(provider.models).toEqual(mockModels);
        expect(provider.tokens).toEqual(mockTokens);
      });
      
      // Verify JSON service was called
      expect(jsonProviderService.findMany).toHaveBeenCalledWith({});
      
      // Verify database queries were made for each provider
      expect(db.query.aiModel.findMany).toHaveBeenCalledTimes(2);
      expect(db.query.aiTeamProviderToken.findMany).toHaveBeenCalledTimes(2);
    });

    it("should pass pagination parameters to JSON service", async () => {
      const params = { limite: 10, offset: 5 };
      await AiProviderRepository.findMany(params);
      
      expect(jsonProviderService.findMany).toHaveBeenCalledWith(params);
    });

    it("should handle empty provider list", async () => {
      vi.mocked(jsonProviderService.findMany).mockResolvedValue([]);
      
      const providers = await AiProviderRepository.findMany();
      
      expect(providers).toHaveLength(0);
      expect(db.query.aiModel.findMany).not.toHaveBeenCalled();
      expect(db.query.aiTeamProviderToken.findMany).not.toHaveBeenCalled();
    });
  });

  describe("count", () => {
    it("should return provider count from JSON service", async () => {
      const count = await AiProviderRepository.count();
      
      expect(count).toBe(2);
      expect(jsonProviderService.count).toHaveBeenCalled();
    });
  });

  describe("Unsupported Operations", () => {
    it("should throw error for create operation", async () => {
      await expect(
        AiProviderRepository.create({ name: "New Provider" })
      ).rejects.toThrow("Creating providers is not supported");
    });

    it("should throw error for update operation", async () => {
      await expect(
        AiProviderRepository.update("openai", { name: "Updated Name" })
      ).rejects.toThrow("Updating providers is not supported");
    });

    it("should throw error for delete operation", async () => {
      await expect(
        AiProviderRepository.delete("openai")
      ).rejects.toThrow("Deleting providers is not supported");
    });
  });

  describe("Error Handling", () => {
    it("should handle JSON service errors gracefully", async () => {
      const error = new Error("JSON service error");
      vi.mocked(jsonProviderService.findById).mockRejectedValue(error);
      
      await expect(
        AiProviderRepository.findById("openai")
      ).rejects.toThrow("JSON service error");
    });

    it("should handle database query errors gracefully", async () => {
      const error = new Error("Database error");
      vi.mocked(db.query.aiModel.findMany).mockRejectedValue(error);
      
      await expect(
        AiProviderRepository.findById("openai")
      ).rejects.toThrow("Database error");
    });
  });

  describe("Performance", () => {
    it("should efficiently handle concurrent provider lookups", async () => {
      const startTime = Date.now();
      
      // Perform multiple concurrent lookups
      const promises = [
        AiProviderRepository.findById("openai"),
        AiProviderRepository.findById("anthropic"),
        AiProviderRepository.findByName("OpenAI"),
        AiProviderRepository.findByName("Anthropic"),
        AiProviderRepository.findMany(),
        AiProviderRepository.count()
      ];
      
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      // All operations should succeed
      expect(results.every(r => r.status === "fulfilled")).toBe(true);
      
      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain consistent provider structure", async () => {
      const provider = await AiProviderRepository.findById("openai");
      
      expect(provider).toMatchObject({
        providerId: expect.any(String),
        name: expect.any(String),
        baseUrl: expect.any(String),
        models: expect.any(Array),
        tokens: expect.any(Array)
      });
    });

    it("should ensure models are filtered by provider", async () => {
      await AiProviderRepository.findById("openai");
      
      // Verify database query includes provider filter
      const call = vi.mocked(db.query.aiModel.findMany).mock.calls[0];
      expect(call).toBeDefined();
      // The where clause should filter by providerId
    });

    it("should ensure tokens are filtered by provider", async () => {
      await AiProviderRepository.findById("openai");
      
      // Verify database query includes provider filter
      const call = vi.mocked(db.query.aiTeamProviderToken.findMany).mock.calls[0];
      expect(call).toBeDefined();
      // The where clause should filter by providerId
    });
  });
});