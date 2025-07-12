#!/usr/bin/env tsx

/**
 * Script para criptografar tokens existentes no banco de dados
 *
 * Este script deve ser executado APÓS ativar a criptografia para
 * converter tokens em texto puro para tokens criptografados
 */
import { eq } from "drizzle-orm";

import { db } from "../src/client";
import { aiTeamProviderToken } from "../src/schema/apps/ai-studio";
import { encryptToken } from "../src/utils/crypto";

console.log("🔐 Iniciando encriptação de tokens existentes...");

async function encryptExistingTokens() {
  try {
    // Buscar todos os tokens não encriptados
    const tokens = await db.query.aiTeamProviderToken.findMany();

    if (tokens.length === 0) {
      console.log("ℹ️ Nenhum token encontrado para encriptar");
      return;
    }

    console.log(`📊 Encontrados ${tokens.length} tokens para encriptar`);

    let encryptedCount = 0;

    for (const token of tokens) {
      try {
        // Verificar se o token já está encriptado (não começou com texto claro)
        if (token.token.includes(":")) {
          console.log(
            `⏭️ Token ${token.id} já parece estar encriptado, pulando...`,
          );
          continue;
        }

        // Encriptar o token
        const encryptedToken = encryptToken(token.token);

        // Atualizar no banco
        await db
          .update(aiTeamProviderToken)
          .set({
            token: encryptedToken,
            updatedAt: new Date(),
          })
          .where(eq(aiTeamProviderToken.id, token.id));

        encryptedCount++;
        console.log(`✅ Token ${token.id} encriptado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao encriptar token ${token.id}:`, error);
      }
    }

    console.log(
      `🎉 Encriptação concluída! ${encryptedCount} tokens encriptados.`,
    );
  } catch (error) {
    console.error("❌ Erro durante encriptação:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  encryptExistingTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { encryptExistingTokens };
