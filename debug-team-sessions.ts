import { db } from "./packages/db/src/client";
import { chatRepository } from "./packages/db/src/repositories";
import { chatSession, teams } from "./packages/db/src/schema";

async function debugTeamSessions() {
  try {
    console.log("🔍 [DEBUG] Buscando teams disponíveis...");

    // Buscar todos os teams
    const teamsData = await db.select().from(teams).limit(10);
    console.log(`📊 Total de teams: ${teamsData.length}`);

    for (const t of teamsData) {
      console.log(`   • Team: ${t.name} (ID: ${t.id})`);
    }

    if (teamsData.length > 0) {
      const firstTeam = teamsData[0]!;
      console.log(
        `\n🎯 [DEBUG] Usando team: ${firstTeam.name} (${firstTeam.id})`,
      );

      // Buscar sessões deste team
      const sessions = await chatRepository.ChatSessionRepository.findByTeam({
        teamId: firstTeam.id,
        limite: 10,
        offset: 0,
        ordenarPor: "updatedAt",
        ordem: "desc",
      });

      console.log(
        `📊 Sessões encontradas para ${firstTeam.name}: ${sessions.length}`,
      );

      for (const session of sessions) {
        console.log(`\n📝 === SESSÃO: ${session.title} ===`);
        console.log(`   • ID: ${session.id}`);
        console.log(`   • aiModelId: ${session.aiModelId || "❌ NULL"}`);
        console.log(`   • teamId: ${session.teamId}`);
        console.log(`   • Created: ${session.createdAt}`);
        console.log(`   • Updated: ${session.updatedAt}`);
      }
    }

    // Também buscar todas as sessões independente do team
    console.log(`\n🔍 [DEBUG] Buscando TODAS as sessões de chat...`);
    const allSessions = await db
      .select({
        id: chatSession.id,
        title: chatSession.title,
        aiModelId: chatSession.aiModelId,
        teamId: chatSession.teamId,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
      })
      .from(chatSession)
      .orderBy(chatSession.updatedAt)
      .limit(10);

    console.log(`📊 Total de sessões na base: ${allSessions.length}`);

    for (const session of allSessions) {
      console.log(`\n📝 === SESSÃO GLOBAL: ${session.title} ===`);
      console.log(`   • ID: ${session.id}`);
      console.log(`   • aiModelId: ${session.aiModelId || "❌ NULL"}`);
      console.log(`   • teamId: ${session.teamId}`);
      console.log(`   • Updated: ${session.updatedAt}`);
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro:", error);
  }
}

debugTeamSessions();
