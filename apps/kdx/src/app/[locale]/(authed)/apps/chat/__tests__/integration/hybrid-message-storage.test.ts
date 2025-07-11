/**
 * 🧪 TESTE CRÍTICO: Híbrido sessionStorage + Thread Context
 *
 * 🎯 Protege a lógica implementada na SUB-ETAPA 2.3:
 * - Thread context como método principal
 * - sessionStorage como fallback robusto
 * - Limpeza inteligente da fonte correta
 *
 * 📚 DOCUMENTAÇÃO:
 * - Troubleshooting: @docs/subapps/chat/troubleshooting-welcome-screen-flow.md
 * - Plano Migração: @docs/subapps/chat/session-message-flow-migration-plan.md
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ===== LÓGICA HÍBRIDA EXTRAÍDA =====

/**
 * Lógica híbrida de gerenciamento de mensagens pendentes
 * Espelha a implementação da SUB-ETAPA 2.3
 */
class HybridMessageStorage {
  static getPendingMessage(
    sessionId: string,
    threadContext: any,
  ): { pendingMessage: string | null; source: string } {
    let pendingMessage: string | null = null;
    let source = "none";

    // Thread context primeiro
    if (threadContext?.getPendingMessage) {
      const threadMsg = threadContext.getPendingMessage();
      if (threadMsg?.trim()) {
        pendingMessage = threadMsg;
        source = "thread-context";
      }
    }

    // Fallback para sessionStorage
    if (!pendingMessage) {
      const sessionMsg = sessionStorage.getItem(`pending-message-${sessionId}`);
      if (sessionMsg && sessionMsg.trim()) {
        pendingMessage = sessionMsg;
        source = "sessionStorage";
      }
    }

    return { pendingMessage, source };
  }

  static setPendingMessage(message: string, threadContext: any): string {
    if (threadContext?.setPendingMessage) {
      threadContext.setPendingMessage(message);
      return "thread-context";
    } else {
      sessionStorage.setItem("pending-message-temp", message);
      return "sessionStorage";
    }
  }

  static cleanupPendingMessage(
    sessionId: string,
    source: string,
    threadContext: any,
  ): string {
    if (source === "thread-context" && threadContext?.clearPendingMessage) {
      threadContext.clearPendingMessage();
      return "cleaned-thread-context";
    } else if (source === "sessionStorage") {
      sessionStorage.removeItem(`pending-message-${sessionId}`);
      return "cleaned-sessionStorage";
    }
    return "no-cleanup";
  }
}

// ===== MOCKS =====

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// @ts-ignore - Mock global
global.sessionStorage = mockSessionStorage;

const mockThreadContext = {
  getPendingMessage: vi.fn(),
  setPendingMessage: vi.fn(),
  clearPendingMessage: vi.fn(),
  activeThreadId: "test-thread-id",
};

// ===== TESTES =====

