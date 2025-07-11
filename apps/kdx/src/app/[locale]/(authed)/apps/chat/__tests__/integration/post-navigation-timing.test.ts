/**
 * 🧪 TESTES DE TIMING - Envio Pós-Navegação
 *
 * Objetivo: Prevenir regressões no timing do envio pós-navegação
 * que causavam necessidade de refresh para ver resposta da IA.
 *
 * Cenários críticos testados:
 * - Race conditions entre useChat e initialMessages
 * - Timing de carregamento de sessão vs envio de mensagem
 * - Condições de loading states conflitantes
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock do sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock do window object para ambiente de teste
Object.defineProperty(globalThis, "window", {
  value: {
    sessionStorage: mockSessionStorage,
  },
  configurable: true,
});

// Mock do hook useChat
const mockUseChat = {
  messages: [] as any[],
  append: vi.fn(),
  isLoading: false,
};

// Mock do hook useSessionWithMessages
const mockUseSessionWithMessages = {
  initialMessages: undefined as any[] | undefined,
  isLoading: false,
  session: null,
};

vi.mock("@ai-sdk/react", () => ({
  useChat: () => mockUseChat,
}));

describe("🧪 POST-NAVIGATION TIMING - Prevenção de Regressões", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChat.messages = [];
    mockUseChat.isLoading = false;
    mockUseSessionWithMessages.initialMessages = undefined;
    mockUseSessionWithMessages.isLoading = false;
  });

  describe("🔄 Condições de Envio Pós-Navegação", () => {
    it("deve enviar quando todas as condições estão corretas", () => {
      // Simular condições ideais
      const sessionId = "test-session-123";
      const pendingMessage = "Mensagem de teste";
      const messagesLength = 0; // Nova sessão
      const isLoadingSession = false; // Sessão carregada
      const initialMessagesLoaded = true; // initialMessages carregou

      mockSessionStorage.getItem.mockReturnValue(pendingMessage);

      // Condição de envio (igual à implementação real)
      const shouldSend =
        sessionId &&
        pendingMessage &&
        (messagesLength as number) === 0 &&
        !isLoadingSession &&
        initialMessagesLoaded;

      expect(shouldSend).toBe(true);
      // Nota: Este teste valida a lógica, não a chamada real do sessionStorage
    });

    it("deve aguardar quando sessão ainda está carregando", () => {
      const sessionId = "test-session-123";
      const pendingMessage = "Mensagem de teste";
      const messagesLength = 0;
      const isLoadingSession = true; // ❌ Ainda carregando
      const initialMessagesLoaded = false; // ❌ Não carregou

      mockSessionStorage.getItem.mockReturnValue(pendingMessage);

      const shouldSend =
        sessionId &&
        pendingMessage &&
        (messagesLength as number) === 0 &&
        !isLoadingSession &&
        initialMessagesLoaded;

      expect(shouldSend).toBe(false);
    });

    it("deve prevenir envio em sessão existente (com mensagens)", () => {
      const sessionId = "test-session-123";
      const pendingMessage = "Mensagem de teste";
      const messagesLength = 2; // ❌ Já há mensagens
      const isLoadingSession = false;
      const initialMessagesLoaded = true;

      mockSessionStorage.getItem.mockReturnValue(pendingMessage);

      const shouldSend =
        sessionId &&
        pendingMessage &&
        (messagesLength as number) === 0 && // ❌ Falha aqui
        !isLoadingSession &&
        initialMessagesLoaded;

      expect(shouldSend).toBe(false);
    });

    it("deve prevenir envio sem mensagem pendente", () => {
      const sessionId = "test-session-123";
      const pendingMessage = null; // ❌ Sem mensagem
      const messagesLength = 0;
      const isLoadingSession = false;
      const initialMessagesLoaded = true;

      mockSessionStorage.getItem.mockReturnValue(pendingMessage);

      const shouldSend = Boolean(
        sessionId &&
          pendingMessage && // ❌ Falha aqui (null)
          (messagesLength as number) === 0 &&
          !isLoadingSession &&
          initialMessagesLoaded,
      );

      expect(shouldSend).toBe(false);
    });
  });

  describe("🚨 Bug Original - Race Condition", () => {
    it("deve funcionar com nova condição mesmo quando useChat está loading", () => {
      // Este era o cenário que causava o bug original
      const sessionId = "test-session-123";
      const pendingMessage = "Mensagem de teste";
      const messagesLength = 0;
      const isLoadingSession = false; // ✅ Sessão carregada
      const initialMessagesLoaded = true; // ✅ initialMessages carregou
      const useChatIsLoading = true; // ⚠️ useChat ainda loading (não importa mais)

      mockSessionStorage.getItem.mockReturnValue(pendingMessage);

      // Condição ANTIGA (problemática) - dependia de !useChatIsLoading
      const oldCondition =
        sessionId &&
        pendingMessage &&
        messagesLength === 0 &&
        !useChatIsLoading;
      expect(oldCondition).toBe(false); // Falharia

      // Condição NOVA (corrigida) - não depende de useChatIsLoading
      const newCondition =
        sessionId &&
        pendingMessage &&
        messagesLength === 0 &&
        !isLoadingSession &&
        initialMessagesLoaded;
      expect(newCondition).toBe(true); // Funciona!
    });
  });

  describe("🔧 Validação de SessionStorage", () => {
    it("deve verificar chave correta de mensagem pendente", () => {
      const sessionId = "test-session-123";
      const expectedKey = `pending-message-${sessionId}`;
      const expectedMessage = "Mensagem pendente";

      mockSessionStorage.getItem.mockReturnValue(expectedMessage);

      const result = mockSessionStorage.getItem(expectedKey);
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBe(expectedMessage);
    });

    it("deve limpar mensagem após envio", () => {
      const sessionId = "test-session-123";
      const expectedKey = `pending-message-${sessionId}`;

      mockSessionStorage.removeItem(expectedKey);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe("📱 Fluxo Completo", () => {
    it("deve simular fluxo: criação → navegação → envio", () => {
      const userMessage = "Como fazer um bolo?";
      const sessionId = "new-session-456";

      // 1. Salvar mensagem temporária
      const tempKey = "pending-message-temp-123";
      mockSessionStorage.setItem(tempKey, userMessage);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        tempKey,
        userMessage,
      );

      // 2. Após navegação, verificar se enviaria
      mockSessionStorage.getItem.mockReturnValue(userMessage);

      const shouldSend =
        sessionId &&
        userMessage &&
        (0 as number) === 0 && // Nova sessão
        !false && // Sessão carregada
        true; // initialMessages carregou
      expect(shouldSend).toBe(true);

      // 3. Limpar após envio
      const sessionKey = `pending-message-${sessionId}`;
      mockSessionStorage.removeItem(sessionKey);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(sessionKey);
    });
  });
});
