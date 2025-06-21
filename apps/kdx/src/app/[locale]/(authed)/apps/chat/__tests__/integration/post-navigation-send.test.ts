/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("Post-Navigation Send - Novo Fluxo", () => {
  beforeEach(() => {
    // Limpar sessionStorage antes de cada teste
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("pending-message-")) {
        sessionStorage.removeItem(key);
      }
    });
  });

  afterEach(() => {
    // Limpar sessionStorage após cada teste
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("pending-message-")) {
        sessionStorage.removeItem(key);
      }
    });
  });

  describe("🔄 FASE 3 - DIA 12: Envio Pós-Navegação", () => {
    it("deve salvar mensagem temporária no sessionStorage", () => {
      const testMessage = "Olá, esta é uma mensagem de teste";
      const tempSessionId = `temp-${Date.now()}`;

      // Simular salvamento da mensagem
      sessionStorage.setItem(`pending-message-${tempSessionId}`, testMessage);

      // Verificar se foi salva
      const savedMessage = sessionStorage.getItem(
        `pending-message-${tempSessionId}`,
      );
      expect(savedMessage).toBe(testMessage);
    });

    it("deve transferir mensagem de temp para sessão real", () => {
      const testMessage = "Mensagem para transferir";
      const tempSessionId = `temp-12345`;
      const realSessionId = "real-session-67890";

      // Salvar mensagem temporária
      sessionStorage.setItem(`pending-message-${tempSessionId}`, testMessage);

      // Simular transferência
      const pendingMessage = sessionStorage.getItem(
        `pending-message-${tempSessionId}`,
      );
      if (pendingMessage) {
        sessionStorage.setItem(
          `pending-message-${realSessionId}`,
          pendingMessage,
        );
        sessionStorage.removeItem(`pending-message-${tempSessionId}`);
      }

      // Verificar transferência
      expect(
        sessionStorage.getItem(`pending-message-${tempSessionId}`),
      ).toBeNull();
      expect(sessionStorage.getItem(`pending-message-${realSessionId}`)).toBe(
        testMessage,
      );
    });

    it("deve detectar múltiplas mensagens temporárias", () => {
      const messages = [
        { id: "temp-1", message: "Primeira mensagem" },
        { id: "temp-2", message: "Segunda mensagem" },
        { id: "temp-3", message: "Terceira mensagem" },
      ];

      // Salvar múltiplas mensagens
      messages.forEach(({ id, message }) => {
        sessionStorage.setItem(`pending-message-${id}`, message);
      });

      // Simular detecção de mensagens temporárias
      const tempKeys = Object.keys(sessionStorage).filter((key) =>
        key.startsWith("pending-message-temp-"),
      );

      expect(tempKeys.length).toBe(3);
    });
  });

  describe("🎯 Integração com ChatWindow", () => {
    it("deve detectar condições para envio pós-navegação", () => {
      const sessionId = "test-session-123";
      const pendingMessage = "Mensagem pendente para envio";
      const isUsingNewFlow = true;
      const messagesLength = 0;
      const isLoading = false;

      // Salvar mensagem pendente
      sessionStorage.setItem(`pending-message-${sessionId}`, pendingMessage);

      // Simular condições do ChatWindow
      const hasSessionId = Boolean(sessionId);
      const hasPendingMessage = Boolean(
        sessionStorage.getItem(`pending-message-${sessionId}`),
      );
      const isNewFlow = Boolean(isUsingNewFlow);
      const hasNoMessages = messagesLength === 0;
      const isNotLoading = !isLoading;

      const shouldSendMessage =
        hasSessionId &&
        hasPendingMessage &&
        isNewFlow &&
        hasNoMessages &&
        isNotLoading;

      expect(shouldSendMessage).toBe(true);
    });

    it("não deve enviar se não estiver usando novo fluxo", () => {
      const sessionId = "test-session-456";
      const pendingMessage = "Mensagem pendente";
      const isUsingNewFlow = false; // Fluxo antigo
      const messagesLength = 0;
      const isLoading = false;

      sessionStorage.setItem(`pending-message-${sessionId}`, pendingMessage);

      const hasSessionId = Boolean(sessionId);
      const hasPendingMessage = Boolean(
        sessionStorage.getItem(`pending-message-${sessionId}`),
      );
      const isNewFlow = Boolean(isUsingNewFlow);
      const hasNoMessages = messagesLength === 0;
      const isNotLoading = !isLoading;

      const shouldSendMessage =
        hasSessionId &&
        hasPendingMessage &&
        isNewFlow &&
        hasNoMessages &&
        isNotLoading;

      expect(shouldSendMessage).toBe(false);
    });

    it("não deve enviar se já existirem mensagens", () => {
      const sessionId = "test-session-789";
      const pendingMessage = "Mensagem pendente";
      const isUsingNewFlow = true;
      const messagesLength = 2; // Já tem mensagens
      const isLoading = false;

      sessionStorage.setItem(`pending-message-${sessionId}`, pendingMessage);

      const hasSessionId = Boolean(sessionId);
      const hasPendingMessage = Boolean(
        sessionStorage.getItem(`pending-message-${sessionId}`),
      );
      const isNewFlow = Boolean(isUsingNewFlow);
      const hasNoMessages = messagesLength === 0;
      const isNotLoading = !isLoading;

      const shouldSendMessage =
        hasSessionId &&
        hasPendingMessage &&
        isNewFlow &&
        hasNoMessages &&
        isNotLoading;

      expect(shouldSendMessage).toBe(false);
    });
  });

  describe("🔧 Casos Edge", () => {
    it("deve lidar com mensagens vazias", () => {
      const sessionId = "test-empty";

      // Salvar mensagem vazia
      sessionStorage.setItem(`pending-message-${sessionId}`, "");

      const pendingMessage = sessionStorage.getItem(
        `pending-message-${sessionId}`,
      );
      const shouldProcess = pendingMessage && pendingMessage.trim().length > 0;

      expect(shouldProcess).toBe(false);
    });

    it("deve lidar com chaves malformadas", () => {
      const malformedKeys = [
        "pending-message-",
        "pending-message",
        "pending-message-temp-",
        "not-pending-message-temp-123",
      ];

      malformedKeys.forEach((key) => {
        sessionStorage.setItem(key, "test");
      });

      const validTempKeys = Object.keys(sessionStorage).filter(
        (key) =>
          key.startsWith("pending-message-temp-") &&
          key.length > "pending-message-temp-".length,
      );

      expect(validTempKeys.length).toBe(0);
    });
  });
});
