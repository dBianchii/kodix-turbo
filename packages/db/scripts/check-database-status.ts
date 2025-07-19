#!/usr/bin/env tsx

/**
 * Script para verificar o estado do banco de dados
 * Usa o cliente Drizzle oficial para ser compatível com o Studio
 */

import { config } from "dotenv";
import { count, eq } from "drizzle-orm";

// Load environment variables from root
config({ path: "../../.env" });

import { db } from "../src/client";
import { aiModel, aiProvider } from "../src/schema";

async function checkDatabaseStatus() {
  console.log("🔍 Checking database status (Studio-safe)...\n");
  
  try {
    // Check providers
    console.log("📊 AI Providers:");
    const providers = await db
      .select({
        providerId: aiProvider.providerId,
        name: aiProvider.name,
        baseUrl: aiProvider.baseUrl,
      })
      .from(aiProvider);
    
    console.table(providers);

    // Check model count per provider
    console.log("\n📈 Model count per provider:");
    const modelCounts = await db
      .select({
        providerId: aiModel.providerId,
        count: count(),
      })
      .from(aiModel)
      .groupBy(aiModel.providerId);
    
    console.table(modelCounts);

    // Show first 10 models
    console.log("\n🎯 Sample models (first 10):");
    const sampleModels = await db
      .select({
        modelId: aiModel.modelId,
        providerId: aiModel.providerId,
        status: aiModel.status,
        enabled: aiModel.enabled,
      })
      .from(aiModel)
      .limit(10);
    
    console.table(sampleModels);

    // Check for any remaining old provider IDs
    console.log("\n🔍 Checking for old provider ID references:");
    const oldProviderIds = ["OpenAI", "Google", "Anthropic", "XAI"];
    
    for (const oldId of oldProviderIds) {
      const modelsWithOldId = await db
        .select({ count: count() })
        .from(aiModel)
        .where(eq(aiModel.providerId, oldId));
      
      if (modelsWithOldId[0]?.count > 0) {
        console.log(`⚠️  Found ${modelsWithOldId[0].count} models still using old ID: ${oldId}`);
      }
    }

    console.log("\n✅ Database status check completed!");
    
  } catch (error) {
    console.error("❌ Error checking database:", error);
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseStatus()
    .then(() => {
      console.log("\n🎉 Check completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Check failed:", error);
      process.exit(1);
    });
}

export { checkDatabaseStatus };