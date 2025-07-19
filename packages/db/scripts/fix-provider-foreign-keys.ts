#!/usr/bin/env tsx

/**
 * Script para atualizar foreign keys dos modelos para usar os novos provider IDs
 * Usa o cliente Drizzle oficial do projeto para evitar conflitos com o Studio
 */

import { config } from "dotenv";
import { eq } from "drizzle-orm";

// Load environment variables from root
config({ path: "../../.env" });

import { db } from "../src/client";
import { aiModel } from "../src/schema";

interface ProviderMapping {
  oldId: string;
  newId: string;
}

const providerMappings: ProviderMapping[] = [
  { oldId: "OpenAI", newId: "openai" },
  { oldId: "Google", newId: "google" },
  { oldId: "Anthropic", newId: "anthropic" },
  { oldId: "XAI", newId: "xai" },
];

async function updateProviderForeignKeys() {
  console.log("🔧 Updating model foreign keys to use new provider IDs...");
  console.log("ℹ️  Using official Drizzle client (Studio-safe)");
  
  try {
    for (const mapping of providerMappings) {
      console.log(`📝 Updating models from '${mapping.oldId}' to '${mapping.newId}'...`);
      
      // Use Drizzle update syntax instead of raw SQL
      const result = await db
        .update(aiModel)
        .set({ providerId: mapping.newId })
        .where(eq(aiModel.providerId, mapping.oldId));

      console.log(`✅ Updated models: ${mapping.oldId} → ${mapping.newId}`);
    }

    // Verify the results
    console.log("\n📊 Verification - Current model distribution:");
    
    // Count models per provider
    const models = await db
      .select({
        modelId: aiModel.modelId,
        providerId: aiModel.providerId,
        status: aiModel.status,
      })
      .from(aiModel)
      .limit(10);

    console.table(models);

    console.log("\n✅ Foreign key update completed successfully!");
    console.log("🎯 Drizzle Studio should remain active and functional");
    
  } catch (error) {
    console.error("❌ Error updating foreign keys:", error);
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateProviderForeignKeys()
    .then(() => {
      console.log("\n🎉 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}

export { updateProviderForeignKeys };