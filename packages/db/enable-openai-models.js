import { eq } from "drizzle-orm";

import { db } from "./src/client.js";
import { aiModel } from "./src/schema/apps/ai-studio.js";
import { jsonProviderService } from "./src/services/json-provider.service.js";

async function enableOpenAIModels() {
  try {
    console.log("🔧 Habilitando modelos OpenAI...\n");

    // 1. Buscar o provider OpenAI
    const openaiProvider = await jsonProviderService.findByName("OpenAI");

    if (!openaiProvider) {
      console.log(
        "❌ Provider OpenAI não encontrado. Execute primeiro o seed:",
      );
      console.log("pnpm db:seed");
      return;
    }

    console.log(`✅ Provider OpenAI encontrado: ${openaiProvider.providerId}`);

    // 2. Buscar modelos OpenAI desabilitados
    const openaiModels = await db.query.aiModel.findMany({
      where: eq(aiModel.providerId, openaiProvider.providerId),
    });

    console.log(`📋 Modelos OpenAI encontrados: ${openaiModels.length}`);

    // 3. Habilitar todos os modelos OpenAI
    let enabledCount = 0;
    for (const model of openaiModels) {
      if (!model.enabled) {
        await db
          .update(aiModel)
          .set({ enabled: true })
          .where(eq(aiModel.modelId, model.modelId));

        console.log(`✅ Habilitado: ${model.modelId}`);
        enabledCount++;
      } else {
        console.log(`✓ Já habilitado: ${model.modelId}`);
      }
    }

    console.log(`\n🎉 Processo concluído!`);
    console.log(`   - ${enabledCount} modelos habilitados`);
    console.log(
      `   - ${openaiModels.length - enabledCount} já estavam habilitados`,
    );

    console.log(`\n📝 Próximos passos:`);
    console.log(`   1. Acesse http://localhost:3000/apps/aiStudio`);
    console.log(`   2. Vá para a seção "Modelos Habilitados"`);
    console.log(`   3. Os modelos OpenAI agora devem aparecer!`);
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    process.exit(0);
  }
}

enableOpenAIModels();
