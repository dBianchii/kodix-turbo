#!/usr/bin/env tsx

/**
 * Automatic database fix for common issues
 * Usage: pnpm db:fix
 */

import { config } from "dotenv";
import { eq, inArray, not } from "drizzle-orm";

config({ path: ".env" });

import { db } from "../../src/client";
import { aiModel, aiProvider, aiTeamProviderToken } from "../../src/schema";

async function autoFix() {
  console.log("🔧 Automatic Database Fix (Studio-safe)\n");
  
  try {
    let fixesApplied = 0;

    // 1. Fix common provider foreign key issues
    console.log("1️⃣ Checking provider foreign keys...");
    
    const commonMappings = [
      { old: "OpenAI", new: "openai" },
      { old: "Google", new: "google" },
      { old: "Anthropic", new: "anthropic" },
      { old: "XAI", new: "xai" },
      { old: "Cohere", new: "cohere" },
      { old: "Mistral", new: "mistral" }
    ];

    for (const mapping of commonMappings) {
      // Fix models
      const modelsUpdated = await db
        .update(aiModel)
        .set({ providerId: mapping.new })
        .where(eq(aiModel.providerId, mapping.old));

      // Fix tokens
      const tokensUpdated = await db
        .update(aiTeamProviderToken)
        .set({ providerId: mapping.new })
        .where(eq(aiTeamProviderToken.providerId, mapping.old));

      if (modelsUpdated || tokensUpdated) {
        console.log(`✅ Fixed references: ${mapping.old} → ${mapping.new}`);
        fixesApplied++;
      }
    }

    // 2. Remove orphaned models
    console.log("\n2️⃣ Checking for orphaned models...");
    
    const validProviders = await db.select({ providerId: aiProvider.providerId }).from(aiProvider);
    const validProviderIds = validProviders.map((p: { providerId: string }) => p.providerId);
    
    if (validProviderIds.length > 0) {
      const orphanedModels = await db
        .select()
        .from(aiModel)
        .where(not(inArray(aiModel.providerId, validProviderIds)));
        
      if (orphanedModels.length > 0) {
        console.log(`⚠️  Found ${orphanedModels.length} orphaned models. Updating to 'unknown' provider...`);
        
        // Instead of deleting, mark as unknown
        await db
          .update(aiModel)
          .set({ 
            providerId: "unknown",
            enabled: false,
            status: "archived"
          })
          .where(not(inArray(aiModel.providerId, validProviderIds)));
          
        console.log("✅ Orphaned models marked as 'unknown' and disabled");
        fixesApplied++;
      }
    }

    // 3. Disable models without provider tokens
    console.log("\n3️⃣ Checking models without provider tokens...");
    
    const tokensWithProviders = await db.select().from(aiTeamProviderToken);
    const providerIdsWithTokens = [...new Set(tokensWithProviders.map((t: { providerId: string }) => t.providerId))];
    
    if (providerIdsWithTokens.length > 0) {
      const modelsWithoutTokens = await db
        .select()
        .from(aiModel)
        .where(
          not(inArray(aiModel.providerId, providerIdsWithTokens))
        );
        
      if (modelsWithoutTokens.length > 0) {
        console.log(`⚠️  Found ${modelsWithoutTokens.length} models from providers without tokens`);
        console.log("💡 These models won't be available until provider tokens are configured");
        // Don't auto-disable these as they might be intentional
      }
    }

    // 4. Summary
    console.log(`\n📊 Summary:`);
    console.log(`- Fixes applied: ${fixesApplied}`);
    
    if (fixesApplied === 0) {
      console.log("✅ No issues found - database is healthy!");
    } else {
      console.log("✅ Database fixes completed!");
      console.log("\n💡 Run 'pnpm db:status' to verify the fixes");
    }
    
  } catch (error) {
    console.error("❌ Error during auto-fix:", error);
    process.exit(1);
  }
}

autoFix();