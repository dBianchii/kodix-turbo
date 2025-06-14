import {
  aiStudioRepository,
  chatRepository,
} from "./packages/db/src/repositories";

async function debugChatSession() {
  try {
    console.log("🔍 [DEBUG] Buscando sessões de chat recentes...");

    // Buscar sessões mais recentes
    const sessions = await chatRepository.ChatSessionRepository.findByTeam({
      teamId: "cm4zbqvlx000213lxepfnc7w5", // ID do team
      limite: 5,
      offset: 0,
      ordenarPor: "updatedAt",
      ordem: "desc",
    });

    console.log(`📊 [DEBUG] Encontradas ${sessions.length} sessões recentes:`);

    for (const session of sessions) {
      console.log(`\n📝 [DEBUG] === SESSÃO: ${session.title} ===`);
      console.log(`   • ID: ${session.id}`);
      console.log(`   • aiModelId: ${session.aiModelId || "❌ NULL"}`);
      console.log(`   • Created: ${session.createdAt}`);
      console.log(`   • Updated: ${session.updatedAt}`);

      // Se tem aiModelId, buscar detalhes do modelo
      if (session.aiModelId) {
        console.log(`   🔍 [DEBUG] Buscando detalhes do modelo...`);
        const model = await aiStudioRepository.AiModelRepository.findById(
          session.aiModelId,
        );

        if (model) {
          console.log(`   ✅ Modelo encontrado:`);
          console.log(`      • Nome: ${model.name}`);
          console.log(`      • Provider: ${model.provider?.name || "Unknown"}`);
          console.log(
            `      • Config version: ${(model.config as any)?.version || model.name}`,
          );
          console.log(`      • Enabled: ${model.enabled}`);
        } else {
          console.log(
            `   ❌ Modelo com ID ${session.aiModelId} NÃO ENCONTRADO no banco!`,
          );
        }
      }

      // Buscar última mensagem para contexto
      if (session.messages && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1];
        console.log(
          `   💬 Última mensagem: "${lastMessage?.content?.substring(0, 50)}..."`,
        );
      }
    }

    // Verificar todos os modelos disponíveis
    console.log(`\n🎯 [DEBUG] === MODELOS DISPONÍVEIS ===`);
    const allModels = await aiStudioRepository.AiModelRepository.findMany({
      enabled: true,
      limite: 20,
    });

    console.log(`📊 Total de modelos habilitados: ${allModels.length}`);
    allModels.forEach((model) => {
      const configVersion = (model.config as any)?.version || model.name;
      console.log(
        `   • ${model.name} (API: ${configVersion}) - Provider: ${model.provider?.name}`,
      );
    });
  } catch (error) {
    console.error("❌ [DEBUG] Erro:", error);
  }
}

debugChatSession();
