#!/usr/bin/env tsx

/**
 * Quick database status check
 * Usage: pnpm db:status
 */

import { config } from "dotenv";
import { count, eq } from "drizzle-orm";

config({ path: ".env" });

import { db } from "../src/client";
import { aiModel, aiProvider, aiTeamProviderToken } from "../src/schema";

async function quickStatus() {
  console.log("🔍 Quick Database Status Check (Studio-safe)\n");
  
  try {
    // 1. Check providers
    const providers = await db.select().from(aiProvider);
    console.log(`📊 Providers: ${providers.length}`);
    if (providers.length > 0) {
      console.table(providers.map(p => ({
        providerId: p.providerId,
        name: p.name,
        baseUrl: p.baseUrl || 'Default'
      })));
    }

    // 2. Check models
    const [totalModels] = await db.select({ count: count() }).from(aiModel);
    const [enabledModels] = await db.select({ count: count() }).from(aiModel).where(eq(aiModel.enabled, true));
    
    console.log(`\n📊 Models: ${totalModels?.count || 0} total, ${enabledModels?.count || 0} enabled`);

    // 3. Check tokens
    const tokens = await db.select().from(aiTeamProviderToken);
    console.log(`\n📊 Team Tokens: ${tokens.length}`);
    
    if (tokens.length > 0) {
      const tokensByProvider = tokens.reduce((acc, token) => {
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
    
    // Check for orphaned models
    const modelsWithProviders = await db.query.aiModel.findMany({
      with: { provider: true }
    });
    const orphanedModels = modelsWithProviders.filter(m => !m.provider);
    
    if (orphanedModels.length > 0) {
      console.log(`⚠️  ${orphanedModels.length} models with invalid provider references`);
    }
    
    // Check for models without tokens
    const providerIdsWithTokens = [...new Set(tokens.map(t => t.providerId))];
    const modelsWithoutTokens = modelsWithProviders.filter(m => 
      m.provider && !providerIdsWithTokens.includes(m.providerId)
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