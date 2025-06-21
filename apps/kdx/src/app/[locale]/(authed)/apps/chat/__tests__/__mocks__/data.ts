// Mock data for Chat SubApp tests

export const mockChatSession = {
  id: "session-123",
  title: "Test Conversation",
  modelId: "gpt-4",
  teamId: "team-123",
  userId: "user-123",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:30:00Z"),
  isArchived: false,
  folderId: null,
};

export const mockChatMessage = {
  id: "msg-123",
  content: "Hello, AI!",
  senderRole: "user" as const,
  chatSessionId: "session-123",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  status: "ok" as const,
  metadata: {
    tokens: 10,
    model: "gpt-4",
    providerId: "openai",
  },
};

export const mockAIMessage = {
  id: "msg-124",
  content: "Hello! How can I help you today?",
  senderRole: "ai" as const,
  chatSessionId: "session-123",
  createdAt: new Date("2024-01-01T10:00:05Z"),
  status: "ok" as const,
  metadata: {
    tokens: 15,
    model: "gpt-4",
    providerId: "openai",
    finishReason: "stop",
  },
};

export const mockChatFolder = {
  id: "folder-123",
  name: "Work Projects",
  teamId: "team-123",
  userId: "user-123",
  createdAt: new Date("2024-01-01T09:00:00Z"),
  isDefault: false,
};

export const mockAIModel = {
  id: "gpt-4",
  name: "GPT-4",
  providerId: "openai",
  enabled: true,
  description: "Most capable GPT-4 model",
  maxTokens: 8192,
  supportsStreaming: true,
  capabilities: ["text", "code", "analysis"],
  teamId: "team-123",
};

export const mockAIProvider = {
  id: "openai",
  name: "OpenAI",
  baseUrl: "https://api.openai.com/v1",
  enabled: true,
  models: ["gpt-4", "gpt-3.5-turbo"],
};

export const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  activeTeamId: "team-123",
  createdAt: new Date("2024-01-01T00:00:00Z"),
};

export const mockTeam = {
  id: "team-123",
  name: "Test Team",
  ownerId: "user-123",
  createdAt: new Date("2024-01-01T00:00:00Z"),
};

export const mockSession = {
  id: "auth-session-123",
  userId: "user-123",
  expires: new Date(Date.now() + 86400000), // 24h from now
  sessionToken: "session-token-123",
};

export const mockChatConfig = {
  defaultModel: "gpt-4",
  streamingEnabled: true,
  autoSaveInterval: 5000,
  maxTokens: 4000,
  temperature: 0.7,
  showTokenUsage: true,
  enableMarkdown: true,
};

export const mockUserConfig = {
  theme: "dark",
  fontSize: 14,
  shortcuts: {
    newSession: "cmd+n",
    send: "cmd+enter",
    clear: "cmd+k",
  },
  sidebarCollapsed: false,
  showWelcomeMessage: true,
};

export const mockTokenUsage = {
  sessionId: "session-123",
  totalTokens: 150,
  promptTokens: 50,
  completionTokens: 100,
  cost: 0.003,
  model: "gpt-4",
};

export const mockStreamChunk = {
  id: "chunk-123",
  content: "Hello",
  delta: " world",
  finished: false,
  metadata: {
    model: "gpt-4",
    tokens: 2,
  },
};

// Factory functions for creating test data
export const createMockSession = (
  overrides?: Partial<typeof mockChatSession>,
) => ({
  ...mockChatSession,
  ...overrides,
});

export const createMockMessage = (
  overrides?: Partial<typeof mockChatMessage>,
) => ({
  ...mockChatMessage,
  ...overrides,
});

export const createMockModel = (overrides?: Partial<typeof mockAIModel>) => ({
  ...mockAIModel,
  ...overrides,
});

export const createMockUser = (overrides?: Partial<typeof mockUser>) => ({
  ...mockUser,
  ...overrides,
});

export const createMockTeam = (overrides?: Partial<typeof mockTeam>) => ({
  ...mockTeam,
  ...overrides,
});

// Collections for testing pagination and lists
export const mockChatSessions = [
  createMockSession({ id: "session-1", title: "First Conversation" }),
  createMockSession({ id: "session-2", title: "Second Conversation" }),
  createMockSession({ id: "session-3", title: "Third Conversation" }),
];

export const mockChatMessages = [
  createMockMessage({ id: "msg-1", content: "First message" }),
  mockAIMessage,
  createMockMessage({ id: "msg-3", content: "Follow-up question" }),
];

export const mockAIModels = [
  createMockModel({ id: "gpt-4", name: "GPT-4", teamId: "team-123" }),
  createMockModel({
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    enabled: false,
    teamId: "team-123",
  }),
  createMockModel({
    id: "claude-3",
    name: "Claude 3",
    providerId: "anthropic",
    teamId: "team-123",
  }),
];

// API Response mocks
export const mockApiResponse = {
  sessions: {
    data: mockChatSessions,
    total: 3,
    hasMore: false,
  },
  messages: {
    data: mockChatMessages,
    total: 3,
    hasMore: false,
  },
  models: {
    data: mockAIModels.filter((m) => m.enabled),
    total: 2,
  },
};

// Error mocks
export const mockApiError = {
  code: "INTERNAL_SERVER_ERROR",
  message: "Something went wrong",
  data: {
    code: "TRPC_ERROR",
    httpStatus: 500,
  },
};

export const mockNotFoundError = {
  code: "NOT_FOUND",
  message: "Resource not found",
  data: {
    code: "TRPC_ERROR",
    httpStatus: 404,
  },
};

export const mockUnauthorizedError = {
  code: "UNAUTHORIZED",
  message: "Unauthorized access",
  data: {
    code: "TRPC_ERROR",
    httpStatus: 401,
  },
};
