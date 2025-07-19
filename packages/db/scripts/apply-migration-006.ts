#!/usr/bin/env tsx

/**
 * Apply Migration 006: Remove ai_provider table
 * 
 * This script safely applies the migration to remove the ai_provider table
 * and replace it with JSON configuration.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { db } from "../src/client";

async function applyMigration006() {
  console.log("🚀 Starting Migration 006: Remove ai_provider table");
  console.log("📋 This migration will:");
  console.log("   1. Verify data integrity");
  console.log("   2. Remove foreign key constraints");
  console.log("   3. Drop ai_provider table");
  console.log("   4. Verify migration success\n");

  try {
    // Step 1: Pre-migration checks
    console.log("🔍 Step 1: Pre-migration verification...");
    
    // Check for orphaned models
    const [orphanedModels] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM ai_model 
      WHERE providerId NOT IN (
        SELECT providerId FROM ai_provider
      )
    `) as any;
    
    console.log(`   • Orphaned models: ${orphanedModels[0]?.count || 0}`);
    
    // Check for orphaned tokens
    const [orphanedTokens] = await db.execute(`
      SELECT COUNT(*) as count
      FROM ai_team_provider_token 
      WHERE providerId NOT IN (
        SELECT providerId FROM ai_provider
      )
    `) as any;
    
    console.log(`   • Orphaned tokens: ${orphanedTokens[0]?.count || 0}`);
    
    if ((orphanedModels[0]?.count || 0) > 0 || (orphanedTokens[0]?.count || 0) > 0) {
      throw new Error("Data integrity check failed! Please fix orphaned references before migration.");
    }
    
    console.log("   ✅ Data integrity verified\n");

    // Step 2: Remove foreign key constraints
    console.log("🔧 Step 2: Removing foreign key constraints...");
    
    try {
      await db.execute("ALTER TABLE ai_model DROP FOREIGN KEY ai_model_provider_id_fk");
      console.log("   ✅ Removed ai_model.providerId foreign key");
    } catch (error: any) {
      if (error.message.includes("check that column/key exists")) {
        console.log("   ⚠️  ai_model foreign key constraint already removed");
      } else {
        throw error;
      }
    }
    
    try {
      await db.execute("ALTER TABLE ai_team_provider_token DROP FOREIGN KEY ai_team_provider_token_provider_id_fk");
      console.log("   ✅ Removed ai_team_provider_token.providerId foreign key");
    } catch (error: any) {
      if (error.message.includes("check that column/key exists")) {
        console.log("   ⚠️  ai_team_provider_token foreign key constraint already removed");
      } else {
        throw error;
      }
    }
    
    console.log("");

    // Step 3: Drop the ai_provider table
    console.log("🗑️  Step 3: Dropping ai_provider table...");
    
    try {
      await db.execute("DROP TABLE ai_provider");
      console.log("   ✅ ai_provider table dropped successfully");
    } catch (error: any) {
      if (error.message.includes("doesn't exist")) {
        console.log("   ⚠️  ai_provider table already removed");
      } else {
        throw error;
      }
    }
    
    console.log("");

    // Step 4: Post-migration verification
    console.log("🔍 Step 4: Post-migration verification...");
    
    // Verify table was dropped
    const [tables] = await db.execute("SHOW TABLES LIKE 'ai_provider'") as any;
    if (tables.length === 0) {
      console.log("   ✅ ai_provider table successfully removed");
    } else {
      throw new Error("ai_provider table still exists!");
    }
    
    // Verify other tables still exist
    const [aiModelTable] = await db.execute("SHOW TABLES LIKE 'ai_model'") as any;
    const [aiTokenTable] = await db.execute("SHOW TABLES LIKE 'ai_team_provider_token'") as any;
    
    if (aiModelTable.length > 0 && aiTokenTable.length > 0) {
      console.log("   ✅ ai_model and ai_team_provider_token tables preserved");
    } else {
      throw new Error("Critical tables missing after migration!");
    }
    
    // Count remaining data
    const [modelCount] = await db.execute("SELECT COUNT(*) as count FROM ai_model") as any;
    const [tokenCount] = await db.execute("SELECT COUNT(*) as count FROM ai_team_provider_token") as any;
    
    console.log(`   • Models preserved: ${modelCount[0]?.count || 0}`);
    console.log(`   • Tokens preserved: ${tokenCount[0]?.count || 0}`);
    
    console.log("\n✅ Migration 006 completed successfully!");
    console.log("📝 Provider information is now managed via JSON configuration");
    console.log("   File: packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json");
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n🔄 To rollback, run the rollback script:");
    console.error("   tsx packages/db/scripts/rollback-migration-006.ts");
    throw error;
  }
}

// Execute migration
if (import.meta.url === `file://${process.argv[1]}`) {
  applyMigration006()
    .then(() => {
      console.log("\n🎉 Migration script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration script failed:", error);
      process.exit(1);
    });
}

export { applyMigration006 };