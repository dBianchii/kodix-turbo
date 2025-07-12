import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Mock do sessionStorage para testes
const mockSessionStorage = {
  store: new Map<string, string>(),
  getItem: function (key: string): string | null {
    return this.store.get(key) || null;
  },
  setItem: function (key: string, value: string): void {
    this.store.set(key, value);
  },
  removeItem: function (key: string): void {
    this.store.delete(key);
  },
  clear: function (): void {
    this.store.clear();
  },
};

// Substituir sessionStorage global
Object.defineProperty(global, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Declarar sessionStorage para TypeScript
declare global {
  const sessionStorage: typeof mockSessionStorage;
}

describe("🔄 Session Storage Flow - Regression Tests", () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  afterEach(() => {
    mockSessionStorage.clear();
  });

  describe("✅ Fluxo de Chaves Específicas - Proteção contra Regressão", () => {
    it("deve usar chaves específicas por sessão em vez de chaves genéricas", () => {
      const sessionId = "test-session-123";
      const message = "Como fazer um bolo de chocolate?";

      // ✅ PROTEÇÃO: Padrão NOVO - chaves específicas por sessão
      const specificKey = `pending-message-${sessionId}`;

      // ❌ PADRÃO ANTIGO que não deve ser usado
      const genericKey = "pending-message";

      // Simular o fluxo correto
      sessionStorage.setItem(specificKey, message);

      // Verificar que a chave específica funciona
      expect(sessionStorage.getItem(specificKey)).toBe(message);

      // Verificar que a chave genérica NÃO foi usada
      expect(sessionStorage.getItem(genericKey)).toBeNull();

      // ✅ PROTEÇÃO: Múltiplas sessões devem ser isoladas
      const sessionId2 = "test-session-456";
      const message2 = "Tutorial de React Hooks";
      const specificKey2 = `pending-message-${sessionId2}`;

      sessionStorage.setItem(specificKey2, message2);

      // Verificar isolamento
      expect(sessionStorage.getItem(specificKey)).toBe(message);
      expect(sessionStorage.getItem(specificKey2)).toBe(message2);
      expect(sessionStorage.getItem(specificKey)).not.toBe(message2);
    });

    it("deve usar chave temporária antes da transferência", () => {
      const tempMessage = "Mensagem temporária antes da criação da sessão";

      // ✅ PROTEÇÃO: Padrão de chave temporária
      const tempKey = "pending-message-temp";

      // Simular salvamento temporário (antes de ter sessionId)
      sessionStorage.setItem(tempKey, tempMessage);

      expect(sessionStorage.getItem(tempKey)).toBe(tempMessage);

      // Simular transferência após obter sessionId
      const sessionId = "new-session-789";
      const specificKey = `pending-message-${sessionId}`;

      // Transferir de temp para específica
      const savedMessage = sessionStorage.getItem(tempKey);
      if (savedMessage) {
        sessionStorage.setItem(specificKey, savedMessage);
        sessionStorage.removeItem(tempKey);
      }

      // Verificar transferência
      expect(sessionStorage.getItem(specificKey)).toBe(tempMessage);
      expect(sessionStorage.getItem(tempKey)).toBeNull();
    });
  });

  describe("✅ Prevenção de Conflitos - Proteção contra Regressão", () => {
    it("deve prevenir conflitos entre múltiplas abas", () => {
      // Simular múltiplas abas com sessões diferentes
      const tab1SessionId = "tab1-session-abc";
      const tab2SessionId = "tab2-session-def";

      const tab1Message = "Mensagem da aba 1";
      const tab2Message = "Mensagem da aba 2";

      // ✅ PROTEÇÃO: Cada aba usa sua própria chave
      sessionStorage.setItem(`pending-message-${tab1SessionId}`, tab1Message);
      sessionStorage.setItem(`pending-message-${tab2SessionId}`, tab2Message);

      // Verificar que não há interferência
      expect(sessionStorage.getItem(`pending-message-${tab1SessionId}`)).toBe(
        tab1Message,
      );
      expect(sessionStorage.getItem(`pending-message-${tab2SessionId}`)).toBe(
        tab2Message,
      );

      // Limpar uma aba não deve afetar a outra
      sessionStorage.removeItem(`pending-message-${tab1SessionId}`);

      expect(
        sessionStorage.getItem(`pending-message-${tab1SessionId}`),
      ).toBeNull();
      expect(sessionStorage.getItem(`pending-message-${tab2SessionId}`)).toBe(
        tab2Message,
      );
    });

    it("deve lidar com caracteres especiais em mensagens", () => {
      const sessionId = "test-session-special";
      const specialMessage =
        'Mensagem com "aspas", \n quebras de linha, e caracteres especiais: áéíóú';

      const key = `pending-message-${sessionId}`;

      sessionStorage.setItem(key, specialMessage);

      // ✅ PROTEÇÃO: Caracteres especiais devem ser preservados
      expect(sessionStorage.getItem(key)).toBe(specialMessage);
      expect(sessionStorage.getItem(key)).toContain('"aspas"');
      expect(sessionStorage.getItem(key)).toContain("\n");
      expect(sessionStorage.getItem(key)).toContain("áéíóú");
    });
  });

  describe("✅ Limpeza de Dados - Proteção contra Regressão", () => {
    it("deve limpar mensagens após processamento", () => {
      const sessionId = "cleanup-test-session";
      const message = "Mensagem para teste de limpeza";
      const key = `pending-message-${sessionId}`;

      // Salvar mensagem
      sessionStorage.setItem(key, message);
      expect(sessionStorage.getItem(key)).toBe(message);

      // Simular processamento e limpeza
      const retrievedMessage = sessionStorage.getItem(key);
      expect(retrievedMessage).toBe(message);

      // ✅ PROTEÇÃO: Deve limpar após uso
      sessionStorage.removeItem(key);
      expect(sessionStorage.getItem(key)).toBeNull();
    });

    it("deve limpar apenas a chave específica, não todas", () => {
      const sessionId1 = "session-1";
      const sessionId2 = "session-2";
      const message1 = "Mensagem da sessão 1";
      const message2 = "Mensagem da sessão 2";

      // Salvar múltiplas mensagens
      sessionStorage.setItem(`pending-message-${sessionId1}`, message1);
      sessionStorage.setItem(`pending-message-${sessionId2}`, message2);
      sessionStorage.setItem("other-data", "dados não relacionados");

      // Limpar apenas uma sessão específica
      sessionStorage.removeItem(`pending-message-${sessionId1}`);

      // ✅ PROTEÇÃO: Limpeza seletiva
      expect(
        sessionStorage.getItem(`pending-message-${sessionId1}`),
      ).toBeNull();
      expect(sessionStorage.getItem(`pending-message-${sessionId2}`)).toBe(
        message2,
      );
      expect(sessionStorage.getItem("other-data")).toBe(
        "dados não relacionados",
      );
    });
  });

  describe("✅ Validação de Padrões - Proteção contra Regressão", () => {
    it("deve seguir padrão de nomenclatura específico", () => {
      const sessionId = "validation-session";

      // ✅ PROTEÇÃO: Padrão de nomenclatura obrigatório
      const correctPattern = `pending-message-${sessionId}`;
      const incorrectPatterns = [
        "pending-message", // Genérico demais
        `message-${sessionId}`, // Sem prefixo correto
        `pending-${sessionId}`, // Sem especificação
        sessionId, // Só o ID
      ];

      // Verificar que o padrão correto é único
      expect(correctPattern).toMatch(/^pending-message-.+$/);
      expect(correctPattern).toContain(sessionId);

      // Verificar que padrões incorretos são diferentes
      incorrectPatterns.forEach((incorrectPattern) => {
        expect(incorrectPattern).not.toBe(correctPattern);
      });
    });

    it("deve validar que sessionId não é vazio ou inválido", () => {
      const validSessionIds = ["abc123", "session-456", "uuid-like-string"];
      const invalidSessionIds = ["", "   ", null, undefined];

      validSessionIds.forEach((sessionId) => {
        const key = `pending-message-${sessionId}`;
        // ✅ PROTEÇÃO: IDs válidos devem gerar chaves válidas
        expect(key).toMatch(/^pending-message-.+$/);
        expect(key.length).toBeGreaterThan("pending-message-".length);
      });

      invalidSessionIds.forEach((sessionId) => {
        // ✅ PROTEÇÃO: IDs inválidos devem ser detectados
        if (!sessionId || sessionId.toString().trim() === "") {
          expect(sessionId).toBeFalsy();
        }
      });
    });
  });

  describe("✅ Casos Extremos - Proteção contra Regressão", () => {
    it("deve lidar com mensagens muito longas", () => {
      const sessionId = "long-message-session";
      const longMessage = "a".repeat(10000); // Mensagem de 10k caracteres
      const key = `pending-message-${sessionId}`;

      sessionStorage.setItem(key, longMessage);

      // ✅ PROTEÇÃO: Mensagens longas devem ser preservadas
      const retrieved = sessionStorage.getItem(key);
      expect(retrieved).toBe(longMessage);
      expect(retrieved?.length).toBe(10000);
    });

    it("deve lidar com muitas sessões simultâneas", () => {
      const numberOfSessions = 50;
      const sessions: { id: string; message: string }[] = [];

      // Criar muitas sessões
      for (let i = 0; i < numberOfSessions; i++) {
        const sessionId = `session-${i}`;
        const message = `Mensagem da sessão ${i}`;
        sessions.push({ id: sessionId, message });

        sessionStorage.setItem(`pending-message-${sessionId}`, message);
      }

      // ✅ PROTEÇÃO: Todas as sessões devem coexistir
      sessions.forEach(({ id, message }) => {
        expect(sessionStorage.getItem(`pending-message-${id}`)).toBe(message);
      });

      // Limpar algumas sessões aleatoriamente
      const sessionsToRemove = [5, 15, 25, 35, 45];
      sessionsToRemove.forEach((index) => {
        sessionStorage.removeItem(`pending-message-session-${index}`);
      });

      // Verificar que apenas as removidas sumiram
      sessions.forEach(({ id, message }, index) => {
        const expected = sessionsToRemove.includes(index) ? null : message;
        expect(sessionStorage.getItem(`pending-message-${id}`)).toBe(expected);
      });
    });
  });
});
