import { config } from "dotenv";
import { eq } from "drizzle-orm";

// Load environment variables
config({ path: ".env" });

import { db } from "../src/client";
import { aiProvider, aiModel, aiTeamProviderToken } from "../src/schema/apps/ai-studio";
import { jsonProviderService } from "../src/services/json-provider.service";

async function validateProviderMigration() {
  console.log("🔍 Validating provider migration from database to JSON...\n");

  try {
    // 1. Load providers from JSON
    const jsonProviders = await jsonProviderService.getAllProviders();
    console.log(`✅ Loaded ${jsonProviders.length} providers from JSON`);
    
    // 2. Load providers from database
    const dbProviders = await db.query.aiProvider.findMany();
    console.log(`✅ Found ${dbProviders.length} providers in database\n`);

    // 3. Create maps for easy lookup
    const jsonProviderMap = new Map(
      jsonProviders.map(p => [p.providerId, p])
    );
    const jsonProviderByNameMap = new Map(
      jsonProviders.map(p => [p.name, p])
    );

    // 4. Validate all database providers exist in JSON
    console.log("📋 Validating database providers match JSON...");
    const missingInJson: typeof dbProviders = [];
    const mismatchedData: Array<{
      providerId: string;
      name: string;
      dbBaseUrl: string | null;
      jsonBaseUrl: string | null | undefined;
    }> = [];

    for (const dbProvider of dbProviders) {
      const jsonProvider = jsonProviderMap.get(dbProvider.providerId);
      const jsonProviderByName = jsonProviderByNameMap.get(dbProvider.name);

      if (!jsonProvider && !jsonProviderByName) {
        missingInJson.push(dbProvider);
      } else {
        // Check if data matches
        const matchedProvider = jsonProvider || jsonProviderByName;
        if (matchedProvider) {
          // Check if IDs match when found by name
          if (!jsonProvider && jsonProviderByName && 
              dbProvider.providerId !== jsonProviderByName.providerId) {
            console.log(`⚠️  ID mismatch for provider "${dbProvider.name}"`);
            console.log(`   Database ID: ${dbProvider.providerId}`);
            console.log(`   JSON ID: ${jsonProviderByName.providerId}`);
          }

          // Check if base URLs match
          const dbUrl = dbProvider.baseUrl || null;
          const jsonUrl = matchedProvider.baseUrl || null;
          if (dbUrl !== jsonUrl) {
            mismatchedData.push({
              providerId: dbProvider.providerId,
              name: dbProvider.name,
              dbBaseUrl: dbUrl,
              jsonBaseUrl: jsonUrl,
            });
          }
        }
      }
    }

    if (missingInJson.length > 0) {
      console.log("\n❌ Providers in database but NOT in JSON:");
      for (const provider of missingInJson) {
        console.log(`   - ${provider.name} (ID: ${provider.providerId})`);
      }
    } else {
      console.log("✅ All database providers exist in JSON");
    }

    if (mismatchedData.length > 0) {
      console.log("\n⚠️  Providers with mismatched base URLs:");
      for (const mismatch of mismatchedData) {
        console.log(`   - ${mismatch.name}:`);
        console.log(`     Database URL: ${mismatch.dbBaseUrl || "(null)"}`);
        console.log(`     JSON URL: ${mismatch.jsonBaseUrl || "(null)"}`);
      }
    }

    // 5. Check for foreign key dependencies
    console.log("\n📊 Checking foreign key dependencies...");
    
    // Check models
    const modelCounts = await Promise.all(
      dbProviders.map(async (provider) => {
        const models = await db.query.aiModel.findMany({
          where: eq(aiModel.providerId, provider.providerId),
        });
        return { provider: provider.name, count: models.length };
      })
    );

    console.log("\n🔗 Models per provider:");
    for (const { provider, count } of modelCounts) {
      console.log(`   - ${provider}: ${count} models`);
    }

    // Check team tokens
    const tokenCounts = await Promise.all(
      dbProviders.map(async (provider) => {
        const tokens = await db.query.aiTeamProviderToken.findMany({
          where: eq(aiTeamProviderToken.providerId, provider.providerId),
        });
        return { provider: provider.name, count: tokens.length };
      })
    );

    console.log("\n🔑 Team tokens per provider:");
    for (const { provider, count } of tokenCounts) {
      console.log(`   - ${provider}: ${count} tokens`);
    }

    // 6. Test repository methods
    console.log("\n🧪 Testing AiProviderRepository methods with JSON backend...");
    
    const { AiProviderRepository } = await import("../src/repositories/ai-studio");
    
    // Test findById
    const testProviderId = jsonProviders[0]?.providerId;
    if (testProviderId) {
      const provider = await AiProviderRepository.findById(testProviderId);
      console.log(`✅ findById works: Found ${provider?.name}`);
    }

    // Test findByName
    const testProviderName = jsonProviders[0]?.name;
    if (testProviderName) {
      const provider = await AiProviderRepository.findByName(testProviderName);
      console.log(`✅ findByName works: Found ${provider?.providerId}`);
    }

    // Test findMany
    const providers = await AiProviderRepository.findMany({ limite: 2 });
    console.log(`✅ findMany works: Retrieved ${providers.length} providers`);

    // Test count
    const count = await AiProviderRepository.count();
    console.log(`✅ count works: Total ${count} providers`);

    // 7. Final summary
    console.log("\n📊 Migration Validation Summary:");
    console.log(`   - Providers in JSON: ${jsonProviders.length}`);
    console.log(`   - Providers in database: ${dbProviders.length}`);
    console.log(`   - Missing in JSON: ${missingInJson.length}`);
    console.log(`   - Data mismatches: ${mismatchedData.length}`);
    
    if (missingInJson.length === 0 && mismatchedData.length === 0) {
      console.log("\n✅ Migration validation PASSED! Safe to proceed.");
    } else {
      console.log("\n⚠️  Migration validation found issues. Please review above.");
    }

  } catch (error) {
    console.error("\n❌ Validation failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

validateProviderMigration();