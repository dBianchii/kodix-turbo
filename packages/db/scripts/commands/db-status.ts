#!/usr/bin/env tsx

/**
 * Quick database status check
 * Usage: pnpm db:status
 */

import { config } from "dotenv";
import { count, eq } from "drizzle-orm";

config({ path: ".env" });

import { db } from "../../src/client";
import { aiModel, aiTeamProviderToken } from "../../src/schema";

async function quickStatus() {
  console.log("🔍 Quick Database Status Check (Studio-safe)\n");
  
  try {
    // 1. Check providers (now managed via JSON config)
    console.log(`📊 Providers: Now managed via JSON configuration file`);
    console.log(`   Configuration path: packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json`);

    // 2. Check models
    const [totalModels] = await db.select({ count: count() }).from(aiModel);
    const [enabledModels] = await db.select({ count: count() }).from(aiModel).where(eq(aiModel.enabled, true));
    
    console.log(`\n📊 Models: ${totalModels?.count || 0} total, ${enabledModels?.count || 0} enabled`);

    // 3. Check tokens
    const tokens = await db.select().from(aiTeamProviderToken);
    console.log(`\n📊 Team Tokens: ${tokens.length}`);
    
    if (tokens.length > 0) {
      const tokensByProvider = tokens.reduce((acc: any, token: any) => {
        acc[token.providerId] = (acc[token.providerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.table(Object.entries(tokensByProvider).map(([providerId, count]) => ({
        providerId,
        tokens: count
      })));
    }

    // 4. Check for potential issues
    console.log("\n🔍 Potential Issues:");
    
    // Check for orphaned models (providers are now managed via JSON config)
    const models = await db.select().from(aiModel);
    const validProviderIds = ["openai", "anthropic", "google", "xai"];
    const orphanedModels = models.filter((m: any) => !validProviderIds.includes(m.providerId));
    
    if (orphanedModels.length > 0) {
      console.log(`⚠️  ${orphanedModels.length} models with invalid provider references`);
    }
    
    // Check for models without tokens
    const providerIdsWithTokens = [...new Set(tokens.map((t: any) => t.providerId))];
    const modelsWithoutTokens = models.filter((m: any) => 
      validProviderIds.includes(m.providerId) && !providerIdsWithTokens.includes(m.providerId)
    );
    
    if (modelsWithoutTokens.length > 0) {
      console.log(`⚠️  ${modelsWithoutTokens.length} models from providers without tokens`);
    }
    
    if (orphanedModels.length === 0 && modelsWithoutTokens.length === 0) {
      console.log("✅ No issues detected");
    }

    console.log("\n✅ Status check completed!");
    
  } catch (error) {
    console.error("❌ Error checking database status:", error);
    process.exit(1);
  }
}

quickStatus();