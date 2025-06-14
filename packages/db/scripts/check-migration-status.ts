/**
 * Script para verificar se a migração para nova estrutura AI Studio foi aplicada
 */
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do .env do root
config({ path: path.resolve(__dirname, "../../../.env") });
config({ path: path.resolve(__dirname, "../../../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL ou MYSQL_URL não encontrada");
  console.error(
    "📋 Verifique se o arquivo .env ou .env.local existe no root do projeto",
  );
  console.error("💡 Procurando por: DATABASE_URL ou MYSQL_URL");
  process.exit(1);
}

async function checkMigrationStatus() {
  console.log("🔍 Verificando status da migração AI Studio...\n");
  console.log(
    `🔗 Conectando em: ${DATABASE_URL!.replace(/password@/, "***@")}\n`,
  );

  const connection = await mysql.createConnection(DATABASE_URL!);

  try {
    // Verificar se existem as tabelas da estrutura antiga
    console.log("📋 Verificando estrutura antiga:");

    const [oldTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('ai_provider_token', 'ai_team_provider_config');
    `);

    // Verificar se existem as tabelas da nova estrutura
    console.log("📋 Verificando nova estrutura:");

    const [newTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('ai_team_provider_token', 'ai_team_model_config');
    `);

    const oldTableNames = (oldTables as any[]).map((t) => t.table_name);
    const newTableNames = (newTables as any[]).map((t) => t.table_name);

    // Analisar status
    console.log("\n📊 STATUS DA MIGRAÇÃO:");
    console.log("========================");

    if (oldTableNames.includes("ai_provider_token")) {
      console.log("❌ Tabela antiga 'ai_provider_token' ainda existe");
    } else {
      console.log("✅ Tabela antiga 'ai_provider_token' foi removida");
    }

    if (oldTableNames.includes("ai_team_provider_config")) {
      console.log("❌ Tabela antiga 'ai_team_provider_config' ainda existe");
    } else {
      console.log("✅ Tabela antiga 'ai_team_provider_config' foi removida");
    }

    if (newTableNames.includes("ai_team_provider_token")) {
      console.log("✅ Nova tabela 'ai_team_provider_token' existe");
    } else {
      console.log("❌ Nova tabela 'ai_team_provider_token' não existe");
    }

    if (newTableNames.includes("ai_team_model_config")) {
      console.log("✅ Nova tabela 'ai_team_model_config' existe");
    } else {
      console.log("❌ Nova tabela 'ai_team_model_config' não existe");
    }

    // Determinar status geral
    const migrated =
      !oldTableNames.includes("ai_provider_token") &&
      !oldTableNames.includes("ai_team_provider_config") &&
      newTableNames.includes("ai_team_provider_token") &&
      newTableNames.includes("ai_team_model_config");

    console.log("\n🎯 RESULTADO:");
    console.log("=============");

    if (migrated) {
      console.log("✅ MIGRAÇÃO CONCLUÍDA - Banco está na nova estrutura");

      // Contar registros nas novas tabelas
      const [tokenCount] = await connection.execute(`
        SELECT COUNT(*) as count FROM ai_team_provider_token;
      `);

      const [configCount] = await connection.execute(`
        SELECT COUNT(*) as count FROM ai_team_model_config;
      `);

      console.log(`📊 Dados encontrados:`);
      console.log(`   • ${(tokenCount as any)[0].count} tokens de provider`);
      console.log(
        `   • ${(configCount as any)[0].count} configurações de modelo`,
      );
    } else {
      console.log("⚠️  MIGRAÇÃO PENDENTE - Execute a migração");
      console.log("\n🛠️  Para migrar, execute:");
      console.log(
        "   npx tsx packages/db/scripts/migrate-to-new-ai-structure.ts",
      );
    }

    // Mostrar todas as tabelas relacionadas ao AI Studio
    console.log("\n📋 Tabelas AI Studio no banco:");
    console.log("==============================");

    const [allAiTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE 'ai_%'
      ORDER BY table_name;
    `);

    (allAiTables as any[]).forEach((table) => {
      const isNew = ["ai_team_provider_token", "ai_team_model_config"].includes(
        table.table_name,
      );
      const isOld = ["ai_provider_token", "ai_team_provider_config"].includes(
        table.table_name,
      );

      let status = "";
      if (isNew) status = " ✅ (nova estrutura)";
      if (isOld) status = " ❌ (estrutura antiga)";

      console.log(`   • ${table.table_name}${status}`);
    });
  } catch (error) {
    console.error("❌ Erro ao verificar migração:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Executar verificação - compatible with ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
  checkMigrationStatus()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { checkMigrationStatus };
