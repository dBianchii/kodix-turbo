/**
 * Script para migrar para nova estrutura AI Studio
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

async function main() {
  console.log("🚀 Iniciando migração para nova estrutura AI Studio...");

  const connection = await mysql.createConnection(DATABASE_URL!);

  try {
    // Desabilitar foreign key checks temporariamente
    console.log("🔧 Desabilitando foreign key checks...");
    await connection.execute("SET foreign_key_checks = 0;");

    // 1. Verificar se tabela antiga existe antes de renomear
    console.log("📋 Verificando se tabela ai_provider_token existe...");
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'ai_provider_token';
    `);

    if ((tables as any[]).length > 0) {
      console.log("📝 Renomeando tabela ai_provider_token...");
      await connection.execute(`
        RENAME TABLE ai_provider_token TO ai_team_provider_token;
      `);
    } else {
      console.log(
        "ℹ️  Tabela ai_provider_token não existe, pulando renomeação...",
      );
    }

    // 2. Verificar e remover tabela ai_team_provider_config se existir
    console.log("📋 Verificando tabela ai_team_provider_config...");
    const [configTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'ai_team_provider_config';
    `);

    if ((configTables as any[]).length > 0) {
      console.log("🗑️ Removendo tabela ai_team_provider_config...");
      await connection.execute(`DROP TABLE ai_team_provider_config;`);
    } else {
      console.log("ℹ️  Tabela ai_team_provider_config não existe...");
    }

    // 3. Verificar se nova tabela já existe
    console.log("📋 Verificando se tabela ai_team_model_config já existe...");
    const [newTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'ai_team_model_config';
    `);

    if ((newTables as any[]).length > 0) {
      console.log(
        "ℹ️  Tabela ai_team_model_config já existe, pulando criação...",
      );
    } else {
      console.log("🆕 Criando tabela ai_team_model_config...");
      await connection.execute(`
        CREATE TABLE ai_team_model_config (
          id varchar(21) NOT NULL,
          teamId varchar(21) NOT NULL,
          modelId varchar(21) NOT NULL,
          enabled boolean DEFAULT false NOT NULL,
          priority int DEFAULT 0,
          config json,
          createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updatedAt timestamp ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY ai_team_model_config_team_model_unique (teamId, modelId),
          KEY ai_team_model_config_team_idx (teamId),
          KEY ai_team_model_config_model_idx (modelId),
          KEY ai_team_model_config_enabled_idx (enabled),
          KEY ai_team_model_config_priority_idx (priority),
          KEY ai_team_model_config_created_at_idx (createdAt),
          CONSTRAINT ai_team_model_config_teamId_teams_id_fk FOREIGN KEY (teamId) REFERENCES teams (id) ON DELETE CASCADE,
          CONSTRAINT ai_team_model_config_modelId_ai_model_id_fk FOREIGN KEY (modelId) REFERENCES ai_model (id) ON DELETE CASCADE
        );
      `);
    }

    // Reabilitar foreign key checks
    console.log("🔧 Reabilitando foreign key checks...");
    await connection.execute("SET foreign_key_checks = 1;");

    console.log("✅ Migração concluída com sucesso!");
    console.log("📊 Resumo das alterações:");
    console.log(
      "  - ✅ ai_provider_token → ai_team_provider_token (se existia)",
    );
    console.log("  - ❌ ai_team_provider_config (removida se existia)");
    console.log("  - ✅ ai_team_model_config (criada se não existia)");

    // Verificar resultado final
    console.log("\n🔍 Verificando estrutura final...");
    const [finalTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE 'ai_%'
      ORDER BY table_name;
    `);

    console.log("📋 Tabelas AI Studio encontradas:");
    (finalTables as any[]).forEach((table) => {
      const isNew = ["ai_team_provider_token", "ai_team_model_config"].includes(
        table.table_name,
      );
      const isOld = ["ai_provider_token", "ai_team_provider_config"].includes(
        table.table_name,
      );

      let status = "";
      if (isNew) status = " ✅ (nova estrutura)";
      if (isOld) status = " ❌ (estrutura antiga - não deveria existir)";

      console.log(`   • ${table.table_name}${status}`);
    });
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);

    // Tentar reabilitar foreign key checks mesmo em caso de erro
    try {
      await connection.execute("SET foreign_key_checks = 1;");
    } catch (fkError) {
      console.error("⚠️  Erro ao reabilitar foreign key checks:", fkError);
    }

    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
