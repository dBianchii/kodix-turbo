import { db } from "../src/client";
import { aiStudioRepository, chatRepository } from "../src/repositories";

async function verifySeedsApplied() {
  console.log("🔍 Verificando seeds aplicados...\n");

  try {
    // =============================
    // 1. Verificar AI Models
    // =============================
    console.log("📊 AI Models:");
    const aiModels = await aiStudioRepository.AiModelRepository.findMany({
      limite: 10,
      offset: 0,
    });
    console.log(`   ✓ ${aiModels.length} modelos de IA encontrados`);

    aiModels.forEach((model) => {
      console.log(
        `     - ${model.modelId} (Provider ID: ${model.providerId}) - ${model.enabled ? "Ativo" : "Inativo"}`,
      );
    });

    // =============================
    // 2. Verificar Teams com dados
    // =============================
    console.log("\n📦 Teams com configurações de IA:");

    const teams = await db.query.teams.findMany({
      with: {
        Owner: {
          columns: { id: true, name: true },
        },
      },
    });

    let teamsWithAI = 0;
    let totalLibraries = 0;
    let totalAgents = 0;
    let totalTokens = 0;
    let totalFolders = 0;
    let totalSessions = 0;
    let totalMessages = 0;

    for (const team of teams) {
      console.log(`\n   🏢 Team: ${team.name}`);

      // AI Libraries
      const libraries = await aiStudioRepository.AiLibraryRepository.findByTeam(
        {
          teamId: team.id,
          limite: 100,
          offset: 0,
        },
      );
      console.log(`      📚 ${libraries.length} bibliotecas`);
      totalLibraries += libraries.length;

      // AI Agents
      const agents = await aiStudioRepository.AiAgentRepository.findByTeam({
        teamId: team.id,
        limite: 100,
        offset: 0,
      });
      console.log(`      🤖 ${agents.length} agentes`);
      totalAgents += agents.length;

      // AI Tokens
      const tokens =
        await aiStudioRepository.AiTeamProviderTokenRepository.findByTeam(
          team.id,
        );
      console.log(`      🔑 ${tokens.length} tokens de provedor`);
      totalTokens += tokens.length;

      // Chat Folders
      const folders = await chatRepository.ChatFolderRepository.findByTeam({
        teamId: team.id,
        limite: 100,
        offset: 0,
      });
      console.log(`      📁 ${folders.length} pastas de chat`);
      totalFolders += folders.length;

      // Chat Sessions
      const sessions = await chatRepository.ChatSessionRepository.findByTeam({
        teamId: team.id,
        limite: 100,
        offset: 0,
      });
      console.log(`      💬 ${sessions.length} sessões de chat`);
      totalSessions += sessions.length;

      // Count messages
      let teamMessages = 0;
      for (const session of sessions) {
        if (session.id) {
          const messageCount =
            await chatRepository.ChatMessageRepository.countBySession(
              session.id,
            );
          teamMessages += messageCount;
        }
      }
      console.log(`      📝 ${teamMessages} mensagens`);
      totalMessages += teamMessages;

      if (libraries.length > 0 || agents.length > 0 || tokens.length > 0) {
        teamsWithAI++;
      }
    }

    // =============================
    // 3. Resumo Geral
    // =============================
    console.log("\n📊 RESUMO GERAL:");
    console.log("================");
    console.log(`Teams no sistema: ${teams.length}`);
    console.log(`Teams com IA configurada: ${teamsWithAI}`);
    console.log(`\nRecursos AI Studio:`);
    console.log(`   📚 Bibliotecas: ${totalLibraries}`);
    console.log(`   🤖 Agentes: ${totalAgents}`);
    console.log(`   🔑 Tokens: ${totalTokens}`);
    console.log(`\nRecursos Chat:`);
    console.log(`   📁 Pastas: ${totalFolders}`);
    console.log(`   💬 Sessões: ${totalSessions}`);
    console.log(`   📝 Mensagens: ${totalMessages}`);

    // =============================
    // 4. Validações
    // =============================
    console.log("\n🔍 VALIDAÇÕES:");
    console.log("==============");

    const issues = [];

    if (aiModels.length === 0) {
      issues.push("❌ Nenhum modelo de IA encontrado - Execute seedAiStudio()");
    }

    if (teams.length > 0 && teamsWithAI === 0) {
      issues.push(
        "⚠️  Nenhum team tem configuração de IA - Execute o seed novamente",
      );
    }

    if (totalTokens === 0 && aiModels.length > 0) {
      issues.push("⚠️  Nenhum token de API configurado");
    }

    if (totalAgents > 0 && totalSessions === 0) {
      issues.push("ℹ️  Agentes criados mas sem sessões de chat");
    }

    if (issues.length === 0) {
      console.log("✅ Todos os seeds foram aplicados corretamente!");
    } else {
      issues.forEach((issue) => console.log(issue));
    }

    // =============================
    // 5. Sugestões
    // =============================
    console.log("\n💡 SUGESTÕES:");
    console.log("============");

    if (totalTokens > 0) {
      console.log(
        "⚠️  Lembre-se de substituir os tokens de exemplo por chaves reais",
      );
    }

    if (totalAgents > 0) {
      console.log(
        "📝 Customize as instruções dos agentes conforme sua necessidade",
      );
    }

    if (teams.length > teamsWithAI) {
      console.log(
        `🔧 ${teams.length - teamsWithAI} teams sem configuração de IA`,
      );
      console.log(
        "   Execute: pnpm db:seed novamente para configurar automaticamente",
      );
    }

    console.log("\n✅ Verificação concluída!");
  } catch (error) {
    console.error("❌ Erro durante verificação:", error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verifySeedsApplied()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { verifySeedsApplied };
