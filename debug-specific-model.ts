import { aiStudioRepository } from "./packages/db/src/repositories";

async function debugSpecificModel() {
  try {
    console.log("🔍 [DEBUG] Verificando modelo específico da sessão...");

    const sessionModelId = "u0idpyuh512s"; // ID do modelo da sessão "Modelo 4o mini"

    console.log(`🎯 Buscando modelo com ID: ${sessionModelId}`);

    const model =
      await aiStudioRepository.AiModelRepository.findById(sessionModelId);

    if (model) {
      console.log(`✅ Modelo encontrado:`);
      console.log(`   • Nome: ${model.name}`);
      console.log(`   • Provider: ${model.provider?.name || "Unknown"}`);
      console.log(`   • Provider ID: ${model.providerId}`);
      console.log(`   • Enabled: ${model.enabled}`);
      console.log(`   • Config:`, model.config);

      const modelConfig = (model.config as any) || {};
      const modelName = modelConfig.version || model.name;
      console.log(`   • API Model Name: ${modelName}`);

      // Verificar provider
      if (model.provider) {
        console.log(`   • Provider details:`);
        console.log(`     - Name: ${model.provider.name}`);
        console.log(`     - Base URL: ${model.provider.baseUrl}`);
      }
    } else {
      console.log(`❌ Modelo com ID ${sessionModelId} NÃO ENCONTRADO!`);
    }

    // Também verificar todos os modelos gpt-4o-mini disponíveis
    console.log(`\n🔍 [DEBUG] Todos os modelos gpt-4o-mini:`);
    const allModels = await aiStudioRepository.AiModelRepository.findMany({
      enabled: true,
      limite: 50,
    });

    const gpt4oMiniModels = allModels.filter(
      (m) =>
        m.name.toLowerCase().includes("gpt-4o-mini") ||
        m.name.toLowerCase().includes("4o-mini"),
    );

    console.log(
      `📊 Modelos gpt-4o-mini encontrados: ${gpt4oMiniModels.length}`,
    );
    gpt4oMiniModels.forEach((model) => {
      const configVersion = (model.config as any)?.version || model.name;
      console.log(
        `   • ${model.name} (ID: ${model.id}) - API: ${configVersion} - Provider: ${model.provider?.name}`,
      );
    });
  } catch (error) {
    console.error("❌ [DEBUG] Erro:", error);
  }
}

debugSpecificModel();
