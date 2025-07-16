import { beforeEach, describe, expect, it, vi } from "vitest";

// Import types separately
import type {
  NormalizedModel,
  AiModelSyncService as TAIModelSyncService,
} from "../ai-model-sync.service";

// Set environment variables before any imports
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.GOOGLE_API_KEY = "test-google-key";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.SKIP_ENV_VALIDATION = "true";

// Mock the adapter instances
const mockOpenAIFetchModels = vi.fn();
const mockGoogleFetchModels = vi.fn();
const mockAnthropicFetchModels = vi.fn();

// Mock the adapters
vi.mock("../ai-sync-adapters/providers/openai/openai-adapter", () => ({
  OpenAIAdapter: vi.fn().mockImplementation(() => ({
    fetchModels: mockOpenAIFetchModels,
  })),
}));

vi.mock("../ai-sync-adapters/providers/google/google-adapter", () => ({
  GoogleAdapter: vi.fn().mockImplementation(() => ({
    fetchModels: mockGoogleFetchModels,
  })),
}));

vi.mock("../ai-sync-adapters/providers/anthropic/anthropic-adapter", () => ({
  AnthropicAdapter: vi.fn().mockImplementation(() => ({
    fetchModels: mockAnthropicFetchModels,
  })),
}));

// Mock database
const mockDbFrom = vi.fn();
const mockDbWhere = vi.fn();

vi.mock("@kdx/db/client", () => ({
  db: {
    select: () => ({
      from: mockDbFrom,
    }),
  },
}));

