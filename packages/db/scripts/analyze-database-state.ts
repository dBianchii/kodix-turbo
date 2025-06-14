/**
 * Script para analisar o estado atual do banco de dados
 */
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
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
  process.exit(1);
}

async function analyzeDatabaseState() {
  console.log("🔍 Analisando estado atual do banco de dados...\n");
  console.log(
    `🔗 Conectando em: ${DATABASE_URL!.replace(/password@/, "***@")}\n`,
  );

  const connection = await mysql.createConnection(DATABASE_URL!);

  try {
    // 1. Verificar se o banco existe e conecta
    console.log("📊 INFORMAÇÕES BÁSICAS DO BANCO:");
    console.log("=================================");

    const [dbInfo] = await connection.execute(
      "SELECT DATABASE() as current_db;",
    );
    console.log(`✅ Banco conectado: ${(dbInfo as any)[0].current_db}`);

    // 2. Listar TODAS as tabelas
    console.log("\n📋 TODAS AS TABELAS NO BANCO:");
    console.log("=============================");

    const [allTables] = await connection.execute(`
      SELECT table_name, table_rows, create_time
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      ORDER BY table_name;
    `);

    if ((allTables as any[]).length === 0) {
      console.log("❌ BANCO VAZIO - Nenhuma tabela encontrada!");
      console.log("📋 Isso explica por que a migração AI Studio falhou.");
      console.log(
        "🛠️  Você precisa executar 'pnpm db:push' primeiro para criar as tabelas básicas.",
      );
    } else {
      console.log(`📊 Total de tabelas: ${(allTables as any[]).length}\n`);

      (allTables as any[]).forEach((table) => {
        const created = table.create_time
          ? new Date(table.create_time).toLocaleDateString()
          : "N/A";
        console.log(
          `   • ${table.table_name} (${table.table_rows || 0} rows, created: ${created})`,
        );
      });
    }

    // 3. Focar especificamente nas tabelas relacionadas ao AI Studio
    console.log("\n🤖 TABELAS RELACIONADAS AO AI STUDIO:");
    console.log("=====================================");

    const [aiTables] = await connection.execute(`
      SELECT table_name, table_rows
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE 'ai_%'
      ORDER BY table_name;
    `);

    if ((aiTables as any[]).length === 0) {
      console.log("❌ Nenhuma tabela AI encontrada");
    } else {
      (aiTables as any[]).forEach((table) => {
        const isOldStructure = [
          "ai_provider_token",
          "ai_team_provider_config",
        ].includes(table.table_name);
        const isNewStructure = [
          "ai_team_provider_token",
          "ai_team_model_config",
        ].includes(table.table_name);

        let status = "";
        if (isOldStructure) status = " ❌ (estrutura antiga)";
        if (isNewStructure) status = " ✅ (nova estrutura)";

        console.log(
          `   • ${table.table_name} (${table.table_rows || 0} rows)${status}`,
        );
      });
    }

    // 4. Verificar tabelas essenciais para foreign keys
    console.log("\n🔗 TABELAS ESSENCIAIS PARA AI STUDIO:");
    console.log("====================================");

    const essentialTables = ["teams", "users", "ai_provider", "ai_model"];

    for (const tableName of essentialTables) {
      const [tableExists] = await connection.execute(
        `
        SELECT table_name, table_rows
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = ?;
      `,
        [tableName],
      );

      if ((tableExists as any[]).length > 0) {
        const rows = (tableExists as any)[0].table_rows || 0;
        console.log(`   ✅ ${tableName} (${rows} rows)`);
      } else {
        console.log(`   ❌ ${tableName} - NÃO EXISTE`);
      }
    }

    // 5. Se existirem tabelas AI, verificar estrutura detalhada
    if ((aiTables as any[]).length > 0) {
      console.log("\n🏗️  ESTRUTURA DAS TABELAS AI:");
      console.log("============================");

      for (const table of aiTables as any[]) {
        console.log(`\n📄 Estrutura da tabela: ${table.table_name}`);

        const [columns] = await connection.execute(
          `
          SELECT column_name, column_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() 
          AND table_name = ?
          ORDER BY ordinal_position;
        `,
          [table.table_name],
        );

        (columns as any[]).forEach((col) => {
          console.log(
            `   • ${col.column_name}: ${col.column_type} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"} ${col.column_default ? `DEFAULT ${col.column_default}` : ""}`,
          );
        });
      }
    }

    // 6. Análise de foreign keys existentes
    console.log("\n🔗 FOREIGN KEYS RELACIONADAS AO AI:");
    console.log("===================================");

    const [foreignKeys] = await connection.execute(`
      SELECT 
        constraint_name,
        table_name,
        column_name,
        referenced_table_name,
        referenced_column_name
      FROM information_schema.key_column_usage 
      WHERE table_schema = DATABASE() 
      AND constraint_name != 'PRIMARY'
      AND (table_name LIKE 'ai_%' OR referenced_table_name LIKE 'ai_%')
      ORDER BY table_name, constraint_name;
    `);

    if ((foreignKeys as any[]).length === 0) {
      console.log("   ℹ️  Nenhuma foreign key relacionada ao AI encontrada");
    } else {
      (foreignKeys as any[]).forEach((fk) => {
        console.log(
          `   • ${fk.table_name}.${fk.column_name} → ${fk.referenced_table_name}.${fk.referenced_column_name}`,
        );
      });
    }

    // 7. Recomendações baseadas no estado atual
    console.log("\n💡 RECOMENDAÇÕES BASEADAS NO ESTADO ATUAL:");
    console.log("==========================================");

    if ((allTables as any[]).length === 0) {
      console.log("🚨 BANCO VAZIO:");
      console.log("   1. Execute: pnpm db:push");
      console.log("   2. Execute: pnpm db:seed (opcional)");
      console.log("   3. Depois execute a migração AI Studio");
    } else if ((aiTables as any[]).length === 0) {
      console.log("📋 TABELAS BÁSICAS EXISTEM, MAS NENHUMA TABELA AI:");
      console.log("   1. As tabelas AI serão criadas pelo db:push");
      console.log("   2. Não precisa de migração específica");
    } else {
      const hasOldStructure = (aiTables as any[]).some((t) =>
        ["ai_provider_token", "ai_team_provider_config"].includes(t.table_name),
      );
      const hasNewStructure = (aiTables as any[]).some((t) =>
        ["ai_team_provider_token", "ai_team_model_config"].includes(
          t.table_name,
        ),
      );

      if (hasOldStructure && !hasNewStructure) {
        console.log("🔄 MIGRAÇÃO NECESSÁRIA:");
        console.log("   1. Execute o script de migração AI Studio");
      } else if (hasNewStructure && !hasOldStructure) {
        console.log("✅ ESTRUTURA JÁ MIGRADA:");
        console.log("   • Nenhuma ação necessária");
      } else if (hasOldStructure && hasNewStructure) {
        console.log("⚠️  ESTRUTURAS MISTAS:");
        console.log("   • Verificar e limpar estruturas duplicadas");
      }
    }
  } catch (error) {
    console.error("❌ Erro ao analisar banco:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Executar análise
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeDatabaseState()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { analyzeDatabaseState };
