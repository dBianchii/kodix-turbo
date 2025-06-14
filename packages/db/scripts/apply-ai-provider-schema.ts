#!/usr/bin/env tsx

/**
 * Script para aplicar mudanças de schema do AI Provider
 *
 * Este script cria as tabelas e colunas necessárias sem fazer migração de dados
 */
import { db } from "../src/client";

async function applyAiProviderSchema() {
  console.log("🔧 Aplicando mudanças de schema do AI Provider...\n");

  try {
    // 1. Criar tabela ai_provider
    console.log("📋 Criando tabela ai_provider...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ai_provider (
        id VARCHAR(30) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        baseUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela ai_provider criada");

    // 2. Adicionar coluna providerId na tabela ai_model
    console.log("📋 Adicionando coluna providerId na tabela ai_model...");
    try {
      await db.execute(`
        ALTER TABLE ai_model 
        ADD COLUMN providerId VARCHAR(30)
      `);
      console.log("✅ Coluna providerId adicionada");
    } catch (error: any) {
      if (error.message.includes("Duplicate column name")) {
        console.log("✓ Coluna providerId já existe");
      } else {
        throw error;
      }
    }

    // 3. Criar tabela ai_provider_token
    console.log("📋 Criando tabela ai_provider_token...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ai_provider_token (
        id VARCHAR(30) PRIMARY KEY,
        teamId VARCHAR(30) NOT NULL,
        providerId VARCHAR(30) NOT NULL,
        token TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela ai_provider_token criada");

    // 4. Adicionar índices
    console.log("📋 Adicionando índices...");
    try {
      await db.execute(`
        CREATE INDEX IF NOT EXISTS ai_model_providerId_idx ON ai_model(providerId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS ai_provider_token_teamId_idx ON ai_provider_token(teamId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS ai_provider_token_providerId_idx ON ai_provider_token(providerId)
      `);
      console.log("✅ Índices criados");
    } catch (error) {
      console.log("⚠️  Alguns índices podem já existir");
    }

    // 5. Remover coluna provider antiga (se existir)
    console.log("📋 Removendo coluna provider antiga...");
    try {
      await db.execute(`
        ALTER TABLE ai_model 
        DROP COLUMN provider
      `);
      console.log("✅ Coluna provider removida");
    } catch (error: any) {
      if (error.message.includes("check that column/key exists")) {
        console.log("✓ Coluna provider já foi removida");
      } else {
        console.log("⚠️  Erro ao remover coluna provider:", error.message);
      }
    }

    console.log("\n✅ Schema do AI Provider aplicado com sucesso!");
    console.log("\n📋 Próximos passos:");
    console.log(
      "   1. Executar migração de dados: pnpm db:migrate:ai-provider",
    );
    console.log(
      "   2. Executar criptografia de tokens: pnpm db:encrypt-tokens",
    );
  } catch (error) {
    console.error("\n❌ Erro ao aplicar schema:", error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
applyAiProviderSchema()
  .then(() => {
    console.log("\n🎉 Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Falha na execução:", error);
    process.exit(1);
  });

export { applyAiProviderSchema };
