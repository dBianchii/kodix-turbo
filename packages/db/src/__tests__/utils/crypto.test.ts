import { beforeAll, describe, expect, it } from "vitest";

import { decryptToken, encryptToken } from "../../utils/crypto";

describe("Token Encryption/Decryption", () => {
  // Simular variável de ambiente para testes
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = "test-encryption-key-with-32-chars!!";
  });

  describe("encryptToken", () => {
    it("should encrypt a token successfully", () => {
      const token = "sk-test-token-12345";
      const encrypted = encryptToken(token);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(token);
      expect(encrypted.split(":")).toHaveLength(3); // IV:authTag:encrypted
    });

    it("should produce different encrypted values for the same token", () => {
      const token = "sk-test-token-12345";
      const encrypted1 = encryptToken(token);
      const encrypted2 = encryptToken(token);

      // Due to random IV, encrypted values should be different
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should handle empty string", () => {
      const token = "";
      const encrypted = encryptToken(token);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should handle special characters", () => {
      const token = "sk-test!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const encrypted = encryptToken(token);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(":")).toHaveLength(3);
    });
  });

  describe("decryptToken", () => {
    it("should decrypt a token successfully", () => {
      const originalToken = "sk-test-token-12345";
      const encrypted = encryptToken(originalToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(originalToken);
    });

    it("should throw error for invalid format", () => {
      expect(() => decryptToken("invalid-token")).toThrow(
        "Invalid encrypted token format",
      );
      expect(() => decryptToken("invalid:token")).toThrow(
        "Invalid encrypted token format",
      );
      expect(() => decryptToken("")).toThrow("Invalid encrypted token format");
    });

    it("should throw error for tampered token", () => {
      const originalToken = "sk-test-token-12345";
      const encrypted = encryptToken(originalToken);
      const parts = encrypted.split(":");

      // Tamper with the encrypted data
      const tamperedToken = parts[0] + ":" + parts[1] + ":" + "tampered-data";

      expect(() => decryptToken(tamperedToken)).toThrow();
    });

    it("should handle empty decrypted value", () => {
      const originalToken = "";
      const encrypted = encryptToken(originalToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(originalToken);
    });
  });

  describe("roundtrip encryption/decryption", () => {
    const testCases = [
      "sk-simple-token",
      "sk-ant-api03-very-long-token-with-many-characters-1234567890",
      "AIzaSy-google-style-token-with-dashes",
      "token_with_underscores_and_numbers_123",
      "UPPERCASE-TOKEN-TEST",
      "unicode-token-with-émojis-🔐",
    ];

    testCases.forEach((token) => {
      it(`should handle roundtrip for: ${token}`, () => {
        const encrypted = encryptToken(token);
        const decrypted = decryptToken(encrypted);
        expect(decrypted).toBe(token);
      });
    });
  });

  describe("security considerations", () => {
    it("should not expose original token in encrypted format", () => {
      const token = "sk-secret-api-key-12345";
      const encrypted = encryptToken(token);

      expect(encrypted).not.toContain(token);
      expect(encrypted).not.toContain("secret");
      expect(encrypted).not.toContain("api");
      expect(encrypted).not.toContain("key");
    });

    it("should produce cryptographically secure output", () => {
      const token = "test-token";
      const encrypted = encryptToken(token);
      const parts = encrypted.split(":");

      // Check IV is proper length (16 bytes = 32 hex chars)
      expect(parts[0]).toHaveLength(32);

      // Check authTag is proper length (16 bytes = 32 hex chars)
      expect(parts[1]).toHaveLength(32);

      // Check all parts are valid hex
      parts.forEach((part) => {
        expect(part).toMatch(/^[0-9a-f]+$/);
      });
    });
  });
});
