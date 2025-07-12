import { vi } from "vitest";

import { mockAIModel, mockAIModels, mockApiError } from "./data";

// Mock do AiStudioService
export const mockAiStudioService = {
  getAvailableModels: vi
    .fn()
    .mockResolvedValue(mockAIModels.filter((m) => m.enabled)),

  getModelById: vi.fn().mockImplementation((params) => {
    const model = mockAIModels.find((m) => m.id === params.modelId);
    if (!model) {
      return Promise.reject(new Error("Model not found"));
    }
    if (model.teamId && model.teamId !== params.teamId) {
      return Promise.reject(new Error("Model not found or access denied"));
    }
    return Promise.resolve(model);
  }),

  getDefaultModel: vi.fn().mockResolvedValue({
    model: mockAIModel,
    config: {
      temperature: 0.7,
      maxTokens: 4000,
    },
  }),

  getProviderToken: vi.fn().mockImplementation((params) => {
    if (params.providerId === "invalid-provider") {
      return Promise.reject(new Error("Provider not found"));
    }
    return Promise.resolve("sk-test-token-encrypted");
  }),

  validateModelAccess: vi.fn().mockImplementation((params) => {
    const model = mockAIModels.find((m) => m.id === params.modelId);
    return Promise.resolve(!!model && model.enabled);
  }),
};

// Mock do ChatService
export const mockChatService = {
  createSession: vi.fn().mockImplementation((data) => ({
    id: "session-" + Date.now(),
    ...data,
    userId: "user-123",
    teamId: "team-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  })),

  createMessage: vi.fn().mockImplementation((data) => ({
    id: "msg-" + Date.now(),
    ...data,
    createdAt: new Date(),
    status: "ok",
  })),

  updateMessage: vi.fn().mockImplementation((id, data) => ({
    id,
    ...data,
    updatedAt: new Date(),
  })),

  getSessionById: vi.fn().mockImplementation((sessionId) => {
    if (sessionId === "invalid-session") {
      return Promise.reject(new Error("Session not found"));
    }
    return Promise.resolve({
      id: sessionId,
      title: "Test Session",
      modelId: "gpt-4",
      teamId: "team-123",
      userId: "user-123",
    });
  }),

  getMessagesBySession: vi.fn().mockResolvedValue({
    messages: [],
    total: 0,
    hasMore: false,
  }),

  deleteSession: vi.fn().mockResolvedValue(true),
  archiveSession: vi.fn().mockResolvedValue(true),
};

// Mock do VercelAIAdapter
export const mockVercelAIAdapter = {
  streamAndSave: vi.fn().mockImplementation(async (params, onSave) => {
    // Simulate streaming chunks
    const chunks = ["Hello", " world", "!"];
    let fullContent = "";

    for (const chunk of chunks) {
      fullContent += chunk;
      // Simulate async streaming
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Call the onSave callback
    if (onSave) {
      await onSave(fullContent, {
        model: params.modelId,
        tokens: 15,
        finishReason: "stop",
      });
    }

    return {
      content: fullContent,
      metadata: {
        model: params.modelId,
        tokens: 15,
        finishReason: "stop",
      },
    };
  }),

  validateModelSupport: vi.fn().mockResolvedValue(true),
  getModelCapabilities: vi.fn().mockResolvedValue(["text", "code"]),
};

// Mock do NotificationService (se existir)
export const mockNotificationService = {
  sendCriticalTaskAlert: vi.fn().mockResolvedValue(true),
  sendSessionSummary: vi.fn().mockResolvedValue(true),
};

// Mock do AppActivityLogsService
export const mockAppActivityLogsService = {
  logChatActivity: vi.fn().mockResolvedValue(true),
  logModelUsage: vi.fn().mockResolvedValue(true),
  logError: vi.fn().mockResolvedValue(true),
};

// Mock com falhas para testes de erro
export const mockAiStudioServiceWithErrors = {
  ...mockAiStudioService,
  getAvailableModels: vi.fn().mockRejectedValue(mockApiError),
  getModelById: vi.fn().mockRejectedValue(new Error("Service unavailable")),
  getDefaultModel: vi.fn().mockRejectedValue(new Error("No default model")),
};

export const mockChatServiceWithErrors = {
  ...mockChatService,
  createSession: vi
    .fn()
    .mockRejectedValue(new Error("Failed to create session")),
  createMessage: vi.fn().mockRejectedValue(new Error("Failed to save message")),
  getSessionById: vi.fn().mockRejectedValue(new Error("Session not found")),
};

// Utility para aplicar mocks globalmente
export const applyServiceMocks = () => {
  vi.mock("@kdx/api/internal/services/ai-studio.service", () => ({
    AiStudioService: mockAiStudioService,
  }));

  vi.mock("@kdx/api/internal/services/chat.service", () => ({
    ChatService: mockChatService,
  }));

  vi.mock("@kdx/api/internal/adapters/vercel-ai-adapter", () => ({
    VercelAIAdapter: class {
      static streamAndSave = mockVercelAIAdapter.streamAndSave;
      static validateModelSupport = mockVercelAIAdapter.validateModelSupport;
      static getModelCapabilities = mockVercelAIAdapter.getModelCapabilities;
    },
  }));
};

// Utility para aplicar mocks com erros
export const applyServiceMocksWithErrors = () => {
  vi.mock("@kdx/api/internal/services/ai-studio.service", () => ({
    AiStudioService: mockAiStudioServiceWithErrors,
  }));

  vi.mock("@kdx/api/internal/services/chat.service", () => ({
    ChatService: mockChatServiceWithErrors,
  }));
};

// Utility para resetar todos os mocks
export const resetAllServiceMocks = () => {
  Object.values(mockAiStudioService).forEach((mock) => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockChatService).forEach((mock) => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockVercelAIAdapter).forEach((mock) => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};
