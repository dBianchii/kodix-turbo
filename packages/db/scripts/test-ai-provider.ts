#!/usr/bin/env tsx

/**
 * Script de teste para verificar se a implementação do AI Provider JSON-based está funcionando
 * NOTE: AiProviderRepository has been replaced with JSON configuration
 */
import { db } from "../src/client";
import { aiStudioRepository } from "../src/repositories";

async function testAiProvider() {
  console.log("🧪 Testando implementação do AI Provider (JSON-based)...\n");
  console.log("⚠️  NOTICE: AiProviderRepository has been replaced with JSON configuration");
  console.log("   Providers are now managed via supported-providers.json");
  console.log("   This script tests model and token operations with existing provider IDs\n");

  try {
    // Use existing provider IDs from JSON configuration
    const testProviderId = "openai"; // Must exist in supported-providers.json

    // 1. Criar um modelo de teste
    console.log("📋 Criando modelo de teste...");
    const model = await aiStudioRepository.AiModelRepository.create({
      modelId: "test-model-id",
      providerId: testProviderId,
      config: { temperature: 0.7 },
      enabled: true,
    });
    console.log("✅ Modelo criado:", model);

    // 2. Buscar um team para criar token
    console.log("📋 Buscando teams...");
    const teams = await db.query.teams.findMany({ limit: 1 });
    console.log("Teams encontrados:", teams.length);

    if (teams.length > 0) {
      // 3. Criar um token de teste
      console.log("📋 Criando token de teste...");
      const token =
        await aiStudioRepository.AiTeamProviderTokenRepository.create({
          teamId: teams[0]!.id,
          providerId: testProviderId,
          token: "test-token-12345",
        });

      if (token?.id) {
        console.log("✅ Token criado com sucesso:", token.id);

        // 4. Buscar token para verificar criptografia
        console.log("📋 Buscando token para verificar criptografia...");
        const foundToken =
          await aiStudioRepository.AiTeamProviderTokenRepository.findById(
            token.id,
          );
        console.log("✅ Token encontrado:", foundToken);
        console.log("Token descriptografado:", foundToken?.token);
      } else {
        console.log("❌ Falha ao criar token");
      }
    } else {
      console.log("⚠️  Nenhum team encontrado, pulando criação de token");
    }

    console.log("\n✅ Teste concluído com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro durante o teste:", error);
    process.exit(1);
  }
}

// Executar teste
testAiProvider()
  .then(() => {
    console.log("\n🎉 Script de teste executado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Falha no teste:", error);
    process.exit(1);
  });

export { testAiProvider };
