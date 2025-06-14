import { chatRepository } from "./src/repositories";

async function debugSessions() {
  try {
    console.log("🔍 [DEBUG] Verificando sessões de chat...");

    // Buscar todas as sessões - assumindo que há pelo menos uma team
    const sessions = await chatRepository.ChatSessionRepository.findByTeam({
      teamId: "cm4zbqvlx000213lxepfnc7w5", // Usar um ID de team que existe
      limite: 10,
    });

    console.log(`📊 [DEBUG] Total de sessões encontradas: ${sessions.length}`);

    for (const session of sessions) {
      console.log(`\n📝 [DEBUG] Sessão: ${session.title}`);
      console.log(`   • ID: ${session.id}`);
      console.log(`   • aiModelId: ${session.aiModelId || "❌ NULL"}`);
      console.log(
        `   • Model data: ${session.aiModel ? `✅ ${session.aiModel.name}` : "❌ NULL"}`,
      );
      console.log(
        `   • Provider: ${session.aiModel?.provider?.name || "❌ NULL"}`,
      );
      console.log(`   • Created: ${session.createdAt}`);
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro:", error);
  }
}

debugSessions();
