#!/usr/bin/env tsx

/**
 * Script de teste para verificar se a implementação do AI Provider está funcionando
 */
import { db } from "../src/client";
import { aiStudioRepository } from "../src/repositories";

async function testAiProvider() {
  console.log("🧪 Testando implementação do AI Provider...\n");

  try {
    // 1. Criar um provider de teste
    console.log("📋 Criando provider de teste...");
    const providerName = `TestProvider_${Date.now()}`;
    const provider = await aiStudioRepository.AiProviderRepository.create({
      name: providerName,
      baseUrl: "https://api.test.com/v1",
    });
    console.log("✅ Provider criado:", provider);

    // 2. Criar um modelo de teste
    console.log("📋 Criando modelo de teste...");
    if (!provider) {
      throw new Error("Provider não foi criado");
    }

    const model = await aiStudioRepository.AiModelRepository.create({
      modelId: "test-model-id",
      providerId: (provider as any).providerId,
      config: { temperature: 0.7 },
      enabled: true,
    });
    console.log("✅ Modelo criado:", model);

    // 3. Buscar um team para criar token
    console.log("📋 Buscando teams...");
    const teams = await db.query.teams.findMany({ limit: 1 });
    console.log("Teams encontrados:", teams.length);

    if (teams.length > 0) {
      // 4. Criar um token de teste
      console.log("📋 Criando token de teste...");
      const token =
        await aiStudioRepository.AiTeamProviderTokenRepository.create({
          teamId: teams[0]!.id,
          providerId: (provider as any).providerId,
          token: "test-token-12345",
        });

      if (token?.id) {
        console.log("✅ Token criado com sucesso:", token.id);

        // 5. Buscar token para verificar criptografia
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
