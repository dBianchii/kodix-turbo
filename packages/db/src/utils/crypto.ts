import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

import { env } from "../env";

// Usar variável de ambiente validada
const ENCRYPTION_KEY = env.ENCRYPTION_KEY || "default-key-change-in-production";
const ALGORITHM = "aes-256-gcm";
const SALT = "kodix-ai-tokens-salt";

// Derivar chave de 32 bytes
const key = scryptSync(ENCRYPTION_KEY, SALT, 32);

export const encryptToken = (token: string): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Retornar IV + authTag + encrypted como uma string
  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
};

export const decryptToken = (encryptedToken: string): string => {
  const parts = encryptedToken.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, authTagHex, encrypted] = parts;
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
