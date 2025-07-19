#!/usr/bin/env tsx

/**
 * Rollback Migration 006: Restore ai_provider table
 * 
 * This script safely rolls back Migration 006 by recreating the ai_provider table
 * and restoring foreign key constraints.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { db } from "../src/client";

async function rollbackMigration006() {
  console.log("🔄 Starting Rollback of Migration 006: Restore ai_provider table");
  console.log("📋 This rollback will:");
  console.log("   1. Recreate ai_provider table");
  console.log("   2. Seed provider data from JSON configuration");
  console.log("   3. Restore foreign key constraints");
  console.log("   4. Verify rollback success\n");

  try {
    // Step 1: Recreate ai_provider table
    console.log("🔧 Step 1: Recreating ai_provider table...");
    
    await db.execute(`
      CREATE TABLE ai_provider (
        providerId varchar(21) PRIMARY KEY,
        name varchar(100) NOT NULL,
        baseUrl text,
        KEY ai_provider_name_idx (name)
      )
    `);
    
    console.log("   ✅ ai_provider table recreated");

    // Step 2: Seed provider data
    console.log("🌱 Step 2: Seeding provider data...");
    
    // Load providers from JSON configuration
    const workspaceRoot = process.cwd();
    const supportedProvidersPath = join(
      workspaceRoot,
      "packages",
      "api",
      "src",
      "internal",
      "services",
      "ai-model-sync-adapter",
      "config",
      "supported-providers.json",
    );

    let supportedProvidersData: { providers: Array<{ providerId: string; name: string; baseUrl: string }> };
    try {
      const supportedProvidersContent = readFileSync(supportedProvidersPath, "utf-8");
      supportedProvidersData = JSON.parse(supportedProvidersContent);
    } catch (error) {
      console.error("   ❌ Failed to read supported-providers.json, using default values");
      supportedProvidersData = {
        providers: [
          { providerId: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
          { providerId: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com/v1" },
          { providerId: "google", name: "Google", baseUrl: "https://generativelanguage.googleapis.com" },
          { providerId: "xai", name: "XAI", baseUrl: "https://api.x.ai/v1" }
        ]
      };
    }

    // Insert providers
    for (const provider of supportedProvidersData.providers) {
      await db.execute(`
        INSERT INTO ai_provider (providerId, name, baseUrl) 
        VALUES ('${provider.providerId}', '${provider.name}', '${provider.baseUrl}')
      `);
      console.log(`   ✅ Inserted provider: ${provider.name}`);
    }

    // Step 3: Restore foreign key constraints
    console.log("🔗 Step 3: Restoring foreign key constraints...");
    
    await db.execute(`
      ALTER TABLE ai_model 
      ADD CONSTRAINT ai_model_provider_id_fk 
      FOREIGN KEY (providerId) REFERENCES ai_provider(providerId)
    `);
    console.log("   ✅ Restored ai_model.providerId foreign key");
    
    await db.execute(`
      ALTER TABLE ai_team_provider_token 
      ADD CONSTRAINT ai_team_provider_token_provider_id_fk 
      FOREIGN KEY (providerId) REFERENCES ai_provider(providerId)
    `);
    console.log("   ✅ Restored ai_team_provider_token.providerId foreign key");

    // Step 4: Verification
    console.log("🔍 Step 4: Verification...");
    
    // Verify table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'ai_provider'") as any;
    if (tables.length > 0) {
      console.log("   ✅ ai_provider table exists");
    } else {
      throw new Error("ai_provider table was not created!");
    }
    
    // Verify foreign keys
    const [foreignKeys] = await db.execute(`
      SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME = 'ai_provider'
    `) as any;
    
    console.log(`   ✅ Foreign keys restored: ${foreignKeys.length}`);
    
    // Count data
    const [providerCount] = await db.execute("SELECT COUNT(*) as count FROM ai_provider") as any;
    const [modelCount] = await db.execute("SELECT COUNT(*) as count FROM ai_model") as any;
    const [tokenCount] = await db.execute("SELECT COUNT(*) as count FROM ai_team_provider_token") as any;
    
    console.log(`   • Providers: ${providerCount[0]?.count || 0}`);
    console.log(`   • Models: ${modelCount[0]?.count || 0}`);
    console.log(`   • Tokens: ${tokenCount[0]?.count || 0}`);
    
    console.log("\n✅ Migration 006 rollback completed successfully!");
    console.log("📝 Provider information is now managed via database again");
    
  } catch (error) {
    console.error("\n❌ Rollback failed:", error);
    console.error("\n⚠️  You may need to manually fix the database state");
    throw error;
  }
}

// Execute rollback
if (import.meta.url === `file://${process.argv[1]}`) {
  rollbackMigration006()
    .then(() => {
      console.log("\n🎉 Rollback script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Rollback script failed:", error);
      process.exit(1);
    });
}

export { rollbackMigration006 };