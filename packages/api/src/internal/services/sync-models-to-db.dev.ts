#!/usr/bin/env node

/**
 * Development Script: Sync Models to Database
 * 
 * This script uses the AiModelSyncService to sync models with the database.
 * 
 * Usage:
 *   npx tsx src/internal/services/sync-models-to-db.dev.ts
 * 
 * Environment Variables Required:
 *   - DATABASE_URL (for database connection)
 *   - OPENAI_API_KEY (optional)
 *   - GOOGLE_API_KEY (optional) 
 *   - ANTHROPIC_API_KEY (optional)
 */

import { AiModelSyncService } from "./ai-model-sync.service.js";

async function main() {
  // Ensure we're in development mode
  if (process.env.NODE_ENV === "production") {
    console.error("❌ This script is only intended for development use!");
    process.exit(1);
  }

  console.log("🚀 Starting AI model database sync...");
  
  const syncService = new AiModelSyncService();
  const providers: ("openai" | "google" | "anthropic")[] = ["openai", "google", "anthropic"];
  
  for (const provider of providers) {
    console.log(`\n🔄 Syncing provider: ${provider}`);
    
    try {
      const diff = await syncService.syncWithProvider(provider);
      
      console.log(`✅ ${provider} sync completed:`);
      console.log(`  📈 New models: ${diff.newModels.length}`);
      console.log(`  🔄 Updated models: ${diff.updatedModels.length}`);
      console.log(`  📦 Archived models: ${diff.archivedModels.length}`);
      
    } catch (error) {
      console.error(`❌ Failed to sync ${provider}:`, error instanceof Error ? error.message : error);
      continue;
    }
  }
  
  console.log("\n🎉 Database sync completed!");
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || 
    process.argv[1]?.endsWith('sync-models-to-db.dev.ts')) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { main };