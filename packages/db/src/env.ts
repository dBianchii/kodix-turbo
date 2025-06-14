import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    MYSQL_URL: z.string().min(1),
    ENCRYPTION_KEY: z
      .string()
      .min(32, "ENCRYPTION_KEY deve ter pelo menos 32 caracteres"),
  },
  runtimeEnv: {
    MYSQL_URL: process.env.MYSQL_URL,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

// Avisar se usando chave padrão
if (process.env.ENCRYPTION_KEY === "default-key-change-in-production") {
  console.warn(
    "⚠️  AVISO: Usando chave de criptografia padrão. Configure ENCRYPTION_KEY em produção!",
  );
}