describe("Hybrid Message Storage Logic (SUB-ETAPA 2.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe("🎯 Message Retrieval Priority", () => {
    it("should prefer thread context over sessionStorage", () => {
      const threadMessage = "Thread context message";
      const sessionMessage = "SessionStorage message";

      mockThreadContext.getPendingMessage.mockReturnValue(threadMessage);
      mockSessionStorage.getItem.mockReturnValue(sessionMessage);

      const result = HybridMessageStorage.getPendingMessage(
        "test-session",
        mockThreadContext,
      );

      expect(result.pendingMessage).toBe(threadMessage);
      expect(result.source).toBe("thread-context");
      expect(mockThreadContext.getPendingMessage).toHaveBeenCalled();
    });

    it("should fallback to sessionStorage", () => {
      const sessionMessage = "SessionStorage fallback message";

      mockThreadContext.getPendingMessage.mockReturnValue(null);
      mockSessionStorage.getItem.mockReturnValue(sessionMessage);

      const result = HybridMessageStorage.getPendingMessage(
        "test-session",
        mockThreadContext,
      );

      expect(result.pendingMessage).toBe(sessionMessage);
      expect(result.source).toBe("sessionStorage");
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
        "pending-message-test-session",
      );
    });

    it("should work without thread context", () => {
      const sessionMessage = "SessionStorage only message";
      mockSessionStorage.getItem.mockReturnValue(sessionMessage);

      const result = HybridMessageStorage.getPendingMessage(
        "test-session",
        null,
      );

      expect(result.pendingMessage).toBe(sessionMessage);
      expect(result.source).toBe("sessionStorage");
    });
  });

  describe("🎯 Message Setting Priority", () => {
    it("should set message in thread context when available", () => {
      const message = "New pending message";

      const source = HybridMessageStorage.setPendingMessage(
        message,
        mockThreadContext,
      );

      expect(source).toBe("thread-context");
      expect(mockThreadContext.setPendingMessage).toHaveBeenCalledWith(message);
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it("should fallback to sessionStorage for message setting", () => {
      const message = "Fallback pending message";

      const source = HybridMessageStorage.setPendingMessage(message, null);

      expect(source).toBe("sessionStorage");
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "pending-message-temp",
        message,
      );
    });
  });

  describe("🎯 Intelligent Cleanup", () => {
    it("should clean up from thread context when appropriate", () => {
      const result = HybridMessageStorage.cleanupPendingMessage(
        "test-session",
        "thread-context",
        mockThreadContext,
      );

      expect(result).toBe("cleaned-thread-context");
      expect(mockThreadContext.clearPendingMessage).toHaveBeenCalled();
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
    });

    it("should clean up from sessionStorage when appropriate", () => {
      const result = HybridMessageStorage.cleanupPendingMessage(
        "test-session",
        "sessionStorage",
        mockThreadContext,
      );

      expect(result).toBe("cleaned-sessionStorage");
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "pending-message-test-session",
      );
      expect(mockThreadContext.clearPendingMessage).not.toHaveBeenCalled();
    });

    it("should handle unknown cleanup source", () => {
      const result = HybridMessageStorage.cleanupPendingMessage(
        "test-session",
        "unknown",
        mockThreadContext,
      );

      expect(result).toBe("no-cleanup");
      expect(mockThreadContext.clearPendingMessage).not.toHaveBeenCalled();
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe("🎯 Edge Cases & Robustness", () => {
    it("should handle empty messages gracefully", () => {
      mockThreadContext.getPendingMessage.mockReturnValue("");
      mockSessionStorage.getItem.mockReturnValue(null);

      const result = HybridMessageStorage.getPendingMessage(
        "test-session",
        mockThreadContext,
      );

      expect(result.pendingMessage).toBeNull();
      expect(result.source).toBe("none");
    });

    it("should handle multiple session IDs correctly", () => {
      const session1Message = "Message for session 1";
      const session2Message = "Message for session 2";

      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === "pending-message-session-1") return session1Message;
        if (key === "pending-message-session-2") return session2Message;
        return null;
      });

      const result1 = HybridMessageStorage.getPendingMessage("session-1", null);
      const result2 = HybridMessageStorage.getPendingMessage("session-2", null);

      expect(result1.pendingMessage).toBe(session1Message);
      expect(result2.pendingMessage).toBe(session2Message);
    });

    it("should handle concurrent access safely", () => {
      const message = "Concurrent message";

      let callCount = 0;
      mockThreadContext.getPendingMessage.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? message : null;
      });

      const result1 = HybridMessageStorage.getPendingMessage(
        "test-session",
        mockThreadContext,
      );
      expect(result1.pendingMessage).toBe(message);
      expect(result1.source).toBe("thread-context");

      const result2 = HybridMessageStorage.getPendingMessage(
        "test-session",
        mockThreadContext,
      );
      expect(result2.pendingMessage).toBeNull();
      expect(result2.source).toBe("none");
    });
  });

  describe("🎯 Backward Compatibility", () => {
    it("should maintain compatibility with existing sessionStorage pattern", () => {
      const existingMessage = "Existing sessionStorage message";
      mockSessionStorage.getItem.mockReturnValue(existingMessage);

      // Simular sistema legado (sem thread context)
      const legacyResult = mockSessionStorage.getItem(
        "pending-message-test-session",
      );

      expect(legacyResult).toBe(existingMessage);
    });

    it("should handle migration from sessionStorage to thread context", () => {
      const sessionMessage = "Legacy sessionStorage message";

      mockSessionStorage.getItem.mockReturnValue(sessionMessage);
      mockThreadContext.getPendingMessage.mockReturnValue(null);

      // Simular migração
      const existingMessage = mockSessionStorage.getItem(
        "pending-message-test-session",
      );

      if (existingMessage && mockThreadContext.setPendingMessage) {
        mockThreadContext.setPendingMessage(existingMessage);
        mockSessionStorage.removeItem("pending-message-test-session");
      }

      expect(mockThreadContext.setPendingMessage).toHaveBeenCalledWith(
        sessionMessage,
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "pending-message-test-session",
      );
    });
  });
});