describe("AiModelSyncService", () => {
  let service: TAIModelSyncService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-import the service to get the mocked dependencies
    const { AiModelSyncService } = await import("../ai-model-sync.service");
    service = new AiModelSyncService();

    // Setup mock chain
    mockDbFrom.mockReturnValue({
      where: mockDbWhere,
    });
    mockDbWhere.mockResolvedValue([]);
  });

  describe("syncWithProvider", () => {
    it("should sync OpenAI models successfully", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [
        {
          modelId: "gpt-4o",
          name: "GPT-4o",
          displayName: "GPT 4o",
          maxTokens: 128000,
          pricing: {
            input: "2.50",
            output: "10.00",
            unit: "per_million_tokens",
          },
        },
      ];

      mockOpenAIFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue([]);

      // Act
      const result = await service.syncWithProvider("openai");

      // Assert
      expect(result.providerId).toBe("openai");
      expect(result.newModels).toHaveLength(1);
      expect(result.newModels[0]).toEqual(mockFreshModels[0]);
      expect(result.updatedModels).toHaveLength(0);
      expect(result.archivedModels).toHaveLength(0);
    });

    it("should detect updated models", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [
        {
          modelId: "gpt-4o",
          name: "GPT-4o",
          displayName: "GPT 4o",
          maxTokens: 128000,
          pricing: {
            input: "3.00", // Changed price
            output: "12.00", // Changed price
            unit: "per_million_tokens",
          },
        },
      ];

      const mockExistingModels = [
        {
          id: "existing-id",
          providerId: "openai",
          name: "GPT-4o",
          enabled: true,
          config: {
            modelId: "gpt-4o",
            pricing: {
              input: "2.50",
              output: "10.00",
              unit: "per_million_tokens",
            },
            maxTokens: 128000,
          },
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockOpenAIFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue(mockExistingModels);

      // Act
      const result = await service.syncWithProvider("openai");

      // Assert
      expect(result.newModels).toHaveLength(0);
      expect(result.updatedModels).toHaveLength(1);
      expect(result.updatedModels[0]?.updated.pricing?.input).toBe("3.00");
      expect(result.archivedModels).toHaveLength(0);
    });

    it("should detect missing models", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [];

      const mockExistingModels = [
        {
          id: "existing-id",
          providerId: "openai",
          name: "GPT-4o",
          enabled: true,
          config: {
            modelId: "gpt-4o",
            pricing: {
              input: "2.50",
              output: "10.00",
              unit: "per_million_tokens",
            },
          },
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockOpenAIFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue(mockExistingModels);

      // Act
      const result = await service.syncWithProvider("openai");

      // Assert
      expect(result.newModels).toHaveLength(0);
      expect(result.updatedModels).toHaveLength(0);
      expect(result.archivedModels).toHaveLength(1);
      expect(result.archivedModels[0]?.modelId).toBe("gpt-4o");
    });

    it("should detect archived models (implicit deprecation)", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [];

      const mockExistingModels = [
        {
          id: "existing-id",
          providerId: "openai",
          name: "GPT-4o",
          enabled: true,
          status: "active" as const,
          config: {
            modelId: "gpt-4o",
            pricing: {
              input: "2.50",
              output: "10.00",
              unit: "per_million_tokens",
            },
          },
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockOpenAIFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue(mockExistingModels);

      // Act
      const result = await service.syncWithProvider("openai");

      // Assert
      expect(result.newModels).toHaveLength(0);
      expect(result.updatedModels).toHaveLength(0);
      expect(result.archivedModels).toHaveLength(1);
      expect(result.archivedModels[0]?.modelId).toBe("gpt-4o");
      expect(result.archivedModels[0]?.status).toBe("archived");
    });

    it("should detect explicit deprecation in updated models", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [
        {
          modelId: "gpt-4o",
          name: "GPT-4o",
          displayName: "GPT 4o",
          maxTokens: 128000,
          pricing: {
            input: "2.50",
            output: "10.00",
            unit: "per_million_tokens",
          },
          status: "archived", // Explicitly deprecated by provider
        },
      ];

      const mockExistingModels = [
        {
          id: "existing-id",
          providerId: "openai",
          name: "GPT-4o",
          enabled: true,
          status: "active" as const,
          config: {
            modelId: "gpt-4o",
            pricing: {
              input: "2.50",
              output: "10.00",
              unit: "per_million_tokens",
            },
            maxTokens: 128000,
          },
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockOpenAIFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue(mockExistingModels);

      // Act
      const result = await service.syncWithProvider("openai");

      // Assert
      expect(result.newModels).toHaveLength(0);
      expect(result.updatedModels).toHaveLength(1);
      expect(result.updatedModels[0]?.updated.status).toBe("archived");
      expect(result.updatedModels[0]?.existing.status).toBe("active");
      expect(result.archivedModels).toHaveLength(0);
    });

    it("should not archive models that are already archived", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [];

      const mockExistingModels = [
        {
          id: "existing-id",
          providerId: "openai",
          name: "GPT-4o",
          enabled: true,
          status: "archived" as const, // Already archived
          config: {
            modelId: "gpt-4o",
            pricing: {
              input: "2.50",
              output: "10.00",
              unit: "per_million_tokens",
            },
          },
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockOpenAIFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue(mockExistingModels);

      // Act
      const result = await service.syncWithProvider("openai");

      // Assert
      expect(result.newModels).toHaveLength(0);
      expect(result.updatedModels).toHaveLength(0);
      expect(result.archivedModels).toHaveLength(0); // Should not include already archived models
    });

    it("should throw error for unsupported provider", async () => {
      // Act & Assert
      await expect(
        service.syncWithProvider("unsupported" as any),
      ).rejects.toThrow("Unsupported provider: unsupported");
    });

    it("should sync Google models successfully", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [
        {
          modelId: "gemini-2.5-pro",
          name: "Gemini 2.5 Pro",
          displayName: "Gemini 2.5 Pro",
          maxTokens: 1000000,
          pricing: {
            input: "1.25",
            output: "10.00",
            unit: "per_million_tokens",
          },
        },
      ];

      mockGoogleFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue([]);

      // Act
      const result = await service.syncWithProvider("google");

      // Assert
      expect(result.providerId).toBe("google");
      expect(result.newModels).toHaveLength(1);
      expect(result.newModels[0]).toEqual(mockFreshModels[0]);
    });

    it("should sync Anthropic models successfully", async () => {
      // Arrange
      const mockFreshModels: NormalizedModel[] = [
        {
          modelId: "claude-3-5-sonnet-20240620",
          name: "Claude 3.5 Sonnet",
          displayName: "Claude 3.5 Sonnet",
          maxTokens: 200000,
          pricing: {
            input: "3.00",
            output: "15.00",
            unit: "per_million_tokens",
          },
        },
      ];

      mockAnthropicFetchModels.mockResolvedValue(mockFreshModels);
      mockDbWhere.mockResolvedValue([]);

      // Act
      const result = await service.syncWithProvider("anthropic");

      // Assert
      expect(result.providerId).toBe("anthropic");
      expect(result.newModels).toHaveLength(1);
      expect(result.newModels[0]).toEqual(mockFreshModels[0]);
    });
  });
});
