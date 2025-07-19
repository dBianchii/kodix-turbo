#!/usr/bin/env tsx

/**
 * Script para testar o serviço de sync de modelos
 * Usa o cliente Drizzle oficial para ser compatível com o Studio
 */

import { config } from "dotenv";

// Load environment variables from root
config({ path: "../../.env" });

import { AiModelSyncService } from "../../api/src/internal/services/ai-model-sync.service";

async function testSyncService() {
  console.log("🧪 Testing AI Model Sync Service (Studio-safe)...\n");
  
  try {
    const syncService = new AiModelSyncService();
    
    // Test with OpenAI provider
    console.log("🔄 Testing sync with OpenAI provider...");
    const syncResult = await syncService.syncWithProvider("openai");
    
    console.log("✅ Sync completed successfully!");
    console.log("📊 Sync Results:");
    console.log(`- Provider: ${syncResult.providerId}`);
    console.log(`- New models: ${syncResult.newModels.length}`);
    console.log(`- Updated models: ${syncResult.updatedModels.length}`);
    console.log(`- Archived models: ${syncResult.archivedModels.length}`);
    
    if (syncResult.newModels.length > 0) {
      console.log("\n📝 New models found:");
      syncResult.newModels.slice(0, 3).forEach((model: any) => {
        console.log(`  - ${model.modelId}`);
      });
    }
    
    if (syncResult.updatedModels.length > 0) {
      console.log("\n🔄 Updated models:");
      syncResult.updatedModels.slice(0, 3).forEach((update: any) => {
        console.log(`  - ${update.existing.modelId}`);
      });
    }
    
    if (syncResult.archivedModels.length > 0) {
      console.log("\n📦 Archived models:");
      syncResult.archivedModels.slice(0, 3).forEach((model: any) => {
        console.log(`  - ${model.modelId}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Sync test failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSyncService()
    .then(() => {
      console.log("\n🎉 Sync test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Sync test failed:", error);
      process.exit(1);
    });
}

export { testSyncService };