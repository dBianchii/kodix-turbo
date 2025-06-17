#!/usr/bin/env node

/**
 * Script para debugar especificamente as dependências do Chat
 * Testa se AI Studio está instalado e middleware funcionando
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
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

async function debugChatDependencies() {
  try {
    console.log("🔍 DEBUG CHAT DEPENDENCIES");
    console.log("==========================");

    // 1. Verificar apps disponíveis
    console.log("\n📱 APPS REGISTRADOS:");
    const appsQuery = `SELECT id, name, description FROM apps`;
    const [apps] = await connection.execute(appsQuery);

    console.log(`Total de apps: ${apps.length}`);
    apps.forEach((app) => {
      console.log(`   • ${app.id}: ${app.name}`);
    });

    // 2. Verificar usuário ativo
    console.log("\n👤 USUÁRIOS:");
    const usersQuery = `SELECT id, name, email, activeTeamId FROM users LIMIT 3`;
    const [users] = await connection.execute(usersQuery);

    if (users.length === 0) {
      console.log("❌ Nenhum usuário encontrado");
      return;
    }

    const user = users[0];
    console.log(`Usuário ativo: ${user.name} (${user.email})`);
    console.log(`Team ativo: ${user.activeTeamId}`);

    // 3. Verificar apps instalados para o team
    console.log("\n🔧 APPS INSTALADOS PARA O TEAM:");
    const installedQuery = `
      SELECT att.teamId, att.appId, a.name as appName
      FROM appsToTeams att 
      JOIN apps a ON att.appId = a.id 
      WHERE att.teamId = ?
    `;
    const [installedApps] = await connection.execute(installedQuery, [
      user.activeTeamId,
    ]);

    console.log(
      `Apps instalados para team ${user.activeTeamId}: ${installedApps.length}`,
    );
    installedApps.forEach((app) => {
      console.log(`   ✅ ${app.appId}: ${app.appName}`);
    });

    // 4. Verificar especificamente Chat e AI Studio
    console.log("\n🎯 VERIFICAÇÃO ESPECÍFICA:");

    const chatAppId = "az1x2c3bv4n5";
    const aiStudioAppId = "ai9x7m2k5p1s";

    const chatInstalled = installedApps.find((app) => app.appId === chatAppId);
    const aiStudioInstalled = installedApps.find(
      (app) => app.appId === aiStudioAppId,
    );

    console.log(
      `Chat App (${chatAppId}): ${chatInstalled ? "✅ INSTALADO" : "❌ NÃO INSTALADO"}`,
    );
    console.log(
      `AI Studio (${aiStudioAppId}): ${aiStudioInstalled ? "✅ INSTALADO" : "❌ NÃO INSTALADO"}`,
    );

    // 5. Verificar modelos de IA disponíveis
    if (aiStudioInstalled) {
      console.log("\n🤖 MODELOS DE IA:");
      const modelsQuery = `
        SELECT am.id, am.name, am.enabled, ap.name as providerName
        FROM aiModels am
        JOIN aiProviders ap ON am.providerId = ap.id
        WHERE am.teamId = ?
        ORDER BY am.enabled DESC, am.name
      `;
      const [models] = await connection.execute(modelsQuery, [
        user.activeTeamId,
      ]);

      console.log(`Modelos disponíveis: ${models.length}`);
      models.forEach((model) => {
        const status = model.enabled ? "✅ ATIVO" : "❌ INATIVO";
        console.log(`   ${status} ${model.name} (${model.providerName})`);
      });

      // 6. Verificar providers com tokens
      console.log("\n🔑 PROVIDERS COM TOKENS:");
      const providersQuery = `
        SELECT ap.id, ap.name, 
               CASE WHEN apt.token IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as hasToken
        FROM aiProviders ap
        LEFT JOIN aiProviderTokens apt ON ap.id = apt.providerId AND apt.teamId = ?
        WHERE ap.teamId = ?
      `;
      const [providers] = await connection.execute(providersQuery, [
        user.activeTeamId,
        user.activeTeamId,
      ]);

      providers.forEach((provider) => {
        const tokenStatus =
          provider.hasToken === "SIM" ? "✅ COM TOKEN" : "❌ SEM TOKEN";
        console.log(`   ${tokenStatus} ${provider.name}`);
      });
    }

    // 7. DIAGNÓSTICO FINAL
    console.log("\n🎯 DIAGNÓSTICO:");

    if (!chatInstalled) {
      console.log("❌ PROBLEMA: Chat app não está instalado");
      console.log("   Solução: Instalar o Chat app para o team");
    } else if (!aiStudioInstalled) {
      console.log(
        "❌ PROBLEMA: AI Studio não está instalado (dependência obrigatória)",
      );
      console.log("   Solução: Instalar o AI Studio app para o team");
    } else {
      console.log("✅ Apps necessários estão instalados");

      if (models && models.length === 0) {
        console.log("⚠️  AVISO: Nenhum modelo de IA configurado");
        console.log("   Solução: Configurar modelos no AI Studio");
      } else if (models && !models.some((m) => m.enabled)) {
        console.log("⚠️  AVISO: Nenhum modelo de IA ativo");
        console.log("   Solução: Ativar pelo menos um modelo no AI Studio");
      } else if (providers && !providers.some((p) => p.hasToken === "SIM")) {
        console.log("⚠️  AVISO: Nenhum provider com token configurado");
        console.log("   Solução: Configurar tokens de API no AI Studio");
      } else {
        console.log("✅ Configuração parece completa!");
        console.log("   Se ainda há problemas, verificar logs do servidor");
      }
    }
  } catch (error) {
    console.error("❌ Erro durante debug:", error);
  } finally {
    await connection.end();
  }
}

debugChatDependencies().catch(console.error);
