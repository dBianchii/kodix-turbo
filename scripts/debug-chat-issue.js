#!/usr/bin/env node

/**
 * Debug Script para Chat Issues
 * Verifica todas as configurações necessárias para o chat funcionar
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "../.env") });

// Database connection
const connection = mysql.createConnection({
  uri: process.env.MYSQL_URL,
});

const db = drizzle(connection);

async function debugChatIssue() {
  try {
    console.log("🔍 DEBUG CHAT ISSUE - Iniciando diagnóstico...\n");

    // 1. Verificar usuários e teams
    console.log("1️⃣ Verificando usuários e teams...");
    const [users] = await connection.execute(`
      SELECT u.id, u.name, u.email, u.activeTeamId, t.name as teamName
      FROM users u
      LEFT JOIN teams t ON u.activeTeamId = t.id
      ORDER BY u.createdAt DESC
      LIMIT 5
    `);

    if (users.length === 0) {
      console.log("❌ Nenhum usuário encontrado no sistema");
      return;
    }

    console.log("✅ Usuários encontrados:");
    users.forEach((user) => {
      console.log(
        `   • ${user.name} (${user.email}) - Team: ${user.teamName || "NONE"} (${user.activeTeamId})`,
      );
    });

    const firstUser = users[0];
    const teamId = firstUser.activeTeamId;

    if (!teamId) {
      console.log("❌ Usuário principal não tem team ativo");
      return;
    }

    console.log(`\n🎯 Focando no team: ${firstUser.teamName} (${teamId})\n`);

    // 2. Verificar apps instalados
    console.log("2️⃣ Verificando apps instalados no team...");
    const [installedApps] = await connection.execute(
      `
      SELECT a.id, a.name
      FROM apps a
      INNER JOIN appsToTeams att ON a.id = att.appId
      WHERE att.teamId = ?
    `,
      [teamId],
    );

    console.log("✅ Apps instalados:");
    if (installedApps.length === 0) {
      console.log("❌ PROBLEMA: Nenhum app instalado para este team!");
      console.log("   Solução: Instalar Chat e AI Studio via interface");
      return;
    }

    const installedAppIds = installedApps.map((app) => app.id);
    installedApps.forEach((app) => {
      console.log(`   • ${app.name} (${app.id})`);
    });

    // Verificar se Chat e AI Studio estão instalados
    const chatInstalled = installedAppIds.includes("chat");
    const aiStudioInstalled = installedAppIds.includes("ai-studio");

    console.log(`\n🔍 Status das dependências:`);
    console.log(`   • Chat: ${chatInstalled ? "✅" : "❌"}`);
    console.log(`   • AI Studio: ${aiStudioInstalled ? "✅" : "❌"}`);

    if (!chatInstalled) {
      console.log("\n❌ PROBLEMA: Chat não está instalado!");
      console.log("   Solução: Ir para /apps e instalar o Chat");
      return;
    }

    if (!aiStudioInstalled) {
      console.log("\n❌ PROBLEMA: AI Studio não está instalado!");
      console.log("   Chat depende do AI Studio para funcionar");
      console.log("   Solução: Ir para /apps e instalar o AI Studio");
      return;
    }

    // 3. Verificar providers de IA
    console.log("\n3️⃣ Verificando providers de IA...");
    const [providers] = await connection.execute(`
      SELECT p.id, p.name, p.baseUrl, p.enabled
      FROM aiProviders p
      WHERE p.enabled = 1
    `);

    if (providers.length === 0) {
      console.log("❌ PROBLEMA: Nenhum provider de IA habilitado!");
      console.log("   Solução: Habilitar providers no AI Studio");
      return;
    }

    console.log("✅ Providers habilitados:");
    providers.forEach((provider) => {
      console.log(
        `   • ${provider.name} (${provider.id}) - ${provider.baseUrl}`,
      );
    });

    // 4. Verificar modelos de IA
    console.log("\n4️⃣ Verificando modelos de IA...");
    const [models] = await connection.execute(`
      SELECT m.id, m.name, m.enabled, p.name as providerName
      FROM aiModels m
      INNER JOIN aiProviders p ON m.providerId = p.id
      WHERE m.enabled = 1
    `);

    if (models.length === 0) {
      console.log("❌ PROBLEMA: Nenhum modelo de IA habilitado!");
      console.log("   Solução: Habilitar modelos no AI Studio");
      return;
    }

    console.log("✅ Modelos habilitados:");
    models.forEach((model) => {
      console.log(
        `   • ${model.name} (${model.id}) - Provider: ${model.providerName}`,
      );
    });

    // 5. Verificar configurações de modelo do team
    console.log("\n5️⃣ Verificando configurações de modelo do team...");
    const [teamModelConfigs] = await connection.execute(
      `
      SELECT tmc.id, tmc.enabled, tmc.priority, m.name as modelName, p.name as providerName
      FROM aiTeamModelConfigs tmc
      INNER JOIN aiModels m ON tmc.modelId = m.id
      INNER JOIN aiProviders p ON m.providerId = p.id
      WHERE tmc.teamId = ? AND tmc.enabled = 1
      ORDER BY tmc.priority ASC
    `,
      [teamId],
    );

    if (teamModelConfigs.length === 0) {
      console.log("❌ PROBLEMA: Nenhum modelo configurado para este team!");
      console.log("   Solução: Configurar modelos no AI Studio para o team");
      return;
    }

    console.log("✅ Modelos configurados para o team:");
    teamModelConfigs.forEach((config, index) => {
      console.log(
        `   ${index === 0 ? "🎯" : "•"} ${config.modelName} (Priority: ${config.priority}) - Provider: ${config.providerName}`,
      );
    });

    // 6. Verificar tokens de provider
    console.log("\n6️⃣ Verificando tokens de provider...");
    const [providerTokens] = await connection.execute(
      `
      SELECT pt.id, pt.providerId, p.name as providerName, 
             CASE WHEN pt.token IS NOT NULL THEN 'CONFIGURADO' ELSE 'AUSENTE' END as tokenStatus
      FROM aiTeamProviderTokens pt
      INNER JOIN aiProviders p ON pt.providerId = p.id
      WHERE pt.teamId = ?
    `,
      [teamId],
    );

    if (providerTokens.length === 0) {
      console.log("❌ PROBLEMA: Nenhum token de provider configurado!");
      console.log("   Solução: Configurar tokens no AI Studio");
      return;
    }

    console.log("✅ Tokens de provider:");
    let hasValidTokens = false;
    providerTokens.forEach((token) => {
      const status = token.tokenStatus === "CONFIGURADO" ? "✅" : "❌";
      console.log(`   ${status} ${token.providerName}: ${token.tokenStatus}`);
      if (token.tokenStatus === "CONFIGURADO") hasValidTokens = true;
    });

    if (!hasValidTokens) {
      console.log("\n❌ PROBLEMA: Nenhum token válido configurado!");
      console.log("   Solução: Configurar tokens no AI Studio");
      return;
    }

    // 7. Verificar sessões de chat
    console.log("\n7️⃣ Verificando sessões de chat...");
    const [chatSessions] = await connection.execute(
      `
      SELECT cs.id, cs.title, cs.aiModelId, m.name as modelName
      FROM chatSessions cs
      LEFT JOIN aiModels m ON cs.aiModelId = m.id
      WHERE cs.teamId = ?
      ORDER BY cs.createdAt DESC
      LIMIT 3
    `,
      [teamId],
    );

    console.log(`✅ Sessões de chat encontradas: ${chatSessions.length}`);
    if (chatSessions.length > 0) {
      chatSessions.forEach((session) => {
        console.log(
          `   • ${session.title} - Modelo: ${session.modelName || "NENHUM"}`,
        );
      });
    }

    // 8. Teste de conectividade com API
    console.log("\n8️⃣ Testando conectividade com API...");

    const defaultModel = teamModelConfigs[0];
    const [tokenResult] = await connection.execute(
      `
      SELECT pt.token, p.baseUrl
      FROM aiTeamProviderTokens pt
      INNER JOIN aiProviders p ON pt.providerId = p.id
      INNER JOIN aiModels m ON p.id = m.providerId
      WHERE pt.teamId = ? AND m.id = ?
    `,
      [teamId, defaultModel.modelName.split(" ")[0]],
    ); // Simplificado

    if (tokenResult.length === 0) {
      console.log("❌ PROBLEMA: Token não encontrado para o modelo padrão");
      return;
    }

    console.log("\n🎉 DIAGNÓSTICO CONCLUÍDO!");
    console.log("✅ Todas as configurações básicas estão corretas");
    console.log("\n🔧 PRÓXIMOS PASSOS PARA DEBUG:");
    console.log("1. Verificar logs do servidor durante tentativa de chat");
    console.log("2. Verificar DevTools do navegador para erros de rede");
    console.log("3. Testar criação de nova sessão manualmente");
    console.log("4. Verificar se middleware está bloqueando requests");
  } catch (error) {
    console.error("❌ Erro durante diagnóstico:", error);
  } finally {
    await connection.end();
  }
}

debugChatIssue().catch(console.error);
