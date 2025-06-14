#!/usr/bin/env tsx
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "../src/env";

async function main() {
  console.log(
    "🚀 Adicionando coluna isDefault na tabela ai_team_model_config...",
  );

  // Conectar ao banco
  const connection = await mysql.createConnection(env.MYSQL_URL);
  const db = drizzle(connection);

  try {
    // 1. Verificar se a coluna já existe
    console.log("🔍 Verificando se a coluna isDefault já existe...");
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'ai_team_model_config' 
      AND COLUMN_NAME = 'isDefault';
    `);

    if ((columns as any[]).length > 0) {
      console.log("ℹ️  Coluna isDefault já existe, pulando criação...");
    } else {
      console.log("➕ Adicionando coluna isDefault...");

      // 2. Adicionar a coluna isDefault
      await connection.execute(`
        ALTER TABLE ai_team_model_config 
        ADD COLUMN isDefault boolean DEFAULT false NOT NULL 
        AFTER enabled;
      `);

      // 3. Adicionar índice para a nova coluna
      await connection.execute(`
        ALTER TABLE ai_team_model_config 
        ADD INDEX ai_team_model_config_is_default_idx (isDefault);
      `);

      console.log("✅ Coluna isDefault adicionada com sucesso!");
    }

    // 4. Configurar o primeiro modelo habilitado de cada team como padrão
    console.log(
      "🎯 Configurando modelos padrão para teams sem padrão definido...",
    );

    const [teamsWithoutDefault] = await connection.execute(`
      SELECT DISTINCT teamId 
      FROM ai_team_model_config 
      WHERE enabled = true 
      AND teamId NOT IN (
        SELECT teamId 
        FROM ai_team_model_config 
        WHERE isDefault = true
      );
    `);

    for (const teamRow of teamsWithoutDefault as any[]) {
      const teamId = teamRow.teamId;

      // Buscar o primeiro modelo habilitado (ordenado por prioridade e data de criação)
      const [firstModel] = await connection.execute(
        `
        SELECT id, modelId 
        FROM ai_team_model_config 
        WHERE teamId = ? AND enabled = true 
        ORDER BY priority ASC, createdAt ASC 
        LIMIT 1;
      `,
        [teamId],
      );

      if ((firstModel as any[]).length > 0) {
        const modelConfig = (firstModel as any[])[0];

        await connection.execute(
          `
          UPDATE ai_team_model_config 
          SET isDefault = true, updatedAt = NOW() 
          WHERE id = ?;
        `,
          [modelConfig.id],
        );

        console.log(
          `✅ Modelo ${modelConfig.modelId} definido como padrão para team ${teamId}`,
        );
      }
    }

    console.log("🎉 Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("💥 Falha na migração:", error);
  process.exit(1);
});
