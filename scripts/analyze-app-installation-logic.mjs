#!/usr/bin/env node

import { config } from "dotenv";
import { createConnection } from "mysql2/promise";

// Load .env
config({ path: ".env" });

async function analyzeInstallationLogic() {
  console.log("🔍 ANALYZING APP INSTALLATION LOGIC...");
  console.log("=====================================");

  const mysqlUrl = process.env.MYSQL_URL;
  const url = new URL(mysqlUrl);
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
  });

  try {
    // Get team info
    const [teams] = await connection.execute("SELECT id, name FROM team LIMIT 1");
    const teamId = teams[0]?.id;
    console.log(`🏢 Team: ${teams[0]?.name} (${teamId})`);

    console.log("\n📊 APPROACH 1: findInstalledAppsByTeamId (what middleware uses)");
    console.log("================================================================");
    console.log("Query: apps LEFT JOIN appsToTeams");
    
    const [installedAppsQuery] = await connection.execute(`
      SELECT 
        apps.id,
        CASE WHEN appsToTeams.teamId IS NOT NULL THEN 1 ELSE 0 END as installed
      FROM apps
      LEFT JOIN appsToTeams ON apps.id = appsToTeams.appId AND appsToTeams.teamId = ?
      WHERE apps.id IN ('ai9x7m2k5p1s', 'az1x2c3bv4n5')
    `, [teamId]);
    
    console.log("Results:");
    installedAppsQuery.forEach(app => {
      console.log(`   ${app.installed ? '✅' : '❌'} ${app.id} - installed: ${app.installed}`);
    });

    console.log("\n📊 APPROACH 2: findAppTeamConfigs (what getConfig handler uses)");
    console.log("===============================================================");
    console.log("Query: appTeamConfigs WHERE appId AND teamId");
    
    const [configsQuery] = await connection.execute(`
      SELECT appId, teamId FROM appTeamConfig 
      WHERE teamId = ? AND appId IN ('ai9x7m2k5p1s', 'az1x2c3bv4n5')
    `, [teamId]);
    
    console.log("Results:");
    configsQuery.forEach(config => {
      console.log(`   ✅ ${config.appId} - has config for team: ${config.teamId}`);
    });

    console.log("\n🔍 ANALYSIS:");
    console.log("=============");
    
    const appsInAppsToTeams = installedAppsQuery.filter(app => app.installed).map(app => app.id);
    const appsInConfigs = configsQuery.map(config => config.appId);
    
    console.log(`Apps in appsToTeams: [${appsInAppsToTeams.join(', ')}]`);
    console.log(`Apps in appTeamConfigs: [${appsInConfigs.join(', ')}]`);
    
    const missingInAppsToTeams = appsInConfigs.filter(id => !appsInAppsToTeams.includes(id));
    const missingInConfigs = appsInAppsToTeams.filter(id => !appsInConfigs.includes(id));
    
    if (missingInAppsToTeams.length > 0) {
      console.log(`❌ PROBLEM: Apps in configs but NOT in appsToTeams: [${missingInAppsToTeams.join(', ')}]`);
      console.log("   This causes UNAUTHORIZED errors in middleware");
    }
    
    if (missingInConfigs.length > 0) {
      console.log(`⚠️  WARNING: Apps in appsToTeams but NO configs: [${missingInConfigs.join(', ')}]`);
    }
    
    if (missingInAppsToTeams.length === 0 && missingInConfigs.length === 0) {
      console.log("✅ Both tables are consistent - no issues found");
    }

    console.log("\n🔧 SOLUTION OPTIONS:");
    console.log("====================");
    
    if (missingInAppsToTeams.length > 0) {
      console.log("1. INSERT missing records into appsToTeams");
      console.log("2. Change middleware to check appTeamConfigs instead");
      console.log("3. Use proper app installation procedure");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

analyzeInstallationLogic().catch(console.error);